import { useEffect } from "react";
import { useNavigate } from "react-router";

import { TextLink } from "../components/ui/text-link";
import { defaultLocale, locales, supportedLocales } from "../i18n/config";
import { I18nProvider, useI18n } from "../i18n/i18n";
import { readPreferredLocale } from "../i18n/locale-preference";

export function meta() {
  return [{ name: "robots", content: "noindex,follow" }];
}

// The root document head redirects before paint (see root.tsx). The links
// serve crawlers and visitors without JavaScript; the effect covers in-app
// navigation to `/`, where the head script does not run again.
function RootRedirectContent() {
  const navigate = useNavigate();
  const { translate } = useI18n();

  useEffect(() => {
    void navigate(`/${readPreferredLocale()}/`, { replace: true });
  }, [navigate]);

  return (
    <main>
      <nav aria-label={translate("common.languageSwitcherLabel")}>
        {supportedLocales.map((locale) => (
          <TextLink
            key={locale}
            lang={locales[locale].htmlLang}
            to={`/${locale}/`}
            variant="secondary"
          >
            {locales[locale].label}
          </TextLink>
        ))}
      </nav>
    </main>
  );
}

export default function RootRedirect() {
  return (
    <I18nProvider locale={defaultLocale}>
      <RootRedirectContent />
    </I18nProvider>
  );
}
