import { generatePhotoManifest } from "./photo-manifest";
import { buildPhotoImages } from "./photo-images";

const photos = await generatePhotoManifest();
await buildPhotoImages(process.cwd(), photos);
