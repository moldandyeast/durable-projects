import type { Env, GalleryImage, ProjectData } from "./types";
import { renderMarkdown } from "./markdown";

function normalizePreviewUrl(url: string | undefined): string | undefined {
  if (url === undefined) return undefined;
  const t = url.trim();
  return t === "" ? undefined : t;
}

function normalizeOptionalTrimmed(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

export function normalizeGalleryImages(raw: unknown): GalleryImage[] {
  if (!Array.isArray(raw)) return [];
  const out: GalleryImage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const url = String(o.url ?? "").trim();
    if (!url) continue;
    const row: GalleryImage = { url };
    const caption = o.caption;
    const alt = o.alt;
    if (typeof caption === "string" && caption.trim()) row.caption = caption.trim();
    if (typeof alt === "string" && alt.trim()) row.alt = alt.trim();
    out.push(row);
  }
  return out;
}

export function normalizeTeamMemberIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x).trim()).filter(Boolean);
}

/**
 * ProjectDO — one Durable Object per portfolio project.
 */
export class ProjectDO {
  constructor(private state: DurableObjectState, private _env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try {
      switch (url.pathname) {
        case "/internal/create":
          return await this.create(request);
        case "/internal/get":
          return await this.get();
        case "/internal/peek":
          return await this.peek();
        case "/internal/update":
          return await this.update(request);
        case "/internal/delete":
          return await this.delete();
        case "/internal/live":
          return await this.handleLive(request);
        default:
          return new Response("Not found", { status: 404 });
      }
    } catch (e) {
      console.error("ProjectDO error:", e);
      return new Response("Internal error", { status: 500 });
    }
  }

  private async load(): Promise<ProjectData | null> {
    return (await this.state.storage.get<ProjectData>("data")) ?? null;
  }

  private async save(data: ProjectData): Promise<void> {
    await this.state.storage.put("data", data);
  }

  private async create(request: Request): Promise<Response> {
    if (await this.load()) {
      return new Response("Already exists", { status: 409 });
    }

    const input = await request.json<Partial<ProjectData>>();
    const now = new Date().toISOString();
    const body = input.body ?? "";

    const preview = normalizePreviewUrl(input.preview_image);
    const client_id = normalizeOptionalTrimmed(input.client_id);
    const sort_date = normalizeOptionalTrimmed(input.sort_date);

    const data: ProjectData = {
      id: input.id!,
      title: input.title ?? "Untitled",
      summary: input.summary ?? "",
      tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
      body,
      rendered_html: await renderMarkdown(body),
      created_at: input.created_at ?? now,
      edited_at: now,
      total_views: 0,
      hidden: false,
      ...(client_id ? { client_id } : {}),
      ...(sort_date ? { sort_date } : {}),
      gallery_images: normalizeGalleryImages(input.gallery_images),
      team_member_ids: normalizeTeamMemberIds(input.team_member_ids),
      ...(preview ? { preview_image: preview } : {}),
    };

    await this.save(data);
    return Response.json(data);
  }

  private async get(): Promise<Response> {
    const data = await this.load();
    if (!data) return new Response("Not found", { status: 404 });
    if (data.hidden) return new Response("Gone", { status: 410 });

    data.total_views++;
    await this.save(data);
    return Response.json(data);
  }

  private async peek(): Promise<Response> {
    const data = await this.load();
    if (!data) return new Response("Not found", { status: 404 });
    if (data.hidden) return new Response("Gone", { status: 410 });
    return Response.json(data);
  }

  private async update(request: Request): Promise<Response> {
    const data = await this.load();
    if (!data) return new Response("Not found", { status: 404 });

    const input = await request.json<Partial<ProjectData> & Record<string, unknown>>();
    const now = new Date().toISOString();

    if (input.title !== undefined) data.title = input.title;
    if (input.summary !== undefined) data.summary = input.summary;
    if (input.tags !== undefined) data.tags = Array.isArray(input.tags) ? input.tags.map(String) : [];
    if (input.created_at !== undefined) data.created_at = input.created_at;

    if ("client_id" in input) {
      const cid = normalizeOptionalTrimmed(input.client_id);
      if (cid === undefined) delete data.client_id;
      else data.client_id = cid;
    }

    if ("sort_date" in input) {
      const sd = normalizeOptionalTrimmed(input.sort_date);
      if (sd === undefined) delete data.sort_date;
      else data.sort_date = sd;
    }

    if (input.preview_image !== undefined) {
      const pv = normalizePreviewUrl(input.preview_image);
      if (pv === undefined) delete data.preview_image;
      else data.preview_image = pv;
    }

    if (input.gallery_images !== undefined) {
      data.gallery_images = normalizeGalleryImages(input.gallery_images);
    }

    if (input.team_member_ids !== undefined) {
      data.team_member_ids = normalizeTeamMemberIds(input.team_member_ids);
    }

    if (input.body !== undefined) {
      data.body = input.body;
      data.rendered_html = await renderMarkdown(input.body);
    }

    data.edited_at = now;
    await this.save(data);

    this.broadcast({ type: "edit", body: data.body, edited_at: data.edited_at });

    return Response.json(data);
  }

  private async delete(): Promise<Response> {
    const data = await this.load();
    if (!data) return new Response("Not found", { status: 404 });

    data.hidden = true;
    data.edited_at = new Date().toISOString();
    await this.save(data);
    return new Response(null, { status: 204 });
  }

  private async handleLive(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected websocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.state.acceptWebSocket(server);

    server.send(JSON.stringify({
      type: "viewers",
      count: this.state.getWebSockets().length,
    }));

    this.broadcast({ type: "viewers", count: this.state.getWebSockets().length });

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message === "string" && message === "ping") {
      ws.send("pong");
    }
  }

  async webSocketClose(_ws: WebSocket): Promise<void> {
    this.broadcast({ type: "viewers", count: this.state.getWebSockets().length });
  }

  private broadcast(payload: unknown): void {
    const msg = JSON.stringify(payload);
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(msg);
      } catch {
        /* ignore */
      }
    }
  }
}
