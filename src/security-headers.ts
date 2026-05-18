/**
 * HTTP security headers for HTML (CSP varies), JSON, and plaintext responses.
 * Preserves WebSocket upgrades (`response.webSocket`).
 */

const CSP_PUBLIC = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' https: data:",
  "media-src https:",
  "font-src 'self' https:",
  "connect-src 'self'",
  "frame-src https:",
  "worker-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const CSP_ADMIN = [
  "default-src 'self'",
  "script-src 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src https: data:",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** Production hostname — send HSTS only here (avoid breaking *.workers.dev local quirks). */
const HSTS_HOST = "work.moldandyeast.com";

export interface SecurityHeaderOptions {
  /** GET /admin shell uses inline script */
  adminHtml?: boolean;
}

export function applySecurityHeaders(response: Response, request: Request, opts?: SecurityHeaderOptions): Response {
  const headers = new Headers(response.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  );

  const ct = headers.get("Content-Type") ?? "";
  if (ct.includes("text/html")) {
    headers.set("Content-Security-Policy", opts?.adminHtml ? CSP_ADMIN : CSP_PUBLIC);
  }

  const hostname = new URL(request.url).hostname;
  if (hostname === HSTS_HOST) {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  const init: ResponseInit & { webSocket?: WebSocket } = {
    status: response.status,
    statusText: response.statusText,
    headers,
  };

  if ((response as Response & { webSocket?: WebSocket }).webSocket) {
    init.webSocket = (response as Response & { webSocket?: WebSocket }).webSocket;
  }

  return new Response(response.body, init);
}
