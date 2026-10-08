import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { scorecardTranslations } from "../../../i18n/translations/scorecard";
import { renderScorecard } from "./test-utils";

const copy = scorecardTranslations.en;

async function start() {
  const button = await screen.findByRole("button", { name: copy.intro.start });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

async function answerWithKeys(keys: string[], total = 20) {
  for (const [index, key] of keys.entries()) {
    await screen.findByText(`Question ${index + 1} of ${total}`);
    fireEvent.keyDown(document, { key });
  }
}

beforeEach(() => {
  window.history.replaceState(null, "", "/en/scorecard");
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("Scorecard flow", () => {
  it("starts from the intro and focuses the first question", async () => {
    const { scorecardEvents } = renderScorecard();

    await start();

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: copy.questions.q01.text,
    });
    expect(heading).toHaveFocus();
    await waitFor(() =>
      expect(scorecardEvents()).toEqual([{ eventName: "scorecard_started" }]),
    );
  });

  it("completes with keyboard shortcuts and emits only aggregate analytics", async () => {
    const { scorecardEvents } = renderScorecard();
    await start();

    await answerWithKeys(Array(20).fill("1"));

    expect(
      await screen.findByText(copy.results.verdicts.strong.label),
    ).toBeVisible();
    expect(window.location.hash).toBe("#r=1.yyyyyyyyyyyyyyyyyyyy");
    await waitFor(() =>
      expect(scorecardEvents()).toEqual([
        { eventName: "scorecard_started" },
        {
          eventName: "scorecard_completed",
          verdict: "strong",
          band: "strong",
          criticalRiskCount: 0,
          unknownCount: 0,
        },
      ]),
    );
  });

  it("keeps earlier answers when going back", async () => {
    renderScorecard();
    await start();

    fireEvent.click(
      await screen.findByRole("radio", {
        name: new RegExp(copy.answers.partial),
      }),
    );
    await screen.findByText("Question 2 of 20");
    fireEvent.click(screen.getByRole("button", { name: copy.navigation.back }));

    await screen.findByText("Question 1 of 20");
    expect(
      screen.getByRole("radio", { name: new RegExp(copy.answers.partial) }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("returns to the intro when going back from the first question", async () => {
    renderScorecard();
    await start();
    await screen.findByText("Question 1 of 20");

    fireEvent.click(screen.getByRole("button", { name: copy.navigation.back }));

    expect(
      await screen.findByRole("button", { name: copy.intro.start }),
    ).toBeVisible();
  });

  it("skips the restore question when backups are not applicable", async () => {
    renderScorecard();
    await start();

    await answerWithKeys(Array(14).fill("1"));
    await screen.findByText("Question 15 of 20");
    expect(
      screen.getByRole("radio", { name: new RegExp(copy.answers.na) }),
    ).toBeVisible();
    fireEvent.keyDown(document, { key: "5" });

    expect(await screen.findByText("Question 16 of 19")).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: copy.questions.q17.text }),
    ).toBeVisible();
  });

  it("ignores shortcut keys pressed with modifiers", async () => {
    renderScorecard();
    await start();
    await screen.findByText("Question 1 of 20");

    fireEvent.keyDown(document, { key: "1", metaKey: true });
    fireEvent.keyDown(document, { key: "1", ctrlKey: true });
    fireEvent.keyDown(document, { key: "1", altKey: true });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByText("Question 1 of 20")).toBeVisible();
  });

  it("ignores auto-repeated key presses from a held key", async () => {
    renderScorecard();
    await start();
    await screen.findByText("Question 1 of 20");

    fireEvent.keyDown(document, { key: "1", repeat: true });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByText("Question 1 of 20")).toBeVisible();
  });

  it("answers the current question once when pressed twice quickly", async () => {
    renderScorecard();
    await start();
    await screen.findByText("Question 1 of 20");

    fireEvent.keyDown(document, { key: "1" });
    fireEvent.keyDown(document, { key: "2" });

    expect(await screen.findByText("Question 2 of 20")).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByText("Question 2 of 20")).toBeVisible();
  });

  it("moves focus between answers with arrow keys", async () => {
    renderScorecard();
    await start();
    const radios = await screen.findAllByRole("radio");

    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    expect(radios[1]).toHaveFocus();
    fireEvent.keyDown(radios[1], { key: "ArrowUp" });
    expect(radios[0]).toHaveFocus();
    fireEvent.keyDown(radios[0], { key: "ArrowUp" });
    expect(radios[radios.length - 1]).toHaveFocus();
  });
});

describe("Scorecard shared results", () => {
  it("shows a result link pasted into an already open scorecard", async () => {
    renderScorecard();
    await screen.findByRole("button", { name: copy.intro.start });

    window.history.replaceState(
      null,
      "",
      "/en/scorecard#r=1.nnnnnnnnnnnnnnnnnnnn",
    );
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(
      await screen.findByText(copy.results.verdicts.highRisk.label),
    ).toBeVisible();
  });

  it("returns to the intro when the hash is replaced by an invalid one", async () => {
    window.history.replaceState(
      null,
      "",
      "/en/scorecard#r=1.yyyyyyyyyyyyyyyyyyyy",
    );
    renderScorecard();
    await screen.findByText(copy.results.verdicts.strong.label);

    window.history.replaceState(null, "", "/en/scorecard#r=1.broken");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(
      await screen.findByRole("button", { name: copy.intro.start }),
    ).toBeVisible();
  });

  it("opens a valid shared hash on the results without completion analytics", async () => {
    window.history.replaceState(
      null,
      "",
      "/en/scorecard#r=1.nnnnnnnnnnnnnnnnnnnn",
    );
    const { scorecardEvents } = renderScorecard();

    expect(
      await screen.findByText(copy.results.verdicts.highRisk.label),
    ).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scorecardEvents()).toEqual([]);
  });

  it("shows the intro for an invalid shared hash", async () => {
    window.history.replaceState(null, "", "/en/scorecard#r=1.broken");
    renderScorecard();

    expect(
      await screen.findByRole("button", { name: copy.intro.start }),
    ).toBeVisible();
  });
});
