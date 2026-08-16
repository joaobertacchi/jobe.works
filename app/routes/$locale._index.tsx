import { useAnalytics } from "../analytics/analytics";
import { IsometricMotif } from "../components/domain/isometric-motif";
import { ServiceCard } from "../components/domain/service-card";
import { CaseBand } from "../components/sections/case-band";
import { FunnelSection } from "../components/sections/funnel-section";
import { HeroSection } from "../components/sections/hero-section";
import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { TextLink } from "../components/ui/text-link";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { homeTranslations } from "../i18n/translations/home";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale._index";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  const loaderData = getSeoLoaderData(matches);
  const seo = homeTranslations[params.locale].seo;
  return createPageMeta(params.locale, loaderData, {
    ...seo,
    indexable: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: loaderData.site.siteName,
      alternateName: "JOBE — Engineering that Works",
      email: "joao@jobe.works",
      url: new URL(loaderData.urls[params.locale], `${loaderData.site.origin}/`)
        .href,
    },
  });
}

export default function Home() {
  const { locale, translate } = useI18n();
  const { capture } = useAnalytics();

  return (
    <main>
      <HeroSection
        actions={
          <>
            <TextLink
              to={`/${locale}/contact`}
              onClick={() =>
                capture({
                  eventName: "cta_pressed",
                  ctaId: "hero-book-call",
                  context: "homepage",
                })
              }
            >
              {translate("home.hero.ctaPrimary")}
            </TextLink>
            <TextLink
              to={`/${locale}/case`}
              variant="secondary"
              onClick={() =>
                capture({
                  eventName: "cta_pressed",
                  ctaId: "hero-stockcast",
                  context: "homepage",
                })
              }
            >
              {translate("home.hero.ctaSecondary")}
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8h10m0 0-3.5-3.5M13 8l-3.5 3.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </TextLink>
          </>
        }
        description={translate("home.hero.description")}
        title={translate("home.hero.title")}
        visual={<IsometricMotif className="h-auto w-full max-w-md" />}
      />

      <section className="border-t border-border py-16 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <Heading>{translate("home.services.title")}</Heading>
              <Text className="mt-4" tone="muted">
                {translate("home.services.description")}
              </Text>
            </div>
            <TextLink
              to={`/${locale}/services`}
              variant="secondary"
              onClick={() =>
                capture({
                  eventName: "cta_pressed",
                  ctaId: "services-explore",
                  context: "homepage",
                })
              }
            >
              {translate("home.services.link")}
            </TextLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <ServiceCard
              description={translate("home.services.items.sprint.description")}
              title={translate("home.services.items.sprint.title")}
            />
            <ServiceCard
              description={translate(
                "home.services.items.fractional.description",
              )}
              title={translate("home.services.items.fractional.title")}
            />
            <ServiceCard
              description={translate(
                "home.services.items.enablement.description",
              )}
              title={translate("home.services.items.enablement.title")}
            />
          </div>
        </Container>
      </section>

      <CaseBand
        actions={
          <TextLink
            to={`/${locale}/case`}
            onClick={() =>
              capture({
                eventName: "cta_pressed",
                ctaId: "case-read",
                context: "homepage",
              })
            }
          >
            {translate("home.case.link")}
          </TextLink>
        }
        description={translate("home.case.description")}
        label={translate("home.case.label")}
        title={translate("home.case.title")}
      />

      <FunnelSection
        actions={
          <TextLink
            to={`/${locale}/contact`}
            onClick={() =>
              capture({
                eventName: "cta_pressed",
                ctaId: "funnel-book-call",
                context: "homepage",
              })
            }
          >
            {translate("home.hero.ctaPrimary")}
          </TextLink>
        }
        description={translate("home.funnel.description")}
        steps={[
          {
            description: translate("home.funnel.steps.call.description"),
            title: translate("home.funnel.steps.call.title"),
          },
          {
            description: translate("home.funnel.steps.diagnosis.description"),
            title: translate("home.funnel.steps.diagnosis.title"),
          },
          {
            description: translate("home.funnel.steps.engagement.description"),
            title: translate("home.funnel.steps.engagement.title"),
          },
        ]}
        title={translate("home.funnel.title")}
      />
    </main>
  );
}
