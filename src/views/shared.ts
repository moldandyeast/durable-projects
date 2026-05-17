export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Onest — loaded on every page using layoutPage (public + admin). */
const FONT_HEAD_ONEST = `<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>`;

/** Global layout + design tokens (public site). */
export function layoutPage(
  title: string,
  body: string,
  opts?: { bodyClass?: string; extraHead?: string },
): string {
  const bodyClassAttr = opts?.bodyClass?.trim() ? ` class="${escapeHtml(opts.bodyClass.trim())}"` : "";
  const extraHead = opts?.extraHead ?? "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="light dark"/>
  <title>${escapeHtml(title)}</title>
  ${FONT_HEAD_ONEST}
  ${extraHead}
  <style>
    :root {
      /* Brand accents (both modes) */
      --rose: #d175ac;
      --orange: #f2b151;
      --green: #90e9a2;
      --blue: #82c7f5;
      --purple: #a27fed;
      --red: #ec9494;
      /* Light */
      --bg: #efeeee;
      --bg-elevated: #fafafa;
      --fg: #1b1b1b;
      --fg-soft: #353535;
      --muted: #5d5c5c;
      --border: rgba(27, 27, 27, 0.085);
      --line: rgba(27, 27, 27, 0.11);
      --accent: #3d87c4;
      --accent-soft: color-mix(in srgb, var(--accent) 17%, transparent);
      --on-accent: #fafafa;
      --radius: 1px;
      --radius-sm: 1px;
      --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
      --font-sans: "Onest", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      --font-display: "Onest", ui-sans-serif, system-ui, sans-serif;
      --shadow: 0 1px 0 rgba(27, 27, 27, 0.04), 0 12px 40px rgba(27, 27, 27, 0.06);
      --shadow-hover: 0 1px 0 rgba(27, 27, 27, 0.06), 0 20px 48px rgba(27, 27, 27, 0.1);
      --max: 68rem;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #1b1b1b;
        --bg-elevated: #161616;
        --fg: #f3f3f3;
        --fg-soft: #d8d8d8;
        --muted: #5d5c5c;
        --border: rgba(243, 243, 243, 0.055);
        --line: rgba(243, 243, 243, 0.075);
        --accent: var(--blue);
        --accent-soft: color-mix(in srgb, var(--blue) 22%, transparent);
        --on-accent: #141414;
        --shadow: 0 1px 0 rgba(0, 0, 0, 0.35), 0 16px 48px rgba(0, 0, 0, 0.42);
        --shadow-hover: 0 1px 0 rgba(0, 0, 0, 0.45), 0 22px 56px rgba(0, 0, 0, 0.52);
      }
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    ::selection {
      background: color-mix(in srgb, var(--accent) 38%, transparent);
      color: var(--fg);
    }
    body {
      margin: 0;
      font-family: var(--font-sans);
      font-size: 1.05rem;
      line-height: 1.55;
      letter-spacing: -0.018em;
      background: var(--bg);
      color: var(--fg);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    a {
      color: var(--accent);
      text-decoration-thickness: 1px;
      text-underline-offset: 0.2em;
      text-decoration-color: color-mix(in srgb, var(--accent) 55%, transparent);
      transition: color 0.15s var(--ease-out-expo), text-decoration-color 0.15s var(--ease-out-expo);
    }
    a:hover {
      text-decoration: none;
      color: color-mix(in srgb, var(--accent) 88%, var(--fg));
    }
    a:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
      border-radius: var(--radius-sm);
    }
    main.page {
      max-width: var(--max);
      margin: 0 auto;
      padding: 1.25rem clamp(1rem, 4vw, 2rem) 5rem;
    }
    .muted { color: var(--muted); font-size: 0.92rem; }
    .client-via { color: var(--muted); font-weight: 400; white-space: nowrap; }

    /* Nav */
    .site-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem clamp(1rem, 4vw, 2rem);
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--bg-elevated) 92%, transparent);
      backdrop-filter: blur(14px) saturate(1.2);
      -webkit-backdrop-filter: blur(14px) saturate(1.2);
    }
    .site-nav a.brand {
      font-family: var(--font-display);
      font-weight: 700;
      letter-spacing: -0.035em;
      font-size: 1.1rem;
      color: var(--fg);
      text-decoration: none;
      transition: color 0.18s var(--ease-out-expo), letter-spacing 0.18s var(--ease-out-expo);
    }
    .site-nav a.brand:hover {
      color: var(--accent);
      letter-spacing: -0.028em;
    }

    /* Tags */
    .tag {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-sm);
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      margin: 0 0.35rem 0.35rem 0;
    }

    /* Index */
    .hero {
      margin-bottom: clamp(2rem, 5vw, 3rem);
      max-width: 40rem;
    }
    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(2rem, 5vw, 2.75rem);
      font-weight: 700;
      letter-spacing: -0.035em;
      line-height: 1.12;
      margin: 0 0 0.75rem;
      color: var(--fg);
    }
    .hero p.lede {
      margin: 0;
      font-size: 1.08rem;
      color: var(--fg-soft);
      line-height: 1.45;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
      gap: 1.35rem;
    }
    .project-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      box-shadow: var(--shadow);
      transition: transform 0.35s var(--ease-out-expo), box-shadow 0.35s var(--ease-out-expo), border-color 0.25s ease;
    }
    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
      border-color: color-mix(in srgb, var(--accent) 28%, var(--border));
    }
    .project-card:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
    }
    .project-card .card-media {
      aspect-ratio: 16 / 10;
      background:
        radial-gradient(120% 80% at 85% 10%, color-mix(in srgb, var(--purple) 22%, transparent), transparent 55%),
        radial-gradient(90% 70% at 10% 90%, color-mix(in srgb, var(--blue) 14%, transparent), transparent 50%),
        linear-gradient(165deg, var(--accent-soft), transparent 65%);
      overflow: hidden;
    }
    .project-card .card-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .project-card .card-body {
      padding: 1.05rem 1.15rem 1.2rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .project-card .card-title {
      font-family: var(--font-display);
      font-weight: 600;
      letter-spacing: -0.02em;
      font-size: 1.08rem;
      line-height: 1.25;
      margin: 0;
    }
    .project-card .card-summary {
      margin: 0;
      font-size: 0.88rem;
      color: var(--muted);
      line-height: 1.45;
      flex: 1;
    }
    .client-pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-top: 0.15rem;
    }
    .empty-state {
      padding: 3rem 1.5rem;
      text-align: center;
      border: 1px dashed var(--border);
      border-radius: var(--radius);
      color: var(--muted);
    }

    /* Project detail */
    .back-row { margin-bottom: 1.75rem; }
    .back-row a {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--muted);
      text-decoration: none;
    }
    .back-row a:hover { color: var(--accent); }
    .project-header { margin-bottom: 2.25rem; }
    .project-header h1 {
      font-family: var(--font-display);
      font-size: clamp(1.85rem, 4.5vw, 2.65rem);
      font-weight: 700;
      letter-spacing: -0.035em;
      line-height: 1.12;
      margin: 0 0 0.65rem;
    }
    .project-header .dek {
      font-size: 1.18rem;
      color: var(--fg-soft);
      line-height: 1.45;
      margin: 0 0 1rem;
      max-width: 42rem;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem 1.25rem;
      align-items: baseline;
      font-size: 0.88rem;
      color: var(--muted);
    }
    .meta-row strong { color: var(--fg-soft); font-weight: 600; }
    .section-title {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin: 0 0 1rem;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .gallery-grid figure {
      margin: 0;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--bg-elevated);
    }
    .gallery-grid img {
      width: 100%;
      height: auto;
      vertical-align: middle;
      display: block;
    }
    .gallery-grid figcaption {
      padding: 0.55rem 0.65rem;
      font-size: 0.8rem;
      color: var(--muted);
      line-height: 1.35;
    }
    .team-list {
      list-style: none;
      margin: 0 0 2.5rem;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .team-list li {
      padding: 0.55rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.95rem;
    }
    .team-list li:last-child { border-bottom: none; }

    /* Markdown body */
    .article-body {
      max-width: 48rem;
      font-size: 1.02rem;
      line-height: 1.65;
      color: var(--fg-soft);
    }
    .article-body > *:first-child { margin-top: 0; }
    .article-body h1, .article-body h2, .article-body h3, .article-body h4 {
      font-family: var(--font-display);
      color: var(--fg);
      letter-spacing: -0.02em;
      margin: 1.75rem 0 0.65rem;
      line-height: 1.25;
    }
    .article-body h1 { font-size: 1.65rem; }
    .article-body h2 { font-size: 1.35rem; }
    .article-body h3 { font-size: 1.15rem; }
    .article-body p { margin: 0 0 1rem; }
    .article-body a { word-break: break-word; }
    .article-body ul, .article-body ol { margin: 0 0 1rem; padding-left: 1.35rem; }
    .article-body li { margin: 0.35rem 0; }
    .article-body blockquote {
      margin: 1rem 0;
      padding: 0.35rem 0 0.35rem 1rem;
      border-left: 3px solid var(--accent);
      color: var(--muted);
      font-style: italic;
    }
    .article-body pre {
      overflow-x: auto;
      padding: 1rem;
      border-radius: var(--radius-sm);
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      font-size: 0.85rem;
      margin: 1rem 0;
    }
    .article-body code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 0.88em;
      background: var(--accent-soft);
      padding: 0.12rem 0.35rem;
      border-radius: var(--radius-sm);
    }
    .article-body pre code {
      background: none;
      padding: 0;
    }
    .article-body img {
      max-width: 100%;
      height: auto;
      border-radius: var(--radius-sm);
      margin: 1rem 0;
    }
    .article-body hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 2rem 0;
    }

    /* Admin — shares root palette + Onest */
    body.admin-app {
      --adm-fg: var(--fg);
      --adm-bg: var(--bg);
      --adm-muted: var(--muted);
      --adm-line: var(--line);
      --adm-field-bg: var(--bg-elevated);
      --adm-accent: var(--accent);
      font-family: var(--font-sans);
      background: var(--adm-bg);
      color: var(--adm-fg);
      letter-spacing: -0.02em;
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
      overflow-x: hidden;
    }
    body.admin-app .admin-shell {
      max-width: none;
      width: 100%;
      margin: 0;
      padding: 0;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    body.admin-app .admin-header {
      flex-shrink: 0;
      padding: 1rem clamp(1rem, 2vw, 1.5rem);
      margin-bottom: 0;
      border-bottom: 1px solid var(--adm-line);
      background: color-mix(in srgb, var(--adm-bg) 88%, transparent);
      backdrop-filter: blur(16px) saturate(1.15);
      -webkit-backdrop-filter: blur(16px) saturate(1.15);
    }
    body.admin-app .admin-header__row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    body.admin-app .admin-wordmark {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-header__exit {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--adm-muted);
      text-decoration: none;
      border-bottom: 1px solid transparent;
    }
    body.admin-app .admin-header__exit:hover {
      color: var(--adm-fg);
      border-bottom-color: color-mix(in srgb, var(--adm-accent) 45%, var(--adm-line));
    }
    body.admin-app .admin-nav {
      display: flex;
      gap: 0;
      flex-wrap: wrap;
    }
    body.admin-app .admin-nav__btn {
      font-family: inherit;
      font-size: 0.8125rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.65rem 0;
      margin-right: 1.75rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--adm-muted);
      cursor: pointer;
      border-radius: 0;
      width: auto;
      max-width: none;
      transition: color 0.2s var(--ease-out-expo), border-color 0.2s var(--ease-out-expo);
    }
    body.admin-app .admin-nav__btn:hover { color: var(--adm-fg); }
    body.admin-app .admin-nav__btn.is-active {
      color: var(--adm-fg);
      border-bottom-color: var(--adm-accent);
    }
    body.admin-app .admin-nav__btn:focus-visible {
      outline: 2px solid var(--adm-accent);
      outline-offset: 6px;
      border-radius: var(--radius-sm);
    }
    body.admin-app .admin-main {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 0 clamp(1rem, 2vw, 1.5rem) 1rem;
    }
    body.admin-app .admin-main > .admin-view:not([hidden]) {
      flex: 1;
      min-height: 0;
    }
    body.admin-app #view-editor:not([hidden]) {
      display: flex;
      flex-direction: column;
    }
    body.admin-app #view-collaborators:not([hidden]),
    body.admin-app #view-clients:not([hidden]) {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    body.admin-app .admin-view-title {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--adm-muted);
      margin: 0 0 1.75rem;
    }
    body.admin-app.admin-overlay-open {
      overflow: hidden;
    }
    body.admin-app .admin-view-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-shrink: 0;
      margin-bottom: 1.25rem;
    }
    body.admin-app .admin-view-head .admin-view-title {
      margin-bottom: 0;
    }
    body.admin-app .admin-add-btn {
      flex-shrink: 0;
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 500;
      line-height: 1;
      background: var(--adm-field-bg);
      color: var(--adm-fg);
      border: 1px solid var(--adm-line);
      cursor: pointer;
      border-radius: var(--radius-sm);
      max-width: none;
      transition: background 0.2s var(--ease-out-expo), border-color 0.2s ease, color 0.2s ease, transform 0.2s var(--ease-out-expo);
    }
    body.admin-app .admin-add-btn:hover {
      background: color-mix(in srgb, var(--adm-accent) 14%, var(--adm-field-bg));
      border-color: color-mix(in srgb, var(--adm-accent) 35%, var(--adm-line));
      color: var(--adm-fg);
      transform: scale(1.04);
    }
    body.admin-app .admin-overlay[hidden] {
      display: none !important;
    }
    body.admin-app .admin-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(1rem, 4vw, 2rem);
      box-sizing: border-box;
    }
    body.admin-app .admin-overlay__backdrop {
      position: absolute;
      inset: 0;
      border: none;
      padding: 0;
      margin: 0;
      background: color-mix(in srgb, #0a0c10 58%, transparent);
      backdrop-filter: blur(14px) saturate(1.15);
      -webkit-backdrop-filter: blur(14px) saturate(1.15);
      cursor: pointer;
      transition: background 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    }
    body.admin-app .admin-overlay__backdrop:hover {
      background: color-mix(in srgb, #0a0c10 64%, transparent);
    }
    body.admin-app .admin-overlay:not([hidden]) .admin-overlay__panel {
      animation: admin-overlay-rise 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes admin-overlay-rise {
      from {
        opacity: 0;
        transform: translateY(14px) scale(0.988);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    body.admin-app .admin-overlay__panel {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 26rem;
      max-height: min(92dvh, 100%);
      overflow-y: auto;
      background: var(--adm-field-bg);
      border: 1px solid color-mix(in srgb, var(--adm-line) 85%, var(--adm-fg));
      border-radius: var(--radius-sm);
      padding: 1.25rem 1.35rem 1.5rem;
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--adm-fg) 5%, transparent),
        0 24px 48px -16px color-mix(in srgb, #000000 55%, transparent),
        0 12px 24px -12px color-mix(in srgb, var(--adm-accent) 12%, transparent);
    }
    body.admin-app .admin-overlay__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.15rem;
    }
    body.admin-app .admin-overlay__title {
      margin: 0;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-overlay__title-stack {
      min-width: 0;
      padding-right: 0.5rem;
    }
    body.admin-app .admin-overlay__eyebrow {
      margin: 0 0 0.35rem;
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--adm-muted) 92%, var(--adm-accent));
    }
    body.admin-app .admin-overlay__heading {
      margin: 0 0 0.45rem;
      font-size: 1.35rem;
      font-weight: 600;
      letter-spacing: -0.035em;
      line-height: 1.15;
      color: var(--adm-fg);
      text-transform: none;
    }
    body.admin-app .admin-overlay__lede {
      margin: 0;
      font-size: 0.8125rem;
      font-weight: 400;
      letter-spacing: 0.01em;
      line-height: 1.5;
      color: var(--adm-muted);
      max-width: 28rem;
    }
    body.admin-app .admin-overlay__head--rich {
      align-items: flex-start;
      margin-bottom: 0;
      padding-bottom: 1.1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--adm-line) 92%, transparent);
    }
    body.admin-app .admin-overlay__panel--settings {
      max-width: min(36rem, 100%);
      max-height: min(92dvh, 880px);
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      border-radius: var(--radius-sm);
    }
    body.admin-app .admin-overlay__panel--settings > .admin-overlay__head {
      padding: 1.35rem 1.5rem 1.15rem;
      margin-bottom: 0;
      flex-shrink: 0;
    }
    body.admin-app .admin-overlay__body--scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 1.25rem 1.5rem 1.5rem;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--adm-muted) 45%, transparent) transparent;
    }
    body.admin-app .admin-settings-section {
      padding-bottom: 1.35rem;
      margin-bottom: 1.35rem;
      border-bottom: 1px solid color-mix(in srgb, var(--adm-line) 88%, transparent);
    }
    body.admin-app .admin-settings-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    body.admin-app .admin-settings-section__label {
      margin: 0 0 1rem;
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--adm-muted) 85%, var(--adm-fg));
    }
    body.admin-app .admin-settings-section__fields {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    body.admin-app .admin-settings-section__fields--dense {
      gap: 1.15rem;
    }
    body.admin-app .admin-overlay__footer {
      flex-shrink: 0;
      padding: 1rem 1.5rem 1.35rem;
      border-top: 1px solid color-mix(in srgb, var(--adm-line) 92%, transparent);
      background: color-mix(in srgb, var(--adm-field-bg) 92%, var(--adm-accent));
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    body.admin-app .admin-overlay__footer-note {
      margin: 0;
      font-size: 0.75rem;
      line-height: 1.45;
      color: var(--adm-muted);
      letter-spacing: 0.02em;
    }
    body.admin-app .admin-overlay__footer-note strong {
      font-weight: 600;
      color: color-mix(in srgb, var(--adm-muted) 35%, var(--adm-fg));
    }
    body.admin-app .admin-btn.admin-btn--primary-wide {
      display: inline-flex;
      align-items: center;
      width: 100%;
      justify-content: center;
      padding-top: 0.65rem;
      padding-bottom: 0.65rem;
      letter-spacing: 0.12em;
    }
    body.admin-app .admin-overlay__close {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      padding: 0;
      margin: -0.35rem -0.35rem 0 0;
      border: none;
      background: transparent;
      color: var(--adm-muted);
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      border-radius: var(--radius-sm);
      max-width: none;
      transition: color 0.2s ease, background 0.2s ease;
    }
    body.admin-app .admin-overlay__close:hover {
      color: var(--adm-fg);
      background: color-mix(in srgb, var(--adm-fg) 6%, transparent);
    }
    body.admin-app .admin-overlay__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
      justify-content: flex-end;
      margin-top: 0.35rem;
    }
    body.admin-app .admin-btn.admin-btn--ghost {
      background: transparent;
      color: var(--adm-fg);
      border-color: var(--adm-line);
      border-radius: var(--radius-sm);
      box-shadow: none;
    }
    body.admin-app .admin-btn.admin-btn--ghost:hover {
      opacity: 1;
      background: color-mix(in srgb, var(--adm-fg) 6%, transparent);
    }
    body.admin-app .admin-panel {
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }
    body.admin-app #view-editor .admin-panel {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    body.admin-app #view-editor #proj-form {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    body.admin-app .admin-panel + .admin-panel { margin-top: 2.5rem; padding-top: 2.5rem; border-top: 1px solid var(--adm-line); }
    body.admin-app .admin-panel h2 {
      margin: 0 0 1rem;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      text-transform: none;
      color: var(--adm-fg);
    }
    body.admin-app label,
    body.admin-app .admin-label {
      display: block;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--adm-muted);
      margin-bottom: 0.4rem;
    }
    body.admin-app .admin-field-hint {
      margin: -0.15rem 0 0.4rem;
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      text-transform: none;
      color: var(--adm-muted);
      line-height: 1.45;
    }
    body.admin-app input,
    body.admin-app textarea,
    body.admin-app select {
      font: inherit;
      letter-spacing: -0.01em;
      border-radius: var(--radius-sm);
      border: 1px solid var(--adm-line);
      padding: 0.55rem 0.65rem;
      background: var(--adm-field-bg);
      color: var(--adm-fg);
      width: 100%;
      max-width: 100%;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
    }
    body.admin-app input:focus,
    body.admin-app textarea:focus,
    body.admin-app select:focus {
      outline: none;
      border-color: color-mix(in srgb, var(--adm-accent) 55%, var(--adm-line));
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--adm-accent) 22%, transparent);
    }
    body.admin-app input:focus-visible,
    body.admin-app textarea:focus-visible,
    body.admin-app select:focus-visible {
      outline: none;
    }
    body.admin-app button[type="submit"],
    body.admin-app .admin-btn {
      width: auto;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: var(--adm-accent);
      color: var(--on-accent);
      border: 1px solid color-mix(in srgb, var(--adm-accent) 72%, #000000);
      padding: 0.55rem 1rem;
      border-radius: var(--radius-sm);
      max-width: none;
      transition: transform 0.18s var(--ease-out-expo), opacity 0.18s ease, box-shadow 0.18s ease;
      box-shadow: 0 1px 0 color-mix(in srgb, var(--adm-fg) 12%, transparent);
    }
    body.admin-app button[type="submit"]:hover,
    body.admin-app .admin-btn:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px color-mix(in srgb, var(--adm-accent) 35%, transparent);
    }
    body.admin-app button#btn-new {
      background: transparent;
      color: var(--adm-fg);
      border-color: var(--adm-line);
      box-shadow: none;
    }
    body.admin-app button#btn-new:hover {
      background: color-mix(in srgb, var(--adm-fg) 6%, transparent);
      transform: translateY(-1px);
    }
    body.admin-app button#btn-del {
      background: transparent;
      color: var(--adm-muted);
      border-color: var(--adm-line);
      font-weight: 500;
    }
    body.admin-app button#btn-del:hover {
      color: var(--red);
      border-color: color-mix(in srgb, var(--red) 45%, var(--adm-line));
      background: color-mix(in srgb, var(--red) 8%, transparent);
    }
    body.admin-app .admin-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
      margin-top: 0.5rem;
    }
    body.admin-app .admin-actions-wrap {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.55rem;
    }
    body.admin-app .admin-save-status {
      margin: 0;
      min-height: 1.35rem;
      font-size: 0.8125rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: var(--adm-muted);
      transition: color 0.2s ease;
    }
    body.admin-app .admin-save-status.is-success {
      color: color-mix(in srgb, var(--green) 88%, var(--adm-fg));
    }
    body.admin-app .admin-save-status.is-error {
      color: var(--red);
    }
    body.admin-app button:disabled {
      opacity: 0.52;
      cursor: not-allowed;
    }
    body.admin-app .admin-collab-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    body.admin-app .admin-collab-picker {
      min-height: 3rem;
      max-height: 14rem;
      overflow-y: auto;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      padding: 0.35rem 0;
      background: var(--adm-field-bg);
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--adm-muted) 55%, transparent) transparent;
    }
    body.admin-app .admin-collab-picker__empty {
      margin: 0;
      padding: 0.65rem 0.75rem;
      font-size: 0.8125rem;
      color: var(--adm-muted);
      line-height: 1.45;
    }
    body.admin-app .admin-collab-row {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: baseline;
      gap: 0.5rem 0.65rem;
      padding: 0.35rem 0.65rem;
      cursor: pointer;
      font-size: 0.8125rem;
      line-height: 1.35;
    }
    body.admin-app .admin-collab-row:hover {
      background: color-mix(in srgb, var(--adm-accent) 9%, transparent);
    }
    body.admin-app .admin-collab-row input {
      width: auto;
      margin: 0;
      accent-color: var(--adm-accent);
    }
    body.admin-app .admin-collab-row__text {
      min-width: 0;
      word-break: break-word;
      color: var(--adm-fg);
    }
    body.admin-app .admin-collab-row__id {
      font-size: 0.65rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--adm-muted);
      white-space: nowrap;
    }
    body.admin-app .admin-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }
    body.admin-app .admin-gallery-block {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    body.admin-app .admin-gallery-rows {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    body.admin-app .admin-gallery-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
      align-items: flex-start;
      padding: 0.85rem 1rem;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--adm-field-bg) 94%, transparent);
    }
    body.admin-app .admin-gallery-row__fields {
      flex: 1 1 16rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.65rem;
      min-width: 0;
    }
    @media (min-width: 32rem) {
      body.admin-app .admin-gallery-row__fields {
        grid-template-columns: 1fr 1fr;
      }
      body.admin-app .admin-gallery-field:first-child {
        grid-column: 1 / -1;
      }
    }
    body.admin-app .admin-gallery-field .admin-label {
      margin-bottom: 0.28rem;
    }
    body.admin-app .admin-gallery-row__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      align-items: center;
      flex-shrink: 0;
    }
    body.admin-app .admin-gallery-row__icon {
      min-width: 2rem;
      padding-left: 0.45rem;
      padding-right: 0.45rem;
      font-size: 0.8125rem;
      line-height: 1;
    }
    body.admin-app .admin-gallery-row__rm {
      font-size: 0.625rem;
    }
    body.admin-app .admin-gallery-add {
      margin-top: 0.25rem;
      align-self: flex-start;
    }
    body.admin-app .admin-gallery-preview-block {
      margin-top: 1.15rem;
      padding-top: 1rem;
      border-top: 1px solid color-mix(in srgb, var(--adm-line) 92%, transparent);
    }
    body.admin-app .admin-gallery-preview-block > .admin-label {
      margin-bottom: 0.5rem;
    }
    body.admin-app .admin-gallery-live.gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 130px), 1fr));
      gap: 0.65rem;
      margin-bottom: 0;
    }
    body.admin-app .admin-gallery-live.gallery-grid figure {
      border-color: var(--adm-line);
      background: var(--adm-field-bg);
    }
    body.admin-app .admin-gallery-live.gallery-grid figcaption {
      color: var(--adm-muted);
      font-size: 0.72rem;
    }
    body.admin-app .admin-gallery-live-empty {
      margin: 0.35rem 0 0;
      font-size: 0.8125rem;
      color: var(--adm-muted);
      line-height: 1.45;
    }
    body.admin-app .admin-gallery-live-empty[hidden] {
      display: none !important;
    }
    body.admin-app code { font-size: 0.85em; font-family: ui-monospace, monospace; }
    body.admin-app .admin-list {
      list-style: none;
      margin: 0 0 1.5rem;
      padding: 0;
      border-top: 1px solid var(--adm-line);
    }
    body.admin-app .admin-list li {
      padding: 0.65rem 0;
      border-bottom: 1px solid var(--adm-line);
      font-size: 0.9375rem;
      font-weight: 400;
    }
    body.admin-app .admin-list__meta {
      display: block;
      font-size: 0.6875rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--adm-muted);
      margin-top: 0.2rem;
    }
    body.admin-app .admin-list__empty {
      color: var(--adm-muted);
      font-style: normal;
      padding: 1rem 0;
    }
    body.admin-app #view-editor .admin-view-title {
      flex-shrink: 0;
      margin: 0;
      padding: 0.65rem 0 0.35rem;
    }
    body.admin-app .admin-editor-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem 1.5rem;
      padding: 1rem 0 1.05rem;
      border-bottom: 1px solid color-mix(in srgb, var(--adm-line) 94%, transparent);
      flex-shrink: 0;
    }
    body.admin-app .admin-editor-toolbar__left {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 0.55rem 1rem;
      min-width: min(100%, 14rem);
    }
    body.admin-app .admin-editor-toolbar__label {
      margin-bottom: 0.38rem;
      flex: 0 0 100%;
      width: 100%;
    }
    @media (min-width: 40rem) {
      body.admin-app .admin-editor-toolbar__label {
        flex: 0 0 auto;
        width: auto;
        margin-bottom: 0;
        padding-bottom: 0.52rem;
      }
    }
    body.admin-app .admin-editor-toolbar__select {
      min-width: min(100%, 14rem);
      max-width: min(100%, 22rem);
    }
    body.admin-app .admin-editor-toolbar__hint {
      flex: 1 1 12rem;
      margin: 0;
      padding-bottom: 0.15rem;
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: 0.03em;
      color: color-mix(in srgb, var(--adm-muted) 94%, var(--adm-fg));
      line-height: 1.35;
    }
    body.admin-app .admin-editor-toolbar__right {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.65rem 0.85rem;
      justify-content: flex-end;
    }
    body.admin-app .admin-editor-toolbar__settings {
      border-radius: var(--radius-sm);
      letter-spacing: 0.1em;
    }
    body.admin-app .admin-toolbar-rule {
      width: 1px;
      height: 1.6rem;
      background: color-mix(in srgb, var(--adm-line) 92%, transparent);
      flex-shrink: 0;
    }
    body.admin-app .admin-editor-toolbar__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      align-items: center;
    }
    body.admin-app .admin-editor-toolbar__status {
      flex: 1 1 100%;
      margin: 0;
      text-align: right;
      min-height: 1.25rem;
    }
    @media (min-width: 52rem) {
      body.admin-app .admin-editor-toolbar__status {
        flex: 0 1 auto;
        text-align: left;
      }
    }
    body.admin-app .admin-editor-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(14rem, 38vw);
      grid-template-rows: minmax(0, 1fr);
      gap: 0;
      align-items: stretch;
      flex: 1;
      min-height: 0;
      margin-top: 0;
      border-top: none;
    }
    @media (max-width: 60rem) {
      body.admin-app .admin-editor-layout {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(16rem, 42vh) minmax(12rem, 1fr);
        flex: 1;
        min-height: 0;
      }
      body.admin-app .admin-editor-md {
        border-right: none;
        border-bottom: 1px solid var(--adm-line);
      }
      body.admin-app .admin-editor-preview {
        border-left: none;
        padding-left: 0;
      }
    }
    body.admin-app .admin-editor-md {
      padding: 1.15rem 1.5rem 1.35rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 0;
      min-width: 0;
      border-right: 1px solid color-mix(in srgb, var(--adm-line) 94%, transparent);
    }
    body.admin-app .admin-md-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 0.65rem 1.25rem;
      flex-wrap: wrap;
    }
    body.admin-app .admin-md-head .admin-label {
      margin-bottom: 0;
    }
    body.admin-app .admin-md-tools {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      flex-shrink: 0;
    }
    body.admin-app .admin-md-tool {
      margin: 0;
      padding: 0.3rem 0.5rem;
      min-width: 1.85rem;
      font-family: inherit;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      line-height: 1.15;
      color: var(--adm-fg);
      background: transparent;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
      box-shadow: none;
      max-width: none;
      width: auto;
    }
    body.admin-app .admin-md-tool:hover {
      background: color-mix(in srgb, var(--adm-fg) 6%, transparent);
      border-color: color-mix(in srgb, var(--adm-accent) 38%, var(--adm-line));
      transform: none;
      opacity: 1;
    }
    body.admin-app .admin-md-tool:focus-visible {
      outline: 2px solid var(--adm-accent);
      outline-offset: 2px;
    }
    body.admin-app .admin-md-tool__b {
      font-weight: 800;
    }
    body.admin-app .admin-md-tool__i {
      font-weight: 600;
      font-style: italic;
      letter-spacing: 0.04em;
      text-transform: none;
      font-size: 0.8125rem;
    }
    body.admin-app .admin-md-tool--wide {
      padding-left: 0.55rem;
      padding-right: 0.55rem;
      min-width: auto;
      font-weight: 600;
    }
    body.admin-app .admin-editor-md textarea[name="body"] {
      flex: 1;
      min-height: 0;
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 0.875rem;
      line-height: 1.55;
      max-width: none;
      border-radius: var(--radius-sm);
      box-shadow: inset 0 1px 2px color-mix(in srgb, var(--adm-fg) 4%, transparent);
    }
    body.admin-app .admin-editor-preview {
      padding: 1.15rem 0 1.35rem 1.5rem;
      border-left: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 0;
      min-width: 0;
    }
    body.admin-app .admin-preview-pane {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--adm-line);
      background: color-mix(in srgb, var(--adm-field-bg) 94%, var(--adm-accent));
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--adm-muted) 45%, transparent) transparent;
    }
    body.admin-app .admin-preview-placeholder {
      margin: 0;
      color: var(--adm-muted);
      font-size: 0.875rem;
    }
    body.admin-app .admin-preview-pane.article-body {
      color: var(--fg-soft);
      font-size: 0.9375rem;
      line-height: 1.65;
    }
    body.admin-app .admin-preview-pane.article-body h1,
    body.admin-app .admin-preview-pane.article-body h2,
    body.admin-app .admin-preview-pane.article-body h3 {
      color: var(--fg);
    }

    body.admin-app .admin-overlay__panel--settings .admin-collab-picker {
      max-height: 11.5rem;
    }

    body.admin-app .admin-view[hidden] { display: none !important; }

    @media (prefers-reduced-motion: reduce) {
      body.admin-app .admin-overlay:not([hidden]) .admin-overlay__panel {
        animation: none;
      }
    }
  </style>
</head>
<body${bodyClassAttr}>
${body}
</body>
</html>`;
}
