import { resolve } from "node:path";

import { stageGitHubPages } from "./stage-github-pages.ts";

const [clientDirectory = "build/client", notFoundLocale = "pt-BR"] =
  process.argv.slice(2);

stageGitHubPages(resolve(clientDirectory), notFoundLocale);
