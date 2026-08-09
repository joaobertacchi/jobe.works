import { useEffect } from "react";
import { useNavigate } from "react-router";

import { defaultLocale, selectPreferredLocale } from "../i18n/config";
import { I18nProvider, useI18n } from "../i18n/i18n";

function RootRedirectContent() {
  const navigate = useNavigate();
  const { translate } = useI18n();

  useEffect(() => {
    const locale = selectPreferredLocale(navigator.languages);
    void navigate(`/${locale}/`, { replace: true });
  }, [navigate]);

  return (
    <main>
      <p role="status">{translate("common.selectingLanguage")}</p>
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
