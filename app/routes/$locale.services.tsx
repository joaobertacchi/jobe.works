import { ContactForm } from "../components/domain/contact-form";
import { ServiceCard } from "../components/domain/service-card";
import { Container } from "../components/ui/container";
import { DividedSection } from "../components/ui/divided-section";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { servicesTranslations } from "../i18n/translations/services";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.services";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...servicesTranslations[params.locale].seo,
    indexable: true,
  });
}

export default function Services() {
  const { translate } = useI18n();
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <Heading as="h1" level="display">
          {translate("services.title")}
        </Heading>
        <Text className="mt-6 max-w-3xl" tone="muted">
          {translate("services.description")}
        </Text>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            title={translate("services.items.foundation.title")}
            description={translate("services.items.foundation.description")}
          />
          <ServiceCard
            title={translate("services.items.localization.title")}
            description={translate("services.items.localization.description")}
          />
          <ServiceCard
            title={translate("services.items.delivery.title")}
            description={translate("services.items.delivery.description")}
          />
        </div>
      </Container>
      <DividedSection className="mt-16">
        <div className="max-w-3xl">
          <Heading as="h2" level="section">
            {translate("services.closing.title")}
          </Heading>
          <Text className="mt-4" tone="muted">
            {translate("services.closing.description")}
          </Text>
        </div>
      </DividedSection>
      <DividedSection className="mt-16">
        <ContactForm />
      </DividedSection>
    </main>
  );
}
