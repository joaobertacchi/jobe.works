import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { finalizeStaticBuild } from "./finalize-static-build.mjs";

function createBuildDirectory() {
  const root = mkdtempSync(join(tmpdir(), "static-build-"));
  const client = join(root, "client");
  mkdirSync(client);
  return { client, root };
}

describe("finalizeStaticBuild", () => {
  it("rejects a build without prerendered entry HTML", () => {
    const { client } = createBuildDirectory();

    expect(() => finalizeStaticBuild(client)).toThrow(
      "Missing prerendered entry: build/client/index.html",
    );
  });

  it("removes the build-time server artifact", () => {
    const { client, root } = createBuildDirectory();
    writeFileSync(join(client, "index.html"), "<!doctype html>");
    const server = join(root, "server");
    mkdirSync(server);

    finalizeStaticBuild(client);

    expect(existsSync(server)).toBe(false);
  });

  it("removes the generated SPA fallback", () => {
    const { client } = createBuildDirectory();
    writeFileSync(join(client, "index.html"), "<!doctype html>");
    const fallback = join(client, "__spa-fallback.html");
    writeFileSync(fallback, "<!doctype html>");

    finalizeStaticBuild(client);

    expect(existsSync(fallback)).toBe(false);
  });
});
