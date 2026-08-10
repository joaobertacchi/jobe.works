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
  hasConsentDecision: boolean;
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const loaded = readConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sync with an external system (localStorage has no same-tab subscription); the initial unresolved render must match the prerendered tree
    if (loaded) setStored(loaded);
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
      hasConsentDecision: stored !== null,
      acceptAll,
      rejectNonEssential,
      updatePreferences,
      settingsOpen,
      openSettings,
      closeSettings,
    }),
    [
      stored,
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
