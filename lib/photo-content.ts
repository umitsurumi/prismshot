import { photoManifest } from "../content/photo-manifest.generated";
import type { PhotoContent, PhotoAsset, PhotoInput, PhotoMetadata, LocalizedText } from "../content/types";
import { isPhotoDate } from "./photo-date";

type Assets = Readonly<Record<string, PhotoAsset>>;

export function resolvePhoto(input: PhotoInput, label: string, assets: Assets = photoManifest): PhotoContent {
  const asset = Object.hasOwn(assets, input.asset) ? assets[input.asset] : undefined;
  if (!asset) throw new Error(`${label}: unknown photo asset ${input.asset}`);
  if (asset.date && input.date !== undefined) throw new Error(`${label}: ${asset.id} date is inferred; remove the configured date`);
  if (input.date !== undefined && !isPhotoDate(input.date)) throw new Error(`${label}: invalid photo date ${input.date}`);
  for (const field of ["title", "caption", "alt"] as const) {
    const value = input[field];
    if (value && (!value.zh.trim() || !value.en.trim())) throw new Error(`${label}: incomplete bilingual ${field}`);
  }
  if (input.focalPoint && [input.focalPoint.x, input.focalPoint.y].some((n) => !Number.isFinite(n) || n < 0 || n > 100)) {
    throw new Error(`${label}: focalPoint must use finite percentages 0–100`);
  }
  if (input.id !== undefined && !input.id.trim()) throw new Error(`${label}: empty content ID`);
  return { ...input, id: input.id ?? asset.id, asset, date: asset.date ?? input.date };
}

export function resolvePhotos(inputs: readonly PhotoInput[], label: string, sortByDate = false, assets: Assets = photoManifest): PhotoContent[] {
  const photos = inputs.map((input, index) => resolvePhoto(input, `${label}[${index}] (${input.asset})`, assets));
  for (const field of ["id", "asset"] as const) {
    const values = photos.map((photo) => field === "asset" ? photo.asset.id : photo.id);
    if (new Set(values).size !== values.length) throw new Error(`${label}: duplicate photo ${field}`);
  }
  return sortByDate ? photos.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")) : photos;
}

export interface ChampionInput extends PhotoMetadata {
  issue: number;
  theme?: LocalizedText;
}

export interface ResolvedChampion extends PhotoContent {
  issue: string;
  theme?: LocalizedText;
  image: PhotoAsset;
}

export function resolveChampions(inputs: readonly ChampionInput[], assets: Assets = photoManifest): ResolvedChampion[] {
  const issues = inputs.map((input) => input.issue);
  if (issues.some((n) => !Number.isSafeInteger(n) || n < 1) || new Set(issues).size !== issues.length) {
    throw new Error("contest champions: issues must be unique positive integers");
  }
  return [...inputs].sort((a, b) => b.issue - a.issue).map(({ issue, theme, ...metadata }) => {
    const asset = `contests-issue${issue}`;
    if (theme && (!theme.zh.trim() || !theme.en.trim())) throw new Error(`contest issue ${issue}: incomplete bilingual theme`);
    const photo = resolvePhoto({ ...metadata, title: metadata.title ?? theme, id: `issue-${issue}`, asset: asset as PhotoInput["asset"] }, `contest issue ${issue}`, assets);
    return { ...photo, theme, issue: String(issue).padStart(2, "0"), image: photo.asset };
  });
}

export function assertAllPhotosReferenced(assets: Assets, photos: readonly PhotoContent[]): void {
  const referenced = new Set(photos.map((photo) => photo.asset.id));
  const unused = Object.keys(assets).filter((id) => !referenced.has(id));
  if (unused.length) throw new Error(`Unreferenced photo assets: ${unused.join(", ")}`);
}
