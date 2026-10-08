import { useI18n } from "../../../i18n/i18n";
import type { ScorecardResult } from "../../../scorecard/scoring";

export function ResultsView({
  result,
}: {
  result: ScorecardResult;
  onRetake: () => void;
  focusOnMount: boolean;
}) {
  const { translate } = useI18n();
  return (
    <h2>{translate(`scorecard.results.verdicts.${result.verdict}.label`)}</h2>
  );
}
