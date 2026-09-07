import type { Locale } from "@/lib/i18n";

import type { PhotoAssetId } from "./photo-manifest.generated";

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface PhotoAsset {
  readonly id: string;
  readonly source: string;
  readonly width: number;
  readonly height: number;
  readonly date?: string;
}

export interface PhotoMetadata {
  author?: string;
  date?: string;
  title?: LocalizedText;
  caption?: LocalizedText;
  alt?: LocalizedText;
  focalPoint?: { x: number; y: number };
}

export interface PhotoInput extends PhotoMetadata {
  asset: PhotoAssetId;
  id?: string;
}

export interface PhotoContent extends PhotoMetadata {
  id: string;
  asset: PhotoAsset;
}

export interface PhotoViewerItem extends PhotoContent {
  details?: readonly LocalizedText[];
}

function localizePhotoMetadata(value: string): LocalizedText {
  if (value === "anonymous") return { zh: "匿名", en: "Anonymous" };
  if (value === "unknown") return { zh: "未知", en: "Unknown" };
  return { zh: value, en: value };
}

export function toPhotoViewerItem(photo: PhotoContent): PhotoViewerItem {
  return {
    ...photo,
    details: [photo.author, photo.date]
      .filter((value): value is string => Boolean(value))
      .map(localizePhotoMetadata),
  };
}

export function localize(value: LocalizedText, locale: Locale): string {
  return value[locale];
}

export function getPhotoAlt(asset: Pick<PhotoMetadata, "alt">, locale: Locale): string {
  return asset.alt
    ? localize(asset.alt, locale)
    : locale === "zh"
      ? "摄影作品"
      : "Photograph";
}

export function getPhotoDimensions(asset: PhotoAsset): { width: number; height: number } {
  return { width: asset.width, height: asset.height };
}

export function getPhotoLabel(photo: PhotoContent, locale: Locale): string {
  return photo.title
    ? localize(photo.title, locale)
    : getPhotoAlt(photo, locale);
}

export function getPhotoMetadataLabel(
  value: string | undefined,
  locale: Locale,
): string | undefined {
  return value ? localize(localizePhotoMetadata(value), locale) : undefined;
}
