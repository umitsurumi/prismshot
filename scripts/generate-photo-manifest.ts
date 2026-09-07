import { generatePhotoManifest } from "./photo-manifest";

const records = await generatePhotoManifest();
console.log(`[photos] manifest ready: ${records.length} assets`);
