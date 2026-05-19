import { describe, expect, it } from "vitest";
import { filterIndexEntries, tagMatches } from "./index-filter";
import type { IndexEntry } from "./types";

const entry = (over: Partial<IndexEntry>): IndexEntry => ({
  id: "abc12345",
  title: "T",
  summary: "",
  tags: ["Strategy"],
  created_at: "2026-01-01T00:00:00.000Z",
  edited_at: "2026-01-01T00:00:00.000Z",
  total_views: 0,
  hidden: false,
  ...over,
});

describe("filterIndexEntries", () => {
  const projects = [
    entry({ id: "aaaaaaaa", tags: ["Strategy"], client_ids: ["client01"] }),
    entry({ id: "bbbbbbbb", tags: ["Design"], via_client_ids: ["via00001"] }),
  ];

  it("filters by tag case-insensitively", () => {
    const out = filterIndexEntries(projects, { tag: "strategy" });
    expect(out.map((p) => p.id)).toEqual(["aaaaaaaa"]);
  });

  it("filters by primary client", () => {
    const out = filterIndexEntries(projects, { client: "client01" });
    expect(out.map((p) => p.id)).toEqual(["aaaaaaaa"]);
  });

  it("filters by via client", () => {
    const out = filterIndexEntries(projects, { client: "via00001" });
    expect(out.map((p) => p.id)).toEqual(["bbbbbbbb"]);
  });
});

describe("tagMatches", () => {
  it("requires exact tag", () => {
    expect(tagMatches(entry({ tags: ["Strategy"] }), "Strat")).toBe(false);
    expect(tagMatches(entry({ tags: ["Strategy"] }), "Strategy")).toBe(true);
  });
});
