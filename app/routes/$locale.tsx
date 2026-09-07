import {
  isRouteErrorResponse,
  Outlet,
  redirect,
  useLoaderData,
  useMatches,
  useParams,
} from "react-router";
import type { ShouldRevalidateFunctionArgs } from "react-router";

import { SiteHeader } from "../components/site/site-header";
import { SiteFooter } from "../components/site/site-footer";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { I18nProvider, useI18n } from "../i18n/i18n";
import { createSiteConfig } from "../seo/site-config.server";
import {
  type CanonicalUrlManifest,
  getLocalizedUrlsForPathname,
} from "../routing/canonical-url-manifest";
import { isCanonicalLocalizedPathname } from "../routing/localized-pathname";
import { readCanonicalManifest } from "../../scripts/canonical-manifest-file.server";
import type { Route } from "./+types/$locale";

function LocalizedLayout() {
  const { urls } = useLoaderData<typeof clientLoader>();
  const { translate } = useI18n();
  const hideLanguageSwitcher = useMatches().some(
    ({ handle }) =>
      (handle as { languageSwitcher?: boolean } | undefined)
        ?.languageSwitcher === false,
  );
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">
        {translate("common.navigation.skipToContent")}
      </a>
      <SiteHeader urls={hideLanguageSwitcher ? null : urls} />
      <div className="flex-1" id="main-content" tabIndex={-1}>
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}

export function getLoaderDataForPathname(
  manifest: CanonicalUrlManifest,
  pathname: string,
  site: ReturnType<typeof createSiteConfig>,
) {
  return {
    urls: getLocalizedUrlsForPathname(manifest, pathname),
    site,
  };
}

export function loader({ url }: Route.LoaderArgs) {
  return getLoaderDataForPathname(
    readCanonicalManifest(),
    url.pathname,
    createSiteConfig(),
  );
}

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  nextParams,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return (
    !("*" in nextParams) &&
    (currentUrl.pathname !== nextUrl.pathname || defaultShouldRevalidate)
  );
}

function isWildcardNotFound(
  error: unknown,
  params: Route.ClientLoaderArgs["params"],
) {
  return (
    (error instanceof Response || isRouteErrorResponse(error)) &&
    error.status === 404 &&
    "*" in params
  );
}

export async function clientLoader({
  params,
  serverLoader,
  url,
}: Route.ClientLoaderArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) {
    throw new Response(null, { status: 404 });
  }
  // The bare locale root is served prerendered by static hosts but is not a
  // canonical URL; redirect it instead of rendering a hydration 404.
  if (url.pathname === `/${params.locale}`) {
    throw redirect(`/${params.locale}/`, { status: 308 });
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
    if (isWildcardNotFound(error, params)) {
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
