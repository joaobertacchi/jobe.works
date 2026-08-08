import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  type CanonicalUrlManifest,
  validateCanonicalUrlManifest,
} from "../app/routing/canonical-url-manifest";

export const canonicalManifestFile = resolve(
  process.cwd(),
  ".react-router/canonical-url-manifest.json",
);

export function writeCanonicalManifest(
  manifest: CanonicalUrlManifest,
  file = canonicalManifestFile,
): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

export function readCanonicalManifest(
  file = canonicalManifestFile,
): CanonicalUrlManifest {
  const manifest = JSON.parse(
    readFileSync(file, "utf8"),
  ) as CanonicalUrlManifest;
  validateCanonicalUrlManifest(manifest);
  return manifest;
}
