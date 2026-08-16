import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { TextLink } from "../components/ui/text-link";
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
  const { translate } = useI18n();
  const principles = [
    translate("about.sections.principlesList.diagnostic"),
    translate("about.sections.principlesList.evidence"),
    translate("about.sections.principlesList.production"),
    translate("about.sections.principlesList.recurring"),
  ];

  return (
    <main className="py-16 sm:py-24">
      <Container>
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
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                  />
                  <Text>{principle}</Text>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-3 border-t border-border pt-10">
            <Heading as="h2" level="section">
              {translate("about.emailLabel")}
            </Heading>
            <TextLink to="mailto:joao@jobe.works" variant="secondary">
              {translate("about.emailAddress")}
            </TextLink>
          </section>
        </article>
      </Container>
    </main>
  );
}
