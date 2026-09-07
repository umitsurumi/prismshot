import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import { galleryPhotos, galleryPageCopy } from "../content/gallery.ts";
import { contestChampions } from "../content/contests.ts";
import { activities } from "../content/events.ts";
import { getResponsivePhotoVariants } from "../lib/responsive-photo-variants.ts";
import { responsivePhotoWidths } from "../lib/photo-variants.ts";

const root = path.resolve("out");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".avif": "image/avif", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer(async (request, response) => {
  try {
    let relative = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/+/, "");
    if (!path.extname(relative)) relative = relative ? `${relative}.html` : "index.html";
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) throw new Error("invalid path");
    response.setHeader("content-type", mime[path.extname(filename)] ?? "application/octet-stream");
    response.end(await readFile(filename));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    for (const locale of ["zh", "en"]) {
      const prefix = locale === "zh" ? "" : "/en";
      for (const section of ["gallery", "contests", "events"]) {
        await page.goto(`${origin}${prefix}/${section}`, { waitUntil: "networkidle" });
        if (section === "gallery") {
          const more = page.getByRole("button", { name: galleryPageCopy[locale].loadMore, exact: true });
          while (await more.count()) await more.click();
        }
        let groups;
        if (section === "events") {
          groups = activities.map((activity) => ({ activityId: activity.id, photos: activity.photos }));
        } else {
          groups = [{ photos: section === "gallery" ? galleryPhotos : contestChampions }];
          const sources = await page.locator('button img[src*="/generated/photos/"]').evaluateAll((images) => images.map((image) => image.getAttribute("src")));
          assert.deepEqual(sources.map((src) => src.replace(/^.*\/generated\/photos\//, "").replace(/-\d+\.(webp|avif)$/, "")), groups[0].photos.map((photo) => photo.asset.id));
        }
        for (const group of groups) {
          if (group.activityId) {
            const toggle = page.locator(`button[aria-controls="activity-panel-${group.activityId}"]`);
            if (await toggle.getAttribute("aria-expanded") !== "true") await toggle.click();
          }
          for (const photo of group.photos) {
            const image = page.locator(`button img[src*="/generated/photos/${photo.asset.id}-"]`).first();
            await image.scrollIntoViewIfNeeded();
            await image.evaluate((node) => node.decode());
            assert(await image.evaluate((node) => node.naturalWidth > 0));
            const source = image.locator("..").locator('source[type="image/webp"]');
            const srcset = await source.getAttribute("srcset");
            for (const variant of getResponsivePhotoVariants(photo.asset.width, responsivePhotoWidths)) {
              assert(srcset.includes(`${photo.asset.id}-${variant.fileWidth}.webp ${variant.outputWidth}w`));
            }
          }
          const first = group.photos[0];
          const trigger = page.locator(`button:has(img[src*="/generated/photos/${first.asset.id}-"])`).first();
          await trigger.click();
          const dialog = page.getByRole("dialog");
          await dialog.waitFor();
          const text = await dialog.locator("aside").innerText();
          if (first.author) assert(text.includes(first.author));
          if (first.date) assert(text.includes(first.date));
          assert(await dialog.locator("img").evaluate((node) => getComputedStyle(node).objectFit === "contain"));
          await page.keyboard.press("ArrowRight");
          await dialog.locator("img").evaluate((node) => node.decode());
          await page.keyboard.press("Escape");
          assert.equal(await dialog.count(), 0);
          assert(await trigger.evaluate((node) => document.activeElement === node));
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        assert.deepEqual(errors, []);
        console.log(`[photos browser] ${mobile ? "mobile" : "desktop"} ${prefix}/${section} passed`);
      }
    }
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
