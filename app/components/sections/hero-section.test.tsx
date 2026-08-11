import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "./hero-section";
import { ContentSection } from "./content-section";

describe("ContentSection", () => {
  it("composes optional eyebrow, heading, description, and children", () => {
    render(
      <ContentSection
        eyebrow="Principle"
        title="Clear boundaries"
        description="Keep responsibilities explicit."
      >
        <p>Supporting example</p>
      </ContentSection>,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Clear boundaries",
    });
    const section = heading.closest("section");

    expect(section).toBeInTheDocument();
    expect(heading).toBeVisible();
    expect(within(section!).getByText("Principle")).toBeVisible();
    expect(
      within(section!).getByText("Keep responsibilities explicit."),
    ).toBeVisible();
    expect(within(section!).getByText("Supporting example")).toBeVisible();
  });
});

describe("HeroSection", () => {
  it("renders hero copy and an optional action", () => {
    render(
      <HeroSection
        eyebrow="Independent thinking"
        title="Build a clearer path forward"
        description="Focused support for ambitious teams."
        actions={<a href="/contact">Contact us</a>}
      />,
    );

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Build a clearer path forward",
    });
    const section = heading.closest("section");

    expect(section).toBeInTheDocument();
    expect(heading).toBeVisible();
    expect(within(section!).getByText("Independent thinking")).toBeVisible();
    expect(
      within(section!).getByText("Focused support for ambitious teams."),
    ).toBeVisible();
    expect(
      within(section!).getByRole("link", { name: "Contact us" }),
    ).toHaveAttribute("href", "/contact");
  });
});
