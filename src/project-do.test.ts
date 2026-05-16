import { describe, expect, it, vi } from "vitest";
import { normalizeGalleryImages, normalizeTeamMemberIds, ProjectDO } from "./project-do";
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
          client_id: "cccccccc",
          sort_date: "2024-03-15",
          gallery_images: [{ url: "https://example.com/a.jpg", caption: "A" }],
          team_member_ids: ["aaaaaaaa"],
        }),
      }),
    );
    expect(res.ok).toBe(true);
    const data = await res.json<{ rendered_html: string; client_id?: string }>();
    expect(data.client_id).toBe("cccccccc");
    expect(data.rendered_html).toContain("Hello");
  });
});
