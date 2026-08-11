import aboutWorkflowImage from "../assets/images/about-workflow.svg?no-inline";
import { Container } from "../components/ui/container";
import { ContentSection } from "../components/sections/content-section";
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
  const { translate } = useI18n();
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="flex max-w-3xl flex-col gap-6">
          <Heading as="h1" level="display">
            {translate("about.title")}
          </Heading>
          <Text tone="muted">{translate("about.description")}</Text>
        </div>
      </Container>
      <div className="mt-16">
        <ContentSection
          title={translate("about.sections.boundaries.title")}
          description={translate("about.sections.boundaries.description")}
        />
        <ContentSection
          title={translate("about.sections.examples.title")}
          description={translate("about.sections.examples.description")}
        >
          <img
            alt={translate("about.workflowImageAlt")}
            className="w-full rounded-2xl border border-border bg-surface"
            height={540}
            src={aboutWorkflowImage}
            width={960}
          />
        </ContentSection>
      </div>
    </main>
  );
}
