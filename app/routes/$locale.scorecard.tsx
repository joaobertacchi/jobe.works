import { Scorecard } from "../components/domain/scorecard/scorecard";
import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { scorecardTranslations } from "../i18n/translations/scorecard";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.scorecard";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...scorecardTranslations[params.locale].seo,
    indexable: true,
  });
}

export default function ScorecardPage() {
  const { translate } = useI18n();

  return (
    <main className="py-12 sm:py-20">
      <Container>
        <Heading
          as="h1"
          className="mb-10 font-display sm:mb-14"
          level="eyebrow"
          tone="brand"
        >
          {translate("scorecard.intro.eyebrow")}
        </Heading>
        <Scorecard />
      </Container>
    </main>
  );
}
