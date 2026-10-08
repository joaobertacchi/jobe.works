import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { stageGitHubPages } from "./stage-github-pages";

let client: string;

function write(path: string, content = `<html>${path}</html>`) {
  const file = join(client, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function read(path: string) {
  return readFileSync(join(client, path), "utf8");
}

beforeEach(() => {
  client = mkdtempSync(join(tmpdir(), "pages-"));
  write("index.html");
  write("en/index.html");
  write("en/about/index.html");
  write("en/about.data", "data");
  write("en/404/index.html");
  write("pt-BR/index.html");
  write("pt-BR/404/index.html");
  write("assets/app-abcdefgh.js", "js");
});

afterEach(() => {
  rmSync(client, { force: true, recursive: true });
});

describe("stageGitHubPages", () => {
  it("flattens page directories so extensionless canonical URLs are served without a redirect", () => {
    stageGitHubPages(client, "pt-BR");

    expect(read("en/about.html")).toBe("<html>en/about/index.html</html>");
    expect(existsSync(join(client, "en/about"))).toBe(false);
    expect(read("en/about.data")).toBe("data");
  });

  it("keeps the root and locale home pages at their trailing-slash index files", () => {
    stageGitHubPages(client, "pt-BR");

    expect(read("index.html")).toBe("<html>index.html</html>");
    expect(read("en/index.html")).toBe("<html>en/index.html</html>");
    expect(existsSync(join(client, "en.html"))).toBe(false);
  });

  it("publishes the chosen locale's not-found page as the root 404", () => {
    stageGitHubPages(client, "pt-BR");

    expect(read("404.html")).toBe("<html>pt-BR/404/index.html</html>");
    expect(read("pt-BR/404.html")).toBe("<html>pt-BR/404/index.html</html>");
  });

  it("leaves non-HTML assets untouched", () => {
    stageGitHubPages(client, "pt-BR");

    expect(read("assets/app-abcdefgh.js")).toBe("js");
  });

  it("refuses to flatten a page whose directory holds nested pages", () => {
    write("en/guides/index.html");
    write("en/guides/setup/index.html");

    expect(() => stageGitHubPages(client, "pt-BR")).toThrow(
      "Cannot flatten en/guides/index.html: directory has other entries",
    );
  });

  it("fails when the not-found page for the locale is missing", () => {
    expect(() => stageGitHubPages(client, "fr")).toThrow(
      "Missing not-found page: fr/404/index.html",
    );
  });
});
