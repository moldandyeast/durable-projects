# Public HTTP API

Read-only JSON for building on top of the portfolio (index, projects, team, clients). **Base URL** = your site origin (e.g. `https://work.moldandyeast.com`) — no separate API host.

| Resource | URL |
|----------|-----|
| Human docs | `GET /api/docs` |
| OpenAPI 3.1 | `GET /api/openapi.json` |
| This file | `docs/API.md` in the repo |

Admin → **API** in the header links to the same content.

---

## CORS (browser clients)

Cross-origin `fetch()` from other sites is supported on:

- `/api/*`
- `/{slug}` and `/{slug}.md` (when requesting JSON or markdown)

Every such response includes:

| Header | Value |
|--------|--------|
| `Access-Control-Allow-Origin` | `*` |
| `Access-Control-Allow-Methods` | `GET, HEAD, OPTIONS` |
| `Access-Control-Allow-Headers` | `Accept, Content-Type, If-None-Match` |
| `Access-Control-Expose-Headers` | `ETag, Cache-Control, Content-Type` |

Send **`OPTIONS`** for preflight when using non-simple headers (e.g. `If-None-Match` for conditional GET).

**Not CORS-enabled:** `/` (HTML home), `/{slug}/export.html`, WebSocket `/{slug}/live`, `/admin/*`.

### Example (browser)

```javascript
const base = "https://work.moldandyeast.com";

const index = await fetch(`${base}/api/index`, {
  headers: { Accept: "application/json" },
}).then((r) => r.json());

const project = await fetch(`${base}/api/projects/${index.projects[0].id}`, {
  headers: { Accept: "application/json" },
}).then((r) => r.json());
```

### Conditional GET

Project routes return `ETag: "<edited_at>"`. Revalidate with:

```bash
curl -sS -H 'Accept: application/json' -H 'If-None-Match: "2026-05-18T12:00:00.000Z"' \
  https://YOUR_ORIGIN/api/projects/xxxxxxxx
```

---

## Slug format

Project, team, and client ids are **8 characters**, **Crockford base32**:

- Allowed: `0-9` `a-h` `j-k` `m-n` `p-t` `v-z`
- Excluded: `i` `l` `o` `u`

Regex: `^[0-9a-hjkmnpqrstvwxyz]{8}$`

---

## Endpoints

### `GET /api/index`

List **non-archived** projects (includes **unlisted** — hidden from the public home page only). Sorted by `sort_date` then `edited_at` (newest first).

**Query (optional):**

| Param | Description |
|-------|-------------|
| `tag` | Exact tag match, case-insensitive |
| `client` | Client id — matches primary `client_ids` or `via_client_ids` |

**Response:** `{ "projects": IndexEntry[] }`

**Cache:** `public, s-maxage=60, stale-while-revalidate=30`

```bash
curl -sS "https://YOUR_ORIGIN/api/index"
curl -sS "https://YOUR_ORIGIN/api/index?tag=Strategy&client=abc12345"
```

### `GET /api/projects/{slug}`

Full **ProjectEnvelope** (markdown `body`, resolved clients/team, gallery, links, etc.).

| Status | Meaning |
|--------|---------|
| 200 | OK |
| 404 | Unknown slug |
| 410 | Archived / deleted |
| 429 | Rate limited (`Retry-After: 60`) |

**Headers:** `ETag`, `Vary: Accept`, `Cache-Control: public, s-maxage=300`

### `GET /api/team`

`{ "members": TeamMember[] }`

### `GET /api/clients`

`{ "clients": Client[] }`

Clients may include `parent_client_id` (rollup org, e.g. studio under holding company).

### `GET /{slug}` (content negotiation)

| Request | Response |
|---------|----------|
| Default / `Accept: text/html` | Project HTML page (CORS headers still sent) |
| `Accept: application/json` | Same as `/api/projects/{slug}` |
| `Accept: text/markdown` or `GET /{slug}.md` | YAML front matter + markdown body |

### `GET /{slug}/export.html`

Standalone HTML download (attachment). **No CORS** — use server-side fetch or same-origin.

### `GET /{slug}/live` (WebSocket)

`Upgrade: websocket` — live view counter channel. Not part of the JSON CORS surface.

---

## Types (summary)

### IndexEntry

```json
{
  "id": "abc12345",
  "title": "…",
  "summary": "…",
  "tags": ["Strategy", "Design"],
  "created_at": "2026-01-01T00:00:00.000Z",
  "edited_at": "2026-05-18T12:00:00.000Z",
  "total_views": 42,
  "client_ids": ["…"],
  "via_client_ids": ["…"],
  "sort_date": "2026-05-01",
  "preview_image": "https://…"
}
```

**Archived** (`hidden: true`) projects are omitted everywhere public. **Unlisted** (`unlisted: true`) projects are omitted from the HTML home page only but remain in this API and at `/{slug}`.

### ProjectEnvelope

All index fields plus:

- `body` — raw markdown
- `views` — view count (`total_views` on storage)
- `viewers` — always `0` on read API
- `project_clients` — `[{ client, parent_client? }, …]` resolved primaries
- `via_clients` — resolved intermediaries
- `team` — resolved collaborators (roles may come from `team_member_roles`)
- `gallery_images` — `{ url, caption?, alt? }[]`
- `project_links` — `{ label, url }[]`
- `my_role`, `why`, `preview_image` — optional strings

Deprecated but still present for older clients: `client_id`, `client`, `parent_client` (first primary only).

### TeamMember

`{ id, name, role?, url? }`

### Client

`{ id, name, url?, parent_client_id? }`

Full field list and schemas: **`GET /api/openapi.json`**.

---

## Authenticated authoring API

**Not public.** Requires **Cloudflare Access** (or `DEV_BYPASS_AUTH=true` locally).

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/api/projects` | List non-archived projects (editor) |
| POST | `/admin/api/projects` | Create project |
| GET/PUT/DELETE | `/admin/api/projects/{slug}` | Read / update / archive |
| POST | `/admin/api/preview` | `{ "body": "…" }` → `{ "html": "…" }` |
| GET/POST | `/admin/api/team/members` | Directory |
| PUT/DELETE | `/admin/api/team/members/{id}` | Update / remove |
| GET/POST | `/admin/api/clients` | Directory |
| PUT/DELETE | `/admin/api/clients/{id}` | Update / remove |

Bodies must be `Content-Type: application/json`. No CORS — call from the admin origin or server-side with an Access service token.

---

## Rate limits

Cloudflare Rate Limit bindings apply per IP. On limit:

- **429** `Rate limit exceeded`
- **Retry-After:** `60`

---

## Building on top

1. **Index + cards:** `GET /api/index` (+ optional filters), join `GET /api/clients` for names.
2. **Project detail app:** `GET /api/projects/{slug}` or cross-origin `GET /{slug}` with `Accept: application/json`.
3. **Static site generator:** Same endpoints from CI (no CORS needed server-side).
4. **OpenAPI codegen:** Point your tool at `/api/openapi.json`.
