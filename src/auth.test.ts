import { describe, expect, it } from "vitest";
import { canAuthor, forbidden } from "./auth";
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

describe("forbidden", () => {
  it("returns HTML for GET /admin", async () => {
    const url = new URL("https://work.moldandyeast.com/admin");
    const res = forbidden(new Request(url, { method: "GET" }), url);
    expect(res.status).toBe(403);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    expect(await res.text()).toContain("Cloudflare Access");
  });

  it("returns JSON for admin API", async () => {
    const url = new URL("https://work.moldandyeast.com/admin/api/projects");
    const res = forbidden(new Request(url), url);
    expect(res.status).toBe(403);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("forbidden");
  });
});
