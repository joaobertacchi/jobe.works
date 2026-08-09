import {
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useMatches,
  useParams,
} from "react-router";

import { SiteHeader } from "../components/site/site-header";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { I18nProvider } from "../i18n/i18n";
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
  return (
    <>
      <SiteHeader urls={hideLanguageSwitcher ? null : urls} />
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
  url,
}: Route.ClientLoaderArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) {
    throw new Response(null, { status: 404 });
  }
  try {
    const data = await serverLoader();
    if (!Object.values(data.urls).includes(url.pathname)) {
      throw new Response(null, { status: 404 });
    }
    return data;
  } catch (error) {
    if (
      (error instanceof Response || isRouteErrorResponse(error)) &&
      error.status === 404 &&
      "*" in params
    ) {
      return { urls: null };
    }
    throw error;
  }
}

function UnsupportedLocalePage() {
  return (
    <main>
      <Heading as="h1" level="display">
        404
      </Heading>
      <Text>Page not found.</Text>
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
      <Heading as="h1" level="display">
        Error
      </Heading>
      <Text>An unexpected error occurred.</Text>
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
