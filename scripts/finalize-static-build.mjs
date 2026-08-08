import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

export function finalizeStaticBuild(clientDirectory) {
  const entry = join(clientDirectory, "index.html");
  if (!existsSync(entry)) {
    throw new Error("Missing prerendered entry: build/client/index.html");
  }

  const fallback = join(clientDirectory, "__spa-fallback.html");
  if (!existsSync(fallback)) {
    throw new Error(
      "Missing prerender evidence: build/client/__spa-fallback.html",
    );
  }

  const serverDirectory = join(dirname(clientDirectory), "server");
  rmSync(serverDirectory, { force: true, recursive: true });
  rmSync(fallback);
}
