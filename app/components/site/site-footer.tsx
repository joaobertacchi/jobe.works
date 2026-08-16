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
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <Text as="span" className="text-lg font-bold tracking-tight">
            {translate("common.siteName")}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-brand">
            {translate("common.tagline")}
          </Text>
          <Text className="mt-3" tone="muted">
            {translate("common.footer.description")}
          </Text>
          <Text className="mt-2 text-sm" tone="muted">
            {translate("common.footer.email")}
          </Text>
        </div>
        <nav
          aria-label={translate("common.footer.navigationLabel")}
          className="flex flex-wrap items-center gap-5"
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
          <Button size="sm" variant="secondary" onClick={openSettings}>
            {translate("consent.cookieSettings")}
          </Button>
        </nav>
      </Container>
    </footer>
  );
}
