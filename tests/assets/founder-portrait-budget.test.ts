import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const directory = join(process.cwd(), "app/assets/images/founder");
const expected = [320, 480, 640].flatMap((width) =>
  ["avif", "webp"].map((format) => `joao-bertacchi-${width}.${format}`),
);

describe("founder portrait derivatives", () => {
  it("ships exactly the expected widths and formats", () => {
    expect(readdirSync(directory).sort()).toEqual([...expected].sort());
  });

  it.each(expected)("keeps %s within the 24 KB budget", (file) => {
    expect(statSync(join(directory, file)).size).toBeLessThanOrEqual(24_576);
  });
});
