import type { Env } from "./types";

/** Defense-in-depth for authoring routes (Cloudflare Access is primary). */
export function canAuthor(request: Request, env: Env): boolean {
  if (env.DEV_BYPASS_AUTH === "true") return true;
  return Boolean(request.headers.get("CF-Access-Jwt-Assertion"));
}

export function forbidden(): Response {
  return new Response("Forbidden: configure Cloudflare Access for authoring routes.", {
    status: 403,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
