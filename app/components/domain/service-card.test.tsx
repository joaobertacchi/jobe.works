import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServiceCard } from "./service-card";

describe("ServiceCard", () => {
  it("renders service content in a semantic card surface", () => {
    const { container } = render(
      <ServiceCard
        title="Strategy"
        description="A practical plan for sustainable growth."
      />,
    );

    const article = container.querySelector("article");

    expect(article).toBeInTheDocument();
    expect(
      within(article!).getByRole("heading", { level: 2, name: "Strategy" }),
    ).toBeVisible();
    expect(
      within(article!).getByText("A practical plan for sustainable growth."),
    ).toBeVisible();
    expect(article?.firstElementChild).toHaveClass(
      "rounded-2xl",
      "border",
      "border-border",
      "bg-surface",
      "p-6",
      "shadow-sm",
    );
  });
});
