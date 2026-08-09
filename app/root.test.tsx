import { render, screen } from "@testing-library/react";
import { Links, Meta, Outlet } from "react-router";
import { describe, expect, it } from "vitest";

import App, { Document, ErrorBoundary, links } from "./root";
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

  it("loads the editorial fonts with the existing preconnects", () => {
    const fontLinks = links();

    expect(fontLinks).toHaveLength(3);
    expect(fontLinks[0]).toEqual({
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    });
    expect(fontLinks[1]).toEqual({
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    });
    expect(fontLinks[2]).toEqual(
      expect.objectContaining({
        href: expect.stringContaining("family=Inter"),
      }),
    );
    expect(fontLinks[2]).toEqual(
      expect.objectContaining({
        href: expect.stringContaining("family=Source+Serif+4"),
      }),
    );
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
  it("renders a not-found response", () => {
    render(ErrorBoundary({ error: routeError(404) } as never));

    expect(screen.getByRole("heading", { name: "404" })).toBeVisible();
    expect(
      screen.getByText("The requested page could not be found."),
    ).toBeVisible();
  });

  it("renders a route error status", () => {
    render(ErrorBoundary({ error: routeError(500, "Server Error") } as never));

    expect(screen.getByRole("heading", { name: "Error" })).toBeVisible();
    expect(screen.getByText("Server Error")).toBeVisible();
  });

  it("falls back when a route error has no status text", () => {
    render(ErrorBoundary({ error: routeError(500) } as never));

    expect(screen.getByText("An unexpected error occurred.")).toBeVisible();
  });

  it("shows development error details", () => {
    render(ErrorBoundary({ error: new Error("Broken route") } as never));

    expect(screen.getByText("Broken route")).toBeVisible();
    expect(screen.getByText(/Error: Broken route/)).toBeVisible();
  });

  it("renders a safe fallback for unknown errors", () => {
    render(ErrorBoundary({ error: null } as never));

    expect(screen.getByRole("heading", { name: "Oops!" })).toBeVisible();
    expect(screen.getByText("An unexpected error occurred.")).toBeVisible();
  });
});
