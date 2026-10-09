import type { CaptureResult, PostHog, PostHogConfig } from "posthog-js";

import {
  isAllowlistedCampaignParameter,
  pickCampaignParameters,
} from "../attribution";
import type { AnalyticsCustomEvent, TrackerRegistration } from "../types";

export const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

type Properties = Record<string, unknown>;

export type PostHogEvent = {
  name: string;
  properties: Properties;
};

export type PostHogClient = Pick<
  PostHog,
  | "init"
  | "capture"
  | "has_opted_out_capturing"
  | "opt_in_capturing"
  | "opt_out_capturing"
>;

export type PostHogTrackerOptions = {
  apiKey: string;
  apiHost?: string;
  /** Query string of the landing URL; defaults to the current location. */
  landingSearch?: string;
  load?: () => Promise<PostHogClient>;
};

const urlPropertyPattern = /url|referrer/i;

// Campaign and click-ID parameters posthog-js derives from URLs, either bare or
// as `$session_entry_*` / `$initial_*` copies. Only the ADR 015 allowlist may
// leave the browser.
const clickIdParameters = new Set([
  "gad_source",
  "mc_cid",
  "gclid",
  "gclsrc",
  "dclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "twclid",
  "li_fat_id",
  "igshid",
  "ttclid",
  "rdt_cid",
  "epik",
  "qclid",
  "sccid",
  "oppref",
  "irclid",
  "_kx",
]);

function isDisallowedCampaignProperty(key: string): boolean {
  const parameter = key.replace(/^\$(session_entry_|initial_)/, "");
  if (isAllowlistedCampaignParameter(parameter)) return false;
  return parameter.startsWith("utm_") || clickIdParameters.has(parameter);
}

function toSnakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toPostHogEvent(event: AnalyticsCustomEvent): PostHogEvent {
  const { eventName, ...attributes } = event;
  if (event.eventName === "page_view") {
    return { name: "$pageview", properties: { locale: event.locale } };
  }
  const properties: Properties = {};
  for (const [key, value] of Object.entries(attributes)) {
    properties[toSnakeCase(key)] = value;
  }
  return { name: eventName, properties };
}

/** Keeps origin, path, and allowlisted campaign parameters; drops everything else. */
export function sanitizeUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }
  const kept = new URLSearchParams();
  for (const [key, paramValue] of url.searchParams) {
    if (isAllowlistedCampaignParameter(key)) kept.append(key, paramValue);
  }
  const search = kept.toString();
  return `${url.origin}${url.pathname}${search ? `?${search}` : ""}`;
}

function sanitizeProperties(properties: Properties | undefined): void {
  if (!properties) return;
  for (const [key, value] of Object.entries(properties)) {
    if (isDisallowedCampaignProperty(key)) {
      delete properties[key];
    } else if (typeof value === "string" && urlPropertyPattern.test(key)) {
      properties[key] = sanitizeUrl(value);
    }
  }
}

export function sanitizeCaptureResult(
  result: CaptureResult | null,
): CaptureResult | null {
  if (!result) return result;
  sanitizeProperties(result.properties);
  sanitizeProperties(result.$set);
  sanitizeProperties(result.$set_once);
  return result;
}

export function createPostHogConfig(apiHost: string): Partial<PostHogConfig> {
  return {
    api_host: apiHost,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_exceptions: false,
    capture_performance: false,
    rageclick: false,
    // The SDK would also extract click IDs (gclid, fbclid, ...) from the URL;
    // allowlisted campaign parameters are attached by the tracker instead.
    save_campaign_params: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_product_tours: true,
    disable_conversations: true,
    disable_web_experiments: true,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
    mask_personal_data_properties: true,
    opt_out_persistence_by_default: true,
    before_send: sanitizeCaptureResult,
  };
}

async function loadPostHog(): Promise<PostHogClient> {
  const module = await import("posthog-js");
  return module.default;
}

/**
 * The SDK is downloaded on the first eligible event, so nothing loads before
 * analytics consent. Withdrawal opts the SDK out so it stops capturing and
 * persisting identifiers.
 */
export function createPostHogRegistration({
  apiKey,
  apiHost = DEFAULT_POSTHOG_HOST,
  landingSearch = typeof window === "undefined" ? "" : window.location.search,
  load = loadPostHog,
}: PostHogTrackerOptions): TrackerRegistration {
  let client: Promise<PostHogClient> | null = null;
  // Read at registration (app start) so attribution survives navigation that
  // happens before consent, as with the in-memory landing attribution.
  const campaign = pickCampaignParameters(new URLSearchParams(landingSearch));

  const getClient = () => {
    client ??= load().then(
      (posthog) => {
        posthog.init(apiKey, createPostHogConfig(apiHost));
        return posthog;
      },
      (error: unknown) => {
        client = null;
        throw error;
      },
    );
    return client;
  };

  return {
    consentCategory: "analytics",
    tracker: async (event) => {
      const posthog = await getClient();
      if (posthog.has_opted_out_capturing()) {
        posthog.opt_in_capturing({ captureEventName: false });
      }
      const { name, properties } = toPostHogEvent(event);
      posthog.capture(name, { ...campaign, ...properties });
    },
    onConsentChange: (granted) => {
      if (granted || !client) return;
      client.then(
        (posthog) => posthog.opt_out_capturing(),
        () => undefined,
      );
    },
  };
}
