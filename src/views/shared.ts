export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  ${extraHead}
  <style>
    :root {
      --fg: #0d0d0c;
      --fg-soft: #2e2e2b;
      --muted: #6e6e69;
      --bg: #f4f3ef;
      --bg-elevated: #fffcf7;
      --border: rgba(13, 13, 12, 0.09);
      --accent: #1e4fd6;
      --accent-soft: rgba(30, 79, 214, 0.12);
      --radius: 14px;
      --radius-sm: 10px;
      --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-display: var(--font-sans);
      --shadow: 0 1px 2px rgba(13, 13, 12, 0.04), 0 6px 28px rgba(13, 13, 12, 0.07);
      --shadow-hover: 0 10px 40px rgba(13, 13, 12, 0.11);
      --max: 68rem;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --fg: #eceae6;
        --fg-soft: #c9c6bf;
        --muted: #9c9890;
        --bg: #141413;
        --bg-elevated: #1c1c1a;
        --border: rgba(236, 234, 230, 0.1);
        --accent: #6e9fff;
        --accent-soft: rgba(110, 159, 255, 0.15);
        --shadow: 0 1px 2px rgba(0, 0, 0, 0.35), 0 8px 32px rgba(0, 0, 0, 0.45);
        --shadow-hover: 0 12px 48px rgba(0, 0, 0, 0.55);
      }
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: var(--font-sans);
      font-size: 1.05rem;
      line-height: 1.55;
      background: var(--bg);
      color: var(--fg);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    a {
      color: var(--accent);
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
    }
    a:hover { text-decoration: none; }
    a:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
      border-radius: 3px;
    }
    main.page {
      max-width: var(--max);
      margin: 0 auto;
      padding: 1.25rem clamp(1rem, 4vw, 2rem) 5rem;
    }
    .muted { color: var(--muted); font-size: 0.92rem; }

    /* Nav */
    .site-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem clamp(1rem, 4vw, 2rem);
      border-bottom: 1px solid var(--border);
      background: var(--bg-elevated);
    }
    .site-nav a.brand {
      font-family: var(--font-display);
      font-weight: 700;
      letter-spacing: -0.03em;
      font-size: 1.1rem;
      color: var(--fg);
      text-decoration: none;
    }
    .site-nav a.brand:hover { color: var(--accent); }

    /* Tags */
    .tag {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
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
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .project-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-hover);
    }
    .project-card:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
    }
    .project-card .card-media {
      aspect-ratio: 16 / 10;
      background: linear-gradient(145deg, var(--accent-soft), transparent);
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
      border-radius: 4px;
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

    /* Admin — Swiss minimal + Onest (font linked via extraHead) */
    body.admin-app {
      --adm-fg: #0a0a0a;
      --adm-bg: #fafafa;
      --adm-muted: #525252;
      --adm-line: #0a0a0a;
      --adm-field-bg: #ffffff;
      font-family: "Onest", ui-sans-serif, system-ui, sans-serif;
      background: var(--adm-bg);
      color: var(--adm-fg);
      letter-spacing: -0.02em;
      font-size: 1rem;
      line-height: 1.5;
    }
    @media (prefers-color-scheme: dark) {
      body.admin-app {
        --adm-fg: #f5f5f5;
        --adm-bg: #0a0a0a;
        --adm-muted: #a3a3a3;
        --adm-line: rgba(245, 245, 245, 0.35);
        --adm-field-bg: #141414;
      }
    }
    body.admin-app .admin-shell {
      max-width: 52rem;
      margin: 0 auto;
      padding: 2rem clamp(1.25rem, 4vw, 2.5rem) 4rem;
      min-height: 100vh;
    }
    body.admin-app .admin-header {
      border-bottom: 1px solid var(--adm-line);
      padding-bottom: 1.25rem;
      margin-bottom: 2.5rem;
    }
    body.admin-app .admin-header__row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
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
      border-bottom-color: var(--adm-line);
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
    }
    body.admin-app .admin-nav__btn:hover { color: var(--adm-fg); }
    body.admin-app .admin-nav__btn.is-active {
      color: var(--adm-fg);
      border-bottom-color: var(--adm-fg);
    }
    body.admin-app .admin-view-title {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--adm-muted);
      margin: 0 0 1.75rem;
    }
    body.admin-app .admin-panel {
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
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
    body.admin-app input,
    body.admin-app textarea,
    body.admin-app select {
      font: inherit;
      letter-spacing: -0.01em;
      border-radius: 0;
      border: 1px solid var(--adm-line);
      padding: 0.55rem 0.65rem;
      background: var(--adm-field-bg);
      color: var(--adm-fg);
      width: 100%;
      max-width: 100%;
    }
    body.admin-app input:focus,
    body.admin-app textarea:focus,
    body.admin-app select:focus {
      outline: none;
      box-shadow: inset 0 0 0 1px var(--adm-fg);
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
      background: var(--adm-fg);
      color: var(--adm-bg);
      border: 1px solid var(--adm-fg);
      padding: 0.55rem 1rem;
      border-radius: 0;
      max-width: none;
    }
    body.admin-app button[type="submit"]:hover,
    body.admin-app .admin-btn:hover {
      opacity: 0.92;
    }
    body.admin-app button#btn-new {
      background: transparent;
      color: var(--adm-fg);
      border-color: var(--adm-line);
    }
    body.admin-app button#btn-new:hover { background: rgba(10, 10, 10, 0.04); }
    @media (prefers-color-scheme: dark) {
      body.admin-app button#btn-new:hover { background: rgba(245, 245, 245, 0.06); }
    }
    body.admin-app button#btn-del {
      background: transparent;
      color: var(--adm-muted);
      border-color: var(--adm-line);
      font-weight: 500;
    }
    body.admin-app button#btn-del:hover {
      color: var(--adm-fg);
      border-color: var(--adm-fg);
    }
    body.admin-app .admin-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
      margin-top: 0.5rem;
    }
    body.admin-app .admin-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }
    body.admin-app textarea[name="body"] {
      min-height: 18rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 0.875rem;
      line-height: 1.55;
    }
    body.admin-app textarea[name="gallery_json"] {
      min-height: 6rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 0.8125rem;
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
    body.admin-app .admin-view[hidden] { display: none !important; }
  </style>
</head>
<body${bodyClassAttr}>
${body}
</body>
</html>`;
}
