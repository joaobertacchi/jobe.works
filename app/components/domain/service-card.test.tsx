import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServiceCard } from "./service-card";

describe("ServiceCard", () => {
  it("renders service content in a semantic article", () => {
    render(
      <ServiceCard
        title="AI Productization Sprint"
        description="Turn traction into production safety."
      />,
    );

    const heading = screen.getByRole("heading", {
      level: 3,
      name: "AI Productization Sprint",
    });
    const article = heading.closest("article");

    expect(article).toBeInTheDocument();
    expect(heading).toBeVisible();
    expect(
      within(article!).getByText("Turn traction into production safety."),
    ).toBeVisible();
  });

  it("renders an optional action", () => {
    render(
      <ServiceCard
        description="Description."
        title="Offer"
        action={<a href="/services">Explore</a>}
      />,
    );

    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "href",
      "/services",
    );
  });
});
