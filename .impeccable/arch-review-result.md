# Architecture Review Result (real subagent)

Spawned via `codex exec` (gpt-5.6-sol, read-only sandbox, fresh session) on 2026-08-16, using .codex/agents/architecture-review.toml and .impeccable/arch-review-input.md.

```yaml
status: NEEDS_CHANGES
findings:
  - severity: medium
    location: app/routes/$locale.contact.tsx:66
    rule: User acceptance criteria; ADR-017
    problem: The new production contact page renders ContactForm, which still submits through the template-only submitExampleContact integration. That integration is a no-op that resolves successfully, so visitors receive a success message although no inquiry is delivered. This retains an example integration despite the requirement to replace template examples and PRODUCT.md recording the contact provider as undecided.
    recommendation: Remove the form from the public page for now and use the existing localized mailto contact path until a browser-safe production provider is explicitly selected.
  - severity: medium
    location: app/components/site/site-footer.tsx:33
    rule: ADR-011
    problem: The change replaces the existing TextLink primitive with raw React Router links and duplicates link typography, color, transition, and hover styling across the footer and header. This moves reusable link visual behavior into the site layer instead of the UI primitive layer.
    recommendation: Add the immediately needed compact navigation and wordmark variants to the UI link primitive, then use those variants in the header and footer.
```

Resolution: both medium findings fixed (mailto-only booking path on the contact page; nav/wordmark variants added to the TextLink primitive and used by header, footer, and primary navigation). Follow-up review ran after fixes.

## Follow-up round (2026-08-16, same subagent spawn)

The follow-up confirmed both original fixes and returned one new medium finding: the localized privacy notice and SEO descriptions still described a contact form that the public site no longer renders (ADR-016 consistency). Fixed: privacy copy now describes the email contact path truthfully in both locales (app/i18n/translations/privacy.ts).

Validation after the final fix: npm run check PASS; 326 unit tests PASS; 37/37 Playwright tests PASS. The direction-contract seed remains in the built HTML.

All blocking (high/medium) findings from the real architecture-review subagent are resolved.
