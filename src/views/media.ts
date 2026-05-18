/**
 * Media type detection + Cloudflare Stream helpers.
 *
 * Public-facing surface auto-detects video vs image from the URL alone — no
 * schema change. Supported video sources:
 *   - Cloudflare Stream:  https://customer-{sub}.cloudflarestream.com/{32hex}/...
 *   - Cloudflare Stream:  https://videodelivery.net/{32hex}/...   (legacy)
 *   - Direct files:       *.mp4, *.webm, *.mov, *.m4v, *.ogv
 */

export type MediaKind = "image" | "video-stream" | "video-file";

export interface StreamRef {
  /** Base URL up to and including the {videoId} path segment (no trailing slash). */
  base: string;
}

const STREAM_CUSTOMER_RE =
  /^(https?:\/\/customer-[a-z0-9]+\.cloudflarestream\.com\/[a-f0-9]{32})\b/i;
const STREAM_LEGACY_RE = /^(https?:\/\/videodelivery\.net\/[a-f0-9]{32})\b/i;
const VIDEO_FILE_RE = /\.(?:mp4|webm|mov|m4v|ogv)(?:[?#]|$)/i;

export function detectMediaKind(url: string | undefined | null): MediaKind {
  const u = (url ?? "").trim();
  if (!u) return "image";
  if (STREAM_CUSTOMER_RE.test(u) || STREAM_LEGACY_RE.test(u)) return "video-stream";
  if (VIDEO_FILE_RE.test(u)) return "video-file";
  return "image";
}

export function parseStreamUrl(url: string): StreamRef | null {
  const u = url.trim();
  const m = STREAM_CUSTOMER_RE.exec(u) ?? STREAM_LEGACY_RE.exec(u);
  if (!m) return null;
  return { base: m[1] };
}

export interface StreamIframeOpts {
  /** Autoplay + loop + muted + no controls — used for index previews. */
  loop?: boolean;
}

export function streamIframeUrl(ref: StreamRef, opts: StreamIframeOpts = {}): string {
  if (opts.loop) {
    return `${ref.base}/iframe?autoplay=true&loop=true&muted=true&controls=false&preload=auto`;
  }
  return `${ref.base}/iframe?preload=metadata`;
}

export interface StreamThumbnailOpts {
  /** e.g. "1s" — seek into the video before grabbing a frame. */
  time?: string;
  /** Pixel height (cap). */
  height?: number;
}

export function streamThumbnailUrl(ref: StreamRef, opts: StreamThumbnailOpts = {}): string {
  const params: string[] = [];
  if (opts.time) params.push(`time=${encodeURIComponent(opts.time)}`);
  if (opts.height) params.push(`height=${opts.height}`);
  const q = params.length ? `?${params.join("&")}` : "";
  return `${ref.base}/thumbnails/thumbnail.jpg${q}`;
}
