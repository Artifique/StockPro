import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const publicSrc = path.join(root, "public");

if (!fs.existsSync(standalone)) {
  console.warn("copy-standalone-assets: .next/standalone absent — étape ignorée (build sans output standalone ?)");
  process.exit(0);
}

fs.mkdirSync(path.join(standalone, ".next"), { recursive: true });
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, path.join(standalone, ".next", "static"), { recursive: true });
}
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, path.join(standalone, "public"), { recursive: true });
}
