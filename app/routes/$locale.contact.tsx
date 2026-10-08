import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { TextLink } from "../components/ui/text-link";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { contactTranslations } from "../i18n/translations/contact";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.contact";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...contactTranslations[params.locale].seo,
    indexable: true,
  });
}

export default function Contact() {
  const { locale, translate } = useI18n();
  const deliverables = [
    translate("contact.deliverables.risks"),
    translate("contact.deliverables.classification"),
    translate("contact.deliverables.nextSteps"),
    translate("contact.deliverables.scorecard"),
  ];

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-6">
            <Heading as="h1" level="display">
              {translate("contact.title")}
            </Heading>
            <Text tone="muted">{translate("contact.description")}</Text>
            <div className="flex flex-col gap-3">
              <Heading as="h2" level="card">
                {translate("contact.deliverablesTitle")}
              </Heading>
              <ul className="flex flex-col gap-2">
                {deliverables.map((deliverable) => (
                  <li
                    className="flex items-start gap-3 text-foreground"
                    key={deliverable}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                    />
                    {deliverable}
                  </li>
                ))}
              </ul>
              <div>
                <TextLink to={`/${locale}/scorecard`} variant="secondary">
                  {translate("contact.scorecardPrompt")}
                </TextLink>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 self-start rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-3">
              <Heading as="h2" level="section">
                {translate("contact.bookByEmailTitle")}
              </Heading>
              <Text tone="muted">
                {translate("contact.bookByEmailDescription")}
              </Text>
            </div>
            <div>
              <TextLink
                to={`mailto:${translate("contact.emailAddress")}?subject=${encodeURIComponent(
                  translate("contact.emailSubject"),
                )}`}
              >
                {translate("contact.emailAddress")}
              </TextLink>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
