import { expect, test as base } from "@playwright/test";

export const test = base.extend<{ browserErrors: void }>({
  browserErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await use();

      expect(errors, "unexpected browser errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
