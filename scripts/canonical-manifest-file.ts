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

export function writeCanonicalManifest(manifest: CanonicalUrlManifest): void {
  mkdirSync(dirname(canonicalManifestFile), { recursive: true });
  writeFileSync(
    canonicalManifestFile,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

export function readCanonicalManifest(): CanonicalUrlManifest {
  const manifest = JSON.parse(
    readFileSync(canonicalManifestFile, "utf8"),
  ) as CanonicalUrlManifest;
  validateCanonicalUrlManifest(manifest);
  return manifest;
}
