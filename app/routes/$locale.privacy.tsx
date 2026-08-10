import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import {
  privacyTranslations,
  type PrivacyTranslation,
} from "../i18n/translations/privacy";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.privacy";

const privacySectionKeys: readonly (keyof PrivacyTranslation["sections"])[] = [
  "data",
  "purpose",
  "storage",
  "consent",
  "cookies",
  "analytics",
  "marketing",
  "attribution",
  "contactForms",
  "rights",
];

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
          {privacySectionKeys.map((key) => (
            <section key={key} className="flex flex-col gap-3">
              <Heading as="h2" level="section">
                {translate(`privacy.sections.${key}.title`)}
              </Heading>
              <Text>{translate(`privacy.sections.${key}.body`)}</Text>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
