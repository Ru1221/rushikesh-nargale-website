// Optimises photos from photos-input/ into public/photos/. Run: npm run photos
// Name each file after the image it replaces, e.g. slide-automate.jpg (see PHOTOS.md).
import fs from "fs";
import path from "path";
import sharp from "sharp";

const IN = path.join(process.cwd(), "photos-input");
const OUT = path.join(process.cwd(), "public", "photos");
fs.mkdirSync(IN, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(IN).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
if (!files.length) console.log("No files in photos-input/. Put your photos there first.");
for (const f of files) {
  const name = path.parse(f).name.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  const dest = path.join(OUT, name + ".jpg");
  await sharp(path.join(IN, f)).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(dest);
  console.log("ok", f, "->", "public/photos/" + name + ".jpg", Math.round(fs.statSync(dest).size / 1024) + " KB");
}
