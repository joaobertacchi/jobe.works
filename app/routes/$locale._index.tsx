import { HeroSection } from "../components/sections/hero-section";
import { Card } from "../components/ui/card";
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
      url: new URL(loaderData.urls[params.locale], `${loaderData.site.origin}/`)
        .href,
    },
  });
}

export default function Home() {
  const { locale, translate } = useI18n();
  return (
    <main>
      <HeroSection
        eyebrow={translate("home.eyebrow")}
        title={translate("home.title")}
        description={translate("home.description")}
        actions={
          <TextLink to={`/${locale}/services`}>
            {translate("home.cta")}
          </TextLink>
        }
      />
      <section className="border-t border-border py-16 sm:py-24">
        <Container>
          <Heading>{translate("home.principles.title")}</Heading>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col gap-3">
              <Heading as="h3" level="card">
                {translate("home.principles.static.title")}
              </Heading>
              <Text tone="muted">
                {translate("home.principles.static.description")}
              </Text>
            </Card>
            <Card className="flex flex-col gap-3">
              <Heading as="h3" level="card">
                {translate("home.principles.localization.title")}
              </Heading>
              <Text tone="muted">
                {translate("home.principles.localization.description")}
              </Text>
            </Card>
            <Card className="flex flex-col gap-3">
              <Heading as="h3" level="card">
                {translate("home.principles.quality.title")}
              </Heading>
              <Text tone="muted">
                {translate("home.principles.quality.description")}
              </Text>
            </Card>
          </div>
        </Container>
      </section>
    </main>
  );
}
