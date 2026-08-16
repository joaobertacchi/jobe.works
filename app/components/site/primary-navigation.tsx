import { useI18n } from "../../i18n/i18n";
import { TextLink } from "../ui/text-link";

export function PrimaryNavigation() {
  const { locale, translate } = useI18n();
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
      label: translate("common.navigation.contact"),
      to: `/${locale}/contact`,
    },
  ];

  return (
    <nav
      aria-label={translate("common.navigationLabel")}
      className="flex flex-wrap items-center gap-5"
    >
      {links.map(({ label, to }) => (
        <TextLink
          activeClassName="font-semibold text-brand"
          end
          key={to}
          to={to}
          variant="nav"
        >
          {label}
        </TextLink>
      ))}
    </nav>
  );
}
