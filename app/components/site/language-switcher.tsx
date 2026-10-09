import { Link } from "react-router";

import { useAnalytics } from "../../analytics/analytics";
import {
  locales,
  supportedLocales,
  type SupportedLocale,
} from "../../i18n/config";
import { useI18n } from "../../i18n/i18n";

export function LanguageSwitcher({
  urls,
}: {
  urls: Record<SupportedLocale, string>;
}) {
  const { locale, translate } = useI18n();
  const { capture } = useAnalytics();

  return (
    <nav
      aria-label={translate("common.languageSwitcherLabel")}
      className="language-switcher"
    >
      {supportedLocales
        .filter((targetLocale) => targetLocale !== locale)
        .map((targetLocale) => (
          <Link
            className="utility-link"
            key={targetLocale}
            onClick={() =>
              capture({
                eventName: "locale_switched",
                from: locale,
                to: targetLocale,
              })
            }
            to={urls[targetLocale]}
          >
            {locales[targetLocale].label}
          </Link>
        ))}
    </nav>
  );
}
