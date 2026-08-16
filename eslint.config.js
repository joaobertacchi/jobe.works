import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    ".react-router/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
    ".opencode/**",
    ".claude/**",
    ".codex/**",
    ".agents/**",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      complexity: ["error", 10],
    },
  },
  prettier,
]);
