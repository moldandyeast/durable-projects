import { describe, expect, it } from "vitest";
import { generateSlug, isValidSlug } from "./slug";

describe("slug", () => {
  it("generateSlug returns 8 lowercase crockford chars", () => {
    const s = generateSlug();
    expect(s).toMatch(/^[0-9a-hjkmnpqrstvwxyz]{8}$/);
  });

  it("isValidSlug rejects wrong length and ambiguous chars", () => {
    expect(isValidSlug("abcdefgh")).toBe(true);
    expect(isValidSlug("abcdefghi")).toBe(false);
    expect(isValidSlug("iiiiiiii")).toBe(false);
  });
});
