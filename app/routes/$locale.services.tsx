import { useAnalytics } from "../analytics/analytics";
import { AtlasAction } from "../components/domain/atlas-action";
import { ServiceCard } from "../components/domain/service-card";
import { AtlasCtaBand } from "../components/sections/atlas-cta-band";
import { FunnelSection } from "../components/sections/funnel-section";
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
  const { locale, translate } = useI18n();
  const { capture } = useAnalytics();

  const services = ["sprint", "fractional", "enablement"] as const;

  function captureCta(ctaId: string) {
    capture({ eventName: "cta_pressed", ctaId, context: "services" });
  }

  return (
    <main className="atlas-page">
      <section
        aria-labelledby="services-page-title"
        className="atlas-section atlas-page-intro"
      >
        <Heading as="h1" id="services-page-title" level="display">
          {translate("services.title")}
        </Heading>
        <Text tone="muted">{translate("services.description")}</Text>

        <div className="atlas-plates">
          {services.map((service) => (
            <ServiceCard
              description={translate(`services.items.${service}.description`)}
              key={service}
              title={translate(`services.items.${service}.title`)}
            />
          ))}
        </div>

        <div className="atlas-cross-sell">
          <Text
            as="span"
            className="font-display text-sm font-semibold uppercase tracking-[0.09em] text-brand"
          >
            {translate("services.crossSell.label")}
          </Text>
          <Heading as="h2" className="mt-2" level="card">
            {translate("services.crossSell.title")}
          </Heading>
          <Text className="mt-3" tone="muted">
            {translate("services.crossSell.description")}
          </Text>
        </div>
      </section>

      <FunnelSection
        description={translate("services.funnel.description")}
        id="services-funnel-title"
        steps={[
          {
            description: translate("services.funnel.steps.call.description"),
            title: translate("services.funnel.steps.call.title"),
          },
          {
            description: translate(
              "services.funnel.steps.diagnosis.description",
            ),
            emphasis: true,
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

      <AtlasCtaBand
        actions={
          <AtlasAction
            onClick={() => captureCta("services-book-call")}
            to={`/${locale}/contact`}
            variant="light"
          >
            {translate("services.closing.cta")}
          </AtlasAction>
        }
        description={translate("services.closing.description")}
        id="services-closing-title"
        title={translate("services.closing.title")}
      />
    </main>
  );
}
