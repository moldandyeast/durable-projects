import { describe, expect, it } from "vitest";
import { IndexDO } from "./index-do";
import type { Env, IndexEntry } from "./types";

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

  async list<T>(options?: { prefix?: string }): Promise<Map<string, T>> {
    const out = new Map<string, T>();
    for (const [key, value] of this.values) {
      if (!options?.prefix || key.startsWith(options.prefix)) {
        out.set(key, value as T);
      }
    }
    return out;
  }
}

function makeIndexDO(): IndexDO {
  return new IndexDO({ storage: new MemoryStorage() } as unknown as DurableObjectState, {} as Env);
}

function entry(id: string, hidden = false, client_id?: string): IndexEntry {
  return {
    id,
    title: id,
    summary: "",
    tags: [],
    created_at: "2026-01-01T00:00:00.000Z",
    edited_at: "2026-01-01T00:00:00.000Z",
    total_views: 0,
    hidden,
    ...(client_id ? { client_id } : {}),
    sort_date: "2024-06-01",
  };
}

async function postJson(doInst: IndexDO, path: string, body: unknown): Promise<Response> {
  return doInst.fetch(new Request(`https://idx${path}`, { method: "POST", body: JSON.stringify(body) }));
}

describe("IndexDO", () => {
  it("register stores client_id and sort_date", async () => {
    const index = makeIndexDO();
    await postJson(index, "/internal/register", entry("aaaaaaaa", false, "cccccccc"));
    const has = await postJson(index, "/internal/has", { id: "aaaaaaaa" });
    expect((await has.json<{ exists: boolean }>()).exists).toBe(true);
    const list = await index.fetch(new Request("https://idx/internal/list"));
    const { projects } = await list.json<{ projects: IndexEntry[] }>();
    const row = projects.find((p) => p.id === "aaaaaaaa");
    expect(row?.client_id).toBe("cccccccc");
    expect(row?.sort_date).toBe("2024-06-01");
  });

  it("list excludes hidden by default", async () => {
    const index = makeIndexDO();
    await postJson(index, "/internal/register", entry("aaaaaaaa"));
    await postJson(index, "/internal/register", entry("bbbbbbbb", true));
    const list = await index.fetch(new Request("https://idx/internal/list"));
    const { projects } = await list.json<{ projects: IndexEntry[] }>();
    expect(projects.map((p) => p.id).sort()).toEqual(["aaaaaaaa"]);
  });

  it("update merges fields", async () => {
    const index = makeIndexDO();
    await postJson(index, "/internal/register", entry("aaaaaaaa"));
    await postJson(index, "/internal/update", { id: "aaaaaaaa", title: "Hello" });
    const list = await index.fetch(new Request("https://idx/internal/list-all"));
    const { projects } = await list.json<{ projects: IndexEntry[] }>();
    expect(projects.find((p) => p.id === "aaaaaaaa")?.title).toBe("Hello");
  });
});
