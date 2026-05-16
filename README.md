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
- `/api/index`, `/api/projects/:id`, `/api/team`, `/api/clients`
- `/:id` — HTML; `/:id.md` or `Accept: text/markdown` — markdown export
- `/admin` — browser authoring (projects + team + clients CMS)

Production URL: [`https://work.moldandyeast.com`](https://work.moldandyeast.com) (configured in `wrangler.toml`). Attach Cloudflare Access to `/admin*` and keep `DEV_BYPASS_AUTH=false` in production.

Response **security headers** (CSP, HSTS on that host, etc.) are documented in [SECURITY.md](./SECURITY.md).

Ensure DNS: Cloudflare dashboard → **Workers Routes** / custom domain setup completes after `wrangler deploy` (proxy **orange cloud** for `work.moldandyeast.com` when using zone DNS).
