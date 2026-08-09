import { expect, test as base } from "@playwright/test";

export const test = base.extend<{
  allowedBrowserErrors: string[];
  browserErrors: void;
}>({
  allowedBrowserErrors: [[], { option: true }],
  browserErrors: [
    async ({ allowedBrowserErrors, page }, use) => {
      const errors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await use();

      expect(
        errors.filter((error) => !allowedBrowserErrors.includes(error)),
        "unexpected browser errors",
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
