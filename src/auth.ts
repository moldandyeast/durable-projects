import type { Env } from "./types";

/** Defense-in-depth for authoring routes (Cloudflare Access is primary). */
export function canAuthor(request: Request, env: Env): boolean {
  if (env.DEV_BYPASS_AUTH === "true") return true;
  return Boolean(request.headers.get("CF-Access-Jwt-Assertion"));
}

/**
 * 403 for authoring routes — HTML hint on GET /admin, JSON on /admin/api/*.
 * Cloudflare Access injects `CF-Access-Jwt-Assertion` after the user signs in at the edge.
 */
export function forbidden(request: Request, url: URL): Response {
  const pathname = url.pathname;
  const method = request.method;

  if (pathname === "/admin" && method === "GET") {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="light dark"/>
  <title>Admin — sign in</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    h1 { font-size: 1.25rem; }
    code { font-size: 0.9em; }
    ol { padding-left: 1.25rem; }
    a { color: #1e4fd6; }
    @media (prefers-color-scheme: dark) {
      body { background: #141413; color: #eceae6; }
      a { color: #6e9fff; }
    }
  </style>
</head>
<body>
  <h1>Admin requires authentication</h1>
  <p>This Worker does not implement its own password login. In production, sign in through <strong>Cloudflare Access</strong>
     on <code>${escapeAttr(url.hostname)}</code> for paths under <code>/admin</code>. After you authenticate, Cloudflare adds
     <code>CF-Access-Jwt-Assertion</code> and this app will load.</p>
  <h2>Fix checklist</h2>
  <ol>
    <li>Zero Trust → <strong>Access controls</strong> → Applications → Create → Self-hosted → Add public hostname.</li>
    <li>Hostname <code>work.moldandyeast.com</code> (or yours): protect paths <strong><code>/admin</code></strong> and <strong><code>/admin/*</code></strong> (both — <code>/admin/*</code> alone does not include <code>/admin</code>).</li>
    <li>Add an <strong>Allow</strong> Access policy (email / Google / GitHub, etc.).</li>
    <li>Confirm DNS for the hostname is proxied (orange cloud) through Cloudflare.</li>
    <li>Keep <code>DEV_BYPASS_AUTH=false</code> in production Worker vars.</li>
  </ol>
  <p><strong>Local dev:</strong> run <code>npm run dev</code> (<code>wrangler dev --env dev</code>) so <code>DEV_BYPASS_AUTH=true</code>, or use a dev tunnel with Access.</p>
  <p>Docs: <a href="https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/">Self-hosted Access applications</a></p>
</body>
</html>`;
    return new Response(html, {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (pathname.startsWith("/admin/api")) {
    const body = JSON.stringify({
      error: "forbidden",
      message:
        "Missing Cloudflare Access session. Authenticate via Access for /admin* or use DEV_BYPASS_AUTH for local dev.",
      hints: [
        "Production: Zero Trust Access application on this hostname with path /admin*.",
        "Local: npm run dev uses env dev with DEV_BYPASS_AUTH=true.",
      ],
    });
    return new Response(body, {
      status: 403,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  return new Response("Forbidden: configure Cloudflare Access for authoring routes.", {
    status: 403,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
