import { render, screen } from "@testing-library/react";
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
import LocalizedCatchAll from "./$locale.$";
import LocaleLayout, {
  clientLoader,
  ErrorBoundary,
  getLoaderDataForPathname,
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
] satisfies CanonicalUrlManifest;

function TestErrorBoundary() {
  return (
    <ErrorBoundary error={useRouteError()} params={useParams() as never} />
  );
}

function getLoaderData(pathname: string) {
  return getLoaderDataForPathname(canonicalManifest, pathname);
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

  it("binds English content and navigation", async () => {
    renderLocalizedRoute("/en/about");

    expect(await screen.findByRole("heading", { name: "About" })).toBeVisible();
    expect(screen.getByRole("banner")).toHaveTextContent("Agent-ready sites");
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/en/",
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/en/about",
    );
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/en/services",
    );
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
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute(
      "href",
      "/pt-BR/",
    );
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute(
      "href",
      "/pt-BR/about",
    );
    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute(
      "href",
      "/pt-BR/services",
    );
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

    expect(await screen.findByText("404")).toBeVisible();
    expect(screen.queryByRole("heading", { name: "About" })).toBeNull();
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
    const data = getLoaderDataForPathname(canonicalManifest, "/en/about");

    expect(data).toEqual({ urls: canonicalManifest[1].urls });
    expect(data).not.toHaveProperty("manifest");
  });

  it("preserves the canonical Home trailing slash", () => {
    const data = getLoaderDataForPathname(canonicalManifest, "/en/");

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
    const data = getLoaderDataForPathname(manifest, "/en/release.data");

    expect(data).toEqual({ urls: dataUrls });
  });
});
