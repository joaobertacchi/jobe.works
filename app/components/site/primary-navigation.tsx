import { useLocation } from "react-router";

import { useI18n } from "../../i18n/i18n";
import { TextLink } from "../ui/text-link";

export function PrimaryNavigation() {
  const { locale, translate } = useI18n();
  // Prerendered pages are requested with a trailing slash; compare without it
  // so the active destination matches during prerender and after hydration.
  const pathname = useLocation().pathname.replace(/(.)\/$/, "$1");
  const links = [
    {
      label: translate("common.navigation.services"),
      to: `/${locale}/services`,
    },
    {
      label: translate("common.navigation.case"),
      to: `/${locale}/case`,
    },
    {
      label: translate("common.navigation.scorecard"),
      to: `/${locale}/scorecard`,
    },
    {
      label: translate("common.navigation.about"),
      to: `/${locale}/about`,
    },
  ];

  return (
    <nav
      aria-label={translate("common.navigationLabel")}
      className="site-primary-navigation"
    >
      {links.map(({ label, to }) => {
        const active = pathname === to;
        return (
          <TextLink
            aria-current={active ? "page" : undefined}
            className={active ? "is-active" : undefined}
            key={to}
            to={to}
            variant="nav"
          >
            {label}
          </TextLink>
        );
      })}
    </nav>
  );
}
