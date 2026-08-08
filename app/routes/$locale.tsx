import { isRouteErrorResponse, Link, Outlet, useParams } from "react-router";

import { isSupportedLocale } from "../i18n/config";
import { I18nProvider, useI18n } from "../i18n/i18n";
import type { Route } from "./+types/$locale";

function LocalizedLayout() {
  const { translate } = useI18n();
  return (
    <>
      <header>
        <nav aria-label="Primary navigation">
          <Link to=".">{translate("common.navigation.home")}</Link>
          <Link to="about">{translate("common.navigation.about")}</Link>
          <Link to="services">{translate("common.navigation.services")}</Link>
        </nav>
      </header>
      <Outlet />
    </>
  );
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) {
    throw new Response(null, { status: 404 });
  }
  return null;
}

function UnsupportedLocalePage() {
  return (
    <main>
      <h1>404</h1>
      <p>Page not found.</p>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (
    (error instanceof Response || isRouteErrorResponse(error)) &&
    error.status === 404
  ) {
    return <UnsupportedLocalePage />;
  }
  return (
    <main>
      <h1>Error</h1>
      <p>An unexpected error occurred.</p>
    </main>
  );
}

export default function LocaleLayout() {
  const { locale } = useParams();
  if (!locale || !isSupportedLocale(locale)) {
    return <UnsupportedLocalePage />;
  }

  return (
    <I18nProvider locale={locale}>
      <LocalizedLayout />
    </I18nProvider>
  );
}
