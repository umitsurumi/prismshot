import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, readFile, rename, rm, stat, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { dateFromFilename, isPhotoDate } from "../lib/photo-date";
import { resolvePhoto, resolvePhotos, resolveChampions, assertAllPhotosReferenced } from "../lib/photo-content";
import type { PhotoInput, PhotoAsset } from "../content/types";
import { scanPhotoManifest, generatePhotoManifest } from "./photo-manifest";
import { buildPhotoImages } from "./photo-images";

// This directive becomes a compiler error if the generated ID type widens to string.
// @ts-expect-error nonexistent IDs must fail type checking
const invalidTypedInput: PhotoInput = { asset: "does-not-exist" };
void invalidTypedInput;

const input = (asset: string, extra: Partial<PhotoInput> = {}): PhotoInput => ({ asset: asset as PhotoInput["asset"], ...extra });
const asset = (id: string, date?: string): PhotoAsset => ({ id, source: `gallery/${id}.png`, width: 100, height: 50, ...(date ? { date } : {}) });

test("strict filename dates, sequence suffixes and ambiguity", () => {
  assert.equal(dateFromFilename("photo-coaching-2026-09-04-0"), "2026-09-04");
  assert.equal(dateFromFilename("2024-02-29"), "2024-02-29");
  assert.equal(dateFromFilename("issue13"), undefined);
  assert.equal(dateFromFilename("2026-1-17"), undefined);
  assert.equal(dateFromFilename("x2026-09-04"), undefined);
  assert.equal(isPhotoDate("2026-02-29"), false);
  assert.throws(() => dateFromFilename("2026-02-30"), /invalid/);
  assert.throws(() => dateFromFilename("2026-01-01-2026-02-01"), /ambiguous/);
});

test("content date ownership, optional attribution and presentation metadata", () => {
  const assets = { dated: asset("dated", "2026-08-28"), old: asset("old") };
  assert.equal(resolvePhoto(input("dated"), "test", assets).date, "2026-08-28");
  assert.equal(resolvePhoto(input("old"), "test", assets).author, undefined);
  assert.equal(resolvePhoto(input("old", { date: "2026-08-14" }), "test", assets).date, "2026-08-14");
  assert.throws(() => resolvePhoto(input("dated", { date: "2026-08-28" }), "test", assets), /remove/);
  assert.throws(() => resolvePhoto(input("old", { date: "2026-02-30" }), "test", assets), /invalid/);
  assert.throws(() => resolvePhoto(input("absent"), "test", assets), /unknown photo/);
  assert.throws(() => resolvePhoto(input("old", { alt: { zh: "描述", en: "" } }), "test", assets), /bilingual/);
  assert.throws(() => resolvePhoto(input("old", { focalPoint: { x: NaN, y: 50 } }), "test", assets), /focalPoint/);
  const first = resolvePhoto(input("old", { focalPoint: { x: 20, y: 50 } }), "first", assets);
  const second = resolvePhoto(input("old", { focalPoint: { x: 80, y: 50 } }), "second", assets);
  assert.equal(first.asset, second.asset);
  assert.notDeepEqual(first.focalPoint, second.focalPoint);
  assert.equal("focalPoint" in assets.old, false);
});

test("stable gallery order, manual event order and reference scopes", () => {
  const assets = { a: asset("a"), b: asset("b", "2026-08-01"), c: asset("c", "2026-08-01"), d: asset("d") };
  const inputs = ["a", "c", "b", "d"].map((id) => input(id));
  const manual = resolvePhotos(inputs, "event", false, assets);
  assert.deepEqual(manual.map((p) => p.id), ["a", "c", "b", "d"]);
  const sorted = resolvePhotos(inputs, "gallery", true, assets);
  assert.deepEqual(sorted.map((p) => p.id), ["c", "b", "a", "d"]);
  assert.doesNotThrow(() => assertAllPhotosReferenced(assets, [...manual, ...sorted]));
  assert.throws(() => assertAllPhotosReferenced(assets, sorted.slice(0, 2)), /a, d/);
  assert.throws(() => resolvePhotos([input("a"), input("a", { id: "different" })], "gallery", false, assets), /duplicate/);
});

test("champions derive images from numeric issues and sort numerically", () => {
  const assets = { "contests-issue2": asset("contests-issue2"), "contests-issue13": asset("contests-issue13") };
  const photos = resolveChampions([{ issue: 2 }, { issue: 13, author: "A" }], assets);
  assert.deepEqual(photos.map((p) => p.issue), ["13", "02"]);
  assert.equal(photos[0].asset.id, "contests-issue13");
  assert.throws(() => resolveChampions([{ issue: 2 }, { issue: 2 }], assets), /unique/);
  assert.throws(() => resolveChampions([{ issue: -1 }], assets), /positive/);
  assert.throws(() => resolveChampions([{ issue: 3 }], assets), /unknown photo/);
  const titled = resolveChampions([{ issue: 2, theme: { zh: "主题", en: "Theme" }, title: { zh: "标题", en: "Title" } }], assets);
  assert.equal(titled[0].title?.en, "Title");
  assert.throws(() => resolveChampions([{ issue: 2, theme: { zh: "主题", en: "" } }], assets), /bilingual theme/);
});

async function fixture(run: (root: string) => Promise<void>) {
  const root = await mkdtemp(path.join(os.tmpdir(), "prismshot-photos-"));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

async function createPhoto(root: string, relative: string, color = "red") {
  const filename = path.join(root, "assets/source/photos", relative);
  await mkdir(path.dirname(filename), { recursive: true });
  await sharp({ create: { width: 80, height: 40, channels: 3, background: color } }).png().toFile(filename);
  return filename;
}

test("fresh manifest is deterministic and nested moves preserve IDs", async () => fixture(async (root) => {
  const source = await createPhoto(root, "gallery/a/2026-08-28-0.png");
  const records = await generatePhotoManifest(root);
  const output = path.join(root, "content/photo-manifest.generated.ts");
  const before = await stat(output);
  await generatePhotoManifest(root);
  assert.equal((await stat(output)).mtimeMs, before.mtimeMs);
  await mkdir(path.join(root, "assets/source/photos/gallery/b"));
  await rename(source, path.join(root, "assets/source/photos/gallery/b/2026-08-28-0.png"));
  const moved = await generatePhotoManifest(root);
  assert.equal(moved[0].id, records[0].id);
  assert.equal(moved[0].date, "2026-08-28");
  assert.notEqual(moved[0].source, records[0].source);
  assert.match(await readFile(output, "utf8"), /PhotoAssetId = keyof/);
}));

test("invalid names, roots, collisions and unreadable LFS pointers fail", async () => {
  for (const paths of [
    ["root.png"],
    ["gallery/Bad_Name.png"],
    ["gallery/a/photo.png", "gallery/b/photo.jpeg"],
    ["a-b/c.png", "a/b-c.png"],
  ]) {
    await fixture(async (root) => {
      for (const relative of paths) await createPhoto(root, relative);
      await assert.rejects(scanPhotoManifest(path.join(root, "assets/source/photos")), /require|duplicate/);
    });
  }
  await fixture(async (root) => {
    const file = await createPhoto(root, "gallery/photo.png");
    await writeFile(file, "version https://git-lfs.github.com/spec/v1\n");
    await assert.rejects(generatePhotoManifest(root), /Git LFS/);
  });
});

test("image cache detects same-mtime replacements, verifies outputs and removes stale variants", async () => fixture(async (root) => {
  const source = await createPhoto(root, "gallery/photo.png");
  const photos = await generatePhotoManifest(root);
  await buildPhotoImages(root, photos);
  const output = path.join(root, "public/generated/photos/gallery-photo-1600.webp");
  const before = await readFile(output);
  const initialStat = await stat(output);
  await buildPhotoImages(root, photos);
  assert.equal((await stat(output)).mtimeMs, initialStat.mtimeMs);
  const time = (await stat(source)).mtime;
  await createPhoto(root, "gallery/photo.png", "blue");
  await utimes(source, time, time);
  await buildPhotoImages(root, await generatePhotoManifest(root));
  assert.notDeepEqual(await readFile(output), before);
  assert.equal((await sharp(output).metadata()).width, 80);
  await writeFile(output, "corrupt");
  const directory = path.dirname(output);
  await writeFile(path.join(directory, "old-photo-1600.webp"), before);
  await writeFile(path.join(directory, "keep.txt"), "unrelated");
  await buildPhotoImages(root, photos);
  assert.equal((await sharp(output).metadata()).height, 40);
  await assert.rejects(stat(path.join(directory, "old-photo-1600.webp")));
  assert.equal(await readFile(path.join(directory, "keep.txt"), "utf8"), "unrelated");
}));

test("EXIF orientation agrees between manifest and encoded image", async () => fixture(async (root) => {
  const source = await createPhoto(root, "gallery/oriented.png");
  const rotated = await sharp(source).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  await writeFile(source, rotated);
  const photos = await generatePhotoManifest(root);
  assert.deepEqual([photos[0].width, photos[0].height], [40, 80]);
  await buildPhotoImages(root, photos);
  const metadata = await sharp(path.join(root, "public/generated/photos/gallery-oriented-1600.webp")).metadata();
  assert.deepEqual([metadata.width, metadata.height], [40, 80]);
}));
