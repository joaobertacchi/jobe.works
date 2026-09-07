import { useEffect, useRef, useState } from "react";

import { useI18n } from "../../i18n/i18n";
import {
  applyTheme,
  persistTheme,
  readTheme,
  resolveTheme,
  THEME_MEDIA_QUERY,
} from "../../theme";
import { Button } from "../ui/button";

const themes = ["light", "dark"] as const;

type ThemeChoice = (typeof themes)[number];

export function ThemeSwitcher() {
  const { translate } = useI18n();
  const [theme, setTheme] = useState<ThemeChoice>("light");
  const [followsSystem, setFollowsSystem] = useState(true);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const storedTheme = readTheme();
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia(THEME_MEDIA_QUERY).matches;

    applyTheme(
      resolveTheme(storedTheme, prefersDark),
      document.documentElement,
    );
    void Promise.resolve().then(() => {
      if (hasInteracted.current) return;
      const freshTheme = readTheme();
      const freshPrefersDark =
        typeof window.matchMedia === "function" &&
        window.matchMedia(THEME_MEDIA_QUERY).matches;

      setTheme(resolveTheme(freshTheme, freshPrefersDark));
      setFollowsSystem(freshTheme === "system");
    });
  }, []);

  useEffect(() => {
    if (!followsSystem || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      const effective = event.matches ? "dark" : "light";
      applyTheme(effective, document.documentElement);
      setTheme(effective);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [followsSystem]);

  function selectTheme(nextTheme: ThemeChoice) {
    hasInteracted.current = true;
    setFollowsSystem(false);
    persistTheme(nextTheme);
    applyTheme(nextTheme, document.documentElement);
    setTheme(nextTheme);
  }

  return (
    <div
      role="group"
      aria-label={translate("common.theme.label")}
      className="theme-switcher"
    >
      {themes.map((option) => (
        <Button
          aria-pressed={theme === option}
          className="theme-switcher__choice"
          key={option}
          onClick={() => selectTheme(option)}
          size="sm"
          variant="secondary"
        >
          {translate(`common.theme.${option}`)}
        </Button>
      ))}
    </div>
  );
}
