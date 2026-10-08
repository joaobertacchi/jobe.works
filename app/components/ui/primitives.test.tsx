import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import { Button } from "./button";
import { Card } from "./card";
import { Container } from "./container";
import { DividedSection } from "./divided-section";
import { Heading } from "./heading";
import { Text } from "./text";
import { TextLink } from "./text-link";

describe("TextLink", () => {
  it("renders an inverse link for use on brand surfaces", () => {
    render(
      <MemoryRouter>
        <TextLink to="mailto:hello@example.com" variant="inverse">
          Email
        </TextLink>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Email" });
    expect(link).toHaveAttribute("href", "mailto:hello@example.com");
    expect(link).toHaveClass("ui-action", "ui-action--inverse");
  });

  it("renders semantic primary and secondary links", () => {
    render(
      <MemoryRouter>
        <TextLink to="/primary">Primary</TextLink>
        <TextLink to="/secondary" variant="secondary">
          Secondary
        </TextLink>
      </MemoryRouter>,
    );

    const primary = screen.getByRole("link", { name: "Primary" });
    const secondary = screen.getByRole("link", { name: "Secondary" });

    expect(primary).toHaveAttribute("href", "/primary");
    expect(primary).toHaveClass("ui-action");
    expect(primary).not.toHaveClass("ui-action--secondary");
    expect(secondary).toHaveAttribute("href", "/secondary");
    expect(secondary).toHaveClass("underline");
  });
});

describe("Button", () => {
  it("renders primary and large defaults on a native button", () => {
    render(<Button>Continue</Button>);

    const button = screen.getByRole("button", { name: "Continue" });

    expect(button).toBeVisible();
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("ui-action", "min-h-11");
    expect(button).not.toHaveClass("ui-action--secondary");
  });

  it("renders a link-styled button without the action plate", () => {
    render(
      <Button size="sm" variant="link">
        Cookie settings
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Cookie settings" });

    expect(button).toHaveClass("underline", "min-h-9");
    expect(button).not.toHaveClass("ui-action", "px-3");
  });

  it("renders a disabled secondary small button", () => {
    render(
      <Button className="w-full" disabled size="sm" variant="secondary">
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toBeDisabled();
    expect(button).toHaveClass("ui-action--secondary", "ui-action--sm");
    expect(button).toHaveClass("w-full");
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
  it("renders a small eyebrow heading in the brand tone", () => {
    render(
      <Heading as="h1" level="eyebrow" tone="brand">
        Scorecard
      </Heading>,
    );

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Scorecard",
    });

    expect(heading).toHaveClass("text-sm", "uppercase", "text-brand");
    expect(heading).not.toHaveClass("text-foreground");
  });

  it("renders inverse headings for brand surfaces", () => {
    render(<Heading tone="inverse">On brand</Heading>);

    expect(screen.getByRole("heading", { name: "On brand" })).toHaveClass(
      "text-brand-foreground",
    );
  });

  it("keeps semantic and visual levels independent", () => {
    render(
      <Heading as="h2" level="display">
        Welcome
      </Heading>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Welcome" });

    expect(heading).toHaveClass(
      "font-display",
      "uppercase",
      "text-[clamp(2.75rem,5vw,5rem)]",
    );
  });

  it("defaults to an h2 with section styling", () => {
    render(<Heading>About us</Heading>);

    const heading = screen.getByRole("heading", { level: 2, name: "About us" });

    expect(heading).toHaveClass(
      "font-display",
      "text-[clamp(1.75rem,3vw,2.5rem)]",
      "text-foreground",
    );
  });

  it("forwards native heading props", () => {
    render(
      <Heading className="tracking-wide" id="services-heading">
        Services
      </Heading>,
    );

    const heading = screen.getByRole("heading", { name: "Services" });

    expect(heading).toHaveAttribute("id", "services-heading");
    expect(heading).toHaveClass("tracking-wide");
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

  it("forwards native text props", () => {
    render(
      <Text className="max-w-prose" title="Introduction">
        Introductory copy
      </Text>,
    );

    const text = screen.getByText("Introductory copy");

    expect(text).toHaveAttribute("title", "Introduction");
    expect(text).toHaveClass("max-w-prose");
  });
});

describe("Card", () => {
  it("renders children in a div and forwards caller props", () => {
    render(
      <Card className="mt-4" data-testid="card">
        Card content
      </Card>,
    );

    const card = screen.getByTestId("card");

    expect(card.tagName).toBe("DIV");
    expect(card).toHaveAttribute("data-testid", "card");
    expect(card).toHaveTextContent("Card content");
    expect(card).toHaveClass("mt-4");
    expect(card).toHaveClass("atlas-plate");
  });
});

describe("Container", () => {
  it("renders children in a div and forwards caller props", () => {
    render(
      <Container className="relative" data-testid="container">
        Page content
      </Container>,
    );

    const container = screen.getByTestId("container");

    expect(container.tagName).toBe("DIV");
    expect(container).toHaveAttribute("data-testid", "container");
    expect(container).toHaveTextContent("Page content");
    expect(container).toHaveClass("relative");
    expect(container).toHaveClass("max-w-6xl", "px-4");
  });
});

describe("DividedSection", () => {
  it("renders section content in a semantic section", () => {
    render(<DividedSection className="mt-16">Section content</DividedSection>);

    const section = screen.getByText("Section content").closest("section");

    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent("Section content");
    expect(section).toHaveClass("mt-16");
    const divider = section?.querySelector(".border-t");

    expect(divider).toHaveClass("border-border");
  });
});
