# Durable Projects

Portfolio-style projects on Cloudflare Workers + Durable Objects (`ProjectDO`, `IndexDO`, `SiteDirectoryDO`). This repo is safe for **public** GitHub: see [SECURITY.md](./SECURITY.md).

## Local dev

```bash
npm install
npm run dev
```

With `[env.dev.vars] DEV_BYPASS_AUTH = "true"`, `/admin` and `/admin/api/*` work without Cloudflare Access JWT.

## Commands

| Command | Purpose |
|--------|---------|
| `npm run dev` | `wrangler dev --env dev` |
| `npm test` | Vitest |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | Block accidental secrets / forbidden filenames (run before push) |
| `npm run deploy` | `wrangler deploy` |

## URLs (local defaults)

- `/` — project grid (`?tag=`, `?client=<client id>`)
- **Public API (CORS-enabled):** [`/api/docs`](https://work.moldandyeast.com/api/docs), [`/api/openapi.json`](https://work.moldandyeast.com/api/openapi.json), [`docs/API.md`](./docs/API.md)
- `/api/index` (`?tag=`, `?client=`), `/api/projects/:id`, `/api/team`, `/api/clients`
- `/:id` — HTML; `Accept: application/json` or `/api/projects/:id` — JSON; `/:id.md` — markdown export
Clients support an optional **parent client** (e.g. Mozilla with parent IDEO). Set **Parent client** in the add-client overlay; projects use **one or more primary clients** (`client_ids`, pick order preserved), plus optional **via** intermediaries (`via_client_ids`).

Production URL: [`https://work.moldandyeast.com`](https://work.moldandyeast.com) (configured in `wrangler.toml`). Authoring uses **Cloudflare Access** (not an app password). Keep `DEV_BYPASS_AUTH=false` in production `[vars]`.

### Production: Cloudflare Access (login to `/admin`)

You need a **Zero Trust** team (dashboard → **Zero Trust** — Cloudflare includes a free tier for small teams). Use the **same Cloudflare account** that owns the DNS zone for `moldandyeast.com` so `work.moldandyeast.com` is proxied and Access can sit in front of the Worker.

1. [Cloudflare dashboard](https://dash.cloudflare.com/) → **Zero Trust** → **Access controls** → **Applications**.
2. **Create new application** → **Self-hosted** → **Add public hostname**.
3. **Domain**: choose **`work.moldandyeast.com`** (must be an active hostname on Cloudflare).
4. **Path**: lock down **admin only**, not the public homepage. Per Cloudflare’s [application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/), **`/admin/*` does not include the bare `/admin`**. Add **both** **`/admin`** and **`/admin/*`** if the UI allows multiple paths on one app; otherwise create **two** Access applications with the same Allow policy (one for `/admin`, one for `/admin/*`).
5. **Access policies**: add an **Allow** rule (emails, Google, GitHub, etc.). Apps are **deny by default**.
6. Pick at least one [**identity provider**](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/), set session duration if you want, then **Create**.

Open **`https://work.moldandyeast.com/admin`** — you should get Cloudflare’s login, then the CMS. In-browser **`fetch()`** to **`/admin/api/...`** stays same-origin and keeps the Access session.

No Tunnel is required for a Worker on a Cloudflare custom domain ([self-hosted public app](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/) — tunnels are for origins that are not already routed through Cloudflare).

Cloudflare injects **`CF-Access-Jwt-Assertion`** after a successful login; the Worker checks it in `src/auth.ts`. If you still see this repo’s **403** help page, Access is not covering that URL yet (missing `/admin` vs `/admin/*`, DNS not proxied, or wrong hostname).

Ensure DNS: **Workers** custom domain / routes look correct after `wrangler deploy`, and **`work.moldandyeast.com`** is **proxied** (orange cloud) in DNS when the zone is full-setup on Cloudflare.

Response **security headers** (CSP, HSTS on that host, etc.) are documented in [SECURITY.md](./SECURITY.md).
