import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "./hero-section";
import { ContentSection } from "./content-section";

describe("ContentSection", () => {
  it("composes optional eyebrow, heading, description, and children", () => {
    const { container } = render(
      <ContentSection
        eyebrow="Principle"
        title="Clear boundaries"
        description="Keep responsibilities explicit."
      >
        <p>Supporting example</p>
      </ContentSection>,
    );

    expect(container.querySelectorAll("section")).toHaveLength(1);
    expect(
      within(container).getByRole("heading", {
        level: 2,
        name: "Clear boundaries",
      }),
    ).toBeVisible();
    expect(within(container).getByText("Principle")).toBeVisible();
    expect(within(container).getByText("Supporting example")).toBeVisible();
  });
});

describe("HeroSection", () => {
  it("renders hero copy with shared bounds and responsive spacing", () => {
    const { container } = render(
      <HeroSection
        eyebrow="Independent thinking"
        title="Build a clearer path forward"
        description="Focused support for ambitious teams."
      />,
    );

    const sections = container.querySelectorAll("section");
    const section = sections[0];

    expect(sections).toHaveLength(1);
    expect(
      within(section).getByRole("heading", {
        level: 1,
        name: "Build a clearer path forward",
      }),
    ).toBeVisible();
    expect(within(section).getByText("Independent thinking")).toBeVisible();
    expect(
      within(section).getByText("Focused support for ambitious teams."),
    ).toBeVisible();
    expect(section.querySelector(".max-w-6xl")).toBeInTheDocument();
    expect(section).toHaveClass("py-16", "sm:py-24", "lg:py-32");
  });
});
