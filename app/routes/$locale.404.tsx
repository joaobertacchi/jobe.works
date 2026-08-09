import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { TextLink } from "../components/ui/text-link";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { notFoundTranslations } from "../i18n/translations/not-found";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.404";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...notFoundTranslations[params.locale].seo,
    indexable: false,
  });
}

export default function NotFound() {
  const { locale, translate } = useI18n();
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="flex max-w-3xl flex-col gap-6">
          <Heading as="h1" level="display">
            {translate("notFound.title")}
          </Heading>
          <Text tone="muted">{translate("notFound.description")}</Text>
          <div>
            <TextLink to={`/${locale}/`}>
              {translate("notFound.homeLink")}
            </TextLink>
          </div>
        </div>
      </Container>
    </main>
  );
}
