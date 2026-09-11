import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  createMemoryRouter,
  isRouteErrorResponse,
  Outlet,
  RouterProvider,
  useParams,
  useRouteError,
} from "react-router";
import { describe, expect, it, vi } from "vitest";

import { AnalyticsProvider } from "../analytics/analytics";
import type { TrackerRegistration } from "../analytics/types";
import { ConsentProvider } from "../consent/consent-context";
import type { CanonicalUrlManifest } from "../routing/canonical-url-manifest";
import NotFound from "./$locale.404";
import About from "./$locale.about";
import Home from "./$locale._index";
import Services from "./$locale.services";
import CaseStudy from "./$locale.case";
import Contact from "./$locale.contact";
import Privacy from "./$locale.privacy";
import LocalizedCatchAll from "./$locale.$";
import LocaleLayout, {
  clientLoader,
  ErrorBoundary,
  getLoaderDataForPathname,
  shouldRevalidate,
} from "./$locale";

const canonicalManifest = [
  {
    id: "home",
    kind: "page",
    pattern: "/:locale/",
    urls: { en: "/en/", "pt-BR": "/pt-BR/" },
  },
  {
    id: "about",
    kind: "page",
    pattern: "/:locale/about",
    urls: { en: "/en/about", "pt-BR": "/pt-BR/about" },
  },
  {
    id: "services",
    kind: "page",
    pattern: "/:locale/services",
    urls: { en: "/en/services", "pt-BR": "/pt-BR/services" },
  },
  {
    id: "case",
    kind: "page",
    pattern: "/:locale/case",
    urls: { en: "/en/case", "pt-BR": "/pt-BR/case" },
  },
  {
    id: "contact",
    kind: "page",
    pattern: "/:locale/contact",
    urls: { en: "/en/contact", "pt-BR": "/pt-BR/contact" },
  },
  {
    id: "404",
    kind: "utility",
    pattern: "/:locale/404",
    urls: { en: "/en/404", "pt-BR": "/pt-BR/404" },
  },
  {
    id: "privacy",
    kind: "page",
    pattern: "/:locale/privacy",
    urls: { en: "/en/privacy", "pt-BR": "/pt-BR/privacy" },
  },
] satisfies CanonicalUrlManifest;

const site = {
  origin: "https://jobe.works",
  siteName: "JOBE",
  defaultSocialImage: "/social-card.svg",
  xDefault: true,
};

function TestErrorBoundary() {
  return (
    <ErrorBoundary error={useRouteError()} params={useParams() as never} />
  );
}

function getLoaderData(pathname: string) {
  return getLoaderDataForPathname(canonicalManifest, pathname, site);
}

function renderLocalizedRoute(
  pathname: string,
  validateLocale = false,
  trackers: readonly TrackerRegistration[] = [],
) {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        Component: () => (
          <ConsentProvider>
            <AnalyticsProvider
              consent={{ analytics: true, marketing: true }}
              trackers={trackers}
            >
              <Outlet />
            </AnalyticsProvider>
          </ConsentProvider>
        ),
        children: [
          {
            path: ":locale",
            Component: LocaleLayout,
            ErrorBoundary: TestErrorBoundary,
            HydrateFallback: () => <p>Loading</p>,
            loader: validateLocale
              ? (args) =>
                  clientLoader({
                    ...args,
                    serverLoader: async () => {
                      try {
                        return getLoaderData(
                          new URL(args.request.url).pathname,
                        );
                      } catch {
                        throw new Response(null, { status: 404 });
                      }
                    },
                  } as never)
              : ({ request }) => getLoaderData(new URL(request.url).pathname),
            shouldRevalidate,
            children: [
              { index: true, Component: Home },
              { path: "about", Component: About },
              { path: "services", Component: Services },
              { path: "case", Component: CaseStudy },
              { path: "contact", Component: Contact },
              { path: "privacy", Component: Privacy },
              { path: "404", Component: NotFound },
              {
                path: "*",
                Component: LocalizedCatchAll,
                handle: { languageSwitcher: false },
              },
            ],
          },
        ],
      },
    ],
    { initialEntries: [pathname] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("localized route layout", () => {
  it.each([
    [
      "en",
      "Page not found",
      "This page may have moved or never existed. Use the navigation to find your way back.",
    ],
    [
      "pt-BR",
      "Página não encontrada",
      "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
    ],
  ])(
    "localizes its 404 error boundary for %s",
    (locale, title, description) => {
      render(
        <ErrorBoundary
          error={new Response(null, { status: 404 })}
          params={{ locale } as never}
        />,
      );

      expect(screen.getByRole("heading", { name: title })).toBeVisible();
      expect(screen.getByText(description)).toBeVisible();
    },
  );

  it("emits cta_pressed with distinct ids for the mobile and rail hero calls to action", async () => {
    const tracker = vi.fn();
    renderLocalizedRoute("/en/", false, [
      { tracker, consentCategory: "analytics" },
    ]);

    const heroCtas = await screen.findAllByRole("link", {
      name: "Book a Product Readiness Call",
    });

    fireEvent.click(heroCtas[0]);

    await vi.waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "cta_pressed",
        ctaId: "hero-mobile-book-call",
        context: "homepage",
      });
    });

    fireEvent.click(heroCtas[1]);

    await vi.waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "cta_pressed",
        ctaId: "hero-rail-book-call",
        context: "homepage",
      });
    });
  });

  it.each([
    [
      "/en/",
      "A product system routed through diagnosis",
      "Evaluate first. Direct the right engagement second.",
    ],
    [
      "/pt-BR/",
      "Um sistema de produto direcionado pelo diagnóstico",
      "Avaliar primeiro. Direcionar o engajamento certo depois.",
    ],
  ])(
    "renders the localized Systems Wayfinding evidence on %s",
    async (pathname, topologyName, founderStatement) => {
      renderLocalizedRoute(pathname);

      expect(
        await screen.findByRole("img", { name: topologyName }),
      ).toBeVisible();
      expect(screen.getByText(founderStatement)).toBeVisible();
      expect(screen.getAllByText("João Bertacchi")).toHaveLength(1);
    },
  );

  it.each([
    ["/en/", "Skip to content"],
    ["/pt-BR/", "Pular para o conteúdo"],
  ])(
    "renders the skip link ahead of every other interactive element on %s",
    async (pathname, skipLabel) => {
      renderLocalizedRoute(pathname);

      const skipLink = await screen.findByRole("link", { name: skipLabel });
      const header = await screen.findByRole("banner");
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#main-content");
      expect(
        skipLink.compareDocumentPosition(header) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    },
  );

  it("renders representative localized privacy content", async () => {
    renderLocalizedRoute("/pt-BR/privacy");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Aviso de privacidade",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Dados tratados por este site",
      }),
    ).toBeVisible();
  });

  it("renders the localized About page", async () => {
    renderLocalizedRoute("/pt-BR/about");

    expect(
      await screen.findByRole("heading", { name: "Sobre a JOBE" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "JOBE une JOão e BErtacchi — com uma leitura secundária da palavra job: o trabalho em si. O slogan carrega a mesma ambiguidade: engenharia que funciona, Jobe Works, jobe.works.",
      ),
    ).toBeVisible();
  });

  it.each(["/en/case", "/pt-BR/case"])(
    "renders a complete localized case study article on %s",
    async (pathname) => {
      renderLocalizedRoute(pathname);

      const article = await screen.findByRole("article");
      expect(within(article).getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        within(article).getAllByRole("heading", { level: 2 }).length,
      ).toBeGreaterThan(0);
      expect(within(article).getAllByRole("blockquote").length).toBeGreaterThan(
        0,
      );
    },
  );

  it("renders the localized contact page with the mailto booking path", async () => {
    renderLocalizedRoute("/pt-BR/contact");

    expect(
      await screen.findByRole("heading", {
        name: "Agendar uma Product Readiness Call",
      }),
    ).toBeVisible();
    expect(
      within(screen.getByRole("main")).getByRole("link", {
        name: "joao@jobe.works",
      }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:joao@jobe.works"),
    );
  });

  it.each([
    ["en", "Error", "An unexpected error occurred."],
    ["pt-BR", "Erro", "Ocorreu um erro inesperado."],
  ])(
    "localizes its generic error boundary for %s",
    (locale, title, description) => {
      render(
        <ErrorBoundary
          error={new Error("Failure")}
          params={{ locale } as never}
        />,
      );

      expect(screen.getByRole("heading", { name: title })).toBeVisible();
      expect(screen.getByText(description)).toBeVisible();
    },
  );

  it.each([{}, { locale: "fr" }])(
    "uses a language-neutral 404 for unsupported or missing locale params",
    (params) => {
      render(
        <ErrorBoundary
          error={new Response(null, { status: 404 })}
          params={params as never}
        />,
      );

      expect(screen.getByRole("heading", { name: "404" })).toBeVisible();
      expect(screen.queryByText("Page not found")).toBeNull();
      expect(screen.queryByText("Página não encontrada")).toBeNull();
      expect(
        screen.queryByText(
          "This page may have moved or never existed. Use the navigation to find your way back.",
        ),
      ).toBeNull();
      expect(
        screen.queryByText(
          "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
        ),
      ).toBeNull();
    },
  );

  it("renders a neutral unsupported locale layout without a provider", () => {
    const router = createMemoryRouter(
      [{ path: ":locale/*", Component: LocaleLayout }],
      { initialEntries: ["/fr/about"] },
    );
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { name: "404" })).toBeVisible();
    expect(screen.queryByText("Page not found")).toBeNull();
    expect(screen.queryByText("Página não encontrada")).toBeNull();
  });

  it("links localized 404 visitors back to canonical Home", async () => {
    renderLocalizedRoute("/pt-BR/404");

    expect(
      await screen.findByRole("link", { name: "Voltar ao início" }),
    ).toHaveAttribute("href", "/pt-BR/");
  });

  it("rejects an unsupported locale", async () => {
    const router = renderLocalizedRoute("/fr/about", true);

    expect(await screen.findByRole("heading", { name: "404" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "About" })).toBeNull();
    expect(screen.queryByText("Page not found")).toBeNull();
    expect(screen.queryByText("Página não encontrada")).toBeNull();
    expect(
      Object.values(router.state.errors ?? {}).some(
        (error) =>
          (error instanceof Response || isRouteErrorResponse(error)) &&
          error.status === 404,
      ),
    ).toBe(true);
  });

  it("renders localized not-found behavior after client navigation", async () => {
    const router = renderLocalizedRoute("/en/about", true);
    expect(
      await screen.findByRole("heading", { name: "About JOBE" }),
    ).toBeVisible();

    await router.navigate("/en/not-published");

    expect(router.state.location.pathname).toBe("/en/not-published");
    expect(
      await screen.findByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "Choose language" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ["/en/about/", "/en/about", "Page not found", "About JOBE"],
    ["/en/About", "/en/about", "Page not found", "About JOBE"],
    ["/pt-BR/about/", "/pt-BR/about", "Página não encontrada", "Sobre a JOBE"],
    ["/pt-BR/About", "/pt-BR/about", "Página não encontrada", "Sobre a JOBE"],
  ] as const)(
    "rejects noncanonical alias navigation to %s",
    async (alias, canonicalPath, notFoundHeading, canonicalHeading) => {
      const router = renderLocalizedRoute(canonicalPath, true);
      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: canonicalHeading,
        }),
      ).toBeVisible();

      await router.navigate(alias);

      expect(router.state.location.pathname).toBe(alias);
      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: notFoundHeading,
        }),
      ).toBeVisible();
      expect(
        screen.queryByRole("heading", {
          level: 1,
          name: canonicalHeading,
        }),
      ).not.toBeInTheDocument();
    },
  );
});

describe("localized route revalidation", () => {
  it.each(["/en/about/", "/en/About", "/pt-BR/about/", "/pt-BR/About"])(
    "revalidates the parent loader for noncanonical pathname %s",
    (pathname) => {
      expect(
        shouldRevalidate({
          currentUrl: new URL("https://example.test/en/services"),
          nextUrl: new URL(`https://example.test${pathname}`),
          nextParams: {
            locale: pathname.startsWith("/pt-BR/") ? "pt-BR" : "en",
          },
        } as never),
      ).toBe(true);
    },
  );

  it("does not reload static data for a localized catch-all path", () => {
    expect(
      shouldRevalidate({
        currentUrl: new URL("https://example.test/en/about"),
        nextUrl: new URL("https://example.test/en/not-published"),
        nextParams: { locale: "en", "*": "not-published" },
        defaultShouldRevalidate: true,
      } as never),
    ).toBe(false);
  });
});

describe("localized route clientLoader", () => {
  it("returns the exact prerendered server loader payload", async () => {
    const loaderData = getLoaderData("/en/about");
    const serverLoader = vi.fn().mockResolvedValue(loaderData);

    await expect(
      clientLoader({
        params: { locale: "en" },
        serverLoader,
        url: new URL("https://example.test/en/about"),
      } as never),
    ).resolves.toBe(loaderData);
    expect(serverLoader).toHaveBeenCalledOnce();
  });

  it("rejects an unsupported locale without loading prerendered data", async () => {
    const serverLoader = vi.fn().mockResolvedValue(getLoaderData("/en/about"));

    await expect(
      clientLoader({ params: { locale: "fr" }, serverLoader } as never),
    ).rejects.toMatchObject({ status: 404 });
    expect(serverLoader).not.toHaveBeenCalled();
  });

  it("returns an empty switcher payload for a missing splat path", async () => {
    const serverLoader = vi
      .fn()
      .mockRejectedValue(new Response(null, { status: 404 }));

    await expect(
      clientLoader({
        params: { locale: "en", "*": "not-published" },
        serverLoader,
        url: new URL("https://example.test/en/not-published"),
      } as never),
    ).resolves.toEqual({ urls: null });
    expect(serverLoader).toHaveBeenCalledOnce();
  });

  it("propagates a missing prerendered path without a splat match", async () => {
    const response = new Response(null, { status: 404 });
    const serverLoader = vi.fn().mockRejectedValue(response);

    await expect(
      clientLoader({
        params: { locale: "en" },
        serverLoader,
        url: new URL("https://example.test/en/about"),
      } as never),
    ).rejects.toBe(response);
    expect(serverLoader).toHaveBeenCalledOnce();
  });

  it("propagates non-404 errors for a splat match", async () => {
    const error = new Error("Static data failed");
    const serverLoader = vi.fn().mockRejectedValue(error);

    await expect(
      clientLoader({
        params: { locale: "en", "*": "not-published" },
        serverLoader,
        url: new URL("https://example.test/en/not-published"),
      } as never),
    ).rejects.toBe(error);
    expect(serverLoader).toHaveBeenCalledOnce();
  });

  it.each(["/en/about/", "/en/About", "/pt-BR/about/", "/pt-BR/About"])(
    "rejects noncanonical alias %s before loading static data",
    async (pathname) => {
      const serverLoader = vi.fn();

      await expect(
        clientLoader({
          params: {
            locale: pathname.startsWith("/pt-BR/") ? "pt-BR" : "en",
          },
          serverLoader,
          url: new URL(`https://example.test${pathname}`),
        } as never),
      ).rejects.toMatchObject({ status: 404 });
      expect(serverLoader).not.toHaveBeenCalled();
    },
  );
});

describe("localized route build loader data", () => {
  it("maps a normalized pathname to exact manifest URLs", () => {
    const data = getLoaderDataForPathname(canonicalManifest, "/en/about", site);

    expect(data).toEqual({ urls: canonicalManifest[1].urls, site });
    expect(data).not.toHaveProperty("manifest");
  });

  it("preserves the canonical Home trailing slash", () => {
    const data = getLoaderDataForPathname(canonicalManifest, "/en/", site);

    expect(data.urls).toBe(canonicalManifest[0].urls);
  });

  it("preserves a valid logical .data pathname", () => {
    const dataUrls = {
      en: "/en/release.data",
      "pt-BR": "/pt-BR/release.data",
    };
    const manifest = [
      ...canonicalManifest,
      {
        id: "release.data",
        kind: "page",
        pattern: "/:locale/release.data",
        urls: dataUrls,
      },
    ] satisfies CanonicalUrlManifest;
    const data = getLoaderDataForPathname(manifest, "/en/release.data", site);

    expect(data).toEqual({ urls: dataUrls, site });
  });
});
