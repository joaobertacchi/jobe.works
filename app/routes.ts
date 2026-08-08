import type { RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

import { createCanonicalUrlManifest } from "./routing/canonical-url-manifest";
import { writeCanonicalManifest } from "../scripts/canonical-manifest-file";

export const routes = await flatRoutes({
  ignoredRouteFiles: ["**/*.test.tsx"],
});
export const canonicalUrlManifest = createCanonicalUrlManifest(routes);
writeCanonicalManifest(canonicalUrlManifest);

export default routes satisfies RouteConfig;
