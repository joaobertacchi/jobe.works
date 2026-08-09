import { readFileSync } from "node:fs";

import { render, screen } from "@testing-library/react";
import { Links, Meta, Outlet } from "react-router";
import { describe, expect, it } from "vitest";

import * as rootModule from "./root";
import App, { Document, ErrorBoundary } from "./root";
import {
  THEME_MEDIA_QUERY,
  THEME_STORAGE_KEY,
  themeInitializationScript,
} from "./theme";

function routeError(status: number, statusText = "") {
  return {
    status,
    statusText,
    internal: false,
    data: null,
  };
}

describe("root document", () => {
  it("defines the localized document shell", () => {
    const child = <p>Page content</p>;
    const document = Document({ children: child, locale: "pt-BR" });
    const [head, body] = document.props.children;

    expect(document.type).toBe("html");
    expect(document.props.lang).toBe("pt-BR");
    expect(document.props.suppressHydrationWarning).toBe(true);
    expect(head.props.suppressHydrationWarning).toBeUndefined();
    expect(body.props.suppressHydrationWarning).toBeUndefined();
    expect(body.props.children[0]).toBe(child);
  });

  it("initializes the theme before discovering route styles", () => {
    const document = Document({ children: null, locale: "en" });
    const headChildren = document.props.children[0].props.children;
    const scriptIndex = headChildren.findIndex(
      (child: React.ReactElement) => child.type === "script",
    );

    expect(headChildren.slice(0, scriptIndex).map(metaIdentity)).toEqual([
      "charset",
      "viewport",
    ]);
    expect(headChildren[scriptIndex].props.children).toBe(
      themeInitializationScript,
    );
    expect(themeInitializationScript).toContain(THEME_STORAGE_KEY);
    expect(themeInitializationScript).toContain(THEME_MEDIA_QUERY);
    expect(headChildren[scriptIndex + 1].type).toBe(Meta);
    expect(headChildren[scriptIndex + 2].type).toBe(Links);
  });

  it("leaves stylesheet discovery to Links without remote font links", () => {
    const source = readFileSync("app/root.tsx", "utf8");

    expect(rootModule).not.toHaveProperty("links");
    expect(source).not.toContain("fonts.googleapis.com");
    expect(source).not.toContain("fonts.gstatic.com");
  });

  it("renders child routes through an outlet", () => {
    expect(App().type).toBe(Outlet);
  });
});

function metaIdentity(
  element: React.ReactElement<{ charSet?: string; name?: string }>,
) {
  return element.props.charSet ? "charset" : element.props.name;
}

describe("root error boundary", () => {
  it("uses typography primitives for global error content", () => {
    render(
      ErrorBoundary({
        error: routeError(404),
        params: { locale: "en" },
      } as never),
    );

    expect(screen.getByRole("heading", { name: "Page not found" })).toHaveClass(
      "font-serif",
      "text-foreground",
    );
    expect(
      screen.getByText(
        "This page may have moved or never existed. Use the navigation to find your way back.",
      ),
    ).toHaveClass("text-base", "leading-relaxed", "text-foreground");
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
    "renders a localized not-found response for %s",
    (locale, title, description) => {
      render(
        ErrorBoundary({ error: routeError(404), params: { locale } } as never),
      );

      expect(screen.getByRole("heading", { name: title })).toBeVisible();
      expect(screen.getByText(description)).toBeVisible();
    },
  );

  it.each([
    ["en", "Error", "An unexpected error occurred."],
    ["pt-BR", "Erro", "Ocorreu um erro inesperado."],
  ])("localizes a generic route error for %s", (locale, title, description) => {
    render(
      ErrorBoundary({
        error: routeError(500, "Arbitrary status text"),
        params: { locale },
      } as never),
    );

    expect(screen.getByRole("heading", { name: title })).toBeVisible();
    expect(screen.getByText(description)).toBeVisible();
    expect(screen.queryByText("Arbitrary status text")).toBeNull();
  });

  it("uses Portuguese copy for unsupported locales", () => {
    render(
      ErrorBoundary({
        error: routeError(500),
        params: { locale: "fr" },
      } as never),
    );

    expect(screen.getByRole("heading", { name: "Erro" })).toBeVisible();
    expect(screen.getByText("Ocorreu um erro inesperado.")).toBeVisible();
  });

  it("shows development error details", () => {
    render(
      ErrorBoundary({
        error: new Error("Broken route"),
        params: { locale: "en" },
      } as never),
    );

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeVisible();
    expect(screen.getByText("Broken route")).toBeVisible();
    expect(screen.getByText(/Error: Broken route/)).toBeVisible();
  });

  it("renders a safe fallback for unknown errors", () => {
    render(ErrorBoundary({ error: null, params: {} } as never));

    expect(
      screen.getByRole("heading", { name: "Algo deu errado" }),
    ).toBeVisible();
    expect(screen.getByText("Ocorreu um erro inesperado.")).toBeVisible();
  });
});
