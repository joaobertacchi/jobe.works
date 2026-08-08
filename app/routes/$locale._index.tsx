import { ContentPage } from "../components/content-page";
import { useI18n } from "../i18n/i18n";

export default function Home() {
  const { translate } = useI18n();
  return (
    <>
      <ContentPage title="home.title" description="home.description" />
      <p>{translate("home.exampleCount", { count: 2 })}</p>
    </>
  );
}
