# Human-First README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the command-only root README with a concise human adoption guide for creating, customizing, validating, and deploying a website from the template.

**Architecture:** Keep audience responsibilities separate: `README.md` guides the human adopter, `AGENTS.md` remains the AI-agent operating contract, and `docs/INDEX.md` remains the deeper documentation index. Document existing repository behavior without adding new setup mechanisms, provider-specific deployment instructions, or duplicated ADR rationale.

**Tech Stack:** Markdown, npm scripts, React Router Framework Mode, TypeScript, Playwright

---

### Task 1: Rewrite the root adoption guide

**Files:**
- Modify: `README.md`

- [x] **Step 1: Replace the existing README structure**

Write a human-first guide with these sections in this order:

1. Product definition: explain that this is a reusable AI-agent development harness, not a website framework or finished website.
2. Included capabilities and explicit non-goals.
3. Initial setup using the pinned Node version, `npm ci`, Playwright Chromium installation, and `npm run dev`.
4. AI-agent workflow that directs the agent to `AGENTS.md` without copying its full contract.
5. Ordered customization map covering site identity and SEO, locales and copy, routes and navigation, visual system and assets, and integrations/privacy/analytics.
6. A pre-publish checklist identifying `https://example.com`, generic branding, placeholder legal copy, example social assets, and the no-op contact integration.
7. Validation workflow explaining `npm run check`, `npm run test:e2e`, architecture review, and CI.
8. Static build and deployment contract, including `SITE_ORIGIN`, `build/client`, no production Node.js runtime, and no SPA fallback.
9. Compact command reference and documentation-role table.

Use exact repository paths and commands. Do not add provider-specific deployment recipes, claim that the example contact form sends data, or duplicate ADR detail.

- [x] **Step 2: Verify documentation formatting and factual references**

Run:

```bash
nvm use
npm run format:check -- README.md docs/template/superpowers/plans/2026-08-11-human-first-readme.md
```

Expected: Prettier reports both Markdown files as correctly formatted.

- [x] **Step 3: Inspect the final diff**

Run:

```bash
git diff --check
```

Expected: no whitespace errors; the root README contains the adoption guide; no application code, validation configuration, or architecture documents are modified.
