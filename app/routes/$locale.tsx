import {
  isRouteErrorResponse,
  Link,
  Outlet,
  useLoaderData,
  useMatches,
  useParams,
} from "react-router";

import { isSupportedLocale, locales, supportedLocales } from "../i18n/config";
import { I18nProvider, useI18n } from "../i18n/i18n";
import {
  type CanonicalUrlManifest,
  getLocalizedUrlsForPathname,
} from "../routing/canonical-url-manifest";
import { readCanonicalManifest } from "../../scripts/canonical-manifest-file.server";
import type { Route } from "./+types/$locale";

function LocalizedLayout() {
  const { urls } = useLoaderData<typeof clientLoader>();
  const hideLanguageSwitcher = useMatches().some(
    ({ handle }) =>
      (handle as { languageSwitcher?: boolean } | undefined)
        ?.languageSwitcher === false,
  );
  const { locale, translate } = useI18n();
  return (
    <>
      <header>
        <nav aria-label="Primary navigation">
          <Link to=".">{translate("common.navigation.home")}</Link>
          <Link to="about">{translate("common.navigation.about")}</Link>
          <Link to="services">{translate("common.navigation.services")}</Link>
        </nav>
        {urls !== null && !hideLanguageSwitcher ? (
          <nav aria-label={translate("common.languageSwitcherLabel")}>
            {supportedLocales
              .filter((targetLocale) => targetLocale !== locale)
              .map((targetLocale) => (
                <Link key={targetLocale} to={urls[targetLocale]}>
                  {locales[targetLocale].label}
                </Link>
              ))}
          </nav>
        ) : null}
      </header>
      <Outlet />
    </>
  );
}

export function getLoaderDataForPathname(
  manifest: CanonicalUrlManifest,
  pathname: string,
) {
  return {
    urls: getLocalizedUrlsForPathname(manifest, pathname),
  };
}

export function loader({ url }: Route.LoaderArgs) {
  return getLoaderDataForPathname(readCanonicalManifest(), url.pathname);
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) {
    throw new Response(null, { status: 404 });
  }
  try {
    return await serverLoader();
  } catch (error) {
    if (
      (error instanceof Response || isRouteErrorResponse(error)) &&
      error.status === 404
    ) {
      return { urls: null };
    }
    throw error;
  }
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
