import { Link, Outlet, useParams } from "react-router";

import { isSupportedLocale } from "../i18n/config";
import { I18nProvider, useI18n } from "../i18n/i18n";

function LocalizedLayout() {
  const { translate } = useI18n();
  return (
    <>
      <header>
        <nav aria-label="Primary navigation">
          <Link to=".">{translate("common.navigation.home")}</Link>
          <Link to="about">{translate("common.navigation.about")}</Link>
          <Link to="services">{translate("common.navigation.services")}</Link>
        </nav>
      </header>
      <Outlet />
    </>
  );
}

export default function LocaleLayout() {
  const { locale } = useParams();
  if (!locale || !isSupportedLocale(locale)) {
    return (
      <main>
        <h1>404</h1>
        <p>Page not found.</p>
      </main>
    );
  }

  return (
    <I18nProvider locale={locale}>
      <LocalizedLayout />
    </I18nProvider>
  );
}
