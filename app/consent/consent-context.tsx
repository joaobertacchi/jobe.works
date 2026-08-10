import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createStoredConsent,
  defaultConsent,
  readConsent,
  writeConsent,
  type ConsentSnapshot,
  type StoredConsent,
} from "./consent";

type ConsentValue = {
  consent: ConsentSnapshot;
  bannerVisible: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  updatePreferences: (snapshot: ConsentSnapshot) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
};

const ConsentContext = createContext<ConsentValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredConsent | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // Deferred one-shot read: applying stored consent (or revealing the banner
    // for new visitors) after hydration keeps the prerendered and hydrated
    // trees identical, so no hydration mismatch or flash occurs.
    queueMicrotask(() => {
      const loaded = readConsent();
      setStored(loaded);
      setConsentChecked(true);
    });
  }, []);

  const persist = useCallback((snapshot: ConsentSnapshot) => {
    const next = createStoredConsent(snapshot);
    setStored(next);
    writeConsent(next);
  }, []);

  const acceptAll = useCallback(
    () => persist({ analytics: true, marketing: true }),
    [persist],
  );
  const rejectNonEssential = useCallback(
    () => persist({ analytics: false, marketing: false }),
    [persist],
  );
  const updatePreferences = useCallback(
    (snapshot: ConsentSnapshot) => persist(snapshot),
    [persist],
  );
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo<ConsentValue>(
    () => ({
      consent: stored ?? defaultConsent,
      bannerVisible: consentChecked && stored === null,
      acceptAll,
      rejectNonEssential,
      updatePreferences,
      settingsOpen,
      openSettings,
      closeSettings,
    }),
    [
      stored,
      consentChecked,
      settingsOpen,
      acceptAll,
      rejectNonEssential,
      updatePreferences,
      openSettings,
      closeSettings,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentValue {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("useConsent must be used within ConsentProvider");
  return value;
}
