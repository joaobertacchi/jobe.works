import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { caseTranslations } from "../i18n/translations/case";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.case";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...caseTranslations[params.locale].seo,
    indexable: true,
  });
}

export default function CaseStudy() {
  const { translate } = useI18n();
  const steps = [
    {
      title: translate("case.steps.situation.title"),
      description: translate("case.steps.situation.description"),
    },
    {
      title: translate("case.steps.diagnosis.title"),
      description: translate("case.steps.diagnosis.description"),
    },
    {
      title: translate("case.steps.engagement.title"),
      description: translate("case.steps.engagement.description"),
    },
    {
      title: translate("case.steps.outcome.title"),
      description: translate("case.steps.outcome.description"),
    },
  ];

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <article className="mx-auto flex max-w-3xl flex-col gap-10">
          <header className="flex flex-col gap-4">
            <Heading as="h1" level="display">
              {translate("case.title")}
            </Heading>
            <Text tone="muted">{translate("case.introduction")}</Text>
          </header>

          <section className="flex flex-col gap-3">
            <Heading as="h2" level="section">
              {translate("case.methodTitle")}
            </Heading>
            <Text tone="muted">{translate("case.methodDescription")}</Text>
          </section>

          <section className="flex flex-col gap-6 border-t border-border pt-10">
            {steps.map((step) => (
              <div className="flex flex-col gap-2" key={step.title}>
                <Heading as="h3" level="card">
                  {step.title}
                </Heading>
                <Text tone="muted">{step.description}</Text>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-dashed border-border bg-surface p-6">
            <Heading as="h2" level="card">
              {translate("case.pendingTitle")}
            </Heading>
            <Text className="mt-3" tone="muted">
              {translate("case.pendingDescription")}
            </Text>
          </section>
        </article>
      </Container>
    </main>
  );
}
