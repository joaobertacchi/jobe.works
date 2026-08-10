# Static E2E Server Routing Design

## Problem

The Playwright suite runs against the locally built static artifact through
`sirv`, not against a deployment. Its unpublished-alias tests currently apply
the same expectation to direct browser requests and client-side navigations.
That is incorrect for a static site:

- a direct request for an alias with no artifact must receive a real HTTP 404;
- a client-side navigation can be handled by the already-loaded React Router
  application and render the localized in-app 404 boundary.

The client-navigation test also calls `router.revalidate()` immediately after
navigation. That creates a second loader transition and can race the original
navigation, leaving the browser on the previous page in CI.

## Decision

Keep Playwright's existing local web server flow:

```text
npm run build -> npm run preview -> sirv build/client
```

Do not add deployment dependencies, an SPA fallback, or a production route
change.

Update the e2e coverage as follows:

- Test client-side navigation to every alias with `router.navigate(alias)` and
  assert the localized catch-all content.
- Keep direct browser coverage for trailing-slash aliases, whose existing
  directory artifact loads and whose hydration rejects the noncanonical URL.
- Assert direct HTTP 404 responses through Playwright's `request` fixture for
  case-mismatched aliases that have no static artifact.

## Rationale

This matches the accepted static-site contract: every published URL has a
prerendered artifact, unknown paths receive normal static-server 404 responses,
and no application route depends on an SPA fallback. It also removes the
unnecessary revalidation race from the browser test instead of masking it with
timing or browser-error allowances.

## Validation

- Targeted `tests/e2e/routing.spec.ts` passes on the local `sirv` server.
- `npm run check` passes without weakened validation.
- Full `npm run test:e2e` passes with no unexpected browser errors.
- The build continues to remove `__spa-fallback.html` and does not publish alias
  artifacts.

## Non-Goals

- Changing the production route tree or error boundaries.
- Configuring a deployment-specific alias or 404 rule.
- Serving arbitrary unknown URLs through the SPA fallback.
