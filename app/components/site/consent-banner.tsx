import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import type { SupportedLocale } from "../../i18n/config";
import { I18nProvider, useI18n } from "../../i18n/i18n";
import { useConsent } from "../../consent/consent-context";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

function ConsentDialog() {
  const { consent, settingsOpen, closeSettings, updatePreferences } =
    useConsent();
  const { translate } = useI18n();
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const analyticsToggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync local form state with the stored consent whenever the dialog opens
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
    const dialog = dialogRef.current;
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    } else if (dialog) {
      dialog.setAttribute("open", "");
    }
    analyticsToggleRef.current?.focus();
  }, [settingsOpen, consent]);

  if (!settingsOpen) return null;

  function savePreferences() {
    updatePreferences({ analytics, marketing });
    closeSettings();
  }

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeSettings();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") closeSettings();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="consent-dialog-title"
      className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 backdrop:bg-background/80"
      onClick={handleDialogClick}
      onClose={closeSettings}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Heading as="h2" id="consent-dialog-title" level="section">
            {translate("consent.dialog.title")}
          </Heading>
          <Text tone="muted">{translate("consent.dialog.description")}</Text>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between gap-4">
            <span className="flex flex-col gap-1">
              <Text as="span">{translate("consent.dialog.necessary")}</Text>
              <Text tone="muted">
                {translate("consent.dialog.necessaryDescription")}
              </Text>
            </span>
            <input
              aria-label={translate("consent.dialog.necessary")}
              checked
              disabled
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="flex flex-col gap-1">
              <Text as="span">{translate("consent.dialog.analytics")}</Text>
              <Text tone="muted">
                {translate("consent.dialog.analyticsDescription")}
              </Text>
            </span>
            <input
              aria-label={translate("consent.dialog.analytics")}
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              ref={analyticsToggleRef}
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="flex flex-col gap-1">
              <Text as="span">{translate("consent.dialog.marketing")}</Text>
              <Text tone="muted">
                {translate("consent.dialog.marketingDescription")}
              </Text>
            </span>
            <input
              aria-label={translate("consent.dialog.marketing")}
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              type="checkbox"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={closeSettings}>
            {translate("consent.dialog.cancel")}
          </Button>
          <Button onClick={savePreferences}>
            {translate("consent.dialog.save")}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

function ConsentBannerContent() {
  const { hasConsentDecision, acceptAll, rejectNonEssential, openSettings } =
    useConsent();
  const { translate } = useI18n();

  return (
    <>
      {hasConsentDecision ? null : (
        <div
          role="region"
          aria-label={translate("consent.banner.label")}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface"
        >
          <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Text>{translate("consent.banner.message")}</Text>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" onClick={acceptAll}>
                {translate("consent.banner.acceptAll")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={rejectNonEssential}
              >
                {translate("consent.banner.rejectNonEssential")}
              </Button>
              <Button size="sm" variant="secondary" onClick={openSettings}>
                {translate("consent.banner.customize")}
              </Button>
            </div>
          </Container>
        </div>
      )}
      <ConsentDialog />
    </>
  );
}

export function ConsentBanner({ locale }: { locale: SupportedLocale | null }) {
  if (locale === null) return null;
  return (
    <I18nProvider locale={locale}>
      <ConsentBannerContent />
    </I18nProvider>
  );
}
