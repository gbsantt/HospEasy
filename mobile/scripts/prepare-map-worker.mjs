import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const packageRoot = dirname(require.resolve("maplibre-gl/package.json"));
const target = fileURLToPath(new URL("../public/maplibre/", import.meta.url));
await mkdir(target, { recursive: true });
// Metro doesn't publish the sibling ES modules used by MapLibre's worker.
// Copy matching versions from the installed package, never from a remote CDN.
for (const name of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
    await copyFile(join(packageRoot, "dist", name), join(target, name));
}
await copyFile(join(packageRoot, "LICENSE.txt"), join(target, "LICENSE.txt"));
