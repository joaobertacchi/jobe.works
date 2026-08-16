import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import { AnalyticsProvider } from "./analytics/analytics";
import { ConsentBanner } from "./components/site/consent-banner";
import { ConsentProvider, useConsent } from "./consent/consent-context";
import {
  defaultLocale,
  getLocaleFromPathname,
  isSupportedLocale,
  locales,
  type SupportedLocale,
} from "./i18n/config";
import { I18nProvider, useI18n } from "./i18n/i18n";
import { Heading } from "./components/ui/heading";
import { Text } from "./components/ui/text";
import { themeInitializationScript } from "./theme";
import type { Route } from "./+types/root";
import "./app.css";

const directionContractComment =
  '<!-- THESIS: The JOBE site is the category-standard engineering-consultancy page, played straight at full craft: restraint, evidence, and one clear action; it refuses startup hype and gimmickry. OWN-WORLD: white and off-white ground, near-black workhorse sans-serif, one deep engineering-blue accent, hairline rules, subtle elevation, generous white space. STORY: A founder or technical leader sees engineering that works, recognizes the diagnostic-first method, and books a Product Readiness Call. FIRST VIEWPORT: nav with the JOBE wordmark; left-aligned display headline "Engineering that Works" with the primary CTA and the StockCast link; an isometric technical motif on the right; below, the three service cards, the StockCast case band, and the call-diagnosis-direction strip. FORM: canon (category standard, owner-chosen via the standing exit); approved composition comp-a on 2026-08-15; direction seed 7ecc6614. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->';

export function Document({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: SupportedLocale | null;
}) {
  return (
    <html
      lang={locale ? locales[locale].htmlLang : "und"}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script>{themeInitializationScript}</script>
        <Meta />
        <Links />
      </head>
      <body>
        <div
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: directionContractComment }}
        />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function ConsentAwareAnalytics({ children }: { children: React.ReactNode }) {
  const { consent } = useConsent();
  return <AnalyticsProvider consent={consent}>{children}</AnalyticsProvider>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const locale =
    getLocaleFromPathname(pathname) ??
    (pathname.split("/")[1] ? null : defaultLocale);
  return (
    <Document locale={locale}>
      <ConsentProvider>
        <ConsentAwareAnalytics>
          {children}
          <ConsentBanner locale={locale} />
        </ConsentAwareAnalytics>
      </ConsentProvider>
    </Document>
  );
}

export default function App() {
  return <Outlet />;
}

function NeutralNotFound() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <Heading as="h1">404</Heading>
    </main>
  );
}

function LocalizedError({ error }: { error: unknown }) {
  const { translate } = useI18n();
  let message = translate("common.errors.unexpectedTitle");
  let details = translate("common.errors.unexpectedDescription");
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message =
      error.status === 404
        ? translate("notFound.title")
        : translate("common.errors.title");
    details =
      error.status === 404
        ? translate("notFound.description")
        : translate("common.errors.unexpectedDescription");
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <Heading as="h1">{message}</Heading>
      <Text>{details}</Text>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function ErrorBoundary({ error, params }: Route.ErrorBoundaryProps) {
  if (params.locale && !isSupportedLocale(params.locale)) {
    return <NeutralNotFound />;
  }
  const locale =
    params.locale && isSupportedLocale(params.locale)
      ? params.locale
      : defaultLocale;
  return (
    <I18nProvider locale={locale}>
      <LocalizedError error={error} />
    </I18nProvider>
  );
}
