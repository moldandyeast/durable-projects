import { describe, expect, it } from "vitest";
import { SiteDirectoryDO } from "./site-directory-do";
import type { Env } from "./types";

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

function makeSiteDO(): SiteDirectoryDO {
  return new SiteDirectoryDO({ storage: new MemoryStorage() } as unknown as DurableObjectState, {} as Env);
}

describe("SiteDirectoryDO", () => {
  it("puts, lists, deletes members", async () => {
    const doInst = makeSiteDO();
    await doInst.fetch(
      new Request("https://t/internal/members/put", {
        method: "POST",
        body: JSON.stringify({ id: "aaaaaaaa", name: "Ada", role: "Dev", url: "https://example.com" }),
      }),
    );
    const listRes = await doInst.fetch(new Request("https://t/internal/members/list"));
    const { members } = await listRes.json<{ members: { id: string }[] }>();
    expect(members.some((m) => m.id === "aaaaaaaa")).toBe(true);

    await doInst.fetch(
      new Request("https://t/internal/members/delete", { method: "POST", body: JSON.stringify({ id: "aaaaaaaa" }) }),
    );
    const listRes2 = await doInst.fetch(new Request("https://t/internal/members/list"));
    const data2 = await listRes2.json<{ members: unknown[] }>();
    expect(data2.members.length).toBe(0);
  });

  it("member get-batch preserves order and skips missing", async () => {
    const doInst = makeSiteDO();
    await doInst.fetch(
      new Request("https://t/internal/members/put", { method: "POST", body: JSON.stringify({ id: "bbbbbbbb", name: "Bob" }) }),
    );
    const res = await doInst.fetch(
      new Request("https://t/internal/members/get-batch", {
        method: "POST",
        body: JSON.stringify({ ids: ["bbbbbbbb", "zzzzzzzz"] }),
      }),
    );
    const { members } = await res.json<{ members: { id: string }[] }>();
    expect(members.map((m) => m.id)).toEqual(["bbbbbbbb"]);
  });

  it("stores clients separately from members", async () => {
    const doInst = makeSiteDO();
    await doInst.fetch(
      new Request("https://t/internal/clients/put", {
        method: "POST",
        body: JSON.stringify({ id: "cccccccc", name: "IDEO", url: "https://ideo.com" }),
      }),
    );
    const listRes = await doInst.fetch(new Request("https://t/internal/clients/list"));
    const { clients } = await listRes.json<{ clients: { id: string }[] }>();
    expect(clients.some((c) => c.id === "cccccccc")).toBe(true);

    const mList = await doInst.fetch(new Request("https://t/internal/members/list"));
    const { members } = await mList.json<{ members: unknown[] }>();
    expect(members.length).toBe(0);
  });
});
