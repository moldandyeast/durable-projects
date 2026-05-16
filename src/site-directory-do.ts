import type { Client, Env, TeamMember } from "./types";
import { isValidSlug } from "./slug";

const MEMBER_PREFIX = "member:";
const CLIENT_PREFIX = "client:";

function memberKey(id: string): string {
  return `${MEMBER_PREFIX}${id}`;
}

function clientKey(id: string): string {
  return `${CLIENT_PREFIX}${id}`;
}

/** Singleton CMS: team members (`member:*`) and clients (`client:*`). */
export class SiteDirectoryDO {
  constructor(private state: DurableObjectState, private _env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try {
      switch (url.pathname) {
        case "/internal/members/list":
          return await this.listMembers();
        case "/internal/members/get-batch":
          return await this.getBatchMembers(request);
        case "/internal/members/put":
          return await this.putMember(request);
        case "/internal/members/delete":
          return await this.deleteMember(request);
        case "/internal/clients/list":
          return await this.listClients();
        case "/internal/clients/get-batch":
          return await this.getBatchClients(request);
        case "/internal/clients/put":
          return await this.putClient(request);
        case "/internal/clients/delete":
          return await this.deleteClient(request);
        default:
          return new Response("Not found", { status: 404 });
      }
    } catch (e) {
      console.error("SiteDirectoryDO error:", e);
      return new Response("Internal error", { status: 500 });
    }
  }

  private async listMembers(): Promise<Response> {
    const map = await this.state.storage.list<TeamMember>({ prefix: MEMBER_PREFIX });
    const members = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    return Response.json({ members });
  }

  private async listClients(): Promise<Response> {
    const map = await this.state.storage.list<Client>({ prefix: CLIENT_PREFIX });
    const clients = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    return Response.json({ clients });
  }

  private async getBatchMembers(request: Request): Promise<Response> {
    const { ids } = await request.json<{ ids: string[] }>();
    const members: TeamMember[] = [];
    for (const id of ids) {
      const m = await this.state.storage.get<TeamMember>(memberKey(id));
      if (m) members.push(m);
    }
    return Response.json({ members });
  }

  private async getBatchClients(request: Request): Promise<Response> {
    const { ids } = await request.json<{ ids: string[] }>();
    const clients: Client[] = [];
    for (const id of ids) {
      const c = await this.state.storage.get<Client>(clientKey(id));
      if (c) clients.push(c);
    }
    return Response.json({ clients });
  }

  private async putMember(request: Request): Promise<Response> {
    const m = await request.json<TeamMember>();
    if (!m?.id || !m.name?.trim()) {
      return new Response("Bad request", { status: 400 });
    }
    const row: TeamMember = {
      id: m.id,
      name: m.name.trim(),
      ...(m.role?.trim() ? { role: m.role.trim() } : {}),
      ...(m.url?.trim() ? { url: m.url.trim() } : {}),
    };
    await this.state.storage.put(memberKey(row.id), row);
    return Response.json(row);
  }

  private async putClient(request: Request): Promise<Response> {
    const c = await request.json<Client>();
    if (!c?.id || !c.name?.trim()) {
      return new Response("Bad request", { status: 400 });
    }
    if (!isValidSlug(c.id)) return new Response("Bad request", { status: 400 });

    let parentId: string | undefined;
    const rawParent = c.parent_client_id?.trim();
    if (rawParent) {
      const err = await this.validateClientParent(c.id, rawParent);
      if (err) return err;
      parentId = rawParent;
    }

    const row: Client = {
      id: c.id,
      name: c.name.trim(),
      ...(c.url?.trim() ? { url: c.url.trim() } : {}),
      ...(parentId ? { parent_client_id: parentId } : {}),
    };
    await this.state.storage.put(clientKey(row.id), row);
    return Response.json(row);
  }

  /** Walk upward from parentId; reject if clientId appears (would create a cycle). */
  private async validateClientParent(clientId: string, parentId: string): Promise<Response | null> {
    if (!isValidSlug(parentId)) return new Response("Invalid parent id", { status: 400 });
    if (parentId === clientId) return new Response("Parent cannot be self", { status: 400 });
    let walk: string | undefined = parentId;
    for (let depth = 0; depth < 32 && walk; depth++) {
      if (walk === clientId) return new Response("Invalid parent (cycle)", { status: 400 });
      const node: Client | undefined = await this.state.storage.get<Client>(clientKey(walk));
      if (!node) return new Response("Parent client not found", { status: 400 });
      walk = node.parent_client_id;
    }
    return null;
  }

  private async deleteMember(request: Request): Promise<Response> {
    const { id } = await request.json<{ id: string }>();
    if (!id) return new Response("Bad request", { status: 400 });
    await this.state.storage.delete(memberKey(id));
    return new Response(null, { status: 204 });
  }

  private async deleteClient(request: Request): Promise<Response> {
    const { id } = await request.json<{ id: string }>();
    if (!id) return new Response("Bad request", { status: 400 });
    await this.state.storage.delete(clientKey(id));
    return new Response(null, { status: 204 });
  }
}
