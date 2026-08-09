import { render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import RootRedirect from "./_index";

const originalLanguages = navigator.languages;

afterEach(() => {
  Object.defineProperty(navigator, "languages", {
    configurable: true,
    value: originalLanguages,
  });
});

async function renderRedirect(languages: readonly string[]) {
  Object.defineProperty(navigator, "languages", {
    configurable: true,
    value: languages,
  });
  const router = createMemoryRouter(
    [
      { path: "/", Component: RootRedirect },
      { path: "/:locale/", element: <p>Localized root</p> },
    ],
    { initialEntries: ["/"] },
  );

  render(<RouterProvider router={router} />);
  await waitFor(() => expect(router.state.location.pathname).not.toBe("/"));
  return router.state.location.pathname;
}

describe("root locale redirect", () => {
  it("renders Portuguese infrastructure copy before selecting a locale", () => {
    const router = createMemoryRouter(
      [
        { path: "/", Component: RootRedirect },
        { path: "/:locale/", element: <p>Localized root</p> },
      ],
      { initialEntries: ["/"] },
    );

    const html = renderToStaticMarkup(<RouterProvider router={router} />);

    expect(html).toContain('<p role="status">Selecionando idioma</p>');
    expect(router.state.location.pathname).toBe("/");
  });

  it("matches a regional English browser locale", async () => {
    await expect(renderRedirect(["en-US"])).resolves.toBe("/en/");
  });

  it("uses the default locale for unsupported languages", async () => {
    await expect(renderRedirect(["fr-FR"])).resolves.toBe("/pt-BR/");
  });
});
