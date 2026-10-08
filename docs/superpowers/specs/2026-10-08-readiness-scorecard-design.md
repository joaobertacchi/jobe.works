# Product Readiness Scorecard — Design

- **Date:** 2026-10-08
- **Status:** Approved in conversation; awaiting written-spec review
- **Path:** Architectural (new interactive feature, new route, new analytics events)

## 1. Intent

JOBE's primary conversion is the Product Readiness Call. Many visitors are not
ready to book a call. The scorecard is a free, self-serve first step: a
20-question assessment that produces a Product Readiness Score, a verdict that
respects critical risks, and up to three findings, then directs the visitor to
a diagnostic conversation.

**Success criteria**

- A visitor completes the scorecard in about 4 minutes on desktop or mobile, in
  `en` or `pt-BR`.
- The result follows the scoring and override rules in section 4 exactly.
- The results screen leads to a prefilled email to `joao@jobe.works`.
- The route stays fully static, with no backend and no storage of answers.
- The experience is animated and on-brand, and fully usable with reduced motion,
  keyboard, and screen readers.

**Decisions made in conversation**

- Results are shown in full immediately. There is no email gate (option A).
- The CTA uses the existing `mailto:` contact channel, prefilled with the results
  summary.
- Results are shareable via the URL hash. Nothing is persisted.
- The home hero secondary CTA is **swapped** from the StockCast case to the
  scorecard.
- Critical questions are not marked to the visitor, to avoid biasing answers.

## 2. Constraints

- React Router Framework Mode, `ssr: false`, prerendered. No backend
  (ADR-005, ADR-008).
- All user-facing copy is in typed localization dictionaries, with explicit
  localized SEO (ADR-013, ADR-014, ADR-019).
- Analytics only via `app/analytics/` typed events (ADR-015).
- No new dependencies. Animation uses CSS and `requestAnimationFrame`
  (ADR-023).
- Theme tokens come from `app/app.css`. New severity tones are defined for both
  light and dark themes (ADR-012).

## 3. Architecture

```
app/scorecard/
  questions.ts        question metadata (no copy)
  scoring.ts          computeResult(answers) → ScorecardResult
  encoding.ts         answers ⇄ URL hash
  scoring.test.ts
  encoding.test.ts

app/i18n/translations/scorecard.ts   en + pt-BR copy

app/components/domain/scorecard/
  scorecard.tsx         state machine: intro → questions → results
  question-step.tsx     one question, answer radiogroup
  progress-rail.tsx     7 category segments
  results-view.tsx      ring, verdict, category bars, findings, unknowns, CTA
  score-ring.tsx        animated SVG dial
  scorecard.test.tsx

app/routes/$locale.scorecard.tsx     SEO meta + composition
tests/e2e/scorecard.spec.ts
```

`app/scorecard/` is pure TypeScript with no React or i18n imports. It is the
single source of truth for scoring, and the UI only renders its output.

### 3.1 Data model

```ts
type CategoryId =
  | "delivery" | "testing" | "security" | "observability"
  | "reliability" | "performance" | "privacy";

type Answer = "yes" | "partial" | "no" | "unknown" | "na";

type Question = {
  id: QuestionId;            // "q01".."q20"
  category: CategoryId;
  classification: "required" | "recommended";
  critical: boolean;
  weight: 1 | 2 | 3;
  allowsNotApplicable?: true; // q15 only
  dependsOn?: QuestionId;     // q16 → q15
};

type ScorecardResult = {
  score: number;                       // 0–100, rounded integer
  band: "strong" | "someGaps" | "significantGaps" | "highRisk";
  verdict: "strong" | "someGaps" | "significantGaps" | "needsAttention" | "highRisk";
  criticalRisks: QuestionId[];         // critical + "no"
  criticalGaps: QuestionId[];          // critical + "partial"
  criticalUnknowns: QuestionId[];      // critical + "unknown"
  categoryScores: Record<CategoryId, { earned: number; applicable: number; percent: number }>;
  findings: Finding[];                 // max 3
};

type Finding = {
  category: CategoryId;
  severity: "criticalRisk" | "criticalGap" | "gap";
};
```

### 3.2 Questions

| Id | Category | Class | Critical | Weight | English text (pt-BR = source checklist) |
|---|---|---|---|---:|---|
| q01 | delivery | required | no | 2 | Do code changes go through review before reaching production? *e.g. pull requests, merge requests, or another code review process.* |
| q02 | delivery | required | no | 3 | Are changes validated automatically before being merged or released? *e.g. tests, build, lint, or other CI checks.* |
| q03 | delivery | required | no | 2 | Is the production release process consistent and reproducible? *e.g. an automated pipeline or a clearly defined procedure, not improvised manual deploys.* |
| q04 | delivery | required | **yes** | 3 | Can you tell which version of the code is running in production and roll back a problematic release? |
| q05 | testing | required | no | 3 | Do the product's main flows have automated tests? *e.g. sign-up, login, payment, or other business-critical flows.* |
| q06 | testing | required | no | 2 | Do tests run automatically whenever relevant changes are made? |
| q07 | security | required | **yes** | 3 | Are passwords, tokens, API keys, and other secrets kept out of the source code? |
| q08 | security | required | **yes** | 3 | Does the backend correctly check who can access or modify each protected piece of data or functionality? *Hiding an option or screen in the interface is not enough.* |
| q09 | security | required | no | 3 | Is data received from users, APIs, and other external systems validated on the backend? |
| q10 | security | required | **yes** | 3 | Is the product protected against common web application and API vulnerabilities? *e.g. injection, XSS, unauthorized data access, and insecure configuration.* |
| q11 | security | required | **yes** | 3 | Is sensitive data properly protected in transit and at rest? *e.g. HTTPS and appropriate protection for credentials and personal information.* |
| q12 | security | recommended | no | 2 | Are the product's dependencies and libraries checked for known vulnerabilities? |
| q13 | observability | required | **yes** | 3 | Are unexpected production errors recorded and possible to investigate? |
| q14 | observability | required | **yes** | 3 | Can you quickly tell if the product is down or showing an abnormal number of errors? *e.g. monitoring, health checks, or alerts.* |
| q15 | reliability | required | **yes** | 3 | Is there a backup strategy for data that cannot be lost? *(Offers "Not applicable" when the product has no relevant persistent data.)* |
| q16 | reliability | required | **yes** | 3 | Are you confident those backups can actually be restored? *e.g. a restore has been tested or there is a proven procedure.* |
| q17 | reliability | required | no | 2 | Are failures or slowness in external services handled without leaving the product stuck indefinitely? *e.g. timeouts, controlled retries, and proper handling of unavailability.* |
| q18 | performance | required | no | 2 | Do the main flows perform acceptably with the current volume of users and data? |
| q19 | performance | recommended | no | 1 | Does the team know the main bottlenecks or limits that could appear if usage grows significantly? |
| q20 | privacy | required | **yes** | 3 | Does the team know what personal or sensitive data the product collects, and have adequate controls for access, retention, and deletion? *Also consider applicable legal or contractual requirements.* |

Category maximums: delivery 10, testing 5, security 17, observability 6,
reliability 8, performance 3, privacy 3. **Total 52.**

## 4. Scoring rules

1. **Answer factors:** yes 1.0, partial 0.5, no 0, unknown 0.
2. **Not applicable:** only q15 offers `na`. When q15 is `na`, q16 is skipped
   in the flow and stored as `na`. Both are removed from the numerator and the
   denominator.
3. **Score** = `round(earned / applicable × 100)`.
4. **Band** from score: 85–100 `strong`, 70–84 `someGaps`,
   50–69 `significantGaps`, 0–49 `highRisk`.
5. **Critical flags** (critical questions only): `no` → Critical Risk,
   `partial` → Critical Gap, `unknown` → Critical Unknown.
6. **Verdict override:**
   - 0 Critical Risks → verdict = band.
   - 1 Critical Risk → if the band is `strong` or `someGaps`, the verdict is
     `needsAttention`. Otherwise the verdict is the band.
   - 2+ Critical Risks → verdict = `highRisk`.
7. **Findings:** max 3, at most one per category.
   - A category's severity is the worst present: `criticalRisk` >
     `criticalGap` > `gap`.
   - A category is a `gap` if its percent is below 70 and it has no critical
     flag.
   - Sort by severity, then by lost weight (`applicable − earned`) descending,
     then by the canonical category order above.
   - Critical Unknowns are not findings. They are listed separately under
     "Areas to verify".

## 5. URL hash encoding

- Format: `#r=1.<20 chars>`, where `1` is the encoding version.
- Characters: `y` yes, `p` partial, `n` no, `u` unknown, `x` na.
- Decoding rejects (returns `null`) on:
  - an unknown version
  - a wrong length
  - an unknown character
  - `x` on any question other than q15/q16
  - a q15/q16 `x` mismatch
- A rejected hash shows the intro.

## 6. UI flow and states

```
intro ──Start──▶ question(i) ──answer──▶ question(i+1) … ──last──▶ results
  ▲                 │ Back                                           │
  └────────────── Retake (clears hash) ◀─────────────────────────────┘
```

- On mount, a valid hash takes the visitor straight to `results`.
- Completing the flow writes the hash with `history.replaceState`.
- If q15 changes from `na` to an answer, q16 re-enters the flow.

### 6.1 Intro

- A display title, the three stats (20 questions · ~4 min · no sign-up), and
  a short promise line.
- A Start button.
- A faint 7-node category constellation, echoing the home `SystemsTopology`.

### 6.2 Question screen

- **Progress rail:** 7 labeled segments sized by question count. Completed
  segments are filled, and the active segment pulses.
- **Content:** a category eyebrow, the question in display type, and the hint
  in muted italic.
- **Answers:** a `role="radiogroup"` of 4 cards, plus "Not applicable" on q15.
  - Layout is a 2×2 grid on desktop and stacked on mobile.
  - Keys 1–4 (5 for N/A) select an answer. Arrow keys move between options.
  - Selection fills the card with `brand`. After ~250 ms the question exits
    left and the next one rises in.
  - Focus moves to the new question heading.
- A Back button is always available. Previously given answers are
  preselected.

### 6.3 Results (choreographed, ~1.8 s total)

1. **Score ring:**
   - The SVG arc draws while the number counts up.
   - The ring tone follows the **verdict**, not the score.
   - The score is announced via `aria-live="polite"`.
2. **Verdict banner:**
   - Shows the localized verdict label and summary.
   - When the override applies, it shows the critical-risk message.
3. **Category bars:**
   - Seven bars fill in sequence, 60 ms apart.
   - A severity marker appears where the category has a critical flag.
   - Each bar has a visually hidden text equivalent.
4. **Findings:** up to 3 numbered cards with the category, a severity tag, and
   one localized sentence (keyed by `category × severity`).
5. **Areas to verify:** shown only when there are Critical Unknowns. These use a
   dashed outline and list the localized question topics.
6. **Next step:**
   - Heading: "Discover which risks to fix first".
   - Primary button: "Book a diagnostic conversation".
   - Secondary actions: "Copy result link" (falls back to selecting the URL
     text) and "Retake".
   - **Perfect result:** a "Strong foundation" message with a softer CTA.

### 6.4 Mailto CTA

`mailto:joao@jobe.works` with:

- a localized subject
- a body containing the score, the verdict label, the finding titles,
  the count of areas to verify, and the result URL

The body is URL-encoded.

### 6.5 Motion

- CSS transitions and keyframes in `app/app.css`. The count-up uses
  `requestAnimationFrame`.
- Under `prefers-reduced-motion: reduce`, all elements render in their
  final state immediately, with no count-up or slide.

### 6.6 Severity tokens

- Add `--risk`, `--gap`, and `--unknown` (plus `-foreground` variants) for
  light and dark themes.
- Check contrast against `surface` and `background` (WCAG AA for text).

## 7. Localization and SEO

- `app/i18n/translations/scorecard.ts` holds `ScorecardTranslation` for `en`
  and `pt-BR`. It covers:
  - SEO
  - intro, answer labels, category names
  - question text and hints
  - bands and verdicts
  - finding sentences per `category × severity`
  - areas-to-verify topics per question
  - CTA, mailto subject and body template, copy and retake labels
- pt-BR question copy is taken verbatim from the source checklist. English is
  as in section 3.2.
- Verdict labels:

  | Verdict | en | pt-BR |
  |---|---|---|
  | `strong` | Strong foundation | Base sólida |
  | `someGaps` | Some important gaps | Lacunas importantes |
  | `significantGaps` | Significant readiness gaps | Lacunas significativas |
  | `needsAttention` | Needs attention | Requer atenção |
  | `highRisk` | High risk | Alto risco |

- The route has an indexable, localized title, description, and OG metadata.
  The canonical manifest and sitemap pick it up automatically.

## 8. Analytics

Add to `app/analytics/types.ts`:

```ts
type ScorecardStartedEvent = { eventName: "scorecard_started" };
type ScorecardCompletedEvent = {
  eventName: "scorecard_completed";
  verdict: ScorecardResult["verdict"];
  band: ScorecardResult["band"];
  criticalRiskCount: number;
  unknownCount: number;
};
```

- The CTA reuses `cta_pressed` with `ctaId: "scorecard-book"` and
  `context: "scorecard-results"`.
- Individual answers are never sent.
- A visit that lands directly on a shared result does not emit
  `scorecard_completed`.

## 9. Site integration

- **Home hero:** the secondary CTA is replaced with "Take the readiness
  scorecard" → `/{locale}/scorecard`. The StockCast case remains reachable via
  the existing case band.
- **Home funnel:** a line above the steps reads "Not ready to talk? Start with
  the 4-minute scorecard →".
- **Case study page:** a closing band reads "How does your product compare?"
  and links to the scorecard.
- **Contact page:** the "scorecard" deliverable item links to the scorecard.
- **Primary navigation:** unchanged.

## 10. Testing

- **Unit tests, `scoring.test.ts`:**
  - answer factors
  - N/A removal and the q16 skip
  - band edges (49/50, 69/70, 84/85)
  - verdict override with 0, 1, and 2+ Critical Risks
  - the 1-risk case when the band is already worse than `needsAttention`
  - flag classification
  - findings ordering and cap
  - the all-yes and all-unknown extremes
- **Unit tests, `encoding.test.ts`:** a round trip, plus every rejection case.
- **Component tests:**
  - keyboard selection
  - Back preserves answers
  - q15 N/A skips q16
  - the analytics payloads contain no answers
  - a shared hash renders the results without `scorecard_completed`
  - reduced motion renders the final values
- **E2E tests:**
  - full completion in `en` and `pt-BR` reaches the expected verdict
  - a shared hash opens straight to the results
  - the mailto href contains the summary
  - the hero CTA navigates to the scorecard
  - the shared error fixture reports no console errors

## 11. Out of scope

- Email capture, lead storage, or a PDF report.
- Persisting answers anywhere other than the URL hash.
- Changes to the primary navigation.
