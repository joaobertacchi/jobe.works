import { NavLink } from "react-router";

import { useI18n } from "../../i18n/i18n";

export function PrimaryNavigation() {
  const { locale, translate } = useI18n();
  const links = [
    {
      label: translate("common.navigation.home"),
      to: `/${locale}/`,
      end: true,
    },
    {
      label: translate("common.navigation.about"),
      to: `/${locale}/about`,
    },
    {
      label: translate("common.navigation.services"),
      to: `/${locale}/services`,
    },
  ];

  return (
    <nav
      aria-label={translate("common.navigationLabel")}
      className="flex flex-wrap gap-4"
    >
      {links.map(({ end, label, to }) => (
        <NavLink
          className={({ isActive }) =>
            isActive
              ? "font-semibold underline underline-offset-4"
              : "hover:underline hover:underline-offset-4"
          }
          end={end}
          key={to}
          to={to}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
