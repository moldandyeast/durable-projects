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

/** Per-project roles keyed by member id; only ids present in `allowedIds` are kept. */
export function normalizeTeamMemberRoles(
  allowedIds: string[],
  raw: unknown,
): Record<string, string> | undefined {
  if (!allowedIds.length || raw === undefined || raw === null) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const allow = new Set(allowedIds);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = String(k).trim();
    if (!allow.has(id)) continue;
    const role = typeof v === "string" ? v.trim() : String(v ?? "").trim();
    if (role) out[id] = role;
  }
  return Object.keys(out).length ? out : undefined;
}

function pruneTeamMemberRolesForIds(data: ProjectData): void {
  if (!data.team_member_roles) return;
  const allow = new Set(data.team_member_ids);
  const next: Record<string, string> = {};
  for (const [k, v] of Object.entries(data.team_member_roles)) {
    if (!allow.has(k)) continue;
    const t = String(v ?? "").trim();
    if (t) next[k] = t;
  }
  if (Object.keys(next).length) data.team_member_roles = next;
  else delete data.team_member_roles;
}

/** Ordered unique client ids (primaries). */
export function normalizeClientIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of raw) {
    const id = String(x).trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Ordered intermediaries; drops duplicates and any id in `primaryClientIds`. */
export function normalizeViaClientIds(raw: unknown, primaryClientIds: string[]): string[] {
  const exclude = new Set(primaryClientIds.map((x) => String(x).trim()).filter(Boolean));
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of raw) {
    const id = String(x).trim();
    if (!id || seen.has(id) || exclude.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
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

  /** Migrate legacy `client_id` → `client_ids`; strip duplicate primaries from via. */
  private prepareStoredClients(data: ProjectData): void {
    if (!data.client_ids?.length && data.client_id) {
      data.client_ids = [data.client_id];
    }
    delete data.client_id;
    if (data.client_ids?.length && data.via_client_ids?.length) {
      data.via_client_ids = normalizeViaClientIds(data.via_client_ids, data.client_ids);
      if (!data.via_client_ids.length) delete data.via_client_ids;
    }
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
    const sort_date = normalizeOptionalTrimmed(input.sort_date);
    const client_ids = normalizeClientIds(
      Array.isArray(input.client_ids) && input.client_ids.length ?
        input.client_ids
      : input.client_id ? [input.client_id] : [],
    );
    const via_client_ids = normalizeViaClientIds(input.via_client_ids, client_ids);

    const team_member_ids = normalizeTeamMemberIds(input.team_member_ids);
    const team_member_roles = normalizeTeamMemberRoles(team_member_ids, input.team_member_roles);

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
      ...(client_ids.length ? { client_ids } : {}),
      ...(via_client_ids.length ? { via_client_ids } : {}),
      ...(sort_date ? { sort_date } : {}),
      gallery_images: normalizeGalleryImages(input.gallery_images),
      team_member_ids,
      ...(team_member_roles ? { team_member_roles } : {}),
      ...(preview ? { preview_image: preview } : {}),
    };

    await this.save(data);
    return Response.json(data);
  }

  private async get(): Promise<Response> {
    const data = await this.load();
    if (!data) return new Response("Not found", { status: 404 });
    if (data.hidden) return new Response("Gone", { status: 410 });

    this.prepareStoredClients(data);

    data.total_views++;
    await this.save(data);
    return Response.json(data);
  }

  private async peek(): Promise<Response> {
    const data = await this.load();
    if (!data) return new Response("Not found", { status: 404 });
    if (data.hidden) return new Response("Gone", { status: 410 });
    this.prepareStoredClients(data);
    await this.save(data);
    return Response.json(data);
  }

  private async update(request: Request): Promise<Response> {
    const data = await this.load();
    if (!data) return new Response("Not found", { status: 404 });

    const input = await request.json<Partial<ProjectData> & Record<string, unknown>>();
    const now = new Date().toISOString();

    this.prepareStoredClients(data);

    if (input.title !== undefined) data.title = input.title;
    if (input.summary !== undefined) data.summary = input.summary;
    if (input.tags !== undefined) data.tags = Array.isArray(input.tags) ? input.tags.map(String) : [];
    if (input.created_at !== undefined) data.created_at = input.created_at;

    if ("client_ids" in input || "client_id" in input) {
      let next: string[];
      if ("client_ids" in input) {
        next = normalizeClientIds(input.client_ids);
      } else {
        const cid = normalizeOptionalTrimmed(input.client_id);
        next = cid ? [cid] : [];
      }
      if (next.length) data.client_ids = next;
      else delete data.client_ids;
      delete data.client_id;
      if (!("via_client_ids" in input) && data.via_client_ids?.length) {
        const via = normalizeViaClientIds(data.via_client_ids, data.client_ids ?? []);
        if (via.length) data.via_client_ids = via;
        else delete data.via_client_ids;
      }
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
      pruneTeamMemberRolesForIds(data);
    }

    if (input.team_member_roles !== undefined) {
      const nextRoles = normalizeTeamMemberRoles(data.team_member_ids, input.team_member_roles);
      if (nextRoles && Object.keys(nextRoles).length) data.team_member_roles = nextRoles;
      else delete data.team_member_roles;
    }

    if ("via_client_ids" in input) {
      const via = normalizeViaClientIds(input.via_client_ids, data.client_ids ?? []);
      if (via.length) data.via_client_ids = via;
      else delete data.via_client_ids;
    }

    if (input.body !== undefined) {
      data.body = input.body;
      data.rendered_html = await renderMarkdown(input.body);
    }

    data.edited_at = now;
    this.prepareStoredClients(data);
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
