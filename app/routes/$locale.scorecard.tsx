import { Scorecard } from "../components/domain/scorecard/scorecard";
import { Container } from "../components/ui/container";
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
    <main className="overflow-x-clip py-12 sm:py-20">
      <Container>
        <h1 className="mb-10 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand sm:mb-14">
          {translate("scorecard.intro.eyebrow")}
        </h1>
        <Scorecard />
      </Container>
    </main>
  );
}
