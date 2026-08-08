import { render, screen } from "@testing-library/react";
import { Outlet } from "react-router";
import { describe, expect, it } from "vitest";

import App, { Document, ErrorBoundary, links } from "./root";

function routeError(status: number, statusText = "") {
  return {
    status,
    statusText,
    internal: false,
    data: null,
  };
}

describe("root document", () => {
  it("defines the localized document shell and external font links", () => {
    const child = <p>Page content</p>;
    const document = Document({ children: child, locale: "pt-BR" });

    expect(document.type).toBe("html");
    expect(document.props.lang).toBe("pt-BR");
    expect(document.props.children[1].props.children[0]).toBe(child);
    expect(links()).toHaveLength(3);
  });

  it("renders child routes through an outlet", () => {
    expect(App().type).toBe(Outlet);
  });
});

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
