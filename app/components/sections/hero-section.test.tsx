import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "./hero-section";

describe("HeroSection", () => {
  it("renders hero copy and an optional action", () => {
    render(
      <HeroSection
        title="Engineering that Works"
        description="Senior engineering for production."
        actions={<a href="/contact">Book the call</a>}
      />,
    );

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Engineering that Works",
    });
    const section = heading.closest("section");

    expect(section).toBeInTheDocument();
    expect(heading).toBeVisible();
    expect(
      within(section!).getByText("Senior engineering for production."),
    ).toBeVisible();
    expect(
      within(section!).getByRole("link", { name: "Book the call" }),
    ).toHaveAttribute("href", "/contact");
  });

  it("renders an optional visual beside the copy", () => {
    render(
      <HeroSection
        description="Copy."
        title="Title"
        visual={<svg aria-hidden="true" data-testid="hero-visual" />}
      />,
    );

    expect(screen.getByTestId("hero-visual")).toBeVisible();
  });

  it("omits the actions row when no actions are given", () => {
    render(<HeroSection description="Copy." title="Title" />);

    expect(screen.queryByRole("link")).toBeNull();
  });
});
