# Security — public repository

This codebase is intended to be **public**. The following are **not** in git and must stay that way:

| Material | Where it lives |
|----------|----------------|
| Cloudflare API token / OAuth for deploy | Your machine / CI secrets (GitHub Actions encrypted secrets, etc.) |
| Production JWTs, session secrets | N/A for this design — authoring uses **Cloudflare Access** at the edge |
| Local dev overrides | `.dev.vars` (Wrangler) — **gitignored** |
| Env files | `.env*` — **gitignored** |

## What *is* in the repo (and is OK)

- **`wrangler.toml`** — Worker name, DO bindings, **placeholder** rate-limit `namespace_id` values (`1001`–`1005`). Those IDs must match **your** Cloudflare account’s Rate Limit definitions when you deploy; they are **identifiers**, not bearer secrets. Anyone can copy them; they don’t grant access without your Cloudflare credentials.
- **`work.moldandyeast.com`** — Public site hostname by design.
- **Source code** — Routing and behaviour only.

## Runtime hardening (Worker)

| Control | Behaviour |
|---------|-----------|
| **Security headers** | `X-Content-Type-Options: nosniff`, `Referrer-Policy`, restrictive `Permissions-Policy`, **CSP** on HTML (public pages: `script-src 'none'` so injected markdown cannot run scripts; `/admin` allows inline script only for the authoring shell). |
| **HSTS** | `Strict-Transport-Security` only on **`work.moldandyeast.com`** (not on `*.workers.dev`). |
| **Admin JSON** | `Content-Type` must include **`application/json`**; body size capped (**512 KiB** project payloads, **64 KiB** team/client payloads). |
| **Public verbs** | `/`, `/api/*` document routes return **405** for non-GET where applicable. |
| **CORS** | Public APIs: `GET, HEAD, OPTIONS` only; allowed headers **`Accept, Content-Type`** (no wildcard `*`). |
| **Rate limits** | Existing Cloudflare Rate Limit bindings on read/write/API/index/WebSocket paths. |
| **Authoring** | Still relies on **Cloudflare Access** JWT + optional `DEV_BYPASS_AUTH` for local dev only. |

Trusted-author markdown may still embed **iframes** (`frame-src https:`) and remote images; it cannot execute script on public pages due to CSP.

## Operational checklist

1. Never commit `.dev.vars`, `.env`, or PEM keys — templates **`*.example`** only.
2. Run **`npm run verify`** before you push (also runs on CI via `.github/workflows/repo-hygiene.yml`).
3. Keep **`DEV_BYPASS_AUTH=false`** in production `[vars]` (already default).
4. Restrict **`/admin*`** with Cloudflare Access (and optionally service tokens for agents).
5. Rotate GitHub / Cloudflare tokens if they were ever pasted into a tracked file (not currently the case).

See **`.env.example`** for safe placeholders — copy values into **`.dev.vars`** locally (Wrangler); never commit that file.

## Reporting

If you find something sensitive accidentally committed, rotate the exposed credential and open an issue or remove it from git history (e.g. `git filter-repo`) as appropriate.
