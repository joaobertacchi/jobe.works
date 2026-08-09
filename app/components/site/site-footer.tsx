import { useI18n } from "../../i18n/i18n";
import { Container } from "../ui/container";
import { Text } from "../ui/text";
import { TextLink } from "../ui/text-link";

export function SiteFooter() {
  const { locale, translate } = useI18n();
  return (
    <footer className="border-t border-border py-8">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <Text as="span">{translate("common.siteName")}</Text>
          <Text tone="muted">{translate("common.footer.description")}</Text>
        </div>
        <nav
          aria-label={translate("common.footer.navigationLabel")}
          className="flex gap-4"
        >
          <TextLink to={`/${locale}/`} variant="secondary">
            {translate("common.navigation.home")}
          </TextLink>
          <TextLink to={`/${locale}/privacy`} variant="secondary">
            {translate("common.navigation.privacy")}
          </TextLink>
        </nav>
      </Container>
    </footer>
  );
}
