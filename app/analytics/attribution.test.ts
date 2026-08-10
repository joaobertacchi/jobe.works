import { describe, expect, it } from "vitest";

import { parseCampaignAttribution } from "./attribution";

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("parseCampaignAttribution", () => {
  it("parses every allowlisted UTM parameter", () => {
    expect(
      parseCampaignAttribution(
        params(
          "utm_source=newsletter&utm_medium=email&utm_campaign=launch&utm_id=campaign-1&utm_term=services&utm_content=hero",
        ),
      ),
    ).toEqual({
      source: "newsletter",
      medium: "email",
      campaign: "launch",
      campaignId: "campaign-1",
      term: "services",
      content: "hero",
    });
  });

  it("returns an empty attribution when no parameters are present", () => {
    expect(parseCampaignAttribution(params(""))).toEqual({});
  });

  it("ignores parameters outside the allowlist", () => {
    expect(
      parseCampaignAttribution(
        params(
          "utm_source=newsletter&gclid=abc123&email=user%40example.com&next=/account",
        ),
      ),
    ).toEqual({ source: "newsletter" });
  });

  it("trims values and drops empty or whitespace-only values", () => {
    expect(
      parseCampaignAttribution(
        params("utm_source=%20newsletter%20&utm_medium=%20%20&utm_campaign="),
      ),
    ).toEqual({ source: "newsletter" });
  });

  it("does not derive attribution from unknown case variants", () => {
    expect(
      parseCampaignAttribution(
        params("utm_source=newsletter&UTM_MEDIUM=email"),
      ),
    ).toEqual({ source: "newsletter" });
  });

  it("uses the first value when a parameter repeats", () => {
    expect(
      parseCampaignAttribution(params("utm_source=first&utm_source=second")),
    ).toEqual({ source: "first" });
  });
});
