import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SupportedLocale } from "../../i18n/config";
import { I18nProvider } from "../../i18n/i18n";
import { commonTranslations } from "../../i18n/translations/common";
import { THEME_STORAGE_KEY } from "../../theme";
import { ConsentProvider } from "../../consent/consent-context";
import { ConsentBanner } from "./consent-banner";
import { LanguageSwitcher } from "./language-switcher";
import { PrimaryNavigation } from "./primary-navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { ThemeSwitcher } from "./theme-switcher";

const urls: Record<SupportedLocale, string> = {
  en: "/en/about",
  "pt-BR": "/pt-BR/about",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.style.colorScheme = "";
});

describe("common translations", () => {
  it("defines shared site, navigation, and theme labels in both locales", () => {
    expect(commonTranslations.en.siteName).toBe("Agent-ready sites");
    expect(commonTranslations.en.navigationLabel).toBe("Primary navigation");
    expect(commonTranslations.en.theme).toEqual({
      label: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
    });
    expect(commonTranslations["pt-BR"].siteName).toBe(
      "Sites prontos para agentes",
    );
    expect(commonTranslations["pt-BR"].navigationLabel).toBe(
      "Navegação principal",
    );
    expect(commonTranslations["pt-BR"].theme).toEqual({
      label: "Tema",
      light: "Claro",
      dark: "Escuro",
      system: "Sistema",
    });
  });
});

describe("PrimaryNavigation", () => {
  it.each([
    [
      "en",
      "/en/about",
      "Primary navigation",
      [
        ["Home", "/en/"],
        ["About", "/en/about"],
        ["Services", "/en/services"],
      ],
    ],
    [
      "pt-BR",
      "/pt-BR/services",
      "Navegação principal",
      [
        ["Início", "/pt-BR/"],
        ["Sobre", "/pt-BR/about"],
        ["Serviços", "/pt-BR/services"],
      ],
    ],
  ] as const)(
    "renders localized canonical links in %s",
    (locale, pathname, label, links) => {
      renderWithRouter(<PrimaryNavigation />, locale, pathname);

      const navigation = screen.getByRole("navigation", { name: label });
      expect(navigation).toBeVisible();
      for (const [name, href] of links) {
        expect(screen.getByRole("link", { name })).toHaveAttribute(
          "href",
          href,
        );
      }
    },
  );

  it("marks only the active destination and matches Home exactly", () => {
    renderWithRouter(<PrimaryNavigation />, "en", "/en/about");

    const activeLink = screen.getByRole("link", { name: "About" });
    const inactiveLinks = [
      screen.getByRole("link", { name: "Home" }),
      screen.getByRole("link", { name: "Services" }),
    ];

    expect(activeLink).toHaveAttribute("aria-current", "page");
    expect(activeLink).toHaveClass("text-brand");
    for (const link of inactiveLinks) {
      expect(link).not.toHaveAttribute("aria-current");
      expect(link).not.toHaveClass("text-brand");
    }
  });

  it("does not mark a destination active on a nested URL", () => {
    renderWithRouter(<PrimaryNavigation />, "en", "/en/about/missing");

    for (const name of ["Home", "About", "Services"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute(
        "aria-current",
      );
    }
  });
});

describe("LanguageSwitcher", () => {
  it.each([
    ["en", "/en/not-published", "Choose language", "Português", "/pt-BR/about"],
    [
      "pt-BR",
      "/pt-BR/anything/else",
      "Escolher idioma",
      "English",
      "/en/about",
    ],
  ] as const)(
    "uses the supplied sibling URL without rewriting the %s pathname",
    (locale, pathname, label, linkName, href) => {
      renderWithRouter(<LanguageSwitcher urls={urls} />, locale, pathname);

      const navigation = screen.getByRole("navigation", { name: label });
      expect(navigation.querySelectorAll("a")).toHaveLength(1);
      expect(screen.getByRole("link", { name: linkName })).toHaveAttribute(
        "href",
        href,
      );
    },
  );
});

describe("SiteHeader", () => {
  it("composes the site identity, navigation, language, and theme controls", () => {
    installMatchMedia(false);
    renderWithRouter(<SiteHeader urls={urls} />, "en", "/en/about");

    const header = screen.getByRole("banner");
    expect(header).toHaveTextContent("Agent-ready sites");
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
    expect(
      screen.getByRole("navigation", { name: "Choose language" }),
    ).toBeVisible();
    expect(screen.getByRole("group", { name: "Theme" })).toBeVisible();
  });

  it("omits only the language switcher when sibling URLs are unavailable", () => {
    installMatchMedia(false);
    renderWithRouter(<SiteHeader urls={null} />, "pt-BR", "/pt-BR/missing");

    const header = screen.getByRole("banner");
    expect(header).toHaveTextContent("Sites prontos para agentes");
    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "Escolher idioma" }),
    ).toBeNull();
    expect(screen.getByRole("group", { name: "Tema" })).toBeVisible();
  });
});

describe("SiteFooter", () => {
  it.each([
    ["en", "Footer navigation", "Home", "Privacy", "/en/", "/en/privacy"],
    [
      "pt-BR",
      "Navegação do rodapé",
      "Início",
      "Privacidade",
      "/pt-BR/",
      "/pt-BR/privacy",
    ],
  ] as const)(
    "renders localized canonical links in %s",
    (locale, label, home, privacy, homeHref, privacyHref) => {
      renderWithRouter(<SiteFooter />, locale, `/${locale}/about`);

      expect(screen.getByRole("contentinfo")).toBeVisible();
      const navigation = screen.getByRole("navigation", { name: label });
      expect(navigation).toBeVisible();
      expect(screen.getByRole("link", { name: home })).toHaveAttribute(
        "href",
        homeHref,
      );
      expect(screen.getByRole("link", { name: privacy })).toHaveAttribute(
        "href",
        privacyHref,
      );
    },
  );

  it("exposes a cookie settings button that opens the customize dialog", () => {
    render(
      <MemoryRouter initialEntries={["/en/about"]}>
        <ConsentProvider>
          <I18nProvider locale="en">
            <SiteFooter />
            <ConsentBanner locale="en" />
          </I18nProvider>
        </ConsentProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));

    expect(
      screen.getByRole("dialog", { name: "Cookie settings" }),
    ).toBeVisible();
  });
});

describe("ThemeSwitcher", () => {
  it.each([
    ["en", "Theme", ["Light", "Dark", "System"]],
    ["pt-BR", "Tema", ["Claro", "Escuro", "Sistema"]],
  ] as const)(
    "renders an accessible localized group in %s",
    async (locale, groupName, buttonNames) => {
      installMatchMedia(false);

      renderThemeSwitcher(locale);

      const group = screen.getByRole("group", { name: groupName });
      const buttons = buttonNames.map((name) =>
        screen.getByRole("button", { name }),
      );

      expect(group).toContainElement(buttons[0]);
      expect(buttons).toHaveLength(3);
      await waitFor(() => {
        expect(
          buttons.filter(
            (button) => button.getAttribute("aria-pressed") === "true",
          ),
        ).toHaveLength(1);
      });
    },
  );

  it.each([
    ["light", false, "light"],
    ["dark", true, "dark"],
  ] as const)(
    "loads and applies a stored %s preference",
    async (storedTheme, isDark, colorScheme) => {
      window.localStorage.setItem(THEME_STORAGE_KEY, storedTheme);
      installMatchMedia(!isDark);

      renderThemeSwitcher();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: title(storedTheme) }),
        ).toHaveAttribute("aria-pressed", "true");
      });
      expect(document.documentElement.classList.contains("dark")).toBe(isDark);
      expect(document.documentElement.style.colorScheme).toBe(colorScheme);
    },
  );

  it("persists and immediately applies explicit dark and light selections", () => {
    installMatchMedia(false);
    renderThemeSwitcher();

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(screen.getByRole("button", { name: "Dark" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Light" }));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it.each([
    [false, "light"],
    [true, "dark"],
  ] as const)(
    "removes the stored preference and follows system dark=%s",
    (prefersDark, effectiveTheme) => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
      installMatchMedia(prefersDark);
      renderThemeSwitcher();

      fireEvent.click(screen.getByRole("button", { name: "System" }));

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
      expect(document.documentElement.classList.contains("dark")).toBe(
        effectiveTheme === "dark",
      );
      expect(document.documentElement.style.colorScheme).toBe(effectiveTheme);
      expect(screen.getByRole("button", { name: "System" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    },
  );

  it("updates the effective system theme when the media preference changes", () => {
    const media = installMatchMedia(false);
    renderThemeSwitcher();

    media.emit(true);

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    media.emit(false);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it.each(["light", "dark"] as const)(
    "does not override an explicit %s selection on media changes",
    (theme) => {
      const media = installMatchMedia(theme === "light");
      renderThemeSwitcher();

      fireEvent.click(screen.getByRole("button", { name: title(theme) }));
      media.emit(theme === "light");

      expect(document.documentElement.classList.contains("dark")).toBe(
        theme === "dark",
      );
      expect(document.documentElement.style.colorScheme).toBe(theme);
    },
  );

  it("removes the system listener on mode change and unmount", () => {
    const media = installMatchMedia(false);
    const { unmount } = renderThemeSwitcher();

    expect(media.listenerCount()).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));

    expect(media.listenerCount()).toBe(0);
    expect(media.removeEventListener).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "System" }));

    expect(media.listenerCount()).toBe(1);

    unmount();

    expect(media.listenerCount()).toBe(0);
    expect(media.removeEventListener).toHaveBeenCalledTimes(2);
  });

  it("cancels the pending mount update when unmounted in the same turn", async () => {
    const media = installMatchMedia(false);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { unmount } = renderThemeSwitcher();

    unmount();
    await act(() => Promise.resolve());

    expect(media.listenerCount()).toBe(0);
    expect(media.addEventListener).toHaveBeenCalledOnce();
    expect(media.removeEventListener).toHaveBeenCalledOnce();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("does not let stored theme sync overwrite a same-turn system selection", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const media = installMatchMedia(false);
    renderThemeSwitcher();

    fireEvent.click(screen.getByRole("button", { name: "System" }));
    await act(() => Promise.resolve());

    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(media.listenerCount()).toBe(1);
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it("does not leak listeners or stale mount updates in StrictMode", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const media = installMatchMedia(false);
    const { unmount } = render(
      <StrictMode>
        <I18nProvider locale="en">
          <ThemeSwitcher />
        </I18nProvider>
      </StrictMode>,
    );

    fireEvent.click(screen.getByRole("button", { name: "System" }));
    await act(() => Promise.resolve());

    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(media.listenerCount()).toBe(1);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    unmount();

    expect(media.listenerCount()).toBe(0);
    expect(media.removeEventListener).toHaveBeenCalledTimes(
      media.addEventListener.mock.calls.length,
    );
  });

  it("uses system when storage contains an invalid value", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "invalid");
    installMatchMedia(true);

    expect(() => renderThemeSwitcher()).not.toThrow();

    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.documentElement).toHaveClass("dark");
  });

  it("uses system when storage throws", () => {
    installMatchMedia(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });

    expect(() => renderThemeSwitcher()).not.toThrow();

    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.documentElement).toHaveClass("dark");
  });

  it("falls back to light when matchMedia is missing", () => {
    vi.stubGlobal("matchMedia", undefined);

    expect(() => renderThemeSwitcher()).not.toThrow();

    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});

function renderThemeSwitcher(locale: "en" | "pt-BR" = "en") {
  return render(
    <I18nProvider locale={locale}>
      <ThemeSwitcher />
    </I18nProvider>,
  );
}

function renderWithRouter(
  component: React.ReactNode,
  locale: SupportedLocale,
  pathname: string,
) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <ConsentProvider>
        <I18nProvider locale={locale}>{component}</I18nProvider>
      </ConsentProvider>
    </MemoryRouter>,
  );
}

function title(theme: "light" | "dark") {
  return `${theme[0].toUpperCase()}${theme.slice(1)}`;
}

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    addEventListener: vi.fn(
      (_type: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (_type: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    ),
    emit(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
    listenerCount: () => listeners.size,
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQuery),
  );

  return mediaQuery;
}
