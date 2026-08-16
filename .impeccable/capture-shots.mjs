import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = "http://127.0.0.1:4173";
const pages = ["/pt-BR/", "/en/services", "/en/case", "/en/contact", "/en/about"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
mkdirSync(".impeccable/shots", { recursive: true });
const browser = await chromium.launch();
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
    const name = path.replaceAll("/", "_").replaceAll("__", "_").slice(1) || "home";
    await page.screenshot({ path: `.impeccable/shots/${vp.name}-${name}.png`, fullPage: true });
    console.log("shot " + vp.name + "-" + name);
  }
  await context.close();
}
await browser.close();

