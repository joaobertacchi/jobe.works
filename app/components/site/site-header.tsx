import type { SupportedLocale } from "../../i18n/config";
import { useI18n } from "../../i18n/i18n";
import { Container } from "../ui/container";
import { Text } from "../ui/text";
import { LanguageSwitcher } from "./language-switcher";
import { PrimaryNavigation } from "./primary-navigation";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader({
  urls,
}: {
  urls: Record<SupportedLocale, string> | null;
}) {
  const { translate } = useI18n();

  return (
    <header>
      <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
        <Text as="span">{translate("common.siteName")}</Text>
        <PrimaryNavigation />
        <div className="flex flex-wrap items-center gap-4">
          {urls === null ? null : <LanguageSwitcher urls={urls} />}
          <ThemeSwitcher />
        </div>
      </Container>
    </header>
  );
}
