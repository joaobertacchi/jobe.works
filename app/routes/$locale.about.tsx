import { useAnalytics } from "../analytics/analytics";
import { AtlasAction } from "../components/domain/atlas-action";
import { AtlasCtaBand } from "../components/sections/atlas-cta-band";
import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { aboutTranslations } from "../i18n/translations/about";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.about";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...aboutTranslations[params.locale].seo,
    indexable: true,
  });
}

export default function About() {
  const { locale, translate } = useI18n();
  const { capture } = useAnalytics();
  const principles = [
    translate("about.sections.principlesList.diagnostic"),
    translate("about.sections.principlesList.evidence"),
    translate("about.sections.principlesList.production"),
    translate("about.sections.principlesList.recurring"),
  ];
  const founderParagraphs = [
    translate("about.sections.founder.introduction"),
    translate("about.sections.founder.leadership"),
    translate("about.sections.founder.background"),
    translate("about.sections.founder.today"),
  ];

  return (
    <main>
      <Container className="py-16 sm:py-24">
        <article className="mx-auto flex max-w-3xl flex-col gap-12">
          <header className="flex flex-col gap-6">
            <Heading as="h1" level="display">
              {translate("about.title")}
            </Heading>
            <Text tone="muted">{translate("about.description")}</Text>
          </header>

          <section className="flex flex-col gap-3">
            <Heading as="h2" level="section">
              {translate("about.sections.name.title")}
            </Heading>
            <Text tone="muted">
              {translate("about.sections.name.description")}
            </Text>
          </section>

          <section className="flex flex-col gap-3">
            <Heading as="h2" level="section">
              {translate("about.sections.positioning.title")}
            </Heading>
            <Text tone="muted">
              {translate("about.sections.positioning.description")}
            </Text>
          </section>

          <section className="flex flex-col gap-3">
            <Heading as="h2" level="section">
              {translate("about.sections.founder.title")}
            </Heading>
            {founderParagraphs.map((paragraph) => (
              <Text key={paragraph} tone="muted">
                {paragraph}
              </Text>
            ))}
          </section>

          <section className="flex flex-col gap-4">
            <Heading as="h2" level="section">
              {translate("about.sections.principles.title")}
            </Heading>
            <Text tone="muted">
              {translate("about.sections.principles.description")}
            </Text>
            <ul className="flex flex-col gap-3">
              {principles.map((principle) => (
                <li className="flex items-start gap-3" key={principle}>
                  <span aria-hidden="true" className="atlas-route-marker" />
                  <Text>{principle}</Text>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </Container>
      <AtlasCtaBand
        actions={
          <>
            <AtlasAction
              onClick={() =>
                capture({
                  eventName: "cta_pressed",
                  ctaId: "about-book-call",
                  context: "about",
                })
              }
              to={`/${locale}/contact`}
              variant="light"
            >
              {translate("about.cta.action")}
            </AtlasAction>
            <a
              className="atlas-cta-band__link"
              href={`mailto:${translate("about.emailAddress")}`}
            >
              {translate("about.emailAddress")}
            </a>
          </>
        }
        description={translate("about.cta.description")}
        id="about-cta-title"
        title={translate("about.emailLabel")}
      />
    </main>
  );
}
