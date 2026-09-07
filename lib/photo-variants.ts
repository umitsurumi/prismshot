export const responsivePhotoWidths = [480, 960, 1600] as const;

export function getPhotoSource(
  asset: { readonly id: string },
  width: (typeof responsivePhotoWidths)[number] = 1600,
  format: "avif" | "webp" = "webp",
): string {
  return `/generated/photos/${asset.id}-${width}.${format}`;
}
