# Phase 4 Example Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing localized routes into a small polished example site and add a localized Privacy page that demonstrates the completed Phase 5 SEO contract.

**Architecture:** Preserve the current component layers and visual language. Add only a semantic link primitive, one genuinely reused content section, and a site footer; page structure stays in TSX while every visible and SEO string stays in typed page-scoped dictionaries.

**Tech Stack:** React Router Framework Mode v8, React 19, TypeScript 5.9, Tailwind CSS v4, i18n-js, Vitest, React Testing Library, Playwright

---

## File Structure

- Create `app/i18n/translations/privacy.ts`: complete localized Privacy body and SEO schema.
- Modify `app/i18n/types.ts` and `app/i18n/translations/index.ts`: register Privacy exhaustively.
- Create `app/routes/$locale.privacy.tsx`: localized semantic Privacy route with native SEO metadata.
- Create `app/components/ui/text-link.tsx`: semantic visual API over React Router `Link`.
- Create `app/components/sections/content-section.tsx`: shared titled content composition for Home and About.
- Create `app/components/site/site-footer.tsx`: localized footer and Privacy navigation.
- Modify `app/components/site/site-header.tsx`: preserve current header while matching the polished shell.
- Modify `app/routes/$locale.tsx`: render the footer in the localized shell.
- Modify Home, About, Services, and 404 routes and dictionaries: polished generic content and composition.
- Modify unit/component and Playwright tests: cover page teaching patterns, accessibility, responsiveness, themes, and SEO.

### Task 1: Add Privacy as a Fully Contracted Route

**Files:**
- Create: `app/i18n/translations/privacy.ts`
- Modify: `app/i18n/types.ts`
- Modify: `app/i18n/translations/index.ts`
- Create: `app/routes/$locale.privacy.tsx`
- Modify: `app/routes/$locale.test.tsx`
- Modify: `app/i18n/types.type-test.ts`

- [ ] **Step 1: Write failing translation and route tests**

Add Privacy to the in-memory canonical manifest and route tree in `$locale.test.tsx`. Assert `/en/privacy` and `/pt-BR/privacy` each render one localized `h1`, an introductory paragraph, and four `h2` sections. Import Privacy `meta()` and assert localized title, self-canonical, indexability, default social metadata, and no JSON-LD descriptor.

Add a type assertion that `translate("privacy.sections.data.title")` is valid and an incomplete `PrivacyTranslation` fails with `@ts-expect-error`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- 'app/routes/$locale.test.tsx' && npm run typecheck`

Expected: FAIL because the Privacy translation scope and route do not exist.

- [ ] **Step 3: Add the typed Privacy dictionary**

Define:

```ts
export type PrivacyTranslation = {
  seo: { title: string; description: string };
  title: string;
  introduction: string;
  sections: {
    data: { title: string; body: string };
    purpose: { title: string; body: string };
    storage: { title: string; body: string };
    rights: { title: string; body: string };
  };
};
```

Use this complete generic content:

```text
EN title: Privacy notice
EN introduction: This example explains the privacy posture of the base static template. Adapt it to the services and processing activities used by your site.
EN data title/body: Data handled by the template / The base template does not send personal data to a project-owned backend. Browser and hosting infrastructure may still process technical request data according to their own configuration.
EN purpose title/body: Added integrations / A fork that adds analytics, forms, marketing tools, or other providers must document what data is collected, why it is needed, and who receives it.
EN storage title/body: Local preferences / The theme control may store an explicit light or dark preference in this browser. The language remains represented by the URL and is not persisted separately.
EN rights title/body: Your choices / Site owners must replace this example with contact details and procedures that match their actual legal obligations and data practices.
EN SEO title: Privacy Notice | Agent-ready Static Sites
EN SEO description: Read the generic privacy posture demonstrated by this static website template and learn what each fork must document for its own integrations.

PT title: Aviso de privacidade
PT introduction: Este exemplo explica a postura de privacidade do modelo estático base. Adapte-o aos serviços e às atividades de tratamento usados pelo seu site.
PT data title/body: Dados tratados pelo modelo / O modelo base não envia dados pessoais para um backend próprio do projeto. O navegador e a infraestrutura de hospedagem ainda podem tratar dados técnicos de requisição conforme suas configurações.
PT purpose title/body: Integrações adicionadas / Um fork que adicione analytics, formulários, ferramentas de marketing ou outros provedores deve informar quais dados são coletados, por que são necessários e quem os recebe.
PT storage title/body: Preferências locais / O controle de tema pode armazenar neste navegador uma preferência explícita por tema claro ou escuro. O idioma permanece representado pela URL e não é persistido separadamente.
PT rights title/body: Suas escolhas / Os responsáveis pelo site devem substituir este exemplo por contatos e procedimentos compatíveis com suas obrigações legais e práticas reais de tratamento de dados.
PT SEO title: Aviso de Privacidade | Sites Estáticos para Agentes
PT SEO description: Conheça a postura genérica de privacidade demonstrada por este modelo de site estático e o que cada fork deve documentar sobre suas integrações.
```

- [ ] **Step 4: Register Privacy exhaustively**

Add `privacy: PrivacyTranslation` to `Translation`, import `privacyTranslations`, and include both locale values in the translation registry.

- [ ] **Step 5: Implement the Privacy route**

Use `Container`, `Heading`, and `Text` directly. Render `<main>` with a constrained readable column, one `h1`, then four `<section>` elements with `h2` headings. Export route-native `meta()` using `createPageMeta`, page translations, `indexable: true`, and parent SEO loader data.

- [ ] **Step 6: Run focused tests, type checking, and build**

Run: `npm test -- 'app/routes/$locale.test.tsx' && npm run typecheck && npm run build`

Expected: PASS; the manifest and build contain `/en/privacy` and `/pt-BR/privacy`, both appear in sitemap, and no SEO validation fails.

- [ ] **Step 7: Commit Privacy route**

```bash
git add app/i18n app/routes
git commit -m "feat: add localized privacy page"
```

### Task 2: Add the Reused Link, Content Section, and Footer

**Files:**
- Create: `app/components/ui/text-link.tsx`
- Create: `app/components/sections/content-section.tsx`
- Create: `app/components/site/site-footer.tsx`
- Modify: `app/components/ui/primitives.test.tsx`
- Modify: `app/components/sections/hero-section.test.tsx`
- Modify: `app/components/site/site-components.test.tsx`
- Modify: `app/components/site/site-header.tsx`
- Modify: `app/routes/$locale.tsx`
- Modify: `app/i18n/translations/common.ts`

- [ ] **Step 1: Write failing component tests**

Assert `TextLink` renders a React Router link with primary and secondary semantic variants and a visible focus class. Assert `ContentSection` renders an optional eyebrow, `h2`, body, and children without adding an extra landmark. Assert `SiteFooter` renders a `contentinfo` landmark, localized site text, Home and Privacy links for the active locale, and no unlocalized hard-coded copy.

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm test -- app/components/ui/primitives.test.tsx app/components/sections/hero-section.test.tsx app/components/site/site-components.test.tsx`

Expected: FAIL because the new components do not exist.

- [ ] **Step 3: Implement `TextLink`**

Create a `LinkProps` wrapper with `variant?: "primary" | "secondary"`. Primary uses brand background/foreground and secondary uses foreground text with an underline offset. Both use inline-flex sizing, rounded focus outline, and no arbitrary values. Preserve all normal `Link` props.

- [ ] **Step 4: Implement `ContentSection`**

Accept `eyebrow?: string`, `title: string`, `description: string`, and `children?: ReactNode`. Compose `Container`, `Text`, and `Heading`; use structural Tailwind only for a responsive two-column layout where the heading block and content align at large widths.

- [ ] **Step 5: Implement and integrate `SiteFooter`**

Add common dictionary fields using `Footer navigation` / `Navegação do rodapé`, `A static foundation designed to be understood and replaced.` / `Uma base estática criada para ser compreendida e substituída.`, and `Privacy` / `Privacidade`, plus `navigation.privacy`. Use the active locale from `useI18n()` to build `/${locale}/` and `/${locale}/privacy`. Render the footer after `<Outlet />` inside a flex-column shell with route content allowed to grow. Keep Privacy out of primary header navigation.

- [ ] **Step 6: Run component and route tests and verify GREEN**

Run: `npm test -- app/components 'app/routes/$locale.test.tsx'`

Expected: PASS.

- [ ] **Step 7: Commit shared page composition**

```bash
git add app/components app/i18n/translations/common.ts app/routes/'$locale.tsx'
git commit -m "feat: add example site footer and sections"
```

### Task 3: Polish Home and About as Teaching Examples

**Files:**
- Modify: `app/i18n/translations/home.ts`
- Modify: `app/i18n/translations/about.ts`
- Modify: `app/routes/$locale._index.tsx`
- Modify: `app/routes/$locale.about.tsx`
- Modify: `app/components/sections/hero-section.tsx`
- Modify: `app/components/sections/hero-section.test.tsx`
- Modify: `app/routes/$locale.test.tsx`

- [ ] **Step 1: Write failing page-composition tests**

Assert Home has one `h1`, three principle headings, and a localized Services call to action. Assert About has one `h1`, two shared `ContentSection` compositions, logical `h2` order, and no raw user-facing string literals in the route source.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- app/components/sections/hero-section.test.tsx 'app/routes/$locale.test.tsx'`

Expected: FAIL because the richer content is absent.

- [ ] **Step 3: Extend Home and About dictionaries**

Add Home `cta`, plus three named principles: `Static delivery`, `Typed localization`, and `Deterministic quality`, translated as `Entrega estática`, `Localização tipada`, and `Qualidade determinística`. Use concise descriptions grounded in the existing architecture and CTA labels `Explore the examples` / `Explore os exemplos`. Add About sections `Clear boundaries` and `Working examples`, translated as `Limites claros` and `Exemplos funcionais`, with one paragraph each explaining static constraints and local training patterns. Preserve existing SEO fields.

- [ ] **Step 4: Polish the Hero and Home route**

Extend `HeroSection` with optional `actions: ReactNode` and render actions after description. Home composes the hero, Services `TextLink`, and a three-column principle section using `Card`, `Heading`, and `Text`. Keep visual decisions in primitives and structural layout in the route/section.

- [ ] **Step 5: Polish About through shared content sections**

Render an introductory heading block followed by two `ContentSection` instances. Keep one `h1`, use `h2` for section titles, and constrain prose width for readability.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `npm test -- app/components/sections/hero-section.test.tsx 'app/routes/$locale.test.tsx'`

Expected: PASS in both locales.

- [ ] **Step 7: Commit Home and About polish**

```bash
git add app/components/sections app/i18n/translations/home.ts app/i18n/translations/about.ts app/routes
git commit -m "feat: polish example home and about pages"
```

### Task 4: Polish Services and Localized 404

**Files:**
- Modify: `app/i18n/translations/services.ts`
- Modify: `app/i18n/translations/not-found.ts`
- Modify: `app/routes/$locale.services.tsx`
- Modify: `app/routes/$locale.404.tsx`
- Modify: `app/components/domain/service-card.tsx`
- Modify: `app/components/domain/service-card.test.tsx`
- Modify: `app/routes/$locale.test.tsx`

- [ ] **Step 1: Write failing semantic and recovery tests**

Assert Services retains exactly three `article` elements with logical `h2` headings and adds a localized closing note without introducing a fourth card. Assert localized 404 renders its noindex metadata and a localized Home `TextLink` with the exact canonical trailing slash.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- app/components/domain/service-card.test.tsx 'app/routes/$locale.test.tsx'`

Expected: FAIL because the closing note and recovery link are absent.

- [ ] **Step 3: Extend localized content**

Add Services closing title/body `A foundation, not a platform` / `These examples stay intentionally small so each fork can establish its own content and visual system.` and `Uma base, não uma plataforma` / `Estes exemplos permanecem intencionalmente pequenos para que cada fork estabeleça seu próprio conteúdo e sistema visual.` Add 404 Home-link labels `Return home` / `Voltar ao início`.

- [ ] **Step 4: Improve Services and 404 composition**

Preserve `ServiceCard` as a domain component composed from `Card`, `Heading`, and `Text`. Improve the page introduction and spacing, retain the responsive one/two/three-column grid, and render the closing note in a bordered semantic section. Add the localized Home `TextLink` to 404.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- app/components/domain/service-card.test.tsx 'app/routes/$locale.test.tsx'`

Expected: PASS.

- [ ] **Step 6: Commit remaining page polish**

```bash
git add app/components/domain app/i18n/translations app/routes
git commit -m "feat: polish services and not-found pages"
```

### Task 5: Browser Validation and Phase 4 Completion

**Files:**
- Modify: `tests/e2e/routing.spec.ts`
- Modify: `tests/e2e/components-theming.spec.ts`

- [ ] **Step 1: Expand route fixtures and language-switch tests**

Add both Privacy URLs and headings to published page fixtures and language-sibling cases. Assert footer Privacy navigation remains in the active locale and Privacy metadata is present in final HTML.

- [ ] **Step 2: Add responsive and accessibility evidence**

At 390×844, visit every English page and assert no horizontal overflow, exactly one `h1`, visible footer, and keyboard-reachable navigation and calls to action. At 1280×800, assert Home principles and Services cards use multiple columns. Run representative pages under light and dark themes and assert readable computed foreground/background differences remain.

- [ ] **Step 3: Run focused browser tests**

Run: `npm run test:e2e -- tests/e2e/routing.spec.ts tests/e2e/components-theming.spec.ts`

Expected: PASS with no console or page errors.

- [ ] **Step 4: Run canonical deterministic validation**

Run: `source "$HOME/.nvm/nvm.sh" && nvm use && npm run check`

Expected: formatting, lint, type checking, all unit/component tests, coverage, production build, SEO generation, and static validation pass.

- [ ] **Step 5: Run the full browser suite**

Run: `npm run test:e2e`

Expected: all Chromium tests pass.

- [ ] **Step 6: Update the knowledge graph**

Run: `graphify update .`

Expected: graph update completes successfully.

- [ ] **Step 7: Request architecture review**

Delegate to `architecture-review` with the combined Phase 4-5 acceptance criteria, changed files, fresh deterministic and browser validation results, and explicit exclusion of Phase 6+ capabilities. Resolve all high and medium findings.

- [ ] **Step 8: Commit final browser evidence and review fixes**

```bash
git add tests/e2e
git commit -m "test: verify polished example pages"
```
