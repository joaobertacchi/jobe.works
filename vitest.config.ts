import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: [
      "app/**/*.test.{ts,tsx}",
      "scripts/**/*.test.mjs",
      "tests/**/*.test.ts",
    ],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      exclude: [
        "**/*.test.{ts,tsx,mjs}",
        "app/locales/types.ts",
        "scripts/*-cli.mjs",
      ],
      include: ["app/**/*.{ts,tsx}", "scripts/**/*.mjs"],
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
