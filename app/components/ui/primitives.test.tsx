import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders primary and large defaults on a native button", () => {
    render(<Button>Continue</Button>);

    const button = screen.getByRole("button", { name: "Continue" });

    expect(button).toBeVisible();
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("bg-brand", "min-h-11", "py-3", "transition");
  });

  it("renders a disabled secondary small button with caller classes", () => {
    render(
      <Button className="w-full" disabled size="sm" variant="secondary">
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toBeDisabled();
    expect(button).toHaveClass("border-border", "min-h-9", "py-2", "w-full");
  });

  it("forwards native props and allows callers to override the type", () => {
    const handleClick = vi.fn();

    render(
      <Button aria-label="Submit form" onClick={handleClick} type="submit">
        Submit
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Submit form" });

    expect(button).toHaveAttribute("type", "submit");

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
