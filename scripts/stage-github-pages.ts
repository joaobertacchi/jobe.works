import {
  copyFileSync,
  existsSync,
  readdirSync,
  renameSync,
  rmdirSync,
} from "node:fs";
import { join, relative, sep } from "node:path";

// GitHub Pages answers `/en/about` with a 301 to `/en/about/` when the page is
// stored as `en/about/index.html`, but canonical page URLs have no trailing
// slash. Serving `en/about.html` instead keeps the canonical URL. The root and
// locale home pages (`/`, `/en/`) are canonical with a trailing slash and stay.
function listNestedPageIndexes(directory: string, root = directory): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listNestedPageIndexes(path, root);
    const artifact = relative(root, path).split(sep).join("/");
    return entry.name === "index.html" && artifact.split("/").length > 2
      ? [artifact]
      : [];
  });
}

export function stageGitHubPages(
  clientDirectory: string,
  notFoundLocale: string,
): void {
  const notFoundArtifact = `${notFoundLocale}/404/index.html`;
  if (!existsSync(join(clientDirectory, notFoundArtifact))) {
    throw new Error(`Missing not-found page: ${notFoundArtifact}`);
  }

  for (const artifact of listNestedPageIndexes(clientDirectory).sort()) {
    const pageDirectory = join(clientDirectory, artifact, "..");
    if (readdirSync(pageDirectory).length !== 1) {
      throw new Error(
        `Cannot flatten ${artifact}: directory has other entries`,
      );
    }
    renameSync(join(clientDirectory, artifact), `${pageDirectory}.html`);
    rmdirSync(pageDirectory);
  }

  copyFileSync(
    join(clientDirectory, `${notFoundLocale}/404.html`),
    join(clientDirectory, "404.html"),
  );
}
