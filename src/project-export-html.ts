/**
 * Offline-friendly project HTML: embed remote images as data URIs where fetch succeeds.
 */
import type { Client, GalleryImage, ProjectClientRef, ProjectData, TeamMember } from "./types";
import { detectMediaKind } from "./views/media";
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

/** Collect absolute URLs from gallery + <img src="..."> in HTML (videos excluded). */
export function collectImageUrlsForEmbed(html: string, gallery: GalleryImage[], origin: string): string[] {
  const out = new Set<string>();
  for (const g of gallery) {
    const u = typeof g.url === "string" ? g.url.trim() : "";
    if (!u) continue;
    if (detectMediaKind(u) !== "image") continue;
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

/** Compact Swiss-grid stylesheet for downloaded HTML (mirrors public project typography). */
const STANDALONE_EXPORT_CSS = `
*{box-sizing:border-box}
:root{
--bg:#efeeee;--fg:#1b1b1b;--fg-soft:#353535;--muted:#5d5c5c;--hairline:rgba(27,27,27,.10);--border:rgba(27,27,27,.085);--accent:#3d87c4;
--radius-sm:1px;
--font-sans:"Inter",ui-sans-serif,system-ui,sans-serif;
--font-display:"Inter",ui-sans-serif,system-ui,sans-serif;
--font-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
--grid-cols:12;--grid-gap:clamp(.9rem,2.2vw,1.65rem);--grid-max:78rem;
--text-2xs:.69rem;--text-xs:.78rem;--text-sm:.86rem;--text-md:.96rem;--text-base:1rem;--text-lg:1.04rem;--text-dek:clamp(1.04rem,1.6vw,1.22rem);--text-h1:clamp(1.85rem,4.2vw,2.72rem);
--tk-display:-.022em;--tk-dek:-.01em;--tk-body:-.012em;--tk-small:-.005em;--tk-ui:-.006em;
}
@media (prefers-color-scheme:dark){
:root{--bg:#1b1b1b;--fg:#f3f3f3;--fg-soft:#d8d8d8;--muted:#8f8e8e;--hairline:rgba(243,243,243,.10);--border:rgba(243,243,243,.055);--accent:#82c7f5}
}
html{font-feature-settings:"kern","calt","liga","ss01","cv11";font-variant-ligatures:common-ligatures}
body{margin:0;font-family:var(--font-sans);font-size:var(--text-lg);line-height:1.55;letter-spacing:var(--tk-body);color:var(--fg);background:var(--bg);-webkit-font-smoothing:antialiased}
a{color:inherit}
.page{max-width:var(--grid-max);margin:0 auto;padding:1.6rem clamp(1rem,4vw,2rem) 4rem}
.project{display:grid;grid-template-columns:repeat(var(--grid-cols),minmax(0,1fr));column-gap:var(--grid-gap);row-gap:0}
.project__rule{grid-column:1/-1;height:0;border:none;border-top:1px solid var(--hairline);margin:5px 0}
.project__row{grid-column:1/-1;display:grid;grid-template-columns:subgrid;column-gap:var(--grid-gap);align-items:baseline}
.project__index{grid-column:1/span 2;font-family:var(--font-mono);font-size:var(--text-2xs);letter-spacing:.02em;line-height:1.4;text-transform:uppercase;color:color-mix(in srgb,var(--muted) 72%,transparent);padding-top:.65em;white-space:nowrap}
.project__index-num{color:color-mix(in srgb,var(--fg) 70%,var(--muted))}
.project__index-sep{color:color-mix(in srgb,var(--muted) 45%,transparent)}
.project__hero-text{grid-column:3/-1}
.project__hero-text{display:flex;flex-direction:column;gap:.3rem}
.project__title{font-family:var(--font-display);font-size:clamp(1.85rem,4.2vw,2.55rem);font-weight:600;letter-spacing:-.046em;line-height:.98;margin:0;color:var(--fg);text-wrap:balance;max-width:22ch;font-feature-settings:"kern","calt","liga","ss01","cv11";font-variant-ligatures:common-ligatures contextual;font-kerning:normal;hanging-punctuation:first}
.project__dek{margin:0;font-size:clamp(1.0625rem,1.45vw,1.22rem);letter-spacing:-.018em;color:color-mix(in srgb,var(--fg-soft) 92%,var(--muted));line-height:1.32;max-width:36rem;text-wrap:pretty;hanging-punctuation:first last;font-feature-settings:"kern","calt","liga","ss01","cv11";font-kerning:normal}
.project__spec{grid-column:3/-1;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));column-gap:var(--grid-gap);row-gap:clamp(.8rem,1.5vw,1.15rem);margin:0;padding:0}
.spec-cell{display:flex;flex-direction:column;gap:.32rem;min-width:0}
.spec-cell--date{grid-column:span 2}
.spec-cell--my-role{grid-column:span 3}
.spec-cell--clients{grid-column:span 5}
.spec-cell--via{grid-column:span 3}
.spec-cell--tags{grid-column:1/-1}
.spec-cell dt{margin:0;font-family:var(--font-mono);font-size:var(--text-2xs);letter-spacing:.04em;text-transform:uppercase;color:color-mix(in srgb,var(--muted) 70%,transparent);line-height:1.4}
.spec-cell dd{margin:0;font-size:var(--text-sm);letter-spacing:var(--tk-small);line-height:1.55;color:var(--fg-soft)}
.spec-cell--date dd{font-variant-numeric:tabular-nums}
.spec-cell__sep{color:color-mix(in srgb,var(--muted) 45%,transparent);padding:0 .06em}
.spec-cell__inline-muted{color:color-mix(in srgb,var(--muted) 65%,transparent)}
.spec-cell a,.project-client-link{color:inherit;text-decoration:none}
.project__body{grid-column:3/span 7;min-width:0;margin:0}
.project__why{grid-column:3/span 7;min-width:0;max-width:36rem;margin:0}
.project__why-p{margin:0 0 .9em;font-family:var(--font-display);font-size:var(--text-lg);font-weight:400;letter-spacing:var(--tk-body);line-height:1.55;color:color-mix(in srgb,var(--fg) 92%,var(--muted));text-wrap:pretty;hanging-punctuation:first last;font-feature-settings:var(--features-text)}
.project__why-p:last-child{margin-bottom:0}
.article-body{font-size:var(--text-lg);line-height:1.68;letter-spacing:var(--tk-body);color:color-mix(in srgb,var(--fg-soft) 96%,var(--muted));margin:0;text-wrap:pretty}
.article-body h1,.article-body h2,.article-body h3,.article-body h4{color:var(--fg);font-weight:600;margin:1.8rem 0 .55rem;line-height:1.2;letter-spacing:var(--tk-display);font-family:var(--font-display)}
.article-body h1{font-size:1.55rem}.article-body h2{font-size:1.28rem}.article-body h3{font-size:1.1rem}.article-body h4{font-size:1rem}
.article-body p{margin:0 0 1rem}
.article-body a{color:inherit;text-decoration:none;box-shadow:inset 0 -1px 0 0 color-mix(in srgb,var(--muted) 50%,transparent);word-break:break-word}
.article-body a:hover{color:var(--accent)}
.article-body ul,.article-body ol{margin:0 0 1rem;padding-left:1.35rem}
.article-body li{margin:.35rem 0}
.article-body blockquote{margin:1.1rem 0;padding:.05rem 0 .05rem 1.1rem;border-left:1px solid var(--hairline);color:var(--muted)}
.article-body pre{overflow-x:auto;padding:1rem 1.1rem;background:color-mix(in srgb,var(--fg) 4%,var(--bg));border:1px solid var(--border);font-family:var(--font-mono);font-size:.82rem;margin:1rem 0;line-height:1.5}
.article-body code{font-family:var(--font-mono);font-size:.88em}
.article-body img{max-width:100%;height:auto;margin:1.2rem 0}
.article-body hr{border:none;border-top:1px solid var(--hairline);width:4rem;margin:2rem auto}
.project__links{grid-column:3/-1;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));column-gap:var(--grid-gap);row-gap:0}
.project__links li{grid-column:span 5;display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:.65rem;align-items:baseline;padding:.55rem 0;border-bottom:1px solid var(--hairline)}
.project__links li:first-child,.project__links li:nth-child(2){border-top:1px solid var(--hairline)}
.project-links__num{font-family:var(--font-mono);font-size:var(--text-2xs);color:color-mix(in srgb,var(--muted) 70%,transparent);font-variant-numeric:tabular-nums}
.project__links a{font-size:var(--text-md);font-weight:500;letter-spacing:var(--tk-ui);color:var(--fg);text-decoration:none}
.project__links a::after{content:" →";margin-left:.4em;color:color-mix(in srgb,var(--muted) 55%,transparent)}
.project__row--gallery .gallery-strip{grid-column:3/-1;max-width:none;display:flex;flex-direction:column;gap:20px}
.gallery-figure{margin:0;padding:clamp(4px,.65vw,7px);border:1px solid var(--hairline);background:color-mix(in srgb,var(--fg) 4%,var(--bg))}
.gallery-figure--hero{padding:clamp(5px,.85vw,9px)}
.gallery-export-img{display:block;width:100%;height:auto}
.gallery-figure--video .gallery-video{position:relative;width:100%;aspect-ratio:16/9;background:#000;overflow:hidden}
.gallery-video__iframe,.gallery-video__el{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
.gallery-video__el{object-fit:contain;background:#000}
.gallery-figcaption{padding:.5rem .4rem 0;font-size:var(--text-2xs);color:var(--muted);text-align:left;line-height:1.4;letter-spacing:.02em;font-family:var(--font-mono);text-transform:uppercase}
.project__team{grid-column:3/-1;margin:0;padding:0;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));column-gap:var(--grid-gap);row-gap:0}
.project__team-row{grid-column:span 5;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:.65rem;align-items:baseline;padding:.42rem 0;border-bottom:1px solid var(--hairline)}
.project__team-row dt{margin:0;font-size:var(--text-sm);font-weight:500;letter-spacing:var(--tk-small);color:var(--fg-soft);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.project__team-row dt a{color:inherit;text-decoration:none}
.project__team-row dd{margin:0;font-family:var(--font-mono);font-size:var(--text-2xs);letter-spacing:.04em;text-transform:uppercase;color:color-mix(in srgb,var(--muted) 80%,transparent);text-align:right}
.project__row--colophon{padding-bottom:1rem}
.project__updated{grid-column:3/-1;margin:0;font-family:var(--font-mono);font-size:var(--text-2xs);letter-spacing:.04em;text-transform:uppercase;color:color-mix(in srgb,var(--muted) 70%,transparent)}
.project__updated time{font-variant-numeric:tabular-nums;color:color-mix(in srgb,var(--fg) 60%,var(--muted));margin-left:.5em}
@media (max-width:1023px){
.project__index{grid-column:1/span 3;padding-top:.4em}
.project__hero-text,.project__body,.project__why,.project__updated{grid-column:4/-1}
.project__spec,.project__links,.project__team{grid-column:4/-1;grid-template-columns:repeat(9,minmax(0,1fr))}
.spec-cell--my-role{grid-column:span 3}
.spec-cell--clients{grid-column:span 4}
.spec-cell--via{grid-column:span 3}
.project__links li,.project__team-row{grid-column:span 9}
.project__row--gallery .gallery-strip{grid-column:4/-1}
}
@media (max-width:720px){
.project{grid-template-columns:1fr;column-gap:0}
.project__row{grid-template-columns:1fr;row-gap:.45rem}
.project__index{grid-column:1;padding-top:0}
.project__hero-text,.project__spec,.project__body,.project__why,.project__links,.project__row--gallery .gallery-strip,.project__team,.project__updated{grid-column:1}
.project__spec{grid-template-columns:1fr 1fr}
.spec-cell--date,.spec-cell--my-role,.spec-cell--clients,.spec-cell--via,.spec-cell--tags{grid-column:1/-1}
.project__links{grid-template-columns:1fr}
.project__links li{grid-column:1}
.project__team{grid-template-columns:1fr}
.project__team-row{grid-column:1}
}
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
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<style>
${STANDALONE_EXPORT_CSS}
</style>
</head>
<body>
<main class="page">${inner}</main>
</body>
</html>`;
}
