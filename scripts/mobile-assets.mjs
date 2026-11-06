import sharp from "sharp";
import { readFileSync } from "node:fs";
const svg = readFileSync("src/app/icon.svg");
const cream = "#f2ede4";
const ink = "#22302a";
// Full icon: the rounded square on cream, as on the website tab.
await sharp(svg).resize(1024, 1024).png().toFile("assets/icon-only.png");
// Adaptive icon: plant marks alone on a transparent layer, ink background.
const glyph = readFileSync("src/app/icon.svg","utf8").replace(/<rect[^>]*\/>\s*/, "");
await sharp(Buffer.from(glyph)).resize(600, 600).extend({ top: 212, bottom: 212, left: 212, right: 212, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile("assets/icon-foreground.png");
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: ink } }).png().toFile("assets/icon-background.png");
// Splash: small mark centred on cream.
const mark = await sharp(svg).resize(360, 360).png().toBuffer();
await sharp({ create: { width: 2732, height: 2732, channels: 4, background: cream } }).composite([{ input: mark, gravity: "centre" }]).png().toFile("assets/splash.png");
await sharp({ create: { width: 2732, height: 2732, channels: 4, background: ink } }).composite([{ input: mark, gravity: "centre" }]).png().toFile("assets/splash-dark.png");
console.log("ok");
