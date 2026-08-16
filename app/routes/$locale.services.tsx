import { useAnalytics } from "../analytics/analytics";
import { ServiceCard } from "../components/domain/service-card";
import { FunnelSection } from "../components/sections/funnel-section";
import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { TextLink } from "../components/ui/text-link";
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
  const { locale, translate } = useI18n();
  const { capture } = useAnalytics();

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <Heading as="h1" level="display">
            {translate("services.title")}
          </Heading>
          <Text className="mt-6" tone="muted">
            {translate("services.description")}
          </Text>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            description={translate("services.items.sprint.description")}
            title={translate("services.items.sprint.title")}
          />
          <ServiceCard
            description={translate("services.items.fractional.description")}
            title={translate("services.items.fractional.title")}
          />
          <ServiceCard
            description={translate("services.items.enablement.description")}
            title={translate("services.items.enablement.title")}
          />
        </div>

        <div className="mt-6 border-l border-brand pl-6">
          <Text
            as="span"
            className="text-sm font-semibold uppercase tracking-widest text-brand"
          >
            {translate("services.crossSell.label")}
          </Text>
          <Heading as="h2" level="card" className="mt-2">
            {translate("services.crossSell.title")}
          </Heading>
          <Text className="mt-2 max-w-2xl" tone="muted">
            {translate("services.crossSell.description")}
          </Text>
        </div>
      </Container>

      <FunnelSection
        description={translate("services.funnel.description")}
        steps={[
          {
            description: translate("services.funnel.steps.call.description"),
            title: translate("services.funnel.steps.call.title"),
          },
          {
            description: translate(
              "services.funnel.steps.diagnosis.description",
            ),
            title: translate("services.funnel.steps.diagnosis.title"),
          },
          {
            description: translate(
              "services.funnel.steps.engagement.description",
            ),
            title: translate("services.funnel.steps.engagement.title"),
          },
        ]}
        title={translate("services.funnel.title")}
      />

      <section className="border-t border-border bg-surface py-16 sm:py-20">
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <Heading>{translate("services.closing.title")}</Heading>
            <Text tone="muted">
              {translate("services.closing.description")}
            </Text>
            <div>
              <TextLink
                to={`/${locale}/contact`}
                onClick={() =>
                  capture({
                    eventName: "cta_pressed",
                    ctaId: "services-book-call",
                    context: "services",
                  })
                }
              >
                {translate("services.closing.cta")}
              </TextLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
