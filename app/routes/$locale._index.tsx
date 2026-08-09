import { HeroSection } from "../components/sections/hero-section";
import { useI18n } from "../i18n/i18n";

export default function Home() {
  const { translate } = useI18n();
  return (
    <main>
      <HeroSection
        eyebrow={translate("home.eyebrow")}
        title={translate("home.title")}
        description={translate("home.description")}
      />
    </main>
  );
}
