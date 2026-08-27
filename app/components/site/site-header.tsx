import type { SupportedLocale } from "../../i18n/config";
import { useI18n } from "../../i18n/i18n";
import { Container } from "../ui/container";
import { TextLink } from "../ui/text-link";
import { LanguageSwitcher } from "./language-switcher";
import { PrimaryNavigation } from "./primary-navigation";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader({
  urls,
}: {
  urls: Record<SupportedLocale, string> | null;
}) {
  const { locale, translate } = useI18n();

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <TextLink
          className="site-wordmark"
          to={`/${locale}/`}
          variant="wordmark"
        >
          {translate("common.siteName")}
        </TextLink>
        <PrimaryNavigation />
        <div className="site-utilities">
          {urls === null ? null : <LanguageSwitcher urls={urls} />}
          <ThemeSwitcher />
        </div>
      </Container>
    </header>
  );
}
