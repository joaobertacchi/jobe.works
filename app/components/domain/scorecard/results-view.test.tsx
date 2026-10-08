import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { scorecardTranslations } from "../../../i18n/translations/scorecard";
import { renderScorecard } from "./test-utils";

const copy = scorecardTranslations.en;

function openShared(encoded: string) {
  window.history.replaceState(null, "", `/en/scorecard#r=1.${encoded}`);
  return renderScorecard();
}

afterEach(() => {
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});

describe("ResultsView", () => {
  it("announces the score and verdict, and shows the critical banner when a critical risk exists", async () => {
    // q08 "no": 49/52 → 94, one critical risk → needsAttention
    openShared("yyyyyyynyyyyyyyyyyyy");

    expect(
      await screen.findByText(
        "Product Readiness Score: 94 out of 100. Readiness: Needs attention.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.results.criticalBanner)).toBeVisible();
    expect(
      screen.getByText(copy.results.findings.security.critical),
    ).toBeVisible();
    expect(
      screen.getByText(copy.results.severities.criticalRisk),
    ).toBeVisible();
  });

  it("lists critical unknowns under areas to verify", async () => {
    openShared("yyyyyyyyyyyyyyyyyyyu");

    expect(
      await screen.findByRole("heading", { name: copy.results.unknownsTitle }),
    ).toBeVisible();
    expect(screen.getByText(copy.questions.q20.topic)).toBeVisible();
  });

  it("renders every category with its percentage", async () => {
    openShared("yyyyyyyyyyypyyyyyyyy");

    await screen.findByRole("heading", { name: copy.results.categoriesTitle });
    expect(screen.getByText(copy.categories.security)).toBeVisible();
    expect(screen.getByText("94%")).toBeVisible();
    expect(screen.getAllByText("100%")).toHaveLength(6);
  });

  it("builds a prefilled diagnostic email", async () => {
    openShared("yyyyyyynyyyyyyyyyyyy");

    const cta = await screen.findByRole("link", {
      name: copy.results.nextStep.cta,
    });
    const href = decodeURIComponent(cta.getAttribute("href") ?? "");

    expect(href).toMatch(/^mailto:joao@jobe\.works\?subject=/);
    expect(href).toContain("Product Readiness Scorecard — 94/100");
    expect(href).toContain("Readiness: Needs attention");
    expect(href).toContain("Main findings: Security — Critical risk");
    expect(href).toContain("Areas to verify: 0");
    expect(href).toContain("#r=1.yyyyyyynyyyyyyyyyyyy");
  });

  it("uses the softer call to action for a strong result", async () => {
    openShared("yyyyyyyyyyyyyyyyyyyy");

    expect(
      await screen.findByRole("heading", {
        name: copy.results.nextStep.strongTitle,
      }),
    ).toBeVisible();
    expect(screen.getByText(copy.results.noFindings)).toBeVisible();
    expect(
      screen.getByRole("link", { name: copy.results.nextStep.strongCta }),
    ).toBeVisible();
  });

  it("copies the result link to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    openShared("yyyyyyyyyyyyyyyyyyyy");

    fireEvent.click(
      await screen.findByRole("button", { name: copy.results.copyLink }),
    );

    await screen.findByRole("button", { name: copy.results.copied });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("#r=1.yyyyyyyyyyyyyyyyyyyy"),
    );
  });

  it("falls back to a selectable field when the clipboard is unavailable", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    openShared("yyyyyyyyyyyyyyyyyyyy");

    fireEvent.click(
      await screen.findByRole("button", { name: copy.results.copyLink }),
    );

    const field = await screen.findByLabelText(copy.results.copyFallback);
    expect((field as HTMLInputElement).value).toContain("#r=1.");
  });

  it("ignores scorecard shortcuts typed into the fallback field", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    openShared("yyyyyyyyyyyyyyyyyyyy");
    fireEvent.click(
      await screen.findByRole("button", { name: copy.results.copyLink }),
    );
    const field = await screen.findByLabelText(copy.results.copyFallback);

    fireEvent.keyDown(field, { key: "1" });

    expect(screen.getByLabelText(copy.results.copyFallback)).toBeVisible();
  });

  it("clears the hash and returns to the intro on retake", async () => {
    openShared("yyyyyyyyyyyyyyyyyyyy");

    fireEvent.click(
      await screen.findByRole("button", { name: copy.results.retake }),
    );

    await waitFor(() => expect(window.location.hash).toBe(""));
    expect(
      screen.getByRole("button", { name: copy.intro.start }),
    ).toBeVisible();
  });
});
