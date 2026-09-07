import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { responsivePhotoWidths } from "../lib/photo-variants";
import { getResponsivePhotoVariants } from "../lib/responsive-photo-variants";
import { writeIfChanged } from "./photo-manifest";
import type { ManifestPhoto } from "./photo-manifest";

const digest = (value: Buffer | string) => createHash("sha256").update(value).digest("hex");
const settings = JSON.stringify({ version: 1, widths: responsivePhotoWidths, sharp: sharp.versions, webp: [76, 82, 4], avif: [48, 56, 3] });

export async function buildPhotoImages(root: string, photos: readonly ManifestPhoto[]): Promise<void> {
  const directory = path.join(root, "public/generated/photos");
  const cachePath = path.join(root, ".photo-cache/images.json");
  await mkdir(directory, { recursive: true });
  let previous: Record<string, { input: string; output: string }> = {};
  try { previous = JSON.parse(await readFile(cachePath, "utf8")); } catch { /* Cold cache. */ }
  const next: typeof previous = {};
  let encoded = 0;
  for (const photo of photos) {
    const source = await readFile(path.join(root, "assets/source/photos", photo.source));
    const fingerprint = digest(Buffer.concat([source, Buffer.from(settings)]));
    for (const variant of getResponsivePhotoVariants(photo.width, responsivePhotoWidths)) {
      for (const format of ["webp", "avif"] as const) {
        const name = `${photo.id}-${variant.fileWidth}.${format}`;
        const outputPath = path.join(directory, name);
        let output: Buffer | undefined;
        try { output = await readFile(outputPath); } catch { /* Missing output. */ }
        if (!output || previous[name]?.input !== fingerprint || previous[name]?.output !== digest(output)) {
          const pipeline = sharp(source).rotate().resize({ width: variant.outputWidth, withoutEnlargement: true });
          output = await (format === "webp"
            ? pipeline.webp({ quality: variant.outputWidth === 480 ? 76 : 82, effort: 4 })
            : pipeline.avif({ quality: variant.outputWidth === 480 ? 48 : 56, effort: 3 })).toBuffer();
          const temporary = `${outputPath}.${randomUUID()}.tmp`;
          try {
            await writeFile(temporary, output);
            await rename(temporary, outputPath);
          } finally {
            await unlink(temporary).catch(() => {});
          }
          encoded += 1;
        }
        const size = await sharp(output).metadata();
        if (size.width !== variant.outputWidth || size.height !== Math.round(photo.height / photo.width * variant.outputWidth)) {
          throw new Error(`${name}: incorrect responsive dimensions`);
        }
        next[name] = { input: fingerprint, output: digest(output) };
      }
    }
  }
  // This directory is owned by this pipeline. Only remove its named image variants.
  const stale = (await readdir(directory)).filter((name) => /^[a-z0-9-]+-(480|960|1600)\.(webp|avif)$/.test(name) && !Object.hasOwn(next, name));
  for (const name of stale) await unlink(path.join(directory, name));
  await writeIfChanged(cachePath, JSON.stringify(next, null, 2) + "\n");
  console.log(`[images] verified ${Object.keys(next).length} variants; encoded ${encoded}; removed ${stale.length} stale generated files`);
}
