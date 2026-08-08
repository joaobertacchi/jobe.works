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
import LocaleLayout, {
  clientLoader,
  ErrorBoundary,
  getLoaderDataForBuildRequest,
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
  return getLoaderDataForBuildRequest(
    canonicalManifest,
    `https://example.test${pathname}`,
  );
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
                serverLoader: async () =>
                  getLoaderData(new URL(args.request.url).pathname),
              } as never)
          : ({ request }) => getLoaderData(new URL(request.url).pathname),
        children: [
          { index: true, Component: Home },
          { path: "about", Component: About },
          { path: "services", Component: Services },
          { path: "404", Component: NotFound },
        ],
      },
    ],
    { initialEntries: [pathname] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("localized route layout", () => {
  it("binds English content and navigation", async () => {
    renderLocalizedRoute("/en/about");

    expect(await screen.findByRole("heading", { name: "About" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/en/services",
    );
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
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute(
      "href",
      "/pt-BR/about",
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

  it("renders a client-side plural translation", async () => {
    renderLocalizedRoute("/pt-BR/");

    expect(await screen.findByText("2 exemplos")).toBeVisible();
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
});

describe("localized route clientLoader", () => {
  it("returns the exact prerendered server loader payload", async () => {
    const loaderData = getLoaderData("/en/about");
    const serverLoader = vi.fn().mockResolvedValue(loaderData);

    await expect(
      clientLoader({ params: { locale: "en" }, serverLoader } as never),
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
});

describe("localized route build loader data", () => {
  it("maps a prerender data request to exact manifest URLs", () => {
    const data = getLoaderDataForBuildRequest(
      canonicalManifest,
      "https://example.test/en/about.data",
    );

    expect(data.urls).toBe(canonicalManifest[1].urls);
  });

  it("maps a Home prerender data request to its trailing-slash URLs", () => {
    const data = getLoaderDataForBuildRequest(
      canonicalManifest,
      "https://example.test/en/_.data",
    );

    expect(data.urls).toBe(canonicalManifest[0].urls);
  });

  it("maps a directory-style prerender request to exact manifest URLs", () => {
    const data = getLoaderDataForBuildRequest(
      canonicalManifest,
      "https://example.test/en/about/",
    );

    expect(data.manifest).toBe(canonicalManifest);
    expect(data.urls).toBe(canonicalManifest[1].urls);
  });

  it("preserves the canonical Home trailing slash", () => {
    const data = getLoaderDataForBuildRequest(
      canonicalManifest,
      "https://example.test/en/",
    );

    expect(data.urls).toBe(canonicalManifest[0].urls);
  });
});
