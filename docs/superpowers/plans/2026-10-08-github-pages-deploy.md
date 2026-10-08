# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every push to `main` that passes full validation builds the static site and deploys `build/client` to GitHub Pages at `https://jobe.works`.

**Architecture:** Extend the existing `.github/workflows/ci.yml`. The `validate` job keeps running `npm run check` and `npm run test:e2e` on every push and pull request. On `push` to `main` only, it then stages a Pages-specific `404.html` and uploads `build/client` as a Pages artifact. A new `deploy` job, gated on `validate`, publishes that exact artifact with `actions/deploy-pages`. No change touches the application, so the build stays provider-neutral (ADR 004); GitHub Pages is recorded as an optional deployment convenience in a new ADR 026.

**Tech Stack:** GitHub Actions, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, existing React Router static build.

**Spec:** User request (2026-10-08): "ao fazer push para main, uma action no GitHub gere os assets todos e faça deploy no GitHub Pages." Constraints come from `AGENTS.md` and ADRs 003, 004, 019, 021.

## Global Constraints

- Production output stays static; no runtime server, no app code change (ADR 003, ADR 005).
- `build/client` must remain deployable to any static server; Pages-only adjustments happen in the workflow, not in `finalizeStaticBuild` (ADR 004).
- Deploy only artifacts that passed `npm run check` **and** `npm run test:e2e` in the same run (ADR 021).
- Pull requests never deploy and never receive `pages: write` / `id-token: write`.
- Node version comes from `.nvmrc` (`22.22.2`).
- `SITE_ORIGIN` stays the default `https://jobe.works`; all asset and link URLs are root-absolute, so the site **must** be served from the domain root (custom domain), not from `joaobertacchi.github.io/jobe.works/`.
- Do not weaken validation, thresholds, tests, or hooks.

## Prerequisites (human, before Task 3 can succeed)

1. **Repository visibility / plan:** `joaobertacchi/jobe.works` is currently **private**. GitHub Pages for a private repo requires GitHub Pro/Team/Enterprise; on the Free plan the repo must be made public. Pick one.
2. **Enable Pages with Actions as source:**
   `gh api -X POST repos/joaobertacchi/jobe.works/pages -f build_type=workflow`
3. **Custom domain:** `gh api -X PUT repos/joaobertacchi/jobe.works/pages -f cname=jobe.works`
   (With Actions-based deploys, a `CNAME` file in the artifact is ignored; the setting is what counts.)
4. **DNS at the registrar for `jobe.works`:** apex `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and `AAAA` records `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`; optionally `www CNAME joaobertacchi.github.io`. Recommended: verify the domain under GitHub account settings → Pages to prevent takeover.
5. After the certificate is issued: `gh api -X PUT repos/joaobertacchi/jobe.works/pages -F https_enforced=true`.

## Review Focus

- **Unknown URL** (`/foo`, `/en/nope`): GitHub Pages serves only a root `/404.html`. Expect the localized "Page Not Found" page with HTTP 404, not GitHub's generic page. Covered by Task 2 step + Task 3 smoke check.
- **Extensionless canonical URLs** (`/en/about`): the build emits `en/about/index.html`; GitHub Pages answers `/en/about` with a `301` to `/en/about/` while the canonical tag says `/en/about`. Expect at most one redirect and the page to load; record the observed behavior in Task 3. If it 301s, open a follow-up decision (emit `en/about.html` siblings vs. trailing-slash canonicals) — out of scope here because it changes SEO architecture (ADR 019).
- **Failed validation on `main`**: a red `check` or `test:e2e` must leave the previous deployment live. Guaranteed by `needs: validate` and by uploading only after tests; verified in Task 1 by reading the job graph.
- **Two pushes in quick succession**: deployments must not interleave; the latest push wins. Covered by the `concurrency` group in Task 1.
- **Pull request from a branch**: must run validation but skip upload and deploy. Covered by the `if:` guards in Task 1.

---

### Task 1: Deploy workflow

**Files:**
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: a Pages artifact named `github-pages` (the default of `upload-pages-artifact`) consumed by the `deploy` job; environment `github-pages` whose URL is the live site.

- [ ] **Step 1: Confirm current action majors**

Run:
```bash
for a in configure-pages upload-pages-artifact deploy-pages checkout setup-node; do
  printf '%s ' "$a"; gh api repos/actions/$a/releases/latest --jq .tag_name
done
```
Expected: tags such as `v5.x`, `v4.x`, `v4.x`, `v4.x/v5.x`, `v4.x/v5.x`. Use the latest **major** of each in the YAML below; if a newer major exists than written here, read its release notes for breaking changes before bumping. Keep `checkout`/`setup-node` at whatever the file already uses unless upgrading all together.

- [ ] **Step 2: Replace `.github/workflows/ci.yml` with**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

concurrency:
  group: ${{ github.event_name == 'push' && 'pages' || format('ci-{0}', github.ref) }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - run: npm ci

      - run: npm run check

      - run: npx playwright install --with-deps chromium

      - run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-failure-artifacts
          path: |
            playwright-report/
            test-results/
          retention-days: 7

      - name: Stage GitHub Pages 404 page
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: cp build/client/pt-BR/404/index.html build/client/404.html

      - uses: actions/configure-pages@v5
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'

      - uses: actions/upload-pages-artifact@v4
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        with:
          path: build/client

  deploy:
    needs: validate
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Notes for the implementer:
- `build/client` at that point is the output of the `npm run build` started by Playwright's `webServer`, i.e. the same build the e2e suite just exercised.
- `404.html` is added **after** validation on purpose: `finalizeStaticBuild` rejects unexpected HTML artifacts, and the root 404 is a GitHub Pages hosting convention, not part of the portable artifact (ADR 004). `pt-BR` matches the root `index.html` locale.
- `cancel-in-progress` is false for pushes so an in-flight deployment is never cut off mid-publish; queued pushes collapse to the newest.

- [ ] **Step 3: Lint the workflow**

Run: `npx --yes @action-validator/cli .github/workflows/ci.yml` (or `actionlint` if installed via Homebrew — do not add either to `package.json`).
Expected: no errors.

- [ ] **Step 4: Run local validation**

Run: `source ~/.nvm/nvm.sh && nvm use && npm run check && npm run test:e2e`
Expected: PASS (no app code changed; this confirms the tree is green before pushing).

- [ ] **Step 5: Simulate the staging step locally**

Run: `cp build/client/pt-BR/404/index.html build/client/404.html && grep -c '<title>' build/client/404.html && rm build/client/404.html`
Expected: `1`, proving the source path exists in a fresh build.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: deploy validated static build to GitHub Pages on main"
```

### Task 2: Record the decision and document deployment

**Files:**
- Create: `docs/adrs/026-github-pages-deployment.md`
- Modify: `docs/decisions_list.md` (status table)
- Modify: `docs/INDEX.md:36` (add ADR 026 to "Product and static deployment boundaries")
- Modify: `README.md:140-148` ("Build and Deploy")

- [ ] **Step 1: Write ADR 026**

```markdown
# ADR 026 — GitHub Pages Deployment

**Status:** Accepted

## Context

ADR 004 requires a portable static artifact and allows provider-specific deployment as an optional convenience. The jobe.works fork needs automatic publishing on every change to `main`.

## Decision

CI deploys `build/client` to GitHub Pages with the official Pages actions after `npm run check` and `npm run test:e2e` pass on a push to `main`. Pull requests validate only.

The site is served from the custom domain `https://jobe.works`, matching the default `SITE_ORIGIN`, because the build emits root-absolute URLs.

GitHub Pages serves unknown paths with a root `404.html`. The workflow copies `pt-BR/404/index.html` to `404.html` after validation; the portable artifact produced by `finalizeStaticBuild` is unchanged.

## Consequences

- Moving to another host requires only replacing the deploy job; the build is untouched.
- GitHub Pages redirects extensionless directory URLs (for example `/en/about`) to a trailing-slash form. Any change to canonical URL shape to avoid that redirect is a separate SEO decision under ADR 019.
- Pages settings (source, custom domain, HTTPS) and DNS live outside the repository and are documented in the README.
```

- [ ] **Step 2: Add the row to `docs/decisions_list.md`** after the `P021` row:

```markdown
| P022 | Deployment Target | Accepted | [ADR 026](adrs/026-github-pages-deployment.md) |
```

- [ ] **Step 3: Update `docs/INDEX.md:36`** so the cell ends with `, [ADR 005](adrs/005-backend-policy.md), [ADR 026](adrs/026-github-pages-deployment.md) |`.

- [ ] **Step 4: Append to README "Build and Deploy"** (after the existing paragraph at line 148):

```markdown
### GitHub Pages

Pushes to `main` deploy automatically through `.github/workflows/ci.yml` once validation and browser tests pass. One-time setup:

1. Enable Pages with GitHub Actions as the source: `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`.
2. Set the custom domain: `gh api -X PUT repos/<owner>/<repo>/pages -f cname=jobe.works`.
3. Point DNS for the apex domain to GitHub Pages (`A` 185.199.108–111.153, `AAAA` 2606:50c0:8000–8003::153).
4. Enforce HTTPS once the certificate is issued: `gh api -X PUT repos/<owner>/<repo>/pages -F https_enforced=true`.
```

- [ ] **Step 5: Validate formatting**

Run: `npm run format:check`
Expected: PASS (run `npx prettier --write` on the three Markdown files if it fails, then re-run).

- [ ] **Step 6: Commit**

```bash
git add docs/adrs/026-github-pages-deployment.md docs/decisions_list.md docs/INDEX.md README.md
git commit -m "docs: record GitHub Pages deployment decision"
```

### Task 3: First deployment and smoke check

Requires the Prerequisites section to be done.

- [ ] **Step 1: Run the architecture review** (AGENTS.md completion step 5) against Tasks 1–2 and fix high/medium findings.

- [ ] **Step 2: Push and watch**

```bash
git push origin main
gh run watch --exit-status "$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId')"
```
Expected: `validate` and `deploy` both succeed; `deploy` prints the page URL.

- [ ] **Step 3: Smoke-check the live site**

```bash
for p in / /pt-BR/ /en/ /en/about /en/about/ /sitemap.xml /robots.txt /favicon.svg /does-not-exist; do
  printf '%-18s ' "$p"; curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://jobe.works$p"
done
curl -s https://jobe.works/does-not-exist | grep -o '<title>[^<]*'
```
Expected: `200` for `/`, `/pt-BR/`, `/en/`, `/en/about/`, `/sitemap.xml`, `/robots.txt`, `/favicon.svg`; `404` for `/does-not-exist` with the localized not-found `<title>`; `/en/about` either `200` or a single `301` to `/en/about/`. Write the observed `/en/about` result into the Consequences of ADR 026 (commit `docs: note observed Pages redirect behavior`).

- [ ] **Step 4: Verify a PR does not deploy**

Open any PR; in its run, confirm the `deploy` job shows as skipped and the Pages upload steps are skipped.
