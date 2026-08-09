import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { privacyTranslations } from "../i18n/translations/privacy";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.privacy";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...privacyTranslations[params.locale].seo,
    indexable: true,
  });
}

export default function Privacy() {
  const { translate } = useI18n();
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <div className="flex flex-col gap-6">
            <Heading as="h1" level="display">
              {translate("privacy.title")}
            </Heading>
            <Text tone="muted">{translate("privacy.introduction")}</Text>
          </div>
          <section className="flex flex-col gap-3">
            <Heading as="h2" level="section">
              {translate("privacy.sections.data.title")}
            </Heading>
            <Text>{translate("privacy.sections.data.body")}</Text>
          </section>
          <section className="flex flex-col gap-3">
            <Heading as="h2" level="section">
              {translate("privacy.sections.purpose.title")}
            </Heading>
            <Text>{translate("privacy.sections.purpose.body")}</Text>
          </section>
          <section className="flex flex-col gap-3">
            <Heading as="h2" level="section">
              {translate("privacy.sections.storage.title")}
            </Heading>
            <Text>{translate("privacy.sections.storage.body")}</Text>
          </section>
          <section className="flex flex-col gap-3">
            <Heading as="h2" level="section">
              {translate("privacy.sections.rights.title")}
            </Heading>
            <Text>{translate("privacy.sections.rights.body")}</Text>
          </section>
        </div>
      </Container>
    </main>
  );
}
