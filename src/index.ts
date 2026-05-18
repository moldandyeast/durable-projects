import type {
  Client,
  Env,
  IndexEntry,
  ProjectClientRef,
  ProjectData,
  ProjectEnvelope,
  TeamMember,
} from "./types";
import { canAuthor, forbidden } from "./auth";
import { generateSlug, isValidSlug } from "./slug";
import { BodyTooLargeError, readBoundedText, readJsonBody } from "./request-body";
import { applySecurityHeaders } from "./security-headers";
import { PROJECT_RUNTIME_JS } from "./project-runtime-bundled";
import { adminTemplate } from "./views/admin";
import { homePage, sortEntries } from "./views/home";
import { projectPublicPage } from "./views/project-public";
import { renderMarkdown } from "./markdown";
import { normalizeClientIds, normalizeViaClientIds } from "./project-do";

export { ProjectDO } from "./project-do";
export { IndexDO } from "./index-do";
export { SiteDirectoryDO } from "./site-directory-do";

const PROJECT_URL_RE = /^\/([0-9a-hjkmnpqrstvwxyz]{8})(\.md)?$/;
const API_PROJECT_RE = /^\/api\/projects\/([0-9a-hjkmnpqrstvwxyz]{8})$/;
const ADMIN_API_PROJECT_RE = /^\/admin\/api\/projects\/([0-9a-hjkmnpqrstvwxyz]{8})$/;

/** Max JSON body for create/update project (markdown + gallery). */
const MAX_PROJECT_PAYLOAD = 512 * 1024;
/** Max JSON for team/client admin payloads. */
const MAX_ADMIN_ENTITY_JSON = 64 * 1024;
/** Max JSON for POST /admin/api/preview ({ body: markdown }). */
const MAX_PREVIEW_JSON = 512 * 1024;

function isPublicApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function corsPreflightPublicApi(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
      "Access-Control-Max-Age": "86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function withPublicApiCors(pathname: string, response: Response): Response {
  if (!isPublicApiPath(pathname)) return response;
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Accept, Content-Type");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Authoring APIs expect JSON bodies. */
function requireJsonContentType(request: Request): Response | null {
  const ct = request.headers.get("Content-Type") ?? "";
  if (!ct.toLowerCase().includes("application/json")) {
    return new Response("Content-Type must be application/json", {
      status: 415,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return null;
}

async function allow(limit: Env["READ_LIMIT"], key: string): Promise<boolean> {
  if (!limit) return true;
  try {
    const res = await limit.limit({ key });
    return res.success;
  } catch {
    return true;
  }
}

function rateLimited(): Response {
  return new Response("Rate limit exceeded", {
    status: 429,
    headers: { "Retry-After": "60" },
  });
}

function projectStub(env: Env, id: string): DurableObjectStub {
  return env.PROJECT_DO.get(env.PROJECT_DO.idFromName(id));
}

function indexStub(env: Env): DurableObjectStub {
  return env.INDEX_DO.get(env.INDEX_DO.idFromName("singleton"));
}

function siteStub(env: Env): DurableObjectStub {
  return env.SITE_DIRECTORY_DO.get(env.SITE_DIRECTORY_DO.idFromName("site"));
}

async function projectExists(env: Env, id: string): Promise<boolean> {
  const res = await indexStub(env).fetch("https://idx/internal/has", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
  if (!res.ok) return false;
  const { exists } = await res.json<{ exists: boolean }>();
  return exists;
}

async function fetchProjectGet(env: Env, id: string): Promise<ProjectData | null> {
  const res = await projectStub(env, id).fetch("https://p/internal/get");
  if (res.status === 410) return null;
  if (!res.ok) return null;
  return res.json<ProjectData>();
}

async function peekProject(env: Env, id: string): Promise<ProjectData | null> {
  const res = await projectStub(env, id).fetch("https://p/internal/peek");
  if (res.status === 410) return null;
  if (!res.ok) return null;
  return res.json<ProjectData>();
}

async function resolveTeam(env: Env, ids: string[]): Promise<TeamMember[]> {
  if (!ids.length) return [];
  const res = await siteStub(env).fetch("https://site/internal/members/get-batch", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) return [];
  const { members } = await res.json<{ members: TeamMember[] }>();
  return members;
}

/** Directory roles merged with optional per-project overrides (`team_member_roles`). */
function mergeProjectTeamRoles(team: TeamMember[], roles: Record<string, string> | undefined): TeamMember[] {
  if (!roles || !Object.keys(roles).length) return team;
  return team.map((m) => {
    const o = roles[m.id]?.trim();
    if (!o) return m;
    return { ...m, role: o };
  });
}

async function resolveClient(env: Env, id: string | undefined): Promise<Client | undefined> {
  if (!id?.trim()) return undefined;
  const res = await siteStub(env).fetch("https://site/internal/clients/get-batch", {
    method: "POST",
    body: JSON.stringify({ ids: [id.trim()] }),
  });
  if (!res.ok) return undefined;
  const { clients } = await res.json<{ clients: Client[] }>();
  return clients[0];
}

async function resolveClientLineage(
  env: Env,
  clientId: string | undefined,
): Promise<{ client?: Client; parent?: Client }> {
  const client = await resolveClient(env, clientId);
  if (!client) return {};
  if (!client.parent_client_id) return { client };
  const parent = await resolveClient(env, client.parent_client_id);
  return { client, ...(parent ? { parent } : {}) };
}

async function resolveClientsInOrder(env: Env, ids: string[]): Promise<Client[]> {
  if (!ids.length) return [];
  const res = await siteStub(env).fetch("https://site/internal/clients/get-batch", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) return [];
  const { clients } = await res.json<{ clients: Client[] }>();
  const map = new Map(clients.map((c) => [c.id, c]));
  const out: Client[] = [];
  for (const id of ids) {
    const c = map.get(id);
    if (c) out.push(c);
  }
  return out;
}

function effectiveProjectClientIds(p: ProjectData): string[] {
  if (p.client_ids?.length) return normalizeClientIds(p.client_ids);
  if (p.client_id) return [p.client_id];
  return [];
}

function effectiveEntryClientIds(e: IndexEntry): string[] {
  if (e.client_ids?.length) return e.client_ids;
  if (e.client_id) return [e.client_id];
  return [];
}

async function resolveProjectPrimaryRefs(env: Env, ids: string[]): Promise<ProjectClientRef[]> {
  const out: ProjectClientRef[] = [];
  for (const id of ids) {
    const { client, parent } = await resolveClientLineage(env, id);
    if (client) out.push({ client, ...(parent ? { parent_client: parent } : {}) });
  }
  return out;
}

function trimPrimaryClient(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s === "" ? undefined : s;
}

function indexRowFromProject(p: ProjectData): IndexEntry {
  return {
    id: p.id,
    title: p.title,
    summary: p.summary,
    tags: p.tags,
    created_at: p.created_at,
    edited_at: p.edited_at,
    total_views: p.total_views,
    hidden: p.hidden,
    client_ids: effectiveProjectClientIds(p),
    via_client_ids: p.via_client_ids ?? [],
    sort_date: p.sort_date,
    preview_image: p.preview_image,
  };
}

async function toEnvelope(data: ProjectData, team: TeamMember[], env: Env): Promise<ProjectEnvelope> {
  const primaryIds = effectiveProjectClientIds(data);
  const refs = await resolveProjectPrimaryRefs(env, primaryIds);
  const viaIds = data.via_client_ids ?? [];
  const viaClients = await resolveClientsInOrder(env, viaIds);
  const first = refs[0];
  const mergedTeam = mergeProjectTeamRoles(team, data.team_member_roles);
  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    tags: data.tags,
    body: data.body,
    created_at: data.created_at,
    edited_at: data.edited_at,
    views: data.total_views,
    viewers: 0,
    ...(primaryIds.length ? { client_ids: primaryIds } : {}),
    ...(first ? { client_id: first.client.id, client: first.client } : {}),
    ...(first?.parent_client ? { parent_client: first.parent_client } : {}),
    ...(refs.length ? { project_clients: refs } : {}),
    ...(viaIds.length ? { via_client_ids: viaIds } : {}),
    ...(viaClients.length ? { via_clients: viaClients } : {}),
    sort_date: data.sort_date,
    gallery_images: data.gallery_images,
    ...(data.project_links?.length ? { project_links: data.project_links } : {}),
    preview_image: data.preview_image,
    team_member_ids: data.team_member_ids,
    ...(data.team_member_roles && Object.keys(data.team_member_roles).length ?
      { team_member_roles: data.team_member_roles }
    : {}),
    ...(mergedTeam.length ? { team: mergedTeam } : {}),
  };
}

function tagMatches(entry: IndexEntry, tag: string): boolean {
  const t = tag.trim().toLowerCase();
  return entry.tags.some((x) => x.toLowerCase() === t);
}

function entryMatchesClient(entry: IndexEntry, clientFilter: string): boolean {
  if (effectiveEntryClientIds(entry).includes(clientFilter)) return true;
  return (entry.via_client_ids ?? []).includes(clientFilter);
}

function methodNotAllowed(allow: string): Response {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: allow },
  });
}

async function dispatchRequest(request: Request, env: Env, url: URL): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "anon";

  if (url.pathname === "/project-runtime.js") {
    if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed("GET, HEAD");
    return new Response(PROJECT_RUNTIME_JS, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  if (url.pathname === "/" && request.method !== "GET") {
    return methodNotAllowed("GET");
  }

  if (
    ["/api/index", "/api/team", "/api/clients"].includes(url.pathname) &&
    request.method !== "GET"
  ) {
    return methodNotAllowed("GET");
  }

  const pubApiProjEarly = url.pathname.match(API_PROJECT_RE);
  if (pubApiProjEarly && request.method !== "GET") {
    return methodNotAllowed("GET");
  }

  const pubProjEarly = url.pathname.match(PROJECT_URL_RE);
  if (pubProjEarly && request.method !== "GET") {
    return methodNotAllowed("GET");
  }

  if (url.pathname === "/admin" && request.method === "GET") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return new Response(adminTemplate(), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (url.pathname === "/admin/api/projects" && request.method === "GET") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    const res = await indexStub(env).fetch("https://idx/internal/list-all");
    return new Response(await res.text(), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (url.pathname === "/admin/api/preview" && request.method === "POST") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return adminPreviewMarkdown(request);
  }

  if (url.pathname === "/admin/api/projects" && request.method === "POST") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return createProject(request, env);
  }

  const adminProj = url.pathname.match(ADMIN_API_PROJECT_RE);
  if (adminProj && ["GET", "PUT", "DELETE"].includes(request.method)) {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    const id = adminProj[1];
    if (request.method === "GET") return adminGetProject(id, env);
    if (request.method === "PUT") return updateProject(id, request, env);
    return deleteProject(id, env);
  }

  if (url.pathname === "/admin/api/team/members" && request.method === "GET") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return siteStub(env).fetch("https://site/internal/members/list");
  }

  if (url.pathname === "/admin/api/team/members" && request.method === "POST") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return adminCreateMember(request, env);
  }

  const adminTeamId = url.pathname.match(/^\/admin\/api\/team\/members\/([0-9a-hjkmnpqrstvwxyz]{8})$/);
  if (adminTeamId && request.method === "PUT") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return adminPutMember(adminTeamId[1], request, env);
  }
  if (adminTeamId && request.method === "DELETE") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return siteStub(env).fetch("https://site/internal/members/delete", {
      method: "POST",
      body: JSON.stringify({ id: adminTeamId[1] }),
    });
  }

  if (url.pathname === "/admin/api/clients" && request.method === "GET") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return siteStub(env).fetch("https://site/internal/clients/list");
  }

  if (url.pathname === "/admin/api/clients" && request.method === "POST") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return adminCreateClient(request, env);
  }

  const adminClientId = url.pathname.match(/^\/admin\/api\/clients\/([0-9a-hjkmnpqrstvwxyz]{8})$/);
  if (adminClientId && request.method === "PUT") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return adminPutClient(adminClientId[1], request, env);
  }
  if (adminClientId && request.method === "DELETE") {
    if (!(await allow(env.WRITE_LIMIT, ip))) return rateLimited();
    if (!canAuthor(request, env)) return forbidden(request, url);
    return siteStub(env).fetch("https://site/internal/clients/delete", {
      method: "POST",
      body: JSON.stringify({ id: adminClientId[1] }),
    });
  }

  if (url.pathname.startsWith("/admin/")) {
    return new Response("Not found", { status: 404 });
  }

  if (url.pathname === "/api/projects" && request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiMatch = url.pathname.match(API_PROJECT_RE);
  if (apiMatch && request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (url.pathname.endsWith("/live")) {
    const m = url.pathname.match(/^\/([0-9a-hjkmnpqrstvwxyz]{8})\/live$/);
    if (m && request.headers.get("Upgrade") === "websocket") {
      if (!(await allow(env.WS_LIMIT, ip))) return rateLimited();
      return projectStub(env, m[1]).fetch("https://p/internal/live", request);
    }
  }

  if (url.pathname === "/" && request.method === "GET") {
    if (!(await allow(env.INDEX_LIMIT, ip))) return rateLimited();
    return home(env, url);
  }

  if (url.pathname === "/api/index" && request.method === "GET") {
    if (!(await allow(env.API_LIMIT, ip))) return rateLimited();
    const res = await indexStub(env).fetch("https://idx/internal/list");
    return new Response(await res.text(), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  }

  if (url.pathname === "/api/team" && request.method === "GET") {
    if (!(await allow(env.API_LIMIT, ip))) return rateLimited();
    return siteStub(env).fetch("https://site/internal/members/list");
  }

  if (url.pathname === "/api/clients" && request.method === "GET") {
    if (!(await allow(env.API_LIMIT, ip))) return rateLimited();
    return siteStub(env).fetch("https://site/internal/clients/list");
  }

  if (apiMatch && request.method === "GET") {
    if (!(await allow(env.API_LIMIT, ip))) return rateLimited();
    return apiGetProject(apiMatch[1], env);
  }

  const postMatch = url.pathname.match(PROJECT_URL_RE);
  if (postMatch && request.method === "GET") {
    if (!(await allow(env.READ_LIMIT, ip))) return rateLimited();
    return getProjectHtml(postMatch[1], !!postMatch[2], request, env);
  }

  return new Response("Not found", { status: 404 });
}

async function home(env: Env, url: URL): Promise<Response> {
  const res = await indexStub(env).fetch("https://idx/internal/list");
  const { projects } = await res.json<{ projects: IndexEntry[] }>();
  let filtered = projects;
  const tag = url.searchParams.get("tag")?.trim();
  if (tag) filtered = filtered.filter((p) => tagMatches(p, tag));
  const clientFilter = url.searchParams.get("client")?.trim();
  if (clientFilter) filtered = filtered.filter((p) => entryMatchesClient(p, clientFilter));

  const sorted = sortEntries(filtered);
  const ids = [
    ...new Set(
      sorted.flatMap((p) => [...effectiveEntryClientIds(p), ...(p.via_client_ids ?? [])]),
    ),
  ] as string[];
  const labels = new Map<string, string>();
  if (ids.length) {
    const cr = await siteStub(env).fetch("https://site/internal/clients/get-batch", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
    if (cr.ok) {
      const { clients } = await cr.json<{ clients: Client[] }>();
      for (const c of clients) labels.set(c.id, c.name);
    }
  }

  const html = homePage(sorted, labels);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}

async function apiGetProject(id: string, env: Env): Promise<Response> {
  if (!isValidSlug(id)) return new Response("Not found", { status: 404 });
  if (!(await projectExists(env, id))) return new Response("Not found", { status: 404 });
  const data = await fetchProjectGet(env, id);
  if (!data) return new Response("Gone", { status: 410 });
  const team = await resolveTeam(env, data.team_member_ids);
  const etag = `"${data.edited_at}"`;
  return Response.json(await toEnvelope(data, team, env), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      ETag: etag,
    },
  });
}

async function getProjectHtml(id: string, asMarkdown: boolean, request: Request, env: Env): Promise<Response> {
  if (!isValidSlug(id)) return new Response("Not found", { status: 404 });
  if (!(await projectExists(env, id))) return new Response("Not found", { status: 404 });

  const project = await fetchProjectGet(env, id);
  if (!project) return new Response("Gone", { status: 410 });

  const accept = request.headers.get("Accept") ?? "";
  const etag = `"${project.edited_at}"`;
  const baseHeaders: Record<string, string> = {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    ETag: etag,
  };

  if (asMarkdown || accept.includes("text/markdown")) {
    const lines = [
      "---",
      `title: ${JSON.stringify(project.title)}`,
      `summary: ${JSON.stringify(project.summary)}`,
      `created_at: ${project.created_at}`,
      `edited_at: ${project.edited_at}`,
      `tags: ${JSON.stringify(project.tags)}`,
      ...(effectiveProjectClientIds(project).length ?
        [`client_ids: ${JSON.stringify(effectiveProjectClientIds(project))}`]
      : []),
      ...(project.via_client_ids?.length ?
        [`via_client_ids: ${JSON.stringify(project.via_client_ids)}`]
      : []),
      ...(project.sort_date ? [`sort_date: ${JSON.stringify(project.sort_date)}`] : []),
      ...(project.preview_image ? [`preview_image: ${JSON.stringify(project.preview_image)}`] : []),
      `gallery_images: ${JSON.stringify(project.gallery_images)}`,
      ...(project.project_links?.length ?
        [`project_links: ${JSON.stringify(project.project_links)}`]
      : []),
      `team_member_ids: ${JSON.stringify(project.team_member_ids)}`,
      ...(project.team_member_roles && Object.keys(project.team_member_roles).length ?
        [`team_member_roles: ${JSON.stringify(project.team_member_roles)}`]
      : []),
      "---",
      "",
      project.body,
    ];
    return new Response(lines.join("\n"), {
      headers: { ...baseHeaders, "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  if (accept.includes("application/json")) {
    const team = await resolveTeam(env, project.team_member_ids);
    return Response.json(await toEnvelope(project, team, env), { headers: baseHeaders });
  }

  const team = mergeProjectTeamRoles(
    await resolveTeam(env, project.team_member_ids),
    project.team_member_roles,
  );
  const primaryRefs = await resolveProjectPrimaryRefs(env, effectiveProjectClientIds(project));
  const viaClients = await resolveClientsInOrder(env, project.via_client_ids ?? []);
  const html = projectPublicPage(project, team, primaryRefs, viaClients);
  return new Response(html, {
    headers: { ...baseHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
}

async function createProject(request: Request, env: Env): Promise<Response> {
  const rej = requireJsonContentType(request);
  if (rej) return rej;

  let input: Partial<ProjectData> & { title?: string; summary?: string; tags?: string[]; body?: string };
  try {
    input = (await readJsonBody(request, MAX_PROJECT_PAYLOAD)) as typeof input;
  } catch (e) {
    if (e instanceof BodyTooLargeError) {
      return new Response("Payload too large", { status: 413 });
    }
    if (e instanceof SyntaxError) {
      return new Response("Invalid JSON", { status: 400 });
    }
    throw e;
  }

  let id = "";
  for (let attempt = 0; attempt < 24; attempt++) {
    const cand = generateSlug();
    if (!(await projectExists(env, cand))) {
      id = cand;
      break;
    }
  }
  if (!id) return new Response("Could not allocate id", { status: 500 });

  const primaryIds = normalizeClientIds(
    Array.isArray(input.client_ids) && input.client_ids.length ?
      input.client_ids
    : input.client_id ? [input.client_id] : [],
  );
  const viaNorm = normalizeViaClientIds(input.via_client_ids, primaryIds);
  const badClients = await validateProjectClients(env, primaryIds, viaNorm);
  if (badClients) return badClients;

  const createRes = await projectStub(env, id).fetch("https://p/internal/create", {
    method: "POST",
    body: JSON.stringify({
      id,
      title: input.title,
      summary: input.summary,
      tags: input.tags,
      body: input.body,
      created_at: input.created_at,
      client_ids: input.client_ids,
      client_id: input.client_id,
      via_client_ids: input.via_client_ids,
      sort_date: input.sort_date,
      gallery_images: input.gallery_images,
      preview_image: input.preview_image,
      team_member_ids: input.team_member_ids,
      team_member_roles: input.team_member_roles,
      project_links: input.project_links,
    }),
  });

  if (!createRes.ok) {
    const t = await createRes.text();
    return new Response(t || "Create failed", { status: createRes.status });
  }

  const created = await createRes.json<ProjectData>();
  const idxRes = await indexStub(env).fetch("https://idx/internal/register", {
    method: "POST",
    body: JSON.stringify(indexRowFromProject(created)),
  });
  if (!idxRes.ok) return new Response("Index register failed", { status: 500 });

  return Response.json(created, { status: 201 });
}

async function adminPreviewMarkdown(request: Request): Promise<Response> {
  const rej = requireJsonContentType(request);
  if (rej) return rej;

  let parsed: unknown;
  try {
    parsed = await readJsonBody(request, MAX_PREVIEW_JSON);
  } catch (e) {
    if (e instanceof BodyTooLargeError) return new Response("Payload too large", { status: 413 });
    if (e instanceof SyntaxError) return new Response("Invalid JSON", { status: 400 });
    throw e;
  }

  const body =
    parsed &&
    typeof parsed === "object" &&
    "body" in parsed &&
    typeof (parsed as { body: unknown }).body === "string"
      ? (parsed as { body: string }).body
      : "";

  const html = await renderMarkdown(body);
  return new Response(JSON.stringify({ html }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function adminGetProject(id: string, env: Env): Promise<Response> {
  if (!isValidSlug(id)) return new Response("Not found", { status: 404 });
  const data = await peekProject(env, id);
  if (!data) return new Response("Not found", { status: 404 });
  return Response.json(data);
}

async function updateProject(id: string, request: Request, env: Env): Promise<Response> {
  if (!isValidSlug(id)) return new Response("Not found", { status: 404 });

  const rej = requireJsonContentType(request);
  if (rej) return rej;

  let body: string;
  try {
    body = await readBoundedText(request, MAX_PROJECT_PAYLOAD);
    if (body.trim()) JSON.parse(body);
  } catch (e) {
    if (e instanceof BodyTooLargeError) {
      return new Response("Payload too large", { status: 413 });
    }
    if (e instanceof SyntaxError) {
      return new Response("Invalid JSON", { status: 400 });
    }
    throw e;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const peek = await peekProject(env, id);
  if (!peek) return new Response("Not found", { status: 404 });

  let nextPrimaries = effectiveProjectClientIds(peek);
  if ("client_ids" in parsed) {
    nextPrimaries = normalizeClientIds(parsed.client_ids);
  } else if ("client_id" in parsed) {
    const c = trimPrimaryClient(parsed.client_id);
    nextPrimaries = c ? [c] : [];
  }
  let viaRaw: unknown = peek.via_client_ids;
  if ("via_client_ids" in parsed) viaRaw = parsed.via_client_ids;
  const viaNorm = normalizeViaClientIds(viaRaw, nextPrimaries);
  const badClients = await validateProjectClients(env, nextPrimaries, viaNorm);
  if (badClients) return badClients;

  const upd = await projectStub(env, id).fetch("https://p/internal/update", {
    method: "POST",
    body,
  });
  if (!upd.ok) return new Response(await upd.text(), { status: upd.status });

  const data = await peekProject(env, id);
  if (!data) return new Response("Not found", { status: 404 });

  await indexStub(env).fetch("https://idx/internal/update", {
    method: "POST",
    body: JSON.stringify(indexRowFromProject(data)),
  });

  return Response.json(data);
}

async function deleteProject(id: string, env: Env): Promise<Response> {
  if (!isValidSlug(id)) return new Response("Not found", { status: 404 });
  const delRes = await projectStub(env, id).fetch("https://p/internal/delete", { method: "POST" });
  if (!delRes.ok) return new Response("Delete failed", { status: 500 });

  const idxRes = await indexStub(env).fetch("https://idx/internal/update", {
    method: "POST",
    body: JSON.stringify({ id, hidden: true }),
  });
  if (!idxRes.ok) return new Response("Index update failed", { status: 500 });

  return new Response(null, { status: 204 });
}

async function collectUsedMemberIds(env: Env): Promise<Set<string>> {
  const res = await siteStub(env).fetch("https://site/internal/members/list");
  const { members } = await res.json<{ members: TeamMember[] }>();
  return new Set(members.map((m) => m.id));
}

async function collectUsedClientIds(env: Env): Promise<Set<string>> {
  const res = await siteStub(env).fetch("https://site/internal/clients/list");
  const { clients } = await res.json<{ clients: Client[] }>();
  return new Set(clients.map((c) => c.id));
}

async function validateProjectClients(
  env: Env,
  primaryIds: string[],
  viaNormalized: string[],
): Promise<Response | null> {
  const allowed = await collectUsedClientIds(env);
  for (const pid of primaryIds) {
    if (!allowed.has(pid)) {
      return new Response(`Unknown client_ids entry: ${pid}`, { status: 400 });
    }
  }
  for (const v of viaNormalized) {
    if (!allowed.has(v)) {
      return new Response(`Unknown via_client_ids entry: ${v}`, { status: 400 });
    }
  }
  return null;
}

async function adminCreateMember(request: Request, env: Env): Promise<Response> {
  const rej = requireJsonContentType(request);
  if (rej) return rej;

  let body: { name?: string; role?: string; url?: string };
  try {
    body = (await readJsonBody(request, MAX_ADMIN_ENTITY_JSON)) as typeof body;
  } catch (e) {
    if (e instanceof BodyTooLargeError) return new Response("Payload too large", { status: 413 });
    if (e instanceof SyntaxError) return new Response("Invalid JSON", { status: 400 });
    throw e;
  }

  if (!body.name?.trim()) return new Response("Bad request", { status: 400 });
  const used = await collectUsedMemberIds(env);
  let id = "";
  for (let i = 0; i < 30; i++) {
    const c = generateSlug();
    if (!used.has(c)) {
      id = c;
      break;
    }
  }
  if (!id) return new Response("Could not allocate id", { status: 500 });

  return siteStub(env).fetch("https://site/internal/members/put", {
    method: "POST",
    body: JSON.stringify({
      id,
      name: body.name.trim(),
      ...(body.role?.trim() ? { role: body.role.trim() } : {}),
      ...(body.url?.trim() ? { url: body.url.trim() } : {}),
    }),
  });
}

async function adminPutMember(id: string, request: Request, env: Env): Promise<Response> {
  const rej = requireJsonContentType(request);
  if (rej) return rej;

  let body: { name?: string; role?: string; url?: string };
  try {
    body = (await readJsonBody(request, MAX_ADMIN_ENTITY_JSON)) as typeof body;
  } catch (e) {
    if (e instanceof BodyTooLargeError) return new Response("Payload too large", { status: 413 });
    if (e instanceof SyntaxError) return new Response("Invalid JSON", { status: 400 });
    throw e;
  }

  const batch = await siteStub(env).fetch("https://site/internal/members/get-batch", {
    method: "POST",
    body: JSON.stringify({ ids: [id] }),
  });
  const { members } = await batch.json<{ members: TeamMember[] }>();
  const existing = members[0];
  if (!existing) return new Response("Not found", { status: 404 });

  const name = body.name?.trim() ?? existing.name;
  const role = body.role !== undefined ? body.role.trim() || undefined : existing.role;
  const url = body.url !== undefined ? body.url.trim() || undefined : existing.url;

  return siteStub(env).fetch("https://site/internal/members/put", {
    method: "POST",
    body: JSON.stringify({
      id,
      name,
      ...(role ? { role } : {}),
      ...(url ? { url } : {}),
    }),
  });
}

async function adminCreateClient(request: Request, env: Env): Promise<Response> {
  const rej = requireJsonContentType(request);
  if (rej) return rej;

  let body: { name?: string; url?: string; parent_client_id?: string };
  try {
    body = (await readJsonBody(request, MAX_ADMIN_ENTITY_JSON)) as typeof body;
  } catch (e) {
    if (e instanceof BodyTooLargeError) return new Response("Payload too large", { status: 413 });
    if (e instanceof SyntaxError) return new Response("Invalid JSON", { status: 400 });
    throw e;
  }

  if (!body.name?.trim()) return new Response("Bad request", { status: 400 });
  const used = await collectUsedClientIds(env);
  let id = "";
  for (let i = 0; i < 30; i++) {
    const c = generateSlug();
    if (!used.has(c)) {
      id = c;
      break;
    }
  }
  if (!id) return new Response("Could not allocate id", { status: 500 });

  const parentRaw = body.parent_client_id?.trim();

  return siteStub(env).fetch("https://site/internal/clients/put", {
    method: "POST",
    body: JSON.stringify({
      id,
      name: body.name.trim(),
      ...(body.url?.trim() ? { url: body.url.trim() } : {}),
      ...(parentRaw ? { parent_client_id: parentRaw } : {}),
    }),
  });
}

async function adminPutClient(id: string, request: Request, env: Env): Promise<Response> {
  const rej = requireJsonContentType(request);
  if (rej) return rej;

  let body: { name?: string; url?: string; parent_client_id?: string };
  try {
    body = (await readJsonBody(request, MAX_ADMIN_ENTITY_JSON)) as typeof body;
  } catch (e) {
    if (e instanceof BodyTooLargeError) return new Response("Payload too large", { status: 413 });
    if (e instanceof SyntaxError) return new Response("Invalid JSON", { status: 400 });
    throw e;
  }

  const batch = await siteStub(env).fetch("https://site/internal/clients/get-batch", {
    method: "POST",
    body: JSON.stringify({ ids: [id] }),
  });
  const { clients } = await batch.json<{ clients: Client[] }>();
  const existing = clients[0];
  if (!existing) return new Response("Not found", { status: 404 });

  const name = body.name?.trim() ?? existing.name;
  const url = body.url !== undefined ? body.url.trim() || undefined : existing.url;
  let parent_client_id: string | undefined;
  if (body.parent_client_id !== undefined) {
    parent_client_id = body.parent_client_id.trim() || undefined;
  } else {
    parent_client_id = existing.parent_client_id;
  }

  return siteStub(env).fetch("https://site/internal/clients/put", {
    method: "POST",
    body: JSON.stringify({
      id,
      name,
      ...(url ? { url } : {}),
      ...(parent_client_id ? { parent_client_id } : {}),
    }),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS" && isPublicApiPath(url.pathname)) {
      return applySecurityHeaders(corsPreflightPublicApi(), request);
    }
    const response = await dispatchRequest(request, env, url);
    const corsed = withPublicApiCors(url.pathname, response);
    const adminHtml =
      url.pathname === "/admin" &&
      corsed.status === 200 &&
      (corsed.headers.get("Content-Type") ?? "").includes("text/html");
    return applySecurityHeaders(corsed, request, { adminHtml });
  },
};
