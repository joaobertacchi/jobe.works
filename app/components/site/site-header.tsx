import { useAnalytics } from "../../analytics/analytics";
import type { SupportedLocale } from "../../i18n/config";
import { useI18n } from "../../i18n/i18n";
import { Container } from "../ui/container";
import { TextLink } from "../ui/text-link";
import { LanguageSwitcher } from "./language-switcher";
import { PrimaryNavigation } from "./primary-navigation";

export function SiteHeader({
  urls,
}: {
  urls: Record<SupportedLocale, string> | null;
}) {
  const { locale, translate } = useI18n();
  const { capture } = useAnalytics();

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <TextLink
          className="site-wordmark"
          to={`/${locale}/`}
          variant="wordmark"
        >
          {translate("common.siteName")}
          <span aria-hidden="true" className="site-wordmark__accent" />
        </TextLink>
        <PrimaryNavigation />
        <div className="site-utilities">
          {urls === null ? null : <LanguageSwitcher urls={urls} />}
          <TextLink
            className="site-header__cta ui-action--sm"
            onClick={() =>
              capture({
                eventName: "cta_pressed",
                ctaId: "header-book-call",
                context: "header",
              })
            }
            to={`/${locale}/contact`}
          >
            {translate("common.navigation.book")}
          </TextLink>
        </div>
      </Container>
    </header>
  );
}
