// gta6-meme-x-01 entry program.
// Reproduces the entry picture into the output directory: the picture ships
// in the repo as base64 text (assets/meme.png.b64) and is decoded here to
// meme.png, byte-for-byte. The written bytes are verified against the
// decoded picture, and a deterministic manifest.json describing the picture
// is emitted. Node 22 standard library only, no network, deterministic.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const botDir =
  process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const encoded = readFileSync(join(botDir, "assets", "meme.png.b64"), "utf8");
const picture = Buffer.from(encoded.replace(/\s+/g, ""), "base64");

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "meme.png");
writeFileSync(outPath, picture);

const written = readFileSync(outPath);
if (!written.equals(picture)) {
  console.error(
    `error: written meme.png does not match the picture decoded from ` +
      `assets/meme.png.b64 (wrote ${written.length} bytes, ` +
      `expected ${picture.length} bytes)`,
  );
  process.exit(1);
}

const sha256 = createHash("sha256").update(picture).digest("hex");
const manifest = {
  competition: "gta6-meme-x-01",
  title: "Leonida Air — Flight VI-2013",
  picture: "meme.png",
  bytes: picture.length,
  sha256,
};
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
