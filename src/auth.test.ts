import { describe, expect, it } from "vitest";
import { canAuthor } from "./auth";
import type { Env } from "./types";

describe("canAuthor", () => {
  it("allows dev bypass", () => {
    const env = { DEV_BYPASS_AUTH: "true" } as Env;
    expect(canAuthor(new Request("https://x/admin"), env)).toBe(true);
  });

  it("requires Access JWT when bypass off", () => {
    const env = { DEV_BYPASS_AUTH: "false" } as Env;
    expect(canAuthor(new Request("https://x/admin"), env)).toBe(false);
    expect(
      canAuthor(new Request("https://x/admin", { headers: { "CF-Access-Jwt-Assertion": "x" } }), env),
    ).toBe(true);
  });
});
