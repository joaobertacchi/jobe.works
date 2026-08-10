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

Do not add deployment dependencies, an SPA fallback, or a route-tree change.

Update the route validation and e2e coverage as follows:

- Test client-side navigation to every alias with `router.navigate(alias)` and
  assert the localized catch-all content. Revalidate the locale parent loader
  whenever the pathname changes so React Router cannot reuse canonical data for
  an alias with the same locale.
- Keep direct browser coverage for trailing-slash aliases, whose existing
  directory artifact loads and whose hydration rejects the noncanonical URL.
- Do not use direct browser or request assertions for aliases in the app-routing
  tests. Whether a webserver maps an alias to an existing directory, returns a
  404, or applies deployment-specific rules is outside the app contract.
- Verify that aliases are absent from the canonical manifest and static
  artifact inventory. Keep direct static-server 404 coverage for stable unknown
  paths such as `/en/not-published`.

## Rationale

This matches the accepted static-site contract: every published URL has a
prerendered artifact, unknown paths receive normal static-server 404 responses,
and no application route depends on an SPA fallback. The app tests do not infer
webserver behavior from filesystem behavior, so they remain portable across
case-sensitive and case-insensitive volumes. The client test waits for the
initial hydration and completed navigation instead of using an unawaited
revalidation race.

## Validation

- Targeted `tests/e2e/routing.spec.ts` passes on the local `sirv` server.
- Route unit coverage verifies pathname-driven parent-loader revalidation.
- Static artifact tests verify aliases are not published.
- `npm run check` passes without weakened validation.
- Full `npm run test:e2e` passes with no unexpected browser errors.
- The build continues to remove `__spa-fallback.html` and does not publish alias
  artifacts.

## Non-Goals

- Changing the production route tree or error boundaries.
- Configuring a deployment-specific alias or 404 rule.
- Serving arbitrary unknown URLs through the SPA fallback.
