import type { CampaignAttribution } from "../../analytics/attribution";

export type ExampleContactSubmission = {
  name: string;
  email: string;
  message: string;
  marketingOptIn: boolean;
  attribution: CampaignAttribution;
};

export function submitExampleContact(
  submission: ExampleContactSubmission,
): Promise<void> {
  void submission;
  return Promise.resolve();
}
