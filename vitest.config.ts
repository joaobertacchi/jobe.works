import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  test: {
    allowOnly: !process.env.CI,
    environment: "jsdom",
    // Never let a local .env PostHog key reach unit tests.
    env: { VITE_POSTHOG_KEY: "", VITE_POSTHOG_HOST: "" },
    include: [
      "app/**/*.test.{ts,tsx}",
      "scripts/**/*.test.{mjs,ts}",
      "tests/**/*.test.ts",
    ],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      exclude: ["**/*.test.{ts,tsx,mjs}", "scripts/*-cli.mjs"],
      include: ["app/**/*.{ts,tsx}", "scripts/**/*.{mjs,ts}"],
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
