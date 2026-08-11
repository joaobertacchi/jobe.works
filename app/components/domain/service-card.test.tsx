import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServiceCard } from "./service-card";

describe("ServiceCard", () => {
  it("renders service content in a semantic article", () => {
    render(
      <ServiceCard
        title="Strategy"
        description="A practical plan for sustainable growth."
      />,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Strategy" });
    const article = heading.closest("article");

    expect(article).toBeInTheDocument();
    expect(heading).toBeVisible();
    expect(
      within(article!).getByText("A practical plan for sustainable growth."),
    ).toBeVisible();
  });
});
