import { useEffect } from "react";
import { useNavigate } from "react-router";

import { defaultLocale, selectPreferredLocale } from "../i18n/config";
import { translations } from "../i18n/translations";

export default function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const locale = selectPreferredLocale(navigator.languages);
    void navigate(`/${locale}/`, { replace: true });
  }, [navigate]);

  return (
    <main>
      <p role="status">
        {translations[defaultLocale].common.selectingLanguage}
      </p>
    </main>
  );
}
