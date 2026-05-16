import type { Env, IndexEntry } from "./types";

/**
 * IndexDO — singleton directory + existence oracle (no link graph).
 */
export class IndexDO {
  constructor(private state: DurableObjectState, private _env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try {
      switch (url.pathname) {
        case "/internal/has":
          return await this.has(request);
        case "/internal/list":
          return await this.list(false);
        case "/internal/list-all":
          return await this.list(true);
        case "/internal/register":
          return await this.register(request);
        case "/internal/update":
          return await this.update(request);
        case "/internal/unregister":
          return await this.unregister(request);
        default:
          return new Response("Not found", { status: 404 });
      }
    } catch (e) {
      console.error("IndexDO error:", e);
      return new Response("Internal error", { status: 500 });
    }
  }

  private key(id: string): string {
    return `project:${id}`;
  }

  private async has(request: Request): Promise<Response> {
    const { id } = await request.json<{ id: string }>();
    const entry = await this.state.storage.get<IndexEntry>(this.key(id));
    return Response.json({ exists: entry != null && !entry.hidden });
  }

  private async list(includeHidden: boolean): Promise<Response> {
    const entries = await this.state.storage.list<IndexEntry>({ prefix: "project:" });
    const projects = [...entries.values()].filter((e) => includeHidden || !e.hidden);
    return Response.json({ projects });
  }

  private async register(request: Request): Promise<Response> {
    const entry = await request.json<IndexEntry>();
    await this.state.storage.put(this.key(entry.id), entry);
    return new Response(null, { status: 204 });
  }

  private async update(request: Request): Promise<Response> {
    const updates = await request.json<Partial<IndexEntry> & { id: string }>();
    const existing = await this.state.storage.get<IndexEntry>(this.key(updates.id));
    if (!existing) return new Response("Not found", { status: 404 });
    await this.state.storage.put(this.key(updates.id), { ...existing, ...updates });
    return new Response(null, { status: 204 });
  }

  private async unregister(request: Request): Promise<Response> {
    const { id } = await request.json<{ id: string }>();
    await this.state.storage.delete(this.key(id));
    return new Response(null, { status: 204 });
  }
}
