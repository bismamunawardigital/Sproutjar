import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";

const svg = await readFile("src/app/icon.svg");
await mkdir("public/icons", { recursive: true });
for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).flatten({ background: "#f2ede4" }).png().toFile(`public/icons/icon-${size}.png`);
}
await sharp(svg).resize(180, 180).flatten({ background: "#f2ede4" }).png().toFile("public/icons/apple-touch-icon.png");
const mark = await sharp(svg).resize(320, 320).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#22302a" } })
  .composite([{ input: mark, gravity: "centre" }]).png().toFile("public/icons/icon-maskable-512.png");
const text = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><text x="380" y="280" font-family="sans-serif" font-weight="700" font-size="76" fill="#f2ede4">Sproutjar</text><text x="380" y="355" font-family="sans-serif" font-size="32" fill="#f2ede4">A plan for your cards.</text><text x="380" y="405" font-family="sans-serif" font-size="32" fill="#f2ede4">Ren, your AI voice coach.</text></svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#22302a" } })
  .composite([{ input: await sharp(svg).resize(220, 220).png().toBuffer(), left: 100, top: 195 }, { input: text }])
  .png().toFile("src/app/opengraph-image.png");
console.log("Generated web icons and Open Graph image from src/app/icon.svg");
