import { useAnalytics } from "../../analytics/analytics";
import { useConsent } from "../../consent/consent-context";
import { useI18n } from "../../i18n/i18n";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { Text } from "../ui/text";
import { TextLink } from "../ui/text-link";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteFooter() {
  const { locale, translate } = useI18n();
  const { openSettings } = useConsent();
  const { capture } = useAnalytics();
  const footerLinks = [
    { key: "home", to: `/${locale}/` },
    { key: "services", to: `/${locale}/services` },
    { key: "case", to: `/${locale}/case` },
    { key: "scorecard", to: `/${locale}/scorecard` },
    { key: "about", to: `/${locale}/about` },
    { key: "contact", to: `/${locale}/contact` },
  ] as const;
  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <div className="max-w-xl">
          <Text as="span" className="site-footer__wordmark">
            {translate("common.siteName")}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-brand">
            {translate("common.tagline")}
          </Text>
          <Text className="mt-3" tone="muted">
            {translate("common.footer.description")}
          </Text>
          <a
            className="site-footer__email"
            href={`mailto:${translate("common.footer.email")}`}
            onClick={() =>
              capture({
                eventName: "contact_link_pressed",
                channel: "email",
                context: "footer",
              })
            }
          >
            {translate("common.footer.email")}
          </a>
        </div>
        <nav
          aria-label={translate("common.footer.navigationLabel")}
          className="site-footer__navigation"
        >
          <ul className="site-footer__links">
            {footerLinks.map(({ key, to }) => (
              <li key={key}>
                <TextLink to={to} variant="nav">
                  {translate(`common.navigation.${key}`)}
                </TextLink>
              </li>
            ))}
          </ul>
          <ul className="site-footer__links site-footer__links--legal">
            <li>
              <TextLink to={`/${locale}/privacy`} variant="nav">
                {translate("common.navigation.privacy")}
              </TextLink>
            </li>
            <li>
              <Button size="sm" variant="link" onClick={openSettings}>
                {translate("consent.cookieSettings")}
              </Button>
            </li>
          </ul>
        </nav>
        <ThemeSwitcher />
      </Container>
    </footer>
  );
}
