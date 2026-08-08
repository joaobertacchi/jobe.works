import { useI18n } from "../i18n/i18n";
import type { PlainTranslationScope } from "../i18n/types";

export function ContentPage({
  description,
  title,
}: {
  description: PlainTranslationScope;
  title: PlainTranslationScope;
}) {
  const { translate } = useI18n();
  return (
    <main>
      <h1>{translate(title)}</h1>
      <p>{translate(description)}</p>
    </main>
  );
}
