import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import NotFound from "./$locale.404";
import About from "./$locale.about";
import Home from "./$locale._index";
import Services from "./$locale.services";
import LocaleLayout from "./$locale";

function renderLocalizedRoute(pathname: string) {
  const router = createMemoryRouter(
    [
      {
        path: ":locale",
        Component: LocaleLayout,
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
}

describe("localized route layout", () => {
  it("binds English content and navigation", () => {
    renderLocalizedRoute("/en/about");

    expect(screen.getByRole("heading", { name: "About" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/en/services",
    );
  });

  it("binds Brazilian Portuguese content", () => {
    renderLocalizedRoute("/pt-BR/services");

    expect(screen.getByRole("heading", { name: "Serviços" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute(
      "href",
      "/pt-BR/about",
    );
  });

  it("renders localized not-found content", () => {
    renderLocalizedRoute("/pt-BR/404");

    expect(
      screen.getByRole("heading", { name: "Página não encontrada" }),
    ).toBeVisible();
  });

  it("rejects an unsupported locale", async () => {
    renderLocalizedRoute("/fr/about");

    expect(await screen.findByText("404")).toBeVisible();
    expect(screen.queryByRole("heading", { name: "About" })).toBeNull();
  });
});
