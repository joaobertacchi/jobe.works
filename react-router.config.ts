import { resolve } from "node:path";

import type { Config } from "@react-router/dev/config";

import {
  getCanonicalUrls,
  type CanonicalUrlManifest,
} from "./app/routing/canonical-url-manifest";
import { readCanonicalManifest } from "./scripts/canonical-manifest-file.server";
import { finalizeStaticBuild } from "./scripts/finalize-static-build";

export function getPrerenderPaths(
  staticPaths: readonly string[],
  manifest: CanonicalUrlManifest,
): string[] {
  const concreteStaticPaths = staticPaths.filter(
    (path) => !path.includes(":") && !path.includes("*"),
  );
  return [...new Set([...concreteStaticPaths, ...getCanonicalUrls(manifest)])];
}

export default {
  ssr: false,
  prerender({ getStaticPaths }) {
    return getPrerenderPaths(getStaticPaths(), readCanonicalManifest());
  },
  buildEnd() {
    finalizeStaticBuild(
      resolve(process.cwd(), "build/client"),
      readCanonicalManifest(),
    );
  },
} satisfies Config;
