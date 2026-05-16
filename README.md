# Durable Projects

Portfolio-style projects on Cloudflare Workers + Durable Objects (`ProjectDO`, `IndexDO`, `SiteDirectoryDO`). See design notes in the parent repo: `docs/superpowers/specs/2026-05-16-durable-projects-design.md`.

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
| `npm run deploy` | `wrangler deploy` |

## URLs (local defaults)

- `/` — project grid (`?tag=`, `?client=<client id>`)
- `/api/index`, `/api/projects/:id`, `/api/team`, `/api/clients`
- `/:id` — HTML; `/:id.md` or `Accept: text/markdown` — markdown export
- `/admin` — browser authoring (projects + team + clients CMS)

Production: attach Cloudflare Access to `/admin*` and set `DEV_BYPASS_AUTH=false`.

Add a `routes` entry in `wrangler.toml` when you have a custom domain.
