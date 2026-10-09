export const utmParameters = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
] as const;

export type UtmParameter = (typeof utmParameters)[number];

export function isAllowlistedCampaignParameter(
  parameter: string,
): parameter is UtmParameter {
  return (utmParameters as readonly string[]).includes(parameter);
}

/** Allowlisted campaign parameters under their original `utm_*` names. */
export function pickCampaignParameters(
  searchParams: URLSearchParams,
): Partial<Record<UtmParameter, string>> {
  const picked: Partial<Record<UtmParameter, string>> = {};
  for (const parameter of utmParameters) {
    const value = searchParams.get(parameter)?.trim();
    if (value) picked[parameter] = value;
  }
  return picked;
}

export type CampaignAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  campaignId?: string;
  term?: string;
  content?: string;
};

const attributionKeys: Record<UtmParameter, keyof CampaignAttribution> = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_id: "campaignId",
  utm_term: "term",
  utm_content: "content",
};

export function parseCampaignAttribution(
  searchParams: URLSearchParams,
): CampaignAttribution {
  const attribution: CampaignAttribution = {};
  for (const [parameter, value] of Object.entries(
    pickCampaignParameters(searchParams),
  )) {
    attribution[attributionKeys[parameter as UtmParameter]] = value;
  }
  return attribution;
}
