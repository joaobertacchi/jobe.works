import { render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { persistLocale } from "../i18n/locale-preference";
import RootRedirect from "./_index";

const originalLanguages = navigator.languages;

afterEach(() => {
  window.localStorage.clear();
  Object.defineProperty(navigator, "languages", {
    configurable: true,
    value: originalLanguages,
  });
});

function createRootRouter() {
  return createMemoryRouter(
    [
      { path: "/", Component: RootRedirect },
      { path: "/:locale/", element: <p>Localized root</p> },
    ],
    { initialEntries: ["/"] },
  );
}

async function redirectTarget() {
  const router = createRootRouter();
  render(<RouterProvider router={router} />);
  await waitFor(() => expect(router.state.location.pathname).not.toBe("/"));
  return router.state.location.pathname;
}

describe("root locale redirect", () => {
  it("prerenders crawlable links to every locale root without a status message", () => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(
      <RouterProvider router={createRootRouter()} />,
    );

    const nav = within(host).getByRole("navigation");
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["English", "/en/"],
      ["Português", "/pt-BR/"],
    ]);
    expect(within(host).queryByRole("status")).toBeNull();
  });

  it("returns to the last used locale", async () => {
    persistLocale("en");
    await expect(redirectTarget()).resolves.toBe("/en/");
  });

  it("opens the default locale on a first visit regardless of browser language", async () => {
    Object.defineProperty(navigator, "languages", {
      configurable: true,
      value: ["en-US"],
    });
    await expect(redirectTarget()).resolves.toBe("/pt-BR/");
    expect(screen.getByText("Localized root")).toBeVisible();
  });
});
