import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { CanonicalUrlManifest } from "../app/routing/canonical-url-manifest";
import {
  readCanonicalManifest,
  writeCanonicalManifest,
} from "./canonical-manifest-file";

const manifest = [
  {
    id: "home",
    kind: "page",
    pattern: "/:locale/",
    urls: { en: "/en/", "pt-BR": "/pt-BR/" },
  },
] satisfies CanonicalUrlManifest;

describe("canonical manifest file", () => {
  it("round-trips a generated manifest", () => {
    const directory = mkdtempSync(join(tmpdir(), "manifest-"));
    const file = join(directory, "nested", "manifest.json");

    writeCanonicalManifest(manifest, file);

    expect(existsSync(file)).toBe(true);
    expect(readCanonicalManifest(file)).toEqual(manifest);
  });
});
