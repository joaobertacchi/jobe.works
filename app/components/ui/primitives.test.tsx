import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import { Button } from "./button";
import { Card } from "./card";
import { Container } from "./container";
import { Heading } from "./heading";
import { Text } from "./text";
import { TextLink } from "./text-link";

describe("TextLink", () => {
  it("renders semantic primary and secondary links", () => {
    render(
      <MemoryRouter>
        <TextLink to="/primary">Primary</TextLink>
        <TextLink to="/secondary" variant="secondary">
          Secondary
        </TextLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Primary" })).toHaveClass(
      "bg-brand",
      "focus-visible:outline-brand",
    );
    expect(screen.getByRole("link", { name: "Secondary" })).toHaveClass(
      "underline",
      "text-foreground",
    );
  });
});

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

describe("Heading", () => {
  it("keeps semantic and visual levels independent", () => {
    render(
      <Heading as="h2" level="display">
        Welcome
      </Heading>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Welcome" });

    expect(heading).toHaveClass("text-4xl", "sm:text-6xl");
  });

  it("defaults to an h2 with section styling", () => {
    render(<Heading>About us</Heading>);

    const heading = screen.getByRole("heading", { level: 2, name: "About us" });

    expect(heading).toHaveClass("text-3xl", "sm:text-4xl", "text-foreground");
  });

  it("appends caller classes and forwards native heading props", () => {
    render(
      <Heading className="tracking-wide" id="services-heading">
        Services
      </Heading>,
    );

    const heading = screen.getByRole("heading", { name: "Services" });

    expect(heading.className).toMatch(/text-foreground tracking-wide$/);
    expect(heading).toHaveAttribute("id", "services-heading");
  });
});

describe("Text", () => {
  it("defaults to a paragraph with the default foreground", () => {
    render(<Text>Supporting copy</Text>);

    const text = screen.getByText("Supporting copy");

    expect(text.tagName).toBe("P");
    expect(text).toHaveClass("text-foreground");
  });

  it("renders muted text as a span", () => {
    render(
      <Text as="span" tone="muted">
        Optional
      </Text>,
    );

    const text = screen.getByText("Optional");

    expect(text.tagName).toBe("SPAN");
    expect(text).toHaveClass("text-muted-foreground");
  });

  it("appends caller classes and forwards native props", () => {
    render(
      <Text className="max-w-prose" title="Introduction">
        Introductory copy
      </Text>,
    );

    const text = screen.getByText("Introductory copy");

    expect(text.className).toMatch(/text-foreground max-w-prose$/);
    expect(text).toHaveAttribute("title", "Introduction");
  });
});

describe("Card", () => {
  it("renders children in a styled div and forwards caller props", () => {
    render(
      <Card className="mt-4" data-testid="card">
        Card content
      </Card>,
    );

    const card = screen.getByTestId("card");

    expect(card.tagName).toBe("DIV");
    expect(card.className).toBe(
      "rounded-2xl border border-border bg-surface p-6 shadow-sm mt-4",
    );
    expect(card).toHaveTextContent("Card content");
  });
});

describe("Container", () => {
  it("renders children in a responsive div and forwards caller props", () => {
    render(
      <Container className="relative" data-testid="container">
        Page content
      </Container>,
    );

    const container = screen.getByTestId("container");

    expect(container.tagName).toBe("DIV");
    expect(container.className).toBe(
      "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative",
    );
    expect(container).toHaveTextContent("Page content");
  });
});
