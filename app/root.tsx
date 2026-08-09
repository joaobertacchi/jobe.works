import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import {
  defaultLocale,
  getLocaleFromPathname,
  isSupportedLocale,
  locales,
  type SupportedLocale,
} from "./i18n/config";
import { translations } from "./i18n/translations";
import { Heading } from "./components/ui/heading";
import { Text } from "./components/ui/text";
import { themeInitializationScript } from "./theme";
import type { Route } from "./+types/root";
import "./app.css";

export function Document({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: SupportedLocale;
}) {
  return (
    <html lang={locales[locale].htmlLang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const locale = getLocaleFromPathname(pathname) ?? defaultLocale;
  return <Document locale={locale}>{children}</Document>;
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error, params }: Route.ErrorBoundaryProps) {
  const locale =
    params.locale && isSupportedLocale(params.locale)
      ? params.locale
      : defaultLocale;
  const translation = translations[locale];
  let message = translation.common.error.unexpectedTitle;
  let details = translation.common.error.unexpectedDescription;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message =
      error.status === 404
        ? translation.notFound.title
        : translation.common.error.title;
    details =
      error.status === 404
        ? translation.notFound.description
        : translation.common.error.unexpectedDescription;
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
