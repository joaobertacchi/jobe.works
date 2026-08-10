import { readFileSync } from "node:fs";

import { render, screen, within } from "@testing-library/react";
import {
  createMemoryRouter,
  isRouteErrorResponse,
  RouterProvider,
  useParams,
  useRouteError,
} from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { CanonicalUrlManifest } from "../routing/canonical-url-manifest";
import NotFound from "./$locale.404";
import About from "./$locale.about";
import Home from "./$locale._index";
import Services from "./$locale.services";
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
  origin: "https://example.com",
  siteName: "Agent-ready sites",
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

function renderLocalizedRoute(pathname: string, validateLocale = false) {
  const router = createMemoryRouter(
    [
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
                    return getLoaderData(new URL(args.request.url).pathname);
                  } catch {
                    throw new Response(null, { status: 404 });
                  }
                },
              } as never)
          : ({ request }) => getLoaderData(new URL(request.url).pathname),
        children: [
          { index: true, Component: Home },
          { path: "about", Component: About },
          { path: "services", Component: Services },
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
    { initialEntries: [pathname] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("localized route layout", () => {
  it("uses the React-facing i18n API instead of translation dictionaries", () => {
    const source = readFileSync("app/routes/$locale.tsx", "utf8");

    expect(source).not.toContain('from "../i18n/translations"');
    expect(source).toContain("useI18n");
    expect(source).toContain('"notFound.title"');
    expect(source).toContain('"common.errors.title"');
  });

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

  it("composes Home principles and a localized call to action", async () => {
    renderLocalizedRoute("/en/");

    expect(
      await screen.findByRole("heading", { name: "Static delivery" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Typed localization" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Deterministic quality" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Explore the examples" }),
    ).toHaveAttribute("href", "/en/services");
  });

  it.each([
    ["/en/privacy", "Privacy notice", "Data handled by the template"],
    ["/pt-BR/privacy", "Aviso de privacidade", "Dados tratados pelo modelo"],
  ])(
    "renders localized Privacy content for %s",
    async (pathname, title, section) => {
      renderLocalizedRoute(pathname);

      expect(
        await screen.findByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", { level: 2, name: section }),
      ).toBeVisible();
      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
    },
  );

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

  it.each([
    [
      "/en/",
      "Built for agents, ready for people",
      "Static website template",
      "A thoughtful static foundation for AI-assisted teams to shape, localize, and ship with confidence.",
    ],
    [
      "/pt-BR/",
      "Feito para agentes, pronto para pessoas",
      "Modelo de site estático",
      "Uma base estática bem estruturada para equipes que desenvolvem com apoio de IA, com decisões explícitas e validação confiável.",
    ],
  ])(
    "renders the localized Home hero for %s",
    async (pathname, eyebrow, title, description) => {
      renderLocalizedRoute(pathname);

      const heading = await screen.findByRole("heading", {
        level: 1,
        name: title,
      });
      const hero = heading.closest("section");

      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(hero).toHaveTextContent(eyebrow);
      expect(hero).toHaveTextContent(description);
    },
  );

  it("composes About from shared semantic content sections", async () => {
    renderLocalizedRoute("/en/about");

    expect(await screen.findByRole("heading", { name: "About" })).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Clear boundaries" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Working examples" }),
    ).toBeVisible();
  });

  it.each([
    [
      "/en/about",
      "About",
      "A focused starting point that keeps structure, content, and quality checks clear so people and AI agents can build together.",
    ],
    [
      "/pt-BR/about",
      "Sobre",
      "Um ponto de partida objetivo que mantém estrutura, conteúdo e verificações de qualidade claros para pessoas e agentes de IA criarem juntos.",
    ],
  ])(
    "renders the localized About page for %s",
    async (pathname, title, description) => {
      renderLocalizedRoute(pathname);

      expect(
        await screen.findByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      expect(screen.getByText(description)).toBeVisible();
    },
  );

  it("closes Services without adding a speculative fourth card", async () => {
    renderLocalizedRoute("/en/services");

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "A foundation, not a platform",
      }),
    ).toBeVisible();
    expect(document.querySelectorAll("article")).toHaveLength(3);
  });

  it.each([
    [
      "/en/services",
      "Services",
      "Everything needed to turn a clear idea into a fast, durable website.",
      ["Foundation", "Localization", "Delivery"],
      [
        "Composable React patterns and a static-first architecture keep each page easy to understand and evolve.",
        "Typed dictionaries keep every supported language complete, consistent, and ready to publish.",
        "Built-in quality checks and prerendering make confident releases routine.",
      ],
    ],
    [
      "/pt-BR/services",
      "Serviços",
      "Tudo o que é necessário para transformar uma ideia clara em um site rápido e duradouro.",
      ["Base", "Localização", "Entrega"],
      [
        "Rotas pré-renderizadas, contratos tipados e validações objetivas mantêm cada página simples de evoluir.",
        "Dicionários completos e URLs explícitas mantêm o conteúdo consistente em todos os idiomas.",
        "Verificações de qualidade e pré-renderização tornam as entregas confiáveis e previsíveis.",
      ],
    ],
  ])(
    "renders three localized Services cards for %s",
    async (
      pathname,
      title,
      description,
      serviceTitles,
      serviceDescriptions,
    ) => {
      renderLocalizedRoute(pathname);

      expect(
        await screen.findByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      expect(screen.getByText(description)).toBeVisible();
      expect(document.querySelectorAll("article")).toHaveLength(3);
      for (const [index, serviceTitle] of serviceTitles.entries()) {
        const serviceHeading = screen.getByRole("heading", {
          level: 2,
          name: serviceTitle,
        });
        expect(serviceHeading).toBeVisible();
        expect(serviceHeading.closest("article")).toHaveTextContent(
          serviceDescriptions[index],
        );
      }
    },
  );

  it.each([
    [
      "/en/404",
      "Page not found",
      "This page may have moved or never existed. Use the navigation to find your way back.",
    ],
    [
      "/pt-BR/404",
      "Página não encontrada",
      "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
    ],
  ])(
    "renders the polished localized 404 page for %s",
    async (pathname, title, description) => {
      renderLocalizedRoute(pathname);

      expect(
        await screen.findByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      expect(screen.getByText(description)).toBeVisible();
    },
  );

  it("links localized 404 visitors back to canonical Home", async () => {
    renderLocalizedRoute("/pt-BR/404");

    expect(
      await screen.findByRole("link", { name: "Voltar ao início" }),
    ).toHaveAttribute("href", "/pt-BR/");
  });

  it("binds English content and navigation", async () => {
    renderLocalizedRoute("/en/about");

    expect(await screen.findByRole("heading", { name: "About" })).toBeVisible();
    expect(screen.getByRole("banner")).toHaveTextContent("Agent-ready sites");
    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(navigation).toBeVisible();
    expect(
      within(navigation).getByRole("link", { name: "Home" }),
    ).toHaveAttribute("href", "/en/");
    expect(
      within(navigation).getByRole("link", { name: "About" }),
    ).toHaveAttribute("href", "/en/about");
    expect(
      within(navigation).getByRole("link", { name: "Services" }),
    ).toHaveAttribute("href", "/en/services");
    expect(screen.getByRole("group", { name: "Theme" })).toBeVisible();
  });

  it("links English About only to its Portuguese sibling", async () => {
    renderLocalizedRoute("/en/about");

    const languageNavigation = await screen.findByRole("navigation", {
      name: "Choose language",
    });
    expect(languageNavigation.querySelectorAll("a")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Português" })).toHaveAttribute(
      "href",
      "/pt-BR/about",
    );
    expect(screen.queryByRole("link", { name: "English" })).toBeNull();
  });

  it("binds Brazilian Portuguese content", async () => {
    renderLocalizedRoute("/pt-BR/services");

    expect(
      await screen.findByRole("heading", { name: "Serviços" }),
    ).toBeVisible();
    const navigation = screen.getByRole("navigation", {
      name: "Navegação principal",
    });
    expect(
      within(navigation).getByRole("link", { name: "Início" }),
    ).toHaveAttribute("href", "/pt-BR/");
    expect(
      within(navigation).getByRole("link", { name: "Sobre" }),
    ).toHaveAttribute("href", "/pt-BR/about");
    expect(
      within(navigation).getByRole("link", { name: "Serviços" }),
    ).toHaveAttribute("href", "/pt-BR/services");
  });

  it("links Portuguese Services only to its English sibling", async () => {
    renderLocalizedRoute("/pt-BR/services");

    const languageNavigation = await screen.findByRole("navigation", {
      name: "Escolher idioma",
    });
    expect(languageNavigation.querySelectorAll("a")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute(
      "href",
      "/en/services",
    );
    expect(screen.queryByRole("link", { name: "Português" })).toBeNull();
  });

  it("preserves the target trailing slash for Home", async () => {
    renderLocalizedRoute("/en/");

    expect(
      await screen.findByRole("link", { name: "Português" }),
    ).toHaveAttribute("href", "/pt-BR/");
  });

  it("preserves localized 404 identity", async () => {
    renderLocalizedRoute("/en/404");

    expect(
      await screen.findByRole("link", { name: "Português" }),
    ).toHaveAttribute("href", "/pt-BR/404");
  });

  it("renders localized not-found content", async () => {
    renderLocalizedRoute("/pt-BR/404");

    expect(
      await screen.findByRole("heading", { name: "Página não encontrada" }),
    ).toBeVisible();
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

  it.each([
    [
      "/en/about",
      "/en/not-published",
      "About",
      "Page not found",
      "This page may have moved or never existed. Use the navigation to find your way back.",
    ],
    [
      "/pt-BR/about",
      "/pt-BR/not-published",
      "Sobre",
      "Página não encontrada",
      "Esta página pode ter mudado ou nunca ter existido. Use a navegação para encontrar o caminho de volta.",
    ],
  ])(
    "renders localized catch-all content after navigating from %s to %s",
    async (initialUrl, unknownUrl, initialHeading, heading, description) => {
      const router = renderLocalizedRoute(initialUrl, true);
      expect(
        await screen.findByRole("heading", { name: initialHeading }),
      ).toBeVisible();

      await router.navigate(unknownUrl);

      expect(router.state.location.pathname).toBe(unknownUrl);
      expect(
        await screen.findByRole("heading", { name: heading }),
      ).toBeVisible();
      expect(screen.getByText(description)).toBeVisible();
      expect(screen.queryByText("An unexpected error occurred.")).toBeNull();
      expect(
        screen.queryByRole("navigation", { name: /language|idioma/i }),
      ).toBeNull();
      expect(screen.getByRole("banner")).toBeVisible();
      expect(
        screen.getByRole("navigation", {
          name: /primary navigation|navegação principal/i,
        }),
      ).toBeVisible();
      expect(screen.getByRole("group", { name: /theme|tema/i })).toBeVisible();
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

  it("runs during hydration to validate direct document URLs", () => {
    expect(clientLoader.hydrate).toBe(true);
  });
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
