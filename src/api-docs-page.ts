/** Public HTML API reference (also linked from admin). */
export function apiDocsPage(origin: string): string {
  const base = origin.replace(/\/$/, "");
  const oas = `${base}/api/openapi.json`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>API — Durable Projects</title>
  <style>
    :root { --fg:#1b1b1b; --muted:#5d5c5c; --line:rgba(27,27,27,.1); --accent:#3d87c4; --mono:ui-monospace,Menlo,monospace; --sans:system-ui,sans-serif; }
    @media (prefers-color-scheme:dark){ :root{ --fg:#f3f3f3; --muted:#9a9999; --line:rgba(243,243,243,.12); --accent:#82c7f5; } }
    body{ margin:0; font:400 1rem/1.55 var(--sans); color:var(--fg); background:color-mix(in srgb,var(--fg) 3%,#fff); padding:2rem clamp(1rem,4vw,2.5rem) 4rem; max-width:46rem; }
    h1{ font-size:1.65rem; letter-spacing:-.03em; margin:0 0 .35rem; }
    h2{ font-size:1.05rem; margin:2rem 0 .65rem; letter-spacing:-.02em; }
    p,li{ color:color-mix(in srgb,var(--fg) 88%,var(--muted)); }
    a{ color:var(--accent); }
    code,pre{ font-family:var(--mono); font-size:.88em; }
    pre{ overflow:auto; padding:.85rem 1rem; border:1px solid var(--line); background:color-mix(in srgb,var(--fg) 4%,transparent); margin:.65rem 0; }
    .muted{ color:var(--muted); font-size:.92rem; }
    table{ width:100%; border-collapse:collapse; font-size:.92rem; margin:.75rem 0; }
    th,td{ text-align:left; padding:.35rem .5rem; border-bottom:1px solid var(--line); vertical-align:top; }
    th{ font-family:var(--mono); font-weight:500; font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }
  </style>
</head>
<body>
  <h1>Public HTTP API</h1>
  <p class="muted">Read-only JSON on your site origin. Machine-readable spec: <a href="${oas}">openapi.json</a>.</p>

  <h2>CORS</h2>
  <p>Cross-origin browser clients may call <code>/api/*</code> and project URLs <code>/{slug}</code> (JSON or markdown via <code>Accept</code>). Responses include:</p>
  <ul>
    <li><code>Access-Control-Allow-Origin: *</code></li>
    <li><code>Access-Control-Allow-Methods: GET, HEAD, OPTIONS</code></li>
    <li><code>Access-Control-Allow-Headers: Accept, Content-Type, If-None-Match</code></li>
    <li><code>Access-Control-Expose-Headers: ETag, Cache-Control, Content-Type</code></li>
  </ul>
  <p>Send <code>OPTIONS</code> for preflight. Use <code>If-None-Match</code> with the <code>ETag</code> header on project routes for conditional GET.</p>
  <pre>fetch("${base}/api/index", { headers: { Accept: "application/json" } })</pre>

  <h2>Endpoints</h2>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Response</th></tr></thead>
    <tbody>
      <tr><td>GET</td><td><code>/api/index</code></td><td><code>{ "projects": [IndexEntry…] }</code> — optional <code>?tag=</code>, <code>?client=</code></td></tr>
      <tr><td>GET</td><td><code>/api/projects/{slug}</code></td><td><code>ProjectEnvelope</code> — 404 / 410</td></tr>
      <tr><td>GET</td><td><code>/api/team</code></td><td><code>{ "members": [TeamMember…] }</code></td></tr>
      <tr><td>GET</td><td><code>/api/clients</code></td><td><code>{ "clients": [Client…] }</code></td></tr>
      <tr><td>GET</td><td><code>/{slug}</code></td><td>HTML default; <code>Accept: application/json</code> → envelope; <code>text/markdown</code> or <code>/{slug}.md</code> → export</td></tr>
      <tr><td>GET</td><td><code>/{slug}/export.html</code></td><td>Standalone HTML download (no CORS)</td></tr>
    </tbody>
  </table>

  <h2>Slug</h2>
  <p>Eight characters, Crockford base32: <code>0-9 a-h j-k m-n p-t v-z</code> (no <code>i l o u</code>).</p>

  <h2>IndexEntry</h2>
  <p><code>id, title, summary, tags[], created_at, edited_at, total_views, client_ids?, via_client_ids?, sort_date?, preview_image?</code> — archived projects are omitted.</p>

  <h2>ProjectEnvelope</h2>
  <p>Full project: markdown <code>body</code>, resolved <code>project_clients</code>, <code>via_clients</code>, <code>team</code>, <code>gallery_images</code>, optional <code>my_role</code>, <code>why</code>, <code>project_links</code>, etc. See OpenAPI for every field.</p>

  <h2>Writes</h2>
  <p class="muted"><code>/admin/api/*</code> requires Cloudflare Access (same-origin in the browser). Not on the public CORS surface.</p>

  <h2>Rate limits</h2>
  <p class="muted"><strong>429</strong> with <code>Retry-After: 60</code> when limits apply.</p>
</body>
</html>`;
}
