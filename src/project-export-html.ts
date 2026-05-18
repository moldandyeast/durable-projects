/**
 * Offline-friendly project HTML: embed remote images as data URIs where fetch succeeds.
 */
import type { Client, GalleryImage, ProjectClientRef, ProjectData, TeamMember } from "./types";
import { escapeHtml } from "./views/shared";
import { projectArticleInnerHtml } from "./views/project-public";

const MAX_IMAGE_BYTES = 2_600_000;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function absolutizeImageUrl(href: string, origin: string): string | null {
  const t = href.trim();
  if (!t || t.startsWith("data:")) return null;
  try {
    return new URL(t, origin).href;
  } catch {
    return null;
  }
}

/** Collect absolute URLs from gallery + <img src="..."> in HTML. */
export function collectImageUrlsForEmbed(html: string, gallery: GalleryImage[], origin: string): string[] {
  const out = new Set<string>();
  for (const g of gallery) {
    const u = typeof g.url === "string" ? g.url.trim() : "";
    if (!u) continue;
    const abs = absolutizeImageUrl(u, origin);
    if (abs) out.add(abs);
  }
  for (const m of html.matchAll(/<img\b[^>]*\bsrc\s*=\s*(["'])([^"']*)\1/gi)) {
    const abs = absolutizeImageUrl(m[2], origin);
    if (abs) out.add(abs);
  }
  return [...out];
}

function bytesToBase64(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    bin += String.fromCharCode(...u8.subarray(i, i + chunk));
  }
  return btoa(bin);
}

/** Replace img src values with embedded data URIs when fetch works. */
export async function embedImagesInHtml(
  html: string,
  gallery: GalleryImage[],
  origin: string,
  fetchImpl: typeof fetch,
): Promise<string> {
  const urls = collectImageUrlsForEmbed(html, gallery, origin);
  const map = new Map<string, string>();

  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetchImpl(url, { redirect: "follow" });
        if (!res.ok) return;
        const ct = (res.headers.get("content-type") ?? "").split(";")[0].trim();
        if (!ct.startsWith("image/")) return;
        const buf = await res.arrayBuffer();
        if (buf.byteLength > MAX_IMAGE_BYTES) return;
        const b64 = bytesToBase64(buf);
        map.set(url, `data:${ct};base64,${b64}`);
      } catch {
        /* keep original URL */
      }
    }),
  );

  if (!map.size) return html;

  let out = html;
  for (const [from, to] of map) {
    const esc = escapeRegex(from);
    out = out.replace(new RegExp(`src=(["'])${esc}\\1`, "gi"), (_m, q: string) => `src=${q}${to}${q}`);
  }
  return out;
}

export function safeExportBasename(title: string, id: string): string {
  const raw = title
    .trim()
    .replace(/[\u0000-\u001f<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
  return raw || id;
}

/** Compact stylesheet for downloaded HTML (mirrors public project typography). */
const STANDALONE_EXPORT_CSS = `
*{box-sizing:border-box}
:root{
--bg:#efeeee;--fg:#1b1b1b;--fg-soft:#353535;--muted:#5d5c5c;--border:rgba(27,27,27,.085);--accent:#3d87c4;
--radius-sm:1px;
--font-sans:"Onest",ui-sans-serif,system-ui,sans-serif;
}
@media (prefers-color-scheme:dark){
:root{
--bg:#1b1b1b;--fg:#f3f3f3;--fg-soft:#d8d8d8;--muted:#5d5c5c;--border:rgba(243,243,243,.055);--accent:#82c7f5;
}
}
body{margin:0;font-family:var(--font-sans);font-size:1.05rem;line-height:1.55;color:var(--fg);background:var(--bg);-webkit-font-smoothing:antialiased}
.page{max-width:68rem;margin:0 auto;padding:1.5rem clamp(1rem,4vw,2rem) 4rem}
.project-header{margin-bottom:clamp(1.75rem,4vw,2.75rem)}
.project-header h1{font-size:clamp(1.85rem,4.2vw,2.72rem);font-weight:700;letter-spacing:-.042em;line-height:1.06;margin:0 0 .72rem;color:var(--fg)}
.dek{font-size:clamp(1.04rem,2.15vw,1.22rem);color:color-mix(in srgb,var(--fg-soft) 94%,var(--muted));line-height:1.52;margin:0 0 1.05rem;max-width:42rem}
.project-header-date-clients{display:flex;flex-wrap:wrap;align-items:baseline;gap:.35rem .45rem;margin:0 0 .5rem;max-width:48rem;font-size:.9375rem;line-height:1.52;color:color-mix(in srgb,var(--muted) 52%,var(--fg-soft))}
.project-header-date-clients__muted{color:color-mix(in srgb,var(--muted) 72%,transparent)}
.project-header-date-clients__sep{color:color-mix(in srgb,var(--muted) 72%,transparent);margin:0 .2rem}
.project-header-date-clients__value{color:var(--fg-soft);font-weight:500}
.project-client-link{color:inherit;font-weight:inherit;text-decoration:none}
.article-body{max-width:48rem;font-size:1.045rem;line-height:1.68;letter-spacing:-.012em;color:color-mix(in srgb,var(--fg-soft) 97%,var(--muted));margin-bottom:2.5rem}
.article-body h1,.article-body h2,.article-body h3{color:var(--fg);font-weight:600;margin:1.85rem 0 .62rem;line-height:1.22;letter-spacing:-.026em}
.article-body h1{font-size:1.65rem}.article-body h2{font-size:1.35rem}.article-body h3{font-size:1.15rem}
.article-body p{margin:0 0 1rem}.article-body a{color:var(--accent);word-break:break-word}
.article-body ul,.article-body ol{margin:0 0 1rem;padding-left:1.35rem}
.article-body li{margin:.35rem 0}
.article-body blockquote{margin:1rem 0;padding:.35rem 0 .35rem 1rem;border-left:3px solid var(--accent);color:var(--muted);font-style:italic}
.article-body pre{overflow-x:auto;padding:1rem;border-radius:var(--radius-sm);background:color-mix(in srgb,var(--fg) 4%,var(--bg));border:1px solid var(--border);font-size:.85rem;margin:1rem 0}
.article-body img{max-width:100%;height:auto;border-radius:var(--radius-sm)}
.project-links{list-style:none;padding:0;margin:0 0 2.5rem;max-width:48rem;font-size:.9375rem}
.project-links li{margin:.45rem 0}
.project-links a{color:var(--accent)}
.project-gallery{margin:0 0 clamp(2.5rem,6vw,3.75rem);max-width:48rem}
.gallery-strip{display:flex;flex-direction:column;gap:clamp(2rem,5vw,3.75rem)}
.gallery-figure{margin:0;padding:clamp(4px,.65vw,7px);border:1px solid color-mix(in srgb,var(--border) 92%,transparent);border-radius:var(--radius-sm);background:color-mix(in srgb,var(--fg) 4%,var(--bg))}
.gallery-figure--hero{padding:clamp(5px,.85vw,9px)}
.gallery-export-img{display:block;width:100%;height:auto;border-radius:var(--radius-sm)}
.gallery-figcaption{padding:.45rem .35rem 0;font-size:.78rem;color:var(--muted);text-align:center;line-height:1.35}
.project-team-min{margin:2.75rem 0 0;padding-top:1.35rem;border-top:1px solid color-mix(in srgb,var(--border) 85%,transparent);max-width:48rem;display:grid;grid-template-columns:minmax(3.25rem,4.75rem) minmax(0,1fr);column-gap:clamp(.85rem,2.2vw,1.35rem);align-items:start}
.project-team-min__tag{margin:0;padding-top:.22em;font-size:.62rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--muted) 88%,transparent)}
.project-team-min__body{margin:0;font-size:.8125rem;line-height:1.68;letter-spacing:-.015em;color:var(--muted)}
.project-team-min__member{font-weight:inherit;color:inherit}
.project-team-min__sep{color:color-mix(in srgb,var(--muted) 58%,transparent)}
.project-team-min__name{font-weight:600;color:var(--fg-soft);text-decoration:none}
.project-team-min__role{font-weight:400;font-size:.78rem;color:color-mix(in srgb,var(--muted) 92%,var(--fg-soft))}
.project-team-min__role::before{content:"\\200a\\2013\\200a"}
.project-footer-meta{margin:1.35rem 0 0;font-size:.73rem;line-height:1.55;letter-spacing:-.01em;color:color-mix(in srgb,var(--muted) 86%,transparent);max-width:48rem}
.project-footer-meta__tag{font-weight:500;text-transform:lowercase}
.project-footer-meta__tagsep{font-weight:400;color:color-mix(in srgb,var(--muted) 72%,transparent)}
.project-footer-meta__sep{color:color-mix(in srgb,var(--muted) 70%,transparent)}
@media (max-width:520px){.project-team-min{grid-template-columns:1fr;row-gap:.45rem}.project-team-min__tag{padding-top:0}}
`;

export async function buildStandaloneProjectHtml(
  project: ProjectData,
  team: TeamMember[],
  primaryRefs: ProjectClientRef[],
  viaClients: Client[],
  origin: string,
  fetchImpl: typeof fetch,
): Promise<string> {
  let inner = projectArticleInnerHtml(project, team, primaryRefs, viaClients, "static");
  inner = await embedImagesInHtml(inner, project.gallery_images, origin, fetchImpl);
  const title = escapeHtml(project.title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="color-scheme" content="light dark"/>
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<style>
${STANDALONE_EXPORT_CSS}
</style>
</head>
<body>
<main class="page">${inner}</main>
</body>
</html>`;
}
