import { readdir } from "node:fs/promises";
import path from "node:path";

export const supportedPhotoSourcePattern = /\.(jpe?g|png)$/i;

export interface PhotoSourceFile {
  absolutePath: string;
  relativePath: string;
}

export function resolvePhotoSourcePath(
  sourceDirectory: string,
  relativePath: string,
): string {
  const normalizedPath = path.posix.normalize(relativePath);

  if (
    !relativePath ||
    path.posix.isAbsolute(relativePath) ||
    relativePath.includes("\\") ||
    normalizedPath !== relativePath ||
    normalizedPath === "." ||
    normalizedPath.startsWith("../") ||
    !supportedPhotoSourcePattern.test(relativePath)
  ) {
    throw new Error(
      `${relativePath || "<empty>"} must be a normalized relative JPG, JPEG, or PNG path using forward slashes`,
    );
  }

  return path.join(sourceDirectory, ...relativePath.split("/"));
}

export async function findPhotoSourceFiles(
  sourceDirectory: string,
): Promise<PhotoSourceFile[]> {
  const files: PhotoSourceFile[] = [];

  async function walk(absoluteDirectory: string, relativeDirectory: string) {
    const entries = (await readdir(absoluteDirectory, { withFileTypes: true }))
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const relativePath = relativeDirectory
        ? path.posix.join(relativeDirectory, entry.name)
        : entry.name;
      const absolutePath = path.join(absoluteDirectory, entry.name);

      if (entry.isSymbolicLink()) {
        throw new Error(`${relativePath}: symbolic links are not supported in photo sources`);
      } else if (entry.isDirectory()) {
        await walk(absolutePath, relativePath);
      } else if (entry.isFile() && supportedPhotoSourcePattern.test(entry.name)) {
        files.push({ absolutePath, relativePath });
      }
    }
  }

  await walk(sourceDirectory, "");
  return files;
}
