import {
  isRouteErrorResponse,
  Link,
  Outlet,
  useLoaderData,
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
  const { urls } = useLoaderData<typeof loader>();
  const { locale, translate } = useI18n();
  return (
    <>
      <header>
        <nav aria-label="Primary navigation">
          <Link to=".">{translate("common.navigation.home")}</Link>
          <Link to="about">{translate("common.navigation.about")}</Link>
          <Link to="services">{translate("common.navigation.services")}</Link>
        </nav>
        <nav aria-label={translate("common.languageSwitcherLabel")}>
          {supportedLocales
            .filter((targetLocale) => targetLocale !== locale)
            .map((targetLocale) => (
              <Link key={targetLocale} to={urls[targetLocale]}>
                {locales[targetLocale].label}
              </Link>
            ))}
        </nav>
      </header>
      <Outlet />
    </>
  );
}

export function getLoaderDataForBuildRequest(
  manifest: CanonicalUrlManifest,
  requestUrl: string,
) {
  const pathname = new URL(requestUrl).pathname;
  let canonicalPathname = pathname;
  if (pathname.endsWith("/_.data")) {
    canonicalPathname = pathname.slice(0, -"_.data".length);
  } else if (pathname.endsWith(".data")) {
    canonicalPathname = pathname.slice(0, -".data".length);
  } else if (
    pathname.endsWith("/") &&
    pathname.split("/").filter(Boolean).length > 1
  ) {
    canonicalPathname = pathname.slice(0, -1);
  }

  return {
    manifest,
    urls: getLocalizedUrlsForPathname(manifest, canonicalPathname),
  };
}

export function loader({ request }: Route.LoaderArgs) {
  return getLoaderDataForBuildRequest(readCanonicalManifest(), request.url);
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) {
    throw new Response(null, { status: 404 });
  }
  return serverLoader();
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
