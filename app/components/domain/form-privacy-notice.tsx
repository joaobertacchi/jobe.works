import { useI18n } from "../../i18n/i18n";
import { Text } from "../ui/text";

type FormPrivacyNoticeProps = {
  marketingOptIn: boolean;
  onMarketingOptInChange: (checked: boolean) => void;
};

export function FormPrivacyNotice({
  marketingOptIn,
  onMarketingOptInChange,
}: FormPrivacyNoticeProps) {
  const { translate } = useI18n();
  return (
    <div className="flex flex-col gap-3">
      <Text tone="muted">{translate("privacy.formNotice.body")}</Text>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(event) => onMarketingOptInChange(event.target.checked)}
        />
        <Text as="span">{translate("privacy.formNotice.marketingOptIn")}</Text>
      </label>
    </div>
  );
}
