import { expect, it } from "vitest";

import { submitExampleContact } from "./submit-example-contact";

it("resolves undefined for an example contact submission", async () => {
  await expect(
    submitExampleContact({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "I would like to discuss a static website.",
      marketingOptIn: false,
      attribution: {
        source: "newsletter",
        campaign: "phase-eight",
      },
    }),
  ).resolves.toBeUndefined();
});
