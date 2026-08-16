# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are JOBE's prospective customers: founders and technical leaders (CTOs, engineering leads) of startups and small-to-mid companies facing one of these situations:

- an AI product that gained traction but is not yet safe, scalable, and sustainable in production;
- a mobile app or React Native codebase in need of rescue or modernization;
- a need for senior fractional CTO or architecture direction;
- a team adopting AI tools in its software development lifecycle without safe, productive practices;
- relevant LLM spend that needs engineering and economic control (cross-sell).

They typically arrive from content or a referral (ex-clients, partners, LinkedIn, the StockCast case, a webinar, or an agency needing senior technical support) and enter a structured evaluation before any offer is chosen.

## Product Purpose

The marketing website for JOBE ("Engineering that Works") makes the company's commercial architecture concrete: it moves visitors through a diagnostic-first funnel — content or referral, an initial technical evaluation (Product Readiness Call), a paid diagnosis, a directed service offer, implementation, and a recurring engagement (fractional CTO, team enablement, secure AI and governance). Success is qualified conversations, paid diagnoses, and engagements that follow.

## Positioning

"Engineering that Works" — engineering that functions in production and for the business, not PoCs with AI, technology choices, or code alone. The prospect never has to choose correctly among eight services: they enter through a conversation or diagnosis and JOBE directs the solution. Differentiating specialty: mobile product rescue and React Native modernization, plus AI security assessment, in a less generic market with demonstrable authority.

## Operating Context

- Site is served at jobe.works, in English and Brazilian Portuguese; the template's default locale is pt-BR.
- Public contact: joao@jobe.works. No logo yet; the JOBE name carries the personal story JOão + BErtacchi and a secondary association with "job".
- Funnel stages (commercial architecture, provided by the owner):
  1. Content or referral (including a checklist, scorecard, or calculator hosted on the site);
  2. Initial technical evaluation / Product Readiness Call — structured 30–45 minute conversation based on client reports, delivering a perceived-risks summary, preliminary problem classification, next steps, and a mini-scorecard;
  3. Paid diagnosis — evidence-based, including founder/team interviews, repository access, architecture review, integration analysis, CI/CD, tests and environments inspection, security analysis, observability evaluation, cloud and AI cost analysis, risk identification, and a roadmap proposal; deliverables include a detailed scorecard, current architecture diagram, risks ranked by impact and urgency, quick wins, prioritized backlog, 30/60/90-day plan, preliminary estimates, and an executive presentation;
  4. Dominant problem determines the offer;
  5. Implementation, then recurring engagement.
- Core offers: AI Productization Sprint (with an embedded security lens, and a mobile-specific variant when applicable), Fractional CTO & Architecture, and AI-Native SDLC & Engineering Enablement.
- Cross-sell: AI Engineering Economics — entered only as a natural cross-sell for clients with relevant LLM spend, never as a fourth entry door, to avoid fragmenting the site message.
- Expansion services (process automation with agents, Secure AI, Cloud/FinOps) are recommended only after the core offers are validated; they are not entry doors.

## Capabilities and Constraints

- The site is static and deployable without Node.js, built on the static-website-template harness: React Router framework mode with TypeScript, locale-prefixed routes, typed localization dictionaries, explicit localized SEO metadata, consent-aware analytics, and no backend, serverless function, route action, local API, or runtime server (ADR-governed; the ADRs remain authoritative).
- Existing components and pages in the template are examples only; a completely new website will be created on top of the preserved architecture.
- Terminology to use consistently: Product Readiness Call, Diagnosis, AI Productization Sprint, Fractional CTO & Architecture, AI-Native SDLC & Engineering Enablement, AI Engineering Economics, Mobile Product Rescue.
- Undecided product facts (recorded, not invented): pricing of the initial evaluation and of each offer, the exact page set and funnel placement, whether the checklist/scorecard/calculator is part of the first release, contact-form integration provider, analytics provider, and visual brand direction (no logo yet).

## Brand Commitments

- Name: JOBE — short and memorable, with the personal story JOão + BErtacchi and a secondary association with "job".
- Tagline and positioning line: "Engineering that Works" — with its intentional ambiguity: engineering that works, Jobe Works (the company's work), and jobe.works as the company address.
- Domain: jobe.works. Contact: joao@jobe.works.
- Voice direction: senior, pragmatic, execution-oriented — matches the promise of engineering that delivers in production and for the business.
- Visual direction (owner-chosen 2026-08-15): the category standard for engineering consultancies, played straight at full craft — conventions embraced without irony or gimmick. Quality bar set by the strongest software-engineering craft work: Linear and Stripe for precision and trust, Thoughtworks as the category incumbent for structure; the canon register is restrained typography, white space, and project-led evidence.
- No logo exists yet; none may be fabricated.

## Evidence on Hand

- Owner-provided commercial architecture brief (funnel, offers, cross-sell, expansion) recorded in this file on 2026-08-15.
- The StockCast case is a real content/referral source (details not in the repository).
- Template working examples (app/routes/$locale.services.tsx, contact form pattern, translations) are implementation references only, not product copy.
- No testimonials, named customers, benchmarks, pricing, or licensing evidence exists; future work must not fabricate these.

## Product Principles

1. Diagnostic-first selling: prospects enter through a conversation or diagnosis and are directed to a solution; never make them choose among services.
2. Production and business outcomes: engineering must work in production and for the business, not stop at proofs of concept.
3. Evidence over claims: the paid diagnosis is grounded in evidence; the initial evaluation is grounded in client reports.
4. Recurring relationships: diagnosis and implementation flow into fractional CTO, enablement, and secure AI and governance engagements.
5. Preserve the harness: static output, full localization (en + pt-BR), ADR-governed architecture, and privacy-conscious consent and analytics.

## Accessibility & Inclusion

The template's quality bar applies: accessible interactive controls and consent mechanisms, meaningful alt text, and accessibility checks in the validation workflow. No binding WCAG conformance level has been established by the owner.
