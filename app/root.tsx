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
  "<!-- THESIS: JOBE turns a complex product system into one legible route from symptoms to a directed engineering decision; it refuses the generic split hero, technical cube, and service-card catalog. OWN-WORLD: committed deep engineering blue, near-white and ink, compressed signage typography, folded atlas planes, clipped evidence plates, and precise topology routes. STORY: A founder or technical leader recognizes João-led judgment, sees diagnosis organize the system, and books a Product Readiness Call. FIRST VIEWPORT: compact navigation above three unequal planes: proposition left, dominant architecture topology center, and João plus indexed actions right; one route crosses every fold and resolves at the primary action. FORM: Systems Wayfinding, grounded candidate 6, seed dce77f20; approved Folded Atlas comp `.impeccable/mocks/home-systems-folded-atlas.webp`. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->";

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
