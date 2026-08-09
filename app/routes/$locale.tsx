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
import { defaultLocale, isSupportedLocale } from "../i18n/config";
import { I18nProvider } from "../i18n/i18n";
import { translations } from "../i18n/translations";
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

function ErrorPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main>
      <Heading as="h1" level="display">
        {title}
      </Heading>
      <Text>{description}</Text>
    </main>
  );
}

function UnsupportedLocalePage() {
  const { title, description } = translations[defaultLocale].notFound;
  return <ErrorPage title={title} description={description} />;
}

export function ErrorBoundary({ error, params }: Route.ErrorBoundaryProps) {
  const locale =
    params.locale && isSupportedLocale(params.locale)
      ? params.locale
      : defaultLocale;
  const translation = translations[locale];

  if (
    (error instanceof Response || isRouteErrorResponse(error)) &&
    error.status === 404
  ) {
    return <ErrorPage {...translation.notFound} />;
  }
  return (
    <ErrorPage
      title={translation.common.error.title}
      description={translation.common.error.unexpectedDescription}
    />
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
