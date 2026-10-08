import { useAnalytics } from "../analytics/analytics";
import portraitAvif320 from "../assets/images/founder/joao-bertacchi-320.avif";
import portraitAvif480 from "../assets/images/founder/joao-bertacchi-480.avif";
import portraitAvif640 from "../assets/images/founder/joao-bertacchi-640.avif";
import portraitWebp320 from "../assets/images/founder/joao-bertacchi-320.webp";
import portraitWebp480 from "../assets/images/founder/joao-bertacchi-480.webp";
import portraitWebp640 from "../assets/images/founder/joao-bertacchi-640.webp";
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

const portraitSizes = "(min-width: 48rem) 15rem, min(20rem, 100vw - 2.5rem)";
const portraitAvifSet = `${portraitAvif320} 320w, ${portraitAvif480} 480w, ${portraitAvif640} 640w`;
const portraitWebpSet = `${portraitWebp320} 320w, ${portraitWebp480} 480w, ${portraitWebp640} 640w`;

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

          <section className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)] md:items-start md:gap-8">
            <figure className="atlas-portrait">
              <picture className="atlas-portrait__frame">
                <source
                  sizes={portraitSizes}
                  srcSet={portraitAvifSet}
                  type="image/avif"
                />
                <source
                  sizes={portraitSizes}
                  srcSet={portraitWebpSet}
                  type="image/webp"
                />
                <img
                  alt={translate("about.sections.founder.portraitAlt")}
                  decoding="async"
                  height={600}
                  loading="lazy"
                  sizes={portraitSizes}
                  src={portraitWebp480}
                  srcSet={portraitWebpSet}
                  width={480}
                />
              </picture>
              <figcaption className="atlas-portrait__caption">
                {translate("about.sections.founder.portraitCaption")}
              </figcaption>
            </figure>
            <div className="flex flex-col gap-3">
              <Heading as="h2" level="section">
                {translate("about.sections.founder.title")}
              </Heading>
              {founderParagraphs.map((paragraph) => (
                <Text key={paragraph} tone="muted">
                  {paragraph}
                </Text>
              ))}
            </div>
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
