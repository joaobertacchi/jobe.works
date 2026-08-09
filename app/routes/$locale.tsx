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
import { I18nProvider, useI18n } from "../i18n/i18n";
import {
  type CanonicalUrlManifest,
  getLocalizedUrlsForPathname,
} from "../routing/canonical-url-manifest";
import { isCanonicalLocalizedPathname } from "../routing/localized-pathname";
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
  if (!isCanonicalLocalizedPathname(url.pathname)) {
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
clientLoader.hydrate = true as const;

function NeutralNotFound() {
  return (
    <main>
      <Heading as="h1" level="display">
        404
      </Heading>
    </main>
  );
}

function LocalizedError({ error }: { error: unknown }) {
  const { translate } = useI18n();
  const isNotFound =
    (error instanceof Response || isRouteErrorResponse(error)) &&
    error.status === 404;

  return (
    <main>
      <Heading as="h1" level="display">
        {translate(isNotFound ? "notFound.title" : "common.errors.title")}
      </Heading>
      <Text>
        {translate(
          isNotFound
            ? "notFound.description"
            : "common.errors.unexpectedDescription",
        )}
      </Text>
    </main>
  );
}

export function ErrorBoundary({ error, params }: Route.ErrorBoundaryProps) {
  if (!params.locale || !isSupportedLocale(params.locale)) {
    return <NeutralNotFound />;
  }
  return (
    <I18nProvider locale={params.locale}>
      <LocalizedError error={error} />
    </I18nProvider>
  );
}

export default function LocaleLayout() {
  const { locale } = useParams();
  if (!locale || !isSupportedLocale(locale)) {
    return <NeutralNotFound />;
  }

  return (
    <I18nProvider locale={locale}>
      <LocalizedLayout />
    </I18nProvider>
  );
}
