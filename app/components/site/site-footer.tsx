import { useConsent } from "../../consent/consent-context";
import { useI18n } from "../../i18n/i18n";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { Text } from "../ui/text";
import { TextLink } from "../ui/text-link";

export function SiteFooter() {
  const { locale, translate } = useI18n();
  const { openSettings } = useConsent();
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
          >
            {translate("common.footer.email")}
          </a>
        </div>
        <nav
          aria-label={translate("common.footer.navigationLabel")}
          className="site-footer__navigation"
        >
          <TextLink to={`/${locale}/`} variant="nav">
            {translate("common.navigation.home")}
          </TextLink>
          <TextLink to={`/${locale}/about`} variant="nav">
            {translate("common.navigation.about")}
          </TextLink>
          <TextLink to={`/${locale}/privacy`} variant="nav">
            {translate("common.navigation.privacy")}
          </TextLink>
          <Button size="sm" variant="link" onClick={openSettings}>
            {translate("consent.cookieSettings")}
          </Button>
        </nav>
      </Container>
    </footer>
  );
}
