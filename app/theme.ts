export const THEME_STORAGE_KEY = "theme";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export type Theme = "light" | "dark" | "system";
export type EffectiveTheme = Exclude<Theme, "system">;
export type ThemeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readTheme(storage?: ThemeStorage): Theme {
  try {
    const value = (
      storage ??
      (typeof window === "undefined" ? undefined : window.localStorage)
    )?.getItem(THEME_STORAGE_KEY);

    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(
  theme: Theme,
  prefersDark: boolean,
): EffectiveTheme {
  return theme === "system" ? (prefersDark ? "dark" : "light") : theme;
}

export function applyTheme(theme: EffectiveTheme, root: HTMLElement): void {
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function persistTheme(theme: Theme, storage?: ThemeStorage): void {
  try {
    const target =
      storage ??
      (typeof window === "undefined" ? undefined : window.localStorage);

    if (theme === "system") {
      target?.removeItem(THEME_STORAGE_KEY);
    } else {
      target?.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // Storage may be blocked by browser privacy settings.
  }
}

export const themeInitializationScript = `(()=>{let t=null;try{t=localStorage.getItem("theme")}catch{}const d=t==="dark"||(t!=="light"&&typeof matchMedia==="function"&&matchMedia("(prefers-color-scheme: dark)").matches),r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"})()`;
