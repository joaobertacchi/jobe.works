import { readFileSync, writeFileSync } from "node:fs";
const h = readFileSync("/tmp/codex-subagents-official.html", "utf8");
const t = h
  .replace(/<[^>]+>/g, " ")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ");
const i = t.indexOf("custom agents");
const j = t.indexOf(".codex/agents/");
const start = Math.min(...[i, j].filter((v) => v >= 0));
writeFileSync("/tmp/subagents-text.txt", start >= 0 ? t.slice(start - 300, start + 9000) : "marker not found: " + i + " " + j);
console.log("start", start);

