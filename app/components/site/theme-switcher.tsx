import { useEffect, useRef, useState } from "react";

import { useI18n } from "../../i18n/i18n";
import {
  applyTheme,
  persistTheme,
  readTheme,
  resolveTheme,
  THEME_MEDIA_QUERY,
  type Theme,
} from "../../theme";
import { Button } from "../ui/button";

const themes = ["light", "dark", "system"] as const;

export function ThemeSwitcher() {
  const { translate } = useI18n();
  const [theme, setTheme] = useState<Theme>("system");
  const hasInteracted = useRef(false);

  useEffect(() => {
    let active = true;
    const storedTheme = readTheme();
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia(THEME_MEDIA_QUERY).matches;

    applyTheme(
      resolveTheme(storedTheme, prefersDark),
      document.documentElement,
    );
    void Promise.resolve().then(() => {
      if (active && !hasInteracted.current) setTheme(storedTheme);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (theme !== "system" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      applyTheme(
        resolveTheme("system", event.matches),
        document.documentElement,
      );
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  function selectTheme(nextTheme: Theme) {
    hasInteracted.current = true;
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia(THEME_MEDIA_QUERY).matches;

    persistTheme(nextTheme);
    applyTheme(resolveTheme(nextTheme, prefersDark), document.documentElement);
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
