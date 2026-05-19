/** Crockford base32 project slug (8 chars, no i/l/o/u). */
export const PROJECT_SLUG_PATH_RE = /^\/([0-9a-hjkmnpqrstvwxyz]{8})(\.md)?$/;

export const PUBLIC_CORS_ALLOW_ORIGIN = "*";
export const PUBLIC_CORS_ALLOW_METHODS = "GET, HEAD, OPTIONS";
/** Request headers allowed on cross-origin reads (incl. conditional GET). */
export const PUBLIC_CORS_ALLOW_HEADERS = "Accept, Content-Type, If-None-Match";
/** Response headers visible to browser `fetch()` clients. */
export const PUBLIC_CORS_EXPOSE_HEADERS = "ETag, Cache-Control, Content-Type";

/** Paths that participate in the public read API CORS policy. */
export function isPublicCorsPath(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return true;
  return PROJECT_SLUG_PATH_RE.test(pathname);
}

export function corsPreflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaderRecord(),
  });
}

export function corsHeaderRecord(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": PUBLIC_CORS_ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": PUBLIC_CORS_ALLOW_METHODS,
    "Access-Control-Allow-Headers": PUBLIC_CORS_ALLOW_HEADERS,
    "Access-Control-Expose-Headers": PUBLIC_CORS_EXPOSE_HEADERS,
    "Access-Control-Max-Age": "86400",
    "X-Content-Type-Options": "nosniff",
  };
}

export function withPublicCors(pathname: string, response: Response): Response {
  if (!isPublicCorsPath(pathname)) return response;
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaderRecord())) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
