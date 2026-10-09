import { useAnalytics } from "../analytics/analytics";
import { Card } from "../components/ui/card";
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
  const { capture } = useAnalytics();
  const deliverables = [
    translate("contact.deliverables.risks"),
    translate("contact.deliverables.classification"),
    translate("contact.deliverables.nextSteps"),
    translate("contact.deliverables.scorecard"),
  ];

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-6">
            <Heading as="h1" level="display">
              {translate("contact.title")}
            </Heading>
            <Text tone="muted">{translate("contact.description")}</Text>
            <TextLink to={`/${locale}/scorecard`} variant="secondary">
              {translate("contact.scorecardPrompt")}
            </TextLink>
          </div>

          <Card className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <Heading as="h2" level="section">
                {translate("contact.bookByEmailTitle")}
              </Heading>
              <Text tone="muted">
                {translate("contact.bookByEmailDescription")}
              </Text>
            </div>
            <TextLink
              className="ui-action--literal w-fit"
              onClick={() =>
                capture({
                  eventName: "contact_link_pressed",
                  channel: "email",
                  context: "contact",
                })
              }
              to={`mailto:${translate("contact.emailAddress")}?subject=${encodeURIComponent(
                translate("contact.emailSubject"),
              )}`}
            >
              {translate("contact.emailAddress")}
            </TextLink>
            <div className="flex flex-col gap-3 border-t border-border pt-8">
              <Heading as="h3" level="card">
                {translate("contact.deliverablesTitle")}
              </Heading>
              <ul className="flex flex-col gap-2">
                {deliverables.map((deliverable) => (
                  <li
                    className="flex items-start gap-3 text-foreground"
                    key={deliverable}
                  >
                    <span aria-hidden="true" className="atlas-route-marker" />
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
