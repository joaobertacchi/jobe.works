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
import { rootLocaleRedirectScript } from "./i18n/locale-preference";
import { Heading } from "./components/ui/heading";
import { Text } from "./components/ui/text";
import { themeInitializationScript } from "./theme";
import type { Route } from "./+types/root";
import "./app.css";

export function Document({
  children,
  locale,
  redirectToPreferredLocale = false,
}: {
  children: React.ReactNode;
  locale: SupportedLocale | null;
  redirectToPreferredLocale?: boolean;
}) {
  return (
    <html
      lang={locale ? locales[locale].htmlLang : "und"}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {redirectToPreferredLocale && (
          <>
            <script>{rootLocaleRedirectScript}</script>
            <noscript>
              <meta httpEquiv="refresh" content={`0;url=/${defaultLocale}/`} />
            </noscript>
          </>
        )}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script>{themeInitializationScript}</script>
        <Meta />
        <Links />
      </head>
      <body>
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
    <Document locale={locale} redirectToPreferredLocale={pathname === "/"}>
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
