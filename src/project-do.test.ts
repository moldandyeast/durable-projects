import { describe, expect, it, vi } from "vitest";
import {
  normalizeClientIds,
  normalizeGalleryImages,
  normalizeProjectLinks,
  normalizeTeamMemberIds,
  normalizeTeamMemberRoles,
  normalizeViaClientIds,
  ProjectDO,
} from "./project-do";
import type { Env } from "./types";

vi.mock("./markdown", () => ({
  renderMarkdown: async (s: string) => `<p>${s}</p>`,
}));

class MemoryStorage {
  private values = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.values.get(key) as T | undefined;
  }

  async put<T>(key: string, value: T): Promise<void> {
    this.values.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.values.delete(key);
  }
}

function makeProjectDO(): ProjectDO {
  return new ProjectDO(
    { storage: new MemoryStorage(), getWebSockets: () => [], acceptWebSocket: () => {} } as unknown as DurableObjectState,
    {} as Env,
  );
}

describe("normalizeGalleryImages", () => {
  it("drops empty urls", () => {
    expect(
      normalizeGalleryImages([{ url: " https://x.com/a.jpg ", caption: " A " }, { url: "  " }]),
    ).toEqual([{ url: "https://x.com/a.jpg", caption: "A" }]);
  });
});

describe("normalizeTeamMemberIds", () => {
  it("trims and drops empty", () => {
    expect(normalizeTeamMemberIds(["  aa ", "", "bb"])).toEqual(["aa", "bb"]);
  });
});

describe("normalizeClientIds", () => {
  it("preserves pick order and drops duplicates", () => {
    expect(normalizeClientIds(["  aa ", "", "bb", "aa"])).toEqual(["aa", "bb"]);
  });
});

describe("normalizeViaClientIds", () => {
  it("preserves order and drops duplicates", () => {
    expect(normalizeViaClientIds(["aa", "bb", "aa"], [])).toEqual(["aa", "bb"]);
  });

  it("drops primary clients if repeated in via list", () => {
    expect(normalizeViaClientIds(["bb", "aa", "cc"], ["aa"])).toEqual(["bb", "cc"]);
    expect(normalizeViaClientIds(["aa", "bb", "cc"], ["aa", "bb"])).toEqual(["cc"]);
  });
});

describe("normalizeProjectLinks", () => {
  it("keeps http(s)/mailto, trims labels, drops junk protocols", () => {
    expect(
      normalizeProjectLinks([
        { label: "", url: "https://example.com/path" },
        { label: "Mail", url: "mailto:a@b.com" },
        { label: "X", url: "javascript:alert(1)" },
        { label: "Bad", url: "ftp://x" },
      ]),
    ).toEqual([
      { label: "example.com", url: "https://example.com/path" },
      { label: "Mail", url: "mailto:a@b.com" },
    ]);
  });

  it("caps length", () => {
    const raw = Array.from({ length: 60 }, (_, i) => ({ label: "L", url: `https://e.test/${i}` }));
    expect(normalizeProjectLinks(raw)).toHaveLength(48);
  });
});

describe("normalizeTeamMemberRoles", () => {
  it("keeps only ids in allow list and trims", () => {
    expect(
      normalizeTeamMemberRoles(["a", "b"], {
        a: " Lead ",
        b: "",
        c: "ignored",
      }),
    ).toEqual({ a: "Lead" });
  });

  it("returns undefined when allow list empty or input invalid", () => {
    expect(normalizeTeamMemberRoles([], { x: "y" })).toBeUndefined();
    expect(normalizeTeamMemberRoles(["a"], undefined)).toBeUndefined();
    expect(normalizeTeamMemberRoles(["a"], [])).toBeUndefined();
  });
});

describe("ProjectDO", () => {
  it("create stores extended metadata", async () => {
    const project = makeProjectDO();
    const res = await project.fetch(
      new Request("https://p/internal/create", {
        method: "POST",
        body: JSON.stringify({
          id: "abcdabcd",
          title: "T",
          summary: "S",
          tags: ["x"],
          body: "Hello",
          client_ids: ["cccccccc"],
          sort_date: "2024-03-15",
          gallery_images: [{ url: "https://example.com/a.jpg", caption: "A" }],
          team_member_ids: ["aaaaaaaa"],
        }),
      }),
    );
    expect(res.ok).toBe(true);
    const data = await res.json<{ rendered_html: string; client_ids?: string[] }>();
    expect(data.client_ids).toEqual(["cccccccc"]);
    expect(data.rendered_html).toContain("Hello");
  });

  it("create stores via_client_ids", async () => {
    const project = makeProjectDO();
    const res = await project.fetch(
      new Request("https://p/internal/create", {
        method: "POST",
        body: JSON.stringify({
          id: "abcdabcd",
          title: "T",
          summary: "",
          tags: [],
          body: "x",
          client_ids: ["aaaaaaaa"],
          via_client_ids: ["bbbbbbbb", "aaaaaaaa", "cccccccc"],
          team_member_ids: [],
        }),
      }),
    );
    expect(res.ok).toBe(true);
    const data = await res.json<{ client_ids?: string[]; via_client_ids?: string[] }>();
    expect(data.client_ids).toEqual(["aaaaaaaa"]);
    expect(data.via_client_ids).toEqual(["bbbbbbbb", "cccccccc"]);
  });

  it("create stores team_member_roles", async () => {
    const project = makeProjectDO();
    const res = await project.fetch(
      new Request("https://p/internal/create", {
        method: "POST",
        body: JSON.stringify({
          id: "abcdabcd",
          title: "T",
          summary: "",
          tags: [],
          body: "x",
          team_member_ids: ["aaaaaaaa", "bbbbbbbb"],
          team_member_roles: { aaaaaaaa: "Art direction", bbbbbbbb: " ", zzzzzzzz: "skip" },
        }),
      }),
    );
    expect(res.ok).toBe(true);
    const data = await res.json<{ team_member_roles?: Record<string, string> }>();
    expect(data.team_member_roles).toEqual({ aaaaaaaa: "Art direction" });
  });

  it("update clears project_links when empty array sent", async () => {
    const project = makeProjectDO();
    const createReq = new Request("https://p/internal/create", {
      method: "POST",
      body: JSON.stringify({
        id: "abcdabcd",
        title: "T",
        summary: "",
        tags: [],
        body: "x",
        team_member_ids: [],
        project_links: [{ label: "A", url: "https://a.test" }],
      }),
    });
    expect((await project.fetch(createReq)).ok).toBe(true);
    const upd = await project.fetch(
      new Request("https://p/internal/update", {
        method: "POST",
        body: JSON.stringify({ project_links: [] }),
      }),
    );
    expect(upd.ok).toBe(true);
    const data = await upd.json<{ project_links?: unknown[] }>();
    expect(data.project_links).toBeUndefined();
  });
});
