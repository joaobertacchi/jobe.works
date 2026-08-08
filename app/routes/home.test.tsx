import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home, { meta } from "./home";

describe("home route", () => {
  it("renders the starter page and its metadata", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("What's next?")).toBeVisible();
    expect(meta()).toContainEqual({
      title: "New React Router App",
    });
  });
});
