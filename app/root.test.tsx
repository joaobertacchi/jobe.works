import { render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ConsentProvider } from "./consent/consent-context";
import { ConsentBanner } from "./components/site/consent-banner";
import App, { Document, ErrorBoundary } from "./root";

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    Links: () => null,
    Meta: () => null,
    Scripts: () => null,
    ScrollRestoration: () => null,
  };
});

function routeError(status: number, statusText = "") {
  return {
    status,
    statusText,
    internal: false,
    data: null,
  };
}

describe("root document", () => {
  it.each([
    ["pt-BR", 'lang="pt-BR"'],
    [null, 'lang="und"'],
  ] as const)("renders the document language for %s", (locale, expected) => {
    const html = renderToStaticMarkup(
      <Document locale={locale}>
        <p>Page content</p>
      </Document>,
    );

    expect(html).toContain(expected);
    expect(html).toContain("<p>Page content</p>");
  });

  it("redirects to the preferred locale from the head only when asked", () => {
    const html = (redirect: boolean) =>
      renderToStaticMarkup(
        <Document locale="pt-BR" redirectToPreferredLocale={redirect}>
          <p>Page content</p>
        </Document>,
      );

    const head = html(true).split("</head>")[0];
    expect(head).toContain("location.replace(");
    expect(head).toContain(
      '<noscript><meta http-equiv="refresh" content="0;url=/pt-BR/"/></noscript>',
    );
    expect(html(false)).not.toContain("location.replace(");
    expect(html(false)).not.toContain("noscript");
  });

  it("renders the matched child route", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          Component: App,
          children: [{ index: true, element: <p>Child route</p> }],
        },
      ],
      { initialEntries: ["/"] },
    );

    render(<RouterProvider router={router} />);
    expect(await screen.findByText("Child route")).toBeVisible();
  });

  it("wraps page content with consent providers and renders the banner", async () => {
    window.localStorage.clear();
    render(
      <MemoryRouter initialEntries={["/en/"]}>
        <ConsentProvider>
          <p>Page content</p>
          <ConsentBanner locale="en" />
        </ConsentProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Page content")).toBeVisible();
    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Cookie preferences" }),
      ).toBeVisible();
    });
    expect(screen.getByRole("button", { name: "Accept all" })).toBeVisible();
  });
});

describe("root error boundary", () => {
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

  it("renders a language-neutral 404 for an unsupported locale", () => {
    render(
      ErrorBoundary({
        error: routeError(404),
        params: { locale: "fr" },
      } as never),
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
