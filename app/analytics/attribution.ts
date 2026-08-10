const utmParameters = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
] as const;

type UtmParameter = (typeof utmParameters)[number];

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
  for (const parameter of utmParameters) {
    const value = searchParams.get(parameter)?.trim();
    if (value) attribution[attributionKeys[parameter]] = value;
  }
  return attribution;
}
