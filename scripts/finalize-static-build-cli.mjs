import { fileURLToPath } from "node:url";

import { finalizeStaticBuild } from "./finalize-static-build.mjs";

finalizeStaticBuild(fileURLToPath(new URL("../build/client", import.meta.url)));
