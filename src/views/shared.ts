export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Inter (variable, opsz) + JetBrains Mono — loaded on every page (public + admin).
 * Onest remains in the font stack as a transition fallback for cached visitors.
 */
const FONT_HEAD_ONEST = `<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,450;14..32,500;14..32,600;14..32,700&amp;family=JetBrains+Mono:wght@400;500&amp;family=Onest:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>`;

/** Global layout + design tokens (public site). */
export function layoutPage(
  title: string,
  body: string,
  opts?: { bodyClass?: string; extraHead?: string; bodySuffix?: string },
): string {
  const bodyClassAttr = opts?.bodyClass?.trim() ? ` class="${escapeHtml(opts.bodyClass.trim())}"` : "";
  const extraHead = opts?.extraHead ?? "";
  const bodySuffix = opts?.bodySuffix ?? "";

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
    /*
      Canonical palette (reference):
      BG #1B1B1B · CARD #161616 · FG #F3F3F3 · FG-MUTED #5D5C5C
      Rose #D175AC · Orange #F2B151 · Green #90E9A2 · Blue #82C7F5 · Purple #A27FED · Red #EC9494
      CARD maps to --bg-elevated; FG-MUTED maps to --muted.
    */
    :root {
      /* Palette — shared across color schemes */
      --rose: #d175ac;
      --orange: #f2b151;
      --green: #90e9a2;
      --blue: #82c7f5;
      --purple: #a27fed;
      --red: #ec9494;
      /* Light theme semantics */
      --bg: #efeeee;
      --bg-elevated: #fafafa;
      --fg: #1b1b1b;
      --fg-soft: #353535;
      --muted: #5d5c5c;
      --bg-card: var(--bg-elevated);
      --border: rgba(27, 27, 27, 0.075);
      --line: rgba(27, 27, 27, 0.11);
      --hairline: rgba(27, 27, 27, 0.045);
      --accent: var(--fg);
      --accent-soft: color-mix(in srgb, var(--fg) 7%, transparent);
      --on-accent: #fafafa;
      --radius: 1px;
      --radius-sm: 1px;
      --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
      --ease-standard: cubic-bezier(0.2, 0.7, 0.2, 1);
      --dur-fast: 140ms;
      --dur: 200ms;
      --font-sans: "Inter", "InterVariable", "Onest", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      --font-display: "Inter", "InterVariable", "Onest", ui-sans-serif, system-ui, sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, monospace;
      --features-text: "kern", "calt", "liga", "ss01", "cv11";
      --features-tnum: "tnum", "kern";
      --shadow: 0 1px 0 rgba(27, 27, 27, 0.04), 0 12px 40px rgba(27, 27, 27, 0.06);
      --shadow-hover: 0 1px 0 rgba(27, 27, 27, 0.06), 0 20px 48px rgba(27, 27, 27, 0.1);
      --max: 68rem;
      /* Type ramp — tight fluid scale */
      --text-2xs: 0.6875rem;
      --text-xs: 0.75rem;
      --text-sm: 0.8125rem;
      --text-base: 0.9375rem;
      --text-md: 1rem;
      --text-lg: 1.0625rem;
      --text-xl: 1.1875rem;
      --text-dek: clamp(1.125rem, 1.6vw, 1.3125rem);
      --text-h3: clamp(1.1rem, 1.5vw, 1.2rem);
      --text-h2: clamp(1.28rem, 2vw, 1.4rem);
      --text-h1-article: clamp(1.55rem, 2.6vw, 1.72rem);
      --text-h1-display: clamp(2rem, 4.6vw, 2.95rem);
      /* Leading + tracking */
      --lh-tight: 1.05;
      --lh-snug: 1.18;
      --lh-default: 1.45;
      --lh-relaxed: 1.62;
      --lh-loose: 1.72;
      --tk-display: -0.04em;
      --tk-h1: -0.032em;
      --tk-h2: -0.022em;
      --tk-h3: -0.016em;
      --tk-dek: -0.022em;
      --tk-body: -0.011em;
      --tk-ui: -0.012em;
      --tk-small: -0.006em;
      --tk-caps: 0.08em;
      --tk-zero: 0;
      /* Swiss grid system (12-col) */
      --grid-cols: 12;
      --grid-gap: clamp(0.9rem, 2.2vw, 1.65rem);
      --grid-max: 78rem;
      --grid-unit: 0.5rem;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        /* Dark theme semantics — BG / CARD / FG / FG-MUTED */
        --bg: #1b1b1b;
        --bg-elevated: #161616;
        --fg: #f3f3f3;
        --fg-soft: #d8d8d8;
        --muted: #5d5c5c;
        --border: rgba(243, 243, 243, 0.06);
        --line: rgba(243, 243, 243, 0.075);
        --hairline: rgba(243, 243, 243, 0.035);
        --on-accent: #141414;
        --shadow: 0 1px 0 rgba(0, 0, 0, 0.35), 0 16px 48px rgba(0, 0, 0, 0.42);
        --shadow-hover: 0 1px 0 rgba(0, 0, 0, 0.45), 0 22px 56px rgba(0, 0, 0, 0.52);
      }
    }
    * { box-sizing: border-box; }
    html {
      scroll-behavior: smooth;
      -webkit-text-size-adjust: 100%;
      font-optical-sizing: auto;
    }
    ::selection {
      background: color-mix(in srgb, var(--accent) 22%, transparent);
      color: var(--fg);
    }
    body {
      margin: 0;
      font-family: var(--font-sans);
      font-size: var(--text-lg);
      line-height: var(--lh-relaxed);
      letter-spacing: var(--tk-body);
      font-weight: 400;
      font-feature-settings: var(--features-text);
      font-variant-ligatures: common-ligatures contextual;
      background: var(--bg);
      color: var(--fg);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    a {
      color: var(--fg-soft);
      text-decoration-thickness: 1px;
      text-underline-offset: 0.22em;
      text-decoration-color: color-mix(in srgb, var(--muted) 50%, transparent);
      transition:
        color var(--dur-fast) var(--ease-standard),
        text-decoration-color var(--dur-fast) var(--ease-standard);
    }
    a:hover {
      color: var(--fg);
      text-decoration-color: currentColor;
    }
    a:focus-visible {
      outline: 1.5px solid color-mix(in srgb, var(--fg) 40%, transparent);
      outline-offset: 3px;
      border-radius: var(--radius-sm);
    }
    main.page {
      max-width: var(--max);
      margin: 0 auto;
      padding: 1.25rem clamp(1rem, 4vw, 2rem) 5rem;
    }
    main.page--project {
      max-width: var(--grid-max);
      padding-top: 1.6rem;
    }
    .muted { color: var(--muted); font-size: var(--text-base); }

    /* ───────── Swiss grid · project page ───────── */
    .project {
      display: grid;
      grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
      column-gap: var(--grid-gap);
      row-gap: 0;
      margin: 0;
    }
    .project__rule {
      grid-column: 1 / -1;
      height: 0;
      border: none;
      border-top: 1px solid var(--hairline);
      margin: 5px 0;
    }
    .project__row {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: subgrid;
      column-gap: var(--grid-gap);
      row-gap: 0;
      align-items: baseline;
      margin: 0;
    }
    .project__index {
      grid-column: 1 / span 2;
      display: inline-flex;
      align-items: baseline;
      gap: 0.18em;
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      font-weight: 400;
      letter-spacing: 0.02em;
      line-height: 1.4;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--muted) 72%, transparent);
      white-space: nowrap;
      padding-top: 0.65em;
      user-select: none;
    }
    .project__index-num {
      color: color-mix(in srgb, var(--fg) 70%, var(--muted));
      font-feature-settings: var(--features-tnum);
    }
    .project__index-sep {
      color: color-mix(in srgb, var(--muted) 45%, transparent);
    }
    .project__index-label {
      color: inherit;
    }

    /* Hero — Swiss display setting.
       Three clear typographic registers: tight display title, a confident lede
       dek, then the muted micro-meta of the index column. Every layer reads
       distinctly without leaning on margins. */
    .project__hero-text {
      grid-column: 3 / -1;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }
    .project__title {
      font-family: var(--font-display);
      font-size: clamp(1.95rem, 4.4vw, 2.7rem);
      font-weight: 600;
      letter-spacing: -0.046em;
      line-height: 0.98;
      margin: 0;
      color: var(--fg);
      text-wrap: balance;
      max-width: 22ch;
      font-feature-settings: "kern", "calt", "liga", "ss01", "cv11";
      font-variant-ligatures: common-ligatures contextual;
      font-kerning: normal;
      hanging-punctuation: first;
    }
    .project__dek {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.1875rem, 1.8vw, 1.45rem);
      font-weight: 400;
      letter-spacing: -0.022em;
      color: var(--fg-soft);
      line-height: 1.3;
      max-width: 34rem;
      text-wrap: pretty;
      hanging-punctuation: first last;
      font-feature-settings: "kern", "calt", "liga", "ss01", "cv11";
      font-kerning: normal;
    }

    /* Spec sheet — Date / Clients / Via / Tags.
       Brockmann-style: micro mono labels (super quiet), confident values. */
    .project__spec {
      grid-column: 3 / -1;
      display: grid;
      grid-template-columns: repeat(10, minmax(0, 1fr));
      column-gap: var(--grid-gap);
      row-gap: clamp(1.1rem, 2vw, 1.55rem);
      margin: 0;
      padding: 0;
    }
    .spec-cell {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      min-width: 0;
    }
    .spec-cell--date { grid-column: span 2; }
    .spec-cell--my-role { grid-column: span 3; }
    .spec-cell--clients { grid-column: span 5; }
    .spec-cell--via { grid-column: span 3; }
    .spec-cell--tags { grid-column: 1 / -1; }
    .spec-cell dt {
      margin: 0;
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      font-weight: 400;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--muted) 60%, transparent);
      line-height: 1.4;
    }
    .spec-cell dd {
      margin: 0;
      font-size: var(--text-base);
      letter-spacing: var(--tk-small);
      line-height: 1.45;
      color: var(--fg-soft);
      font-feature-settings: var(--features-text);
    }
    .spec-cell--date dd {
      font-variant-numeric: tabular-nums;
      font-feature-settings: var(--features-tnum);
    }
    .spec-cell__sep {
      color: color-mix(in srgb, var(--muted) 45%, transparent);
      user-select: none;
      padding: 0 0.06em;
    }
    .spec-cell__inline-muted {
      color: color-mix(in srgb, var(--muted) 65%, transparent);
      font-weight: 400;
    }
    .spec-cell__tag {
      color: inherit;
    }
    .spec-cell a.project-client-link,
    .spec-cell dd a {
      color: inherit;
      text-decoration: none;
      box-shadow: inset 0 -1px 0 0 transparent;
      transition:
        color var(--dur-fast) var(--ease-standard),
        box-shadow var(--dur-fast) var(--ease-standard);
    }
    .spec-cell a.project-client-link:hover,
    .spec-cell dd a:hover {
      color: var(--fg);
      box-shadow: inset 0 -1px 0 0 color-mix(in srgb, var(--muted) 50%, transparent);
    }
    .spec-cell a:focus-visible {
      outline: 1.5px solid var(--accent);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    /* Article body — measure tuned for reading; widened past the legacy 36rem
       cap so prose uses more of the available column. */
    .project__body {
      grid-column: 3 / span 7;
      min-width: 0;
      max-width: 44rem;
    }

    /* Brief — editorial kicker rendered inside the "What we did" body, ahead of
       the prose. Smaller than the article body, italicised, more muted. Acts as
       a one-line framing line that sets up the work. */
    .project__brief {
      margin: 0 0 1.6rem;
      font-family: var(--font-display);
      font-size: clamp(1.05rem, 1.55vw, 1.2rem);
      font-style: italic;
      font-weight: 400;
      letter-spacing: -0.012em;
      line-height: 1.4;
      color: color-mix(in srgb, var(--fg) 75%, var(--muted));
      text-wrap: pretty;
      hanging-punctuation: first last;
    }

    /* Takeaway — demoted hierarchy vs. "What we did". Smaller font, more muted
       colour, slightly tighter line height. The row itself gets extra breathing
       room above it so the visual separation reads clearly. */
    .project__row--takeaway { margin-top: clamp(1.5rem, 3vw, 2.4rem); }
    .article-body.project__body--takeaway {
      font-size: var(--text-base);
      line-height: 1.6;
      color: color-mix(in srgb, var(--fg-soft) 78%, var(--muted));
    }
    .article-body.project__body--takeaway h1,
    .article-body.project__body--takeaway h2,
    .article-body.project__body--takeaway h3,
    .article-body.project__body--takeaway h4 {
      color: color-mix(in srgb, var(--fg) 85%, var(--muted));
      font-weight: 500;
    }
    .article-body.project__body--takeaway > p:first-of-type {
      font-size: var(--text-base);
      line-height: 1.6;
      letter-spacing: var(--tk-body);
      color: color-mix(in srgb, var(--fg-soft) 78%, var(--muted));
    }

    /* Links */
    .project__links {
      grid-column: 3 / -1;
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(10, minmax(0, 1fr));
      column-gap: var(--grid-gap);
      row-gap: 0;
      counter-reset: project-link;
    }
    .project__links li {
      grid-column: span 5;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      column-gap: 0.65rem;
      align-items: baseline;
      padding: 0.55rem 0;
      border-bottom: 1px solid var(--hairline);
    }
    .project__links li:first-child,
    .project__links li:nth-child(2) {
      border-top: 1px solid var(--hairline);
    }
    .project__links__num,
    .project-links__num {
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      letter-spacing: 0.02em;
      color: color-mix(in srgb, var(--muted) 70%, transparent);
      font-feature-settings: var(--features-tnum);
      padding-top: 0.05em;
    }
    .project__links a {
      font-size: var(--text-md);
      font-weight: 500;
      letter-spacing: var(--tk-ui);
      color: var(--fg);
      text-decoration: none;
      box-shadow: inset 0 -1px 0 0 transparent;
      transition:
        color var(--dur-fast) var(--ease-standard),
        box-shadow var(--dur-fast) var(--ease-standard);
    }
    .project__links a::after {
      content: " →";
      display: inline-block;
      margin-left: 0.4em;
      color: color-mix(in srgb, var(--muted) 55%, transparent);
      transition:
        transform var(--dur-fast) var(--ease-standard),
        color var(--dur-fast) var(--ease-standard);
    }
    .project__links a:hover {
      color: var(--fg);
      box-shadow: inset 0 -1px 0 0 color-mix(in srgb, var(--muted) 45%, transparent);
    }
    .project__links a:hover::after {
      color: color-mix(in srgb, var(--fg) 70%, var(--muted));
      transform: translateX(2px);
    }

    /* Gallery row */
    .project__row--gallery .gallery-strip {
      grid-column: 3 / -1;
      max-width: none;
    }

    /* Credits — tabular dl */
    .project__team {
      grid-column: 3 / -1;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(10, minmax(0, 1fr));
      column-gap: var(--grid-gap);
      row-gap: 0;
    }
    .project__team-row {
      grid-column: span 5;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      column-gap: 0.65rem;
      align-items: baseline;
      padding: 0.42rem 0;
      border-bottom: 1px solid var(--hairline);
    }
    .project__team-row dt {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: 500;
      letter-spacing: var(--tk-small);
      color: var(--fg-soft);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .project__team-row dt a {
      color: inherit;
      text-decoration: none;
      box-shadow: inset 0 -1px 0 0 transparent;
      transition:
        color var(--dur-fast) var(--ease-standard),
        box-shadow var(--dur-fast) var(--ease-standard);
    }
    .project__team-row dt a:hover {
      color: var(--fg);
      box-shadow: inset 0 -1px 0 0 currentColor;
    }
    .project__team-row dd {
      margin: 0;
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--muted) 80%, transparent);
      text-align: right;
    }

    /* Colophon */
    .project__row--colophon { padding-bottom: 1rem; }
    .project__updated {
      grid-column: 3 / -1;
      margin: 0;
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--muted) 70%, transparent);
    }
    .project__updated time {
      font-variant-numeric: tabular-nums;
      font-feature-settings: var(--features-tnum);
      color: color-mix(in srgb, var(--fg) 60%, var(--muted));
      margin-left: 0.5em;
    }

    /* Tablet — narrow rail, content takes more cols */
    @media (max-width: 1023px) {
      .project__index { grid-column: 1 / span 3; padding-top: 0.4em; }
      .project__hero-text { grid-column: 4 / -1; }
      .project__spec { grid-column: 4 / -1; grid-template-columns: repeat(9, minmax(0, 1fr)); }
      .spec-cell--date { grid-column: span 2; }
      .spec-cell--my-role { grid-column: span 3; }
      .spec-cell--clients { grid-column: span 4; }
      .spec-cell--via { grid-column: span 3; }
      .project__body { grid-column: 4 / -1; }
      .project__why { grid-column: 4 / -1; }
      .project__links { grid-column: 4 / -1; grid-template-columns: repeat(9, minmax(0, 1fr)); }
      .project__links li { grid-column: span 9; }
      .project__row--gallery .gallery-strip { grid-column: 4 / -1; }
      .project__team { grid-column: 4 / -1; grid-template-columns: repeat(9, minmax(0, 1fr)); }
      .project__team-row { grid-column: span 9; }
      .project__updated { grid-column: 4 / -1; }
    }

    /* Mobile — index becomes a top label, single column */
    @media (max-width: 720px) {
      .project { grid-template-columns: 1fr; column-gap: 0; }
      .project__row { grid-template-columns: 1fr; row-gap: 0.45rem; }
      .project__index {
        grid-column: 1;
        padding-top: 0;
        font-size: var(--text-2xs);
      }
      .project__hero-text,
      .project__spec,
      .project__body,
      .project__why,
      .project__links,
      .project__row--gallery .gallery-strip,
      .project__team,
      .project__updated {
        grid-column: 1;
      }
      .project__spec { grid-template-columns: 1fr 1fr; }
      .spec-cell--date,
      .spec-cell--my-role,
      .spec-cell--clients,
      .spec-cell--via,
      .spec-cell--tags { grid-column: 1 / -1; }
      .project__links { grid-template-columns: 1fr; }
      .project__links li { grid-column: 1; }
      .project__team { grid-template-columns: 1fr; }
      .project__team-row { grid-column: 1; }
    }

    /* Nav */
    /* ───────── Site nav (masthead) — sits on the same 12-col grid as the page ───────── */
    .site-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid var(--hairline);
      background: color-mix(in srgb, var(--bg) 88%, transparent);
      backdrop-filter: blur(16px) saturate(1.15);
      -webkit-backdrop-filter: blur(16px) saturate(1.15);
    }
    .site-nav__inner {
      max-width: var(--grid-max);
      margin: 0 auto;
      padding: 0.85rem clamp(1rem, 4vw, 2rem);
      display: grid;
      grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
      column-gap: var(--grid-gap);
      row-gap: 0;
      align-items: baseline;
    }
    .site-nav a.brand {
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1.4;
      color: var(--fg);
      text-decoration: none;
      white-space: nowrap;
      transition: color var(--dur-fast) var(--ease-standard);
    }
    .site-nav a.brand:hover {
      color: color-mix(in srgb, var(--fg) 72%, var(--muted));
    }
    /* Home masthead: brand in cols 1-2, meta on right */
    .site-nav:not(.site-nav--project) .site-nav__inner > .brand {
      grid-column: 1 / span 2;
    }
    .site-nav__meta {
      grid-column: 10 / -1;
      justify-self: end;
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      font-weight: 400;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.4;
      color: color-mix(in srgb, var(--muted) 70%, transparent);
      white-space: nowrap;
      font-feature-settings: var(--features-tnum);
    }

    /* Project masthead — sticky chrome with title slot and tools */
    .site-nav--project .site-nav__inner {
      align-items: center;
    }
    .site-nav__start {
      grid-column: 1 / span 3;
      display: flex;
      align-items: baseline;
      gap: 0;
      min-width: 0;
      white-space: nowrap;
    }
    .site-nav__start > .brand {
      flex-shrink: 0;
    }
    .site-nav__crumb {
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      font-weight: 400;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.4;
      color: color-mix(in srgb, var(--muted) 72%, var(--fg-soft));
      text-decoration: none;
      white-space: nowrap;
      transition: color var(--dur-fast) var(--ease-standard);
    }
    .site-nav__crumb::before {
      content: " / ";
      color: color-mix(in srgb, var(--muted) 45%, transparent);
      padding: 0 0.18em 0 0.32em;
    }
    .site-nav__crumb:hover {
      color: var(--fg);
    }
    .site-nav__title-slot {
      grid-column: 4 / span 6;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .site-nav__doc-title {
      display: block;
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-weight: 500;
      letter-spacing: var(--tk-ui);
      line-height: 1.25;
      color: var(--fg-soft);
      text-align: left;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0;
      transform: translateY(3px);
      transition:
        opacity var(--dur) var(--ease-standard),
        transform var(--dur) var(--ease-standard);
      pointer-events: none;
    }
    .site-nav__doc-title.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
    @media (prefers-reduced-motion: reduce) {
      .site-nav__doc-title {
        transition: none;
      }
    }
    .site-nav__tools {
      grid-column: 10 / -1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 0;
    }
    .site-nav__tool {
      margin: 0;
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--muted) 72%, var(--fg-soft));
      background: transparent;
      border: none;
      border-radius: 0;
      padding: 0.45rem 0.7rem;
      line-height: 1;
      cursor: pointer;
      position: relative;
      transition:
        color var(--dur-fast) var(--ease-standard),
        background var(--dur-fast) var(--ease-standard);
    }
    .site-nav__tool + .site-nav__tool::before {
      content: "";
      position: absolute;
      left: 0;
      top: 28%;
      bottom: 28%;
      width: 1px;
      background: color-mix(in srgb, var(--muted) 30%, transparent);
    }
    .site-nav__tool:hover {
      color: var(--fg);
      background: color-mix(in srgb, var(--fg) 5%, transparent);
    }
    .site-nav__tool:focus-visible {
      outline: 1.5px solid var(--accent);
      outline-offset: 2px;
    }
    .site-nav__tool--link {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }
    @media (max-width: 1023px) {
      .site-nav__start { grid-column: 1 / span 4; }
      .site-nav__title-slot { grid-column: 5 / span 4; }
      .site-nav__tools { grid-column: 9 / -1; }
    }
    @media (max-width: 720px) {
      .site-nav__inner {
        grid-template-columns: 1fr auto;
        row-gap: 0.4rem;
      }
      .site-nav:not(.site-nav--project) .site-nav__inner > .brand {
        grid-column: 1;
        justify-self: start;
      }
      .site-nav__meta {
        grid-column: 2;
        justify-self: end;
      }
      .site-nav__start {
        grid-column: 1 / -1;
        justify-content: flex-start;
      }
      .site-nav__title-slot {
        grid-column: 1 / -1;
        order: 3;
      }
      .site-nav__tools {
        grid-column: 1 / -1;
        order: 2;
        justify-content: flex-start;
        margin-left: -0.7rem;
      }
    }

    /* Tags */
    .tag {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-sm);
      background: var(--accent-soft);
      color: var(--accent);
      font-size: var(--text-xs);
      font-weight: 500;
      letter-spacing: var(--tk-small);
      text-transform: lowercase;
      margin: 0 0.35rem 0.35rem 0;
    }

    /* ───────── Index (home) — numbered table-of-contents on the Swiss grid ───────── */
    main.page--index {
      max-width: var(--grid-max);
      padding-top: clamp(1.75rem, 3vw, 2.5rem);
    }
    .index {
      display: grid;
      grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
      column-gap: var(--grid-gap);
      row-gap: 0;
    }
    .index__hero {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: subgrid;
      column-gap: var(--grid-gap);
      align-items: start;
      padding-block: clamp(2.75rem, 6.5vw, 5rem) clamp(2.5rem, 5vw, 4rem);
    }
    .index__hero .project__index {
      padding-top: 0.35em;
      align-self: start;
    }
    .index__intro {
      gap: 0;
    }
    .index__display {
      font-size: clamp(2.65rem, 6.8vw, 4.85rem);
      font-weight: 500;
      letter-spacing: -0.052em;
      line-height: 0.94;
      max-width: 12ch;
      margin-bottom: clamp(1.35rem, 3.2vw, 2.25rem);
    }
    .index__lede {
      margin: 0;
      padding-top: clamp(0.35rem, 1vw, 0.65rem);
      font-family: var(--font-sans);
      font-size: clamp(1rem, 1.45vw, 1.1875rem);
      font-weight: 400;
      letter-spacing: var(--tk-body);
      line-height: var(--lh-loose);
      color: color-mix(in srgb, var(--fg-soft) 90%, var(--muted));
      max-width: 46ch;
      text-wrap: pretty;
      hanging-punctuation: first last;
    }
    .page--index .index__lede a {
      color: var(--fg-soft);
      text-decoration: none;
      border-bottom: 1px solid color-mix(in srgb, var(--muted) 55%, transparent);
      padding-bottom: 0.08em;
      transition:
        color var(--dur-fast) var(--ease-standard),
        border-color var(--dur-fast) var(--ease-standard);
    }
    .page--index .index__lede a:hover {
      color: var(--fg);
      text-decoration: none;
      border-bottom-color: color-mix(in srgb, var(--fg) 55%, transparent);
    }
    .page--index .index__lede a:focus-visible {
      color: var(--fg);
      outline: 1.5px solid color-mix(in srgb, var(--fg) 40%, transparent);
      outline-offset: 3px;
      border-radius: var(--radius-sm);
    }
    .index__hero + .project__rule {
      margin-bottom: clamp(2.75rem, 5.5vw, 4rem);
    }
    /* Two-column image grid — image leads, type is a quiet caption.
       Tight 10px gutter between the plates, generous row gap below. */
    .index__list {
      grid-column: 1 / -1;
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 10px;
      row-gap: 60px;
    }
    .index__row {
      display: flex;
      flex-direction: column;
      gap: 1.05rem;
      text-decoration: none;
      color: inherit;
    }
    .index__row:focus-visible {
      outline: 1.5px solid var(--accent);
      outline-offset: 4px;
    }
    .index__body {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
    }
    .index__title {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 500;
      letter-spacing: var(--tk-ui);
      line-height: 1.25;
      color: var(--fg);
      margin: 0;
      text-wrap: balance;
      transition: color var(--dur-fast) var(--ease-standard);
    }
    .index__row:hover .index__title {
      color: color-mix(in srgb, var(--fg) 78%, var(--muted));
    }
    .index__meta {
      margin: 0;
      font-family: var(--font-mono);
      font-size: var(--text-2xs);
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--muted) 88%, transparent);
      line-height: 1.4;
    }
    .index__meta-sep {
      color: color-mix(in srgb, var(--muted) 45%, transparent);
      font-weight: 400;
      padding: 0 0.18em;
    }
    /* Cards match the native video aspect (16:9) so Cloudflare Stream iframes
       don't letterbox, then everything sits at a 1.1× scale for a tight crop
       (hides any residual bars on non-standard sources and gives images a
       slightly tighter, more editorial feel). Hover nudges to 1.13. */
    .index__media {
      position: relative;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      background: color-mix(in srgb, var(--fg) 3%, transparent);
    }
    .index__media img,
    .index__media-iframe,
    .index__media-video {
      transform: scale(1.1);
      transform-origin: center;
      transition: transform 0.55s var(--ease-out-expo);
    }
    .index__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .index__row:hover .index__media img,
    .index__row:hover .index__media-iframe,
    .index__row:hover .index__media-video {
      transform: scale(1.13);
    }
    .index__media--video {
      background: #000;
    }
    .index__media-iframe,
    .index__media-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      pointer-events: none;
    }
    .index__media-video {
      object-fit: cover;
    }
    .index__media--empty {
      background:
        linear-gradient(135deg,
          color-mix(in srgb, var(--fg) 4%, transparent),
          color-mix(in srgb, var(--fg) 1%, transparent) 60%,
          transparent);
    }

    .index__empty {
      grid-column: 1 / -1;
      padding: 3rem 0;
      font-size: var(--text-sm);
      color: var(--muted);
      border-top: 1px solid var(--hairline);
      border-bottom: 1px solid var(--hairline);
    }
    @media (max-width: 720px) {
      .index { grid-template-columns: 1fr; column-gap: 0; }
      .index__hero {
        grid-template-columns: 1fr;
        row-gap: 0.65rem;
        padding-block: 2rem 1.75rem;
      }
      .index__display {
        font-size: clamp(2.15rem, 11vw, 2.85rem);
        max-width: none;
        margin-bottom: 1.25rem;
      }
      .index__lede {
        line-height: 1.75;
        max-width: none;
      }
      .index__list {
        grid-template-columns: 1fr;
        row-gap: 40px;
      }
    }

    /* Project detail anchors */
    #article-body,
    #project-gallery {
      scroll-margin-top: 5rem;
    }

    /* Project gallery container — within Swiss grid (placement set on .project__row--gallery .gallery-strip) */
    .project-gallery {
      margin: 0;
    }
    .gallery-strip {
      box-sizing: border-box;
      width: 100%;
      max-width: 48rem;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .gallery-figure {
      margin: 0;
      padding: clamp(4px, 0.65vw, 6px);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--bg-elevated);
      box-shadow: 0 1px 0 color-mix(in srgb, var(--fg) 2.5%, transparent);
    }
    /* First plate sits a hair larger but stays flat. */
    .gallery-strip .gallery-figure--hero {
      padding: clamp(5px, 0.85vw, 8px);
      border-radius: var(--radius-sm);
    }
    @media (prefers-color-scheme: dark) {
      .gallery-figure {
        border-color: var(--border);
        background: var(--bg-elevated);
        box-shadow: 0 1px 0 color-mix(in srgb, var(--fg) 4%, transparent);
      }
      .gallery-strip .gallery-figcaption {
        background: color-mix(in srgb, var(--bg-elevated) 88%, var(--fg) 12%);
        border-top-color: color-mix(in srgb, var(--border) 80%, transparent);
        color: color-mix(in srgb, var(--muted) 88%, var(--fg-soft));
      }
    }
    .gallery-thumb {
      display: block;
      width: 100%;
      padding: 0;
      margin: 0;
      border: none;
      background: transparent;
      cursor: zoom-in;
      color: inherit;
      font: inherit;
      line-height: 0;
    }
    .gallery-thumb:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 2px var(--accent);
    }
    .gallery-strip .gallery-thumb {
      overflow: hidden;
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--bg-elevated) 82%, var(--fg) 18%);
    }
    .gallery-strip .gallery-figure:has(.gallery-figcaption) .gallery-thumb {
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    }
    .gallery-strip .gallery-figure--hero .gallery-thumb {
      border-radius: var(--radius-sm);
    }
    .gallery-strip .gallery-figure--hero:has(.gallery-figcaption) .gallery-thumb {
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    }
    .gallery-strip .gallery-thumb img {
      width: 100%;
      height: auto;
      vertical-align: middle;
      display: block;
      transition: opacity 0.35s var(--ease-out-expo);
    }
    @media (hover: hover) {
      .gallery-strip .gallery-thumb:hover img {
        opacity: 0.92;
      }
    }

    /* Gallery video — Cloudflare Stream iframe or HTML5 <video> */
    .gallery-figure--video .gallery-video {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      overflow: hidden;
      border-radius: var(--radius-sm);
    }
    .gallery-strip .gallery-figure--video:has(.gallery-figcaption) .gallery-video {
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    }
    .gallery-video__iframe,
    .gallery-video__el {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }
    .gallery-video__el {
      object-fit: contain;
      background: #000;
    }
    .gallery-strip .gallery-figcaption {
      margin: 0;
      padding: 0.7rem clamp(0.85rem, 2.8vw, 1.2rem) 0.55rem;
      font-size: var(--text-sm);
      font-weight: 400;
      color: color-mix(in srgb, var(--muted) 80%, var(--fg-soft));
      line-height: 1.45;
      letter-spacing: var(--tk-small);
      border-top: 1px solid var(--hairline);
      background: color-mix(in srgb, var(--bg-elevated) 95%, var(--fg) 5%);
    }
    .gallery-figure:last-child .gallery-figcaption {
      padding-bottom: 0.5rem;
    }

    .gallery-lightbox {
      padding: 0;
      border: none;
      margin: 0;
      max-width: none;
      max-height: none;
      width: 100%;
      height: 100%;
      background: transparent;
    }
    .gallery-lightbox::backdrop {
      background: rgba(12, 12, 12, 0.94);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }
    .gallery-lightbox__shell {
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      min-height: 100dvh;
      padding: clamp(3rem, 8vw, 4rem) clamp(0.75rem, 3vw, 1.25rem) clamp(1.5rem, 4vw, 2rem);
    }
    .gallery-lightbox__close {
      position: absolute;
      top: clamp(0.65rem, 2vw, 1rem);
      right: clamp(0.65rem, 2vw, 1rem);
      z-index: 2;
      padding: 0.4rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--bg-elevated) 72%, transparent);
      color: var(--fg-soft);
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      font-weight: 500;
      letter-spacing: var(--tk-caps);
      text-transform: uppercase;
      cursor: pointer;
      transition:
        border-color var(--dur-fast) var(--ease-standard),
        background var(--dur-fast) var(--ease-standard),
        color var(--dur-fast) var(--ease-standard);
    }
    .gallery-lightbox__close:hover {
      border-color: color-mix(in srgb, var(--fg) 30%, transparent);
      color: var(--fg);
    }
    .gallery-lightbox__row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      width: 100%;
      max-width: min(96vw, 1680px);
      margin: 0 auto;
      flex: 1;
      min-height: 0;
    }
    .gallery-lightbox__nav {
      flex-shrink: 0;
      width: 2.75rem;
      height: 2.75rem;
      padding: 0;
      border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--bg-elevated) 55%, transparent);
      color: var(--fg-soft);
      font-size: 1.65rem;
      font-weight: 300;
      line-height: 1;
      cursor: pointer;
      transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
    }
    .gallery-lightbox__nav:hover {
      border-color: var(--accent);
      color: var(--fg);
    }
    .gallery-lightbox__figure {
      margin: 0;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
    }
    .gallery-lightbox__img {
      display: block;
      max-width: 100%;
      max-height: min(82vh, 1400px);
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: var(--radius-sm);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
    }
    .gallery-lightbox__caption {
      margin: 0;
      padding: 0 0.5rem;
      max-width: 42rem;
      text-align: center;
      font-size: var(--text-sm);
      letter-spacing: var(--tk-small);
      line-height: 1.5;
      color: color-mix(in srgb, var(--fg) 80%, var(--muted));
    }
    .gallery-lightbox__caption:empty {
      display: none;
    }

    /* Admin + compact grids elsewhere */
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

    @media (prefers-reduced-motion: reduce) {
      .gallery-thumb img {
        transition: none;
      }
      .gallery-lightbox::backdrop {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }
    @media (max-width: 520px) {
      .gallery-lightbox__nav {
        width: 2.35rem;
        height: 2.35rem;
        font-size: 1.35rem;
      }
    }
    /* Note: project-team / project-links / project-footer-meta have been replaced by
       the Swiss grid system (.project__team, .project__links, .project__updated). */

    /* Markdown body — long-form reading */
    .article-body {
      font-size: var(--text-lg);
      line-height: 1.62;
      letter-spacing: var(--tk-body);
      font-weight: 400;
      color: color-mix(in srgb, var(--fg-soft) 96%, var(--muted));
      margin: 0;
      text-wrap: pretty;
      hanging-punctuation: first last;
      font-feature-settings: var(--features-text);
      font-kerning: normal;
    }
    .article-body > *:first-child { margin-top: 0; }
    .article-body > *:last-child { margin-bottom: 0; }
    .article-body h1,
    .article-body h2,
    .article-body h3,
    .article-body h4 {
      font-family: var(--font-display);
      color: var(--fg);
      font-weight: 500;
      line-height: 1.2;
      margin: 2.4rem 0 0.65rem;
      text-wrap: balance;
      letter-spacing: var(--tk-h2);
    }
    .article-body h1 {
      font-size: clamp(1.5rem, 2.4vw, 1.7rem);
      letter-spacing: var(--tk-h1);
      line-height: 1.14;
      margin-top: 2.6rem;
    }
    .article-body h2 {
      font-size: clamp(1.3rem, 2.05vw, 1.45rem);
      letter-spacing: var(--tk-h2);
    }
    .article-body h3 {
      font-size: var(--text-h3);
      letter-spacing: var(--tk-h3);
    }
    .article-body h4 {
      font-size: var(--text-md);
      letter-spacing: var(--tk-h3);
      font-weight: 500;
    }
    .article-body h2:first-child,
    .article-body h3:first-child,
    .article-body h4:first-child { margin-top: 0; }
    .article-body p { margin: 0 0 1.25rem; }
    /* Lede — first paragraph reads as a proper editorial lede so the
       hierarchy below it (h2 / body) has air to breathe. */
    .article-body > p:first-of-type {
      font-size: clamp(1.15rem, 1.6vw, 1.3rem);
      line-height: 1.4;
      letter-spacing: -0.014em;
      color: var(--fg);
      font-weight: 400;
      margin-bottom: 1.55rem;
      max-width: 34rem;
    }
    .article-body > p:first-of-type strong { font-weight: 500; }
    .article-body strong { font-weight: 500; color: var(--fg); }
    .article-body em { font-style: italic; }
    .article-body a {
      color: var(--fg);
      text-decoration: none;
      box-shadow: inset 0 -1px 0 0 color-mix(in srgb, var(--muted) 50%, transparent);
      word-break: break-word;
      transition:
        color var(--dur-fast) var(--ease-standard),
        box-shadow var(--dur-fast) var(--ease-standard);
    }
    .article-body a:hover {
      color: var(--fg);
      box-shadow: inset 0 -1px 0 0 currentColor;
    }
    .article-body ul,
    .article-body ol {
      margin: 0 0 1.1rem;
      padding-left: 1.35rem;
    }
    .article-body li { margin: 0.35rem 0; }
    .article-body li::marker {
      color: color-mix(in srgb, var(--muted) 70%, transparent);
    }
    .article-body blockquote {
      margin: 1.35rem 0;
      padding: 0.1rem 0 0.1rem 1.1rem;
      border-left: 1px solid color-mix(in srgb, var(--muted) 38%, transparent);
      color: color-mix(in srgb, var(--fg-soft) 78%, var(--muted));
      font-style: normal;
      letter-spacing: -0.013em;
    }
    .article-body blockquote p { margin-bottom: 0.6rem; }
    .article-body pre {
      overflow-x: auto;
      padding: 0.95rem 1.05rem;
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--fg) 4%, var(--bg));
      border: 1px solid var(--hairline);
      font-family: var(--font-mono);
      font-size: 0.84rem;
      line-height: 1.55;
      letter-spacing: 0;
      margin: 1.25rem 0;
      color: var(--fg-soft);
    }
    .article-body code {
      font-family: var(--font-mono);
      font-size: 0.86em;
      letter-spacing: 0;
      background: color-mix(in srgb, var(--fg) 5.5%, transparent);
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-sm);
      color: var(--fg);
    }
    .article-body pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    .article-body img {
      max-width: 100%;
      height: auto;
      border-radius: var(--radius-sm);
      margin: 1.35rem 0;
    }
    .article-body hr {
      border: none;
      border-top: 1px solid var(--hairline);
      margin: 2.25rem auto;
      width: 4rem;
    }

    /* Admin — shares root palette + Onest */
    body.admin-app {
      --adm-fg: var(--fg);
      --adm-fg-soft: var(--fg-soft);
      --adm-bg: var(--bg);
      --adm-bg-soft: color-mix(in srgb, var(--adm-fg) 3%, var(--adm-bg));
      --adm-muted: var(--muted);
      --adm-line: var(--line);
      --adm-line-strong: color-mix(in srgb, var(--adm-fg) 14%, transparent);
      --adm-field-bg: var(--bg-elevated);
      --adm-accent: var(--accent);
      --adm-ring: color-mix(in srgb, var(--adm-accent) 70%, transparent);
      --adm-scrim: color-mix(in srgb, var(--adm-fg) 5%, transparent);
      --adm-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, "JetBrains Mono", monospace;
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
      /* 100dvh alone can exceed the visible viewport on mobile Safari; cap with svh so the shell never clips the editor. */
      height: min(100dvh, 100svh);
      max-height: min(100dvh, 100svh);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    body.admin-app .admin-header {
      flex-shrink: 0;
      padding: 0.85rem clamp(1rem, 2vw, 1.5rem) 0;
      margin-bottom: 0;
      border-bottom: 1px solid var(--adm-line);
      background: color-mix(in srgb, var(--adm-bg) 86%, transparent);
      backdrop-filter: blur(18px) saturate(1.1);
      -webkit-backdrop-filter: blur(18px) saturate(1.1);
    }
    body.admin-app .admin-header__row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.65rem;
    }
    body.admin-app .admin-wordmark {
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      color: var(--adm-fg);
    }
    body.admin-app .admin-wordmark::before {
      content: "■  ";
      color: var(--adm-accent);
      letter-spacing: 0;
    }
    body.admin-app .admin-header__exit {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--adm-muted);
      text-decoration: none;
      letter-spacing: -0.005em;
      transition: color 0.18s var(--ease-out-expo);
    }
    body.admin-app .admin-header__exit:hover {
      color: var(--adm-fg);
    }
    body.admin-app .admin-header__exit::after {
      content: " ↗";
      font-size: 0.85em;
      color: var(--adm-muted);
    }
    body.admin-app .admin-header__links {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.35rem 0.5rem;
    }
    body.admin-app .admin-header__links-sep {
      color: var(--adm-line-strong);
      font-weight: 400;
      user-select: none;
    }
    body.admin-app .admin-header__link-btn {
      font-family: inherit;
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: -0.005em;
      color: var(--adm-muted);
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: color 0.18s var(--ease-out-expo), border-color 0.18s var(--ease-out-expo);
      max-width: none;
      width: auto;
    }
    body.admin-app .admin-header__link-btn:hover {
      color: var(--adm-fg);
      border-bottom-color: var(--adm-fg);
    }
    body.admin-app .admin-header__link-btn:focus-visible {
      outline: 1px solid var(--adm-ring);
      outline-offset: 4px;
      border-radius: 0;
    }
    body.admin-app .admin-api-docs-prose {
      font-size: 0.875rem;
      line-height: 1.55;
      color: var(--adm-fg-soft);
    }
    body.admin-app .admin-api-docs-prose p {
      margin: 0 0 0.65rem;
    }
    body.admin-app .admin-api-docs-prose p:last-child {
      margin-bottom: 0;
    }
    body.admin-app .admin-doc-muted {
      color: var(--adm-muted);
      font-size: 0.8125rem;
    }
    body.admin-app .admin-code-inline {
      font-family: var(--adm-mono);
      font-size: 0.8125em;
      letter-spacing: -0.02em;
      padding: 0.1em 0.28em;
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--adm-muted) 12%, transparent);
      color: var(--adm-fg);
    }
    body.admin-app .admin-doc-pre {
      margin: 0.5rem 0 0;
      padding: 0.65rem 0.75rem;
      font-family: var(--adm-mono);
      font-size: 0.78rem;
      line-height: 1.45;
      letter-spacing: -0.02em;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      border-radius: var(--radius-sm);
      border: 1px solid var(--adm-line);
      background: color-mix(in srgb, var(--adm-bg-soft) 94%, transparent);
      color: var(--adm-fg);
    }
    body.admin-app .admin-doc-list {
      margin: 0.35rem 0 0;
      padding-left: 1.15rem;
      color: var(--adm-fg-soft);
      font-size: 0.875rem;
      line-height: 1.5;
    }
    body.admin-app .admin-doc-list li {
      margin-bottom: 0.35rem;
    }
    body.admin-app .admin-doc-list li:last-child {
      margin-bottom: 0;
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
      letter-spacing: -0.005em;
      text-transform: none;
      padding: 0.55rem 0 0.7rem;
      margin-right: 1.5rem;
      background: none;
      border: none;
      border-bottom: 1px solid transparent;
      color: var(--adm-muted);
      cursor: pointer;
      border-radius: 0;
      width: auto;
      max-width: none;
      transition: color 0.18s var(--ease-out-expo), border-color 0.18s var(--ease-out-expo);
    }
    body.admin-app .admin-nav__btn:hover { color: var(--adm-fg); }
    body.admin-app .admin-nav__btn.is-active {
      color: var(--adm-fg);
      border-bottom-color: var(--adm-fg);
    }
    body.admin-app .admin-nav__btn:focus-visible {
      outline: 1px solid var(--adm-ring);
      outline-offset: 4px;
      border-radius: 0;
    }
    body.admin-app .admin-main {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 0 clamp(1rem, 2vw, 1.5rem) 1rem;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    body.admin-app .admin-main > .admin-view:not([hidden]) {
      flex: 1;
      min-height: 0;
    }
    body.admin-app #view-editor:not([hidden]) {
      display: flex;
      flex-direction: column;
    }
    body.admin-app .admin-view-title {
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      color: var(--adm-muted);
      margin: 0 0 1.5rem;
    }
    body.admin-app .admin-view-title::before {
      content: "/ ";
      color: var(--adm-line-strong);
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
      width: 2rem;
      height: 2rem;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      font-weight: 400;
      line-height: 1;
      background: transparent;
      color: var(--adm-muted);
      border: 1px solid var(--adm-line);
      cursor: pointer;
      border-radius: var(--radius-sm);
      max-width: none;
      transition: background 0.18s var(--ease-out-expo), border-color 0.18s ease, color 0.18s ease;
    }
    body.admin-app .admin-add-btn:hover {
      background: var(--adm-scrim);
      border-color: var(--adm-line-strong);
      color: var(--adm-fg);
    }
    body.admin-app .admin-add-btn:focus-visible {
      outline: 1px solid var(--adm-ring);
      outline-offset: 2px;
    }
    body.admin-app .admin-overlay[hidden] {
      display: none !important;
    }
    body.admin-app .admin-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
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
      background: color-mix(in srgb, var(--adm-bg) 78%, transparent);
      backdrop-filter: blur(20px) saturate(1.05);
      -webkit-backdrop-filter: blur(20px) saturate(1.05);
      cursor: pointer;
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
    body.admin-app .admin-overlay__panel--sheet .admin-grid {
      margin-top: 0;
    }
    body.admin-app .admin-overlay__panel {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 26rem;
      max-height: min(92dvh, 100%);
      overflow-y: auto;
      background: var(--adm-field-bg);
      border: 1px solid var(--adm-line-strong);
      border-radius: var(--radius-sm);
      padding: 1.25rem 1.35rem 1.5rem;
      box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.5);
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
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-overlay__title-stack {
      min-width: 0;
      padding-right: 0.5rem;
    }
    body.admin-app .admin-overlay__eyebrow {
      margin: 0 0 0.4rem;
      font-family: var(--adm-mono);
      font-size: 0.625rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-overlay__eyebrow::before {
      content: "/ ";
      color: var(--adm-line-strong);
    }
    body.admin-app .admin-overlay__heading {
      margin: 0 0 0.5rem;
      font-size: 1.3rem;
      font-weight: 500;
      letter-spacing: -0.025em;
      line-height: 1.15;
      color: var(--adm-fg);
      text-transform: none;
    }
    body.admin-app .admin-overlay__lede {
      margin: 0;
      font-size: 0.8125rem;
      font-weight: 400;
      letter-spacing: -0.005em;
      line-height: 1.5;
      color: var(--adm-muted);
      max-width: 28rem;
    }
    body.admin-app .admin-overlay__lede--compact {
      font-size: 0.78rem;
      line-height: 1.45;
      max-width: 22rem;
    }
    body.admin-app .admin-overlay__head--rich {
      align-items: flex-start;
      margin-bottom: 0;
      padding-bottom: 1.1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--adm-line) 92%, transparent);
    }
    body.admin-app .admin-overlay__panel--settings {
      max-width: min(42rem, 100%);
      max-height: min(92dvh, 880px);
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      border-radius: var(--radius-sm);
    }
    body.admin-app .admin-overlay__panel--settings > .admin-overlay__head {
      padding: 1.7rem 1.85rem 1.4rem;
      margin-bottom: 0;
      flex-shrink: 0;
    }
    body.admin-app .admin-overlay__body--scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 1.65rem 1.85rem 1.85rem;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--adm-muted) 45%, transparent) transparent;
    }
    body.admin-app .admin-settings-section {
      padding-bottom: 1.85rem;
      margin-bottom: 1.85rem;
      border-bottom: 1px solid color-mix(in srgb, var(--adm-line) 88%, transparent);
    }
    body.admin-app .admin-settings-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    body.admin-app .admin-settings-section__label {
      margin: 0 0 1.15rem;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-settings-section__label::before {
      content: "§ ";
      color: var(--adm-line-strong);
    }
    body.admin-app .admin-settings-section__fields {
      display: flex;
      flex-direction: column;
      gap: 1.3rem;
    }
    body.admin-app .admin-settings-section__fields--dense {
      gap: 1.45rem;
    }
    body.admin-app .admin-overlay__footer {
      flex-shrink: 0;
      padding: 1.15rem 1.85rem 1.55rem;
      border-top: 1px solid color-mix(in srgb, var(--adm-line) 92%, transparent);
      background: color-mix(in srgb, var(--adm-field-bg) 92%, var(--adm-accent));
      display: flex;
      flex-direction: column;
      gap: 0.95rem;
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
      font-weight: 500;
      letter-spacing: -0.02em;
      text-transform: none;
      color: var(--adm-fg);
    }
    body.admin-app label,
    body.admin-app .admin-label {
      display: block;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      color: var(--adm-muted);
      margin-bottom: 0.4rem;
    }
    body.admin-app .admin-field-hint {
      margin: -0.15rem 0 0.4rem;
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: -0.005em;
      text-transform: none;
      color: var(--adm-muted);
      line-height: 1.45;
    }
    body.admin-app .admin-field-more {
      margin: -0.2rem 0 0.45rem;
      padding: 0;
      border: none;
    }
    body.admin-app .admin-field-more summary {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.01em;
      text-transform: lowercase;
      color: var(--adm-muted);
      list-style: none;
      transition: color 0.15s ease;
    }
    body.admin-app .admin-field-more summary::-webkit-details-marker {
      display: none;
    }
    body.admin-app .admin-field-more summary::after {
      content: "";
      width: 0.35em;
      height: 0.35em;
      border-right: 1px solid currentColor;
      border-bottom: 1px solid currentColor;
      transform: rotate(-45deg);
      opacity: 0.65;
      transition: transform 0.2s var(--ease-out-expo);
    }
    body.admin-app .admin-field-more[open] summary::after {
      transform: rotate(45deg);
    }
    body.admin-app .admin-field-more summary:hover {
      color: color-mix(in srgb, var(--adm-accent) 72%, var(--adm-fg));
    }
    body.admin-app .admin-field-more__body {
      margin: 0.45rem 0 0;
      padding: 0;
      font-size: 0.72rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      text-transform: none;
      color: var(--adm-muted);
      line-height: 1.45;
      max-width: 26rem;
    }
    body.admin-app input,
    body.admin-app textarea,
    body.admin-app select {
      font: inherit;
      letter-spacing: -0.01em;
      border-radius: var(--radius-sm);
      border: 1px solid var(--adm-line);
      padding: 0.55rem 0.7rem;
      background: var(--adm-field-bg);
      color: var(--adm-fg);
      width: 100%;
      max-width: 100%;
      transition: border-color 0.16s ease, background 0.16s ease;
    }
    body.admin-app input::placeholder,
    body.admin-app textarea::placeholder {
      color: color-mix(in srgb, var(--adm-muted) 70%, transparent);
    }
    body.admin-app input:hover,
    body.admin-app textarea:hover,
    body.admin-app select:hover {
      border-color: var(--adm-line-strong);
    }
    body.admin-app input:focus,
    body.admin-app textarea:focus,
    body.admin-app select:focus {
      outline: none;
      border-color: var(--adm-fg);
      background: var(--adm-bg-soft);
    }
    body.admin-app input:focus-visible,
    body.admin-app textarea:focus-visible,
    body.admin-app select:focus-visible {
      outline: none;
    }
    body.admin-app input[name="sort_date"],
    body.admin-app input[name="tags"] {
      font-variant-numeric: tabular-nums;
    }
    body.admin-app button[type="submit"],
    body.admin-app .admin-btn {
      width: auto;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.8125rem;
      font-weight: 500;
      letter-spacing: -0.005em;
      text-transform: none;
      background: var(--adm-accent);
      color: var(--on-accent);
      border: 1px solid var(--adm-accent);
      padding: 0.5rem 0.9rem;
      border-radius: var(--radius-sm);
      max-width: none;
      box-shadow: none;
      transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, opacity 0.16s ease;
    }
    body.admin-app button[type="submit"]:hover,
    body.admin-app .admin-btn:hover {
      background: color-mix(in srgb, var(--adm-accent) 88%, var(--adm-fg));
      border-color: color-mix(in srgb, var(--adm-accent) 88%, var(--adm-fg));
    }
    body.admin-app button[type="submit"]:focus-visible,
    body.admin-app .admin-btn:focus-visible {
      outline: 1px solid var(--adm-ring);
      outline-offset: 2px;
    }
    body.admin-app .admin-btn.admin-btn--toolbar-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.5rem 0.85rem 0.5rem 0.9rem;
    }
    body.admin-app .admin-btn__label {
      letter-spacing: -0.005em;
    }
    body.admin-app .admin-btn.admin-btn--toolbar-secondary {
      background: transparent;
      color: var(--adm-fg);
      border-color: var(--adm-line-strong);
    }
    body.admin-app .admin-btn.admin-btn--toolbar-secondary:hover {
      background: var(--adm-scrim);
      border-color: var(--adm-fg);
      color: var(--adm-fg);
    }
    body.admin-app .admin-btn.admin-btn--toolbar-archive {
      background: transparent;
      color: var(--adm-muted);
      border: none;
      padding: 0.5rem 0.35rem;
      font-weight: 400;
      letter-spacing: -0.005em;
      transition: color 0.16s ease;
    }
    body.admin-app .admin-btn.admin-btn--toolbar-archive:hover {
      color: var(--red);
      background: transparent;
      border: none;
    }
    body.admin-app .admin-kbd.admin-kbd--inline {
      display: inline-block;
      padding: 0.12rem 0.32rem 0.14rem;
      font-family: var(--adm-mono);
      font-size: 0.625rem;
      font-weight: 500;
      font-style: normal;
      letter-spacing: 0;
      text-transform: none;
      line-height: 1;
      color: color-mix(in srgb, var(--on-accent) 80%, transparent);
      background: color-mix(in srgb, #000000 18%, transparent);
      border: 1px solid color-mix(in srgb, #000000 14%, transparent);
      border-radius: var(--radius-sm);
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
      min-height: 1.25rem;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0;
      font-variant-numeric: tabular-nums;
      color: var(--adm-muted);
      transition: color 0.2s ease;
    }
    body.admin-app .admin-save-status:not(:empty)::before {
      content: "→ ";
      color: var(--adm-line-strong);
    }
    body.admin-app .admin-save-status.is-success {
      color: color-mix(in srgb, var(--green) 65%, var(--adm-fg));
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
      padding: 0.4rem 0.75rem;
      cursor: pointer;
      font-size: 0.8125rem;
      line-height: 1.35;
      transition: background 0.12s ease;
    }
    body.admin-app .admin-collab-row:hover {
      background: var(--adm-scrim);
    }
    body.admin-app .admin-collab-row input {
      width: auto;
      margin: 0;
      accent-color: var(--adm-fg);
    }
    body.admin-app .admin-collab-row__text {
      min-width: 0;
      word-break: break-word;
      color: var(--adm-fg);
    }
    body.admin-app .admin-collab-row__id {
      font-family: var(--adm-mono);
      font-size: 0.65rem;
      letter-spacing: 0;
      text-transform: lowercase;
      font-variant-numeric: tabular-nums;
      color: var(--adm-muted);
      white-space: nowrap;
    }
    body.admin-app .admin-collab-team-block:not(:last-child) {
      border-bottom: 1px solid color-mix(in srgb, var(--adm-line) 85%, transparent);
    }
    body.admin-app .admin-collab-team-role {
      padding: 0 0.75rem 0.5rem 2.35rem;
    }
    body.admin-app .admin-collab-team-role__input {
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: 0.35rem 0.5rem;
      font-size: 0.8125rem;
      line-height: 1.35;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      background: var(--adm-field-bg);
      color: var(--adm-fg);
    }
    body.admin-app .admin-collab-team-role__input::placeholder {
      color: var(--adm-muted);
    }
    body.admin-app .admin-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }
    body.admin-app .admin-gallery-block {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    body.admin-app .admin-gallery-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 1.1rem;
    }
    body.admin-app .admin-gallery-title {
      margin: 0;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-gallery-title::before {
      content: "§ ";
      color: var(--adm-line-strong);
    }
    body.admin-app .admin-gallery-count {
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0;
      color: var(--adm-muted);
      min-height: 1.2em;
    }
    body.admin-app .admin-gallery-count:not(:empty)::before {
      content: "→ ";
      color: var(--adm-line-strong);
    }
    body.admin-app .admin-gallery-composer {
      display: flex;
      gap: 0;
      align-items: stretch;
      border: 1px solid var(--adm-line-strong);
      border-radius: var(--radius-sm);
      background: var(--adm-bg-soft);
      overflow: hidden;
      transition: border-color 0.16s ease, background 0.16s ease;
    }
    body.admin-app .admin-gallery-composer:focus-within {
      border-color: var(--adm-fg);
      background: var(--adm-field-bg);
    }
    body.admin-app .admin-gallery-composer-input {
      flex: 1;
      min-width: 0;
      margin: 0;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      padding: 0.55rem 0.7rem !important;
      font-family: var(--adm-mono);
      font-size: 0.8125rem;
      letter-spacing: -0.01em;
      background: transparent !important;
    }
    body.admin-app .admin-gallery-composer-input:focus {
      outline: none !important;
      box-shadow: none !important;
      background: transparent !important;
    }
    body.admin-app .admin-gallery-composer-add {
      flex-shrink: 0;
      margin: 0;
      padding: 0 0.95rem;
      font-family: inherit;
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: -0.005em;
      text-transform: none;
      color: var(--adm-fg);
      background: transparent;
      border: none;
      border-left: 1px solid var(--adm-line);
      cursor: pointer;
      transition: background 0.14s ease, color 0.14s ease;
      max-width: none;
      width: auto;
      border-radius: 0;
      box-shadow: none;
    }
    body.admin-app .admin-gallery-composer-add:hover {
      background: var(--adm-scrim);
      filter: none;
      transform: none;
      opacity: 1;
    }
    body.admin-app .admin-gallery-composer-hint {
      margin: 0.7rem 0 1.2rem;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 400;
      letter-spacing: 0;
      line-height: 1.5;
      color: var(--adm-muted);
    }
    body.admin-app .admin-gallery-composer-hint kbd {
      font-family: var(--adm-mono);
      font-size: 0.85em;
      padding: 0.04rem 0.28rem;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--adm-fg);
    }
    body.admin-app .admin-links-block .admin-field-hint {
      margin-bottom: 0.65rem;
    }
    body.admin-app .admin-links-composer {
      display: grid;
      grid-template-columns: minmax(6.5rem, 0.32fr) minmax(0, 1fr) auto;
      align-items: stretch;
      border: 1px solid var(--adm-line-strong);
      border-radius: var(--radius-sm);
      background: var(--adm-bg-soft);
      overflow: hidden;
      transition: border-color 0.16s ease, background 0.16s ease;
    }
    body.admin-app .admin-links-composer:focus-within {
      border-color: var(--adm-fg);
      background: var(--adm-field-bg);
    }
    body.admin-app .admin-links-composer-label,
    body.admin-app .admin-links-composer-url {
      margin: 0;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      padding: 0.55rem 0.65rem !important;
      font-family: var(--adm-mono);
      font-size: 0.8125rem;
      letter-spacing: -0.01em;
      background: transparent !important;
      min-width: 0;
    }
    body.admin-app .admin-links-composer-label {
      border-right: 1px solid var(--adm-line) !important;
    }
    body.admin-app .admin-links-composer-url {
      border-right: 1px solid var(--adm-line) !important;
    }
    body.admin-app .admin-links-composer-label:focus,
    body.admin-app .admin-links-composer-url:focus {
      outline: none !important;
    }
    body.admin-app .admin-links-rows {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin-top: 0.65rem;
    }
    body.admin-app .admin-link-row {
      display: grid;
      grid-template-columns: auto minmax(5rem, 0.3fr) minmax(0, 1fr) auto;
      gap: 0;
      align-items: stretch;
      padding: 0.35rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--adm-line) 94%, transparent);
      transition: opacity 0.15s ease;
    }
    body.admin-app .admin-link-row:last-child {
      border-bottom: none;
    }
    body.admin-app .admin-link-row .admin-gallery-grip {
      align-self: center;
      border-right: 1px solid color-mix(in srgb, var(--adm-line) 88%, transparent);
      margin-right: 0.35rem;
      padding-right: 0.35rem;
    }
    body.admin-app .admin-link-row--dragging {
      opacity: 0.45;
    }
    body.admin-app .admin-link-label,
    body.admin-app .admin-link-url {
      margin: 0;
      border: none !important;
      border-radius: 0 !important;
      padding: 0.45rem 0.55rem !important;
      font-family: var(--adm-mono);
      font-size: 0.78rem;
      letter-spacing: -0.01em;
      background: transparent !important;
      min-width: 0;
      box-shadow: none !important;
    }
    body.admin-app .admin-link-label {
      border-right: 1px solid color-mix(in srgb, var(--adm-line) 88%, transparent) !important;
    }
    body.admin-app .admin-link-url {
      border-right: 1px solid color-mix(in srgb, var(--adm-line) 88%, transparent) !important;
    }
    body.admin-app .admin-gallery-list-shell {
      position: relative;
      min-height: 2rem;
    }
    body.admin-app .admin-gallery-list-empty {
      margin: 0;
      padding: 1.25rem 0.5rem 0.75rem;
      text-align: center;
      font-size: 0.8125rem;
      line-height: 1.45;
      color: var(--adm-muted);
      letter-spacing: 0.02em;
    }
    body.admin-app .admin-gallery-list-empty[hidden] {
      display: none !important;
    }
    body.admin-app .admin-gallery-rows {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    body.admin-app .admin-gallery-row {
      display: grid;
      grid-template-columns: auto 3.25rem minmax(0, 1fr) auto;
      gap: 0.75rem 0.85rem;
      align-items: start;
      padding: 1rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--adm-line) 94%, transparent);
      transition: opacity 0.15s ease;
    }
    body.admin-app .admin-gallery-row:last-child {
      border-bottom: none;
    }
    body.admin-app .admin-gallery-row--dragging {
      opacity: 0.45;
    }
    body.admin-app .admin-gallery-grip {
      display: inline-flex;
      gap: 3px;
      align-self: center;
      padding: 0.35rem 0.25rem;
      margin: 0;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: inherit;
      cursor: grab;
      max-width: none;
      width: auto;
      box-shadow: none;
    }
    body.admin-app .admin-gallery-grip:hover {
      background: color-mix(in srgb, var(--adm-fg) 5%, transparent);
      transform: none;
      opacity: 1;
    }
    body.admin-app .admin-gallery-grip:active {
      cursor: grabbing;
    }
    body.admin-app .admin-gallery-grip__bars {
      display: block;
      width: 3px;
      height: 14px;
      border-radius: 1px;
      opacity: 0.5;
      background: repeating-linear-gradient(
        to bottom,
        var(--adm-muted) 0 2px,
        transparent 2px 4px
      );
    }
    body.admin-app .admin-gallery-thumb {
      position: relative;
      width: 3.25rem;
      height: 3.25rem;
      flex-shrink: 0;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--adm-line) 92%, transparent);
      background: color-mix(in srgb, var(--adm-muted) 10%, var(--adm-field-bg));
    }
    body.admin-app .admin-gallery-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      margin: 0;
      padding: 0;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
    body.admin-app .admin-gallery-thumb-ph {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    body.admin-app .admin-gallery-thumb-ph[hidden] {
      display: none !important;
    }
    body.admin-app .admin-gallery-thumb-ph::before {
      content: "";
      display: block;
      width: 58%;
      height: 58%;
      border: 1px dashed color-mix(in srgb, var(--adm-muted) 55%, transparent);
      border-radius: var(--radius-sm);
    }
    body.admin-app .admin-gallery-thumb-ph:not(:empty) {
      font-family: var(--font-mono);
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--adm-muted);
      background: color-mix(in srgb, var(--adm-fg) 4%, transparent);
    }
    body.admin-app .admin-gallery-thumb-ph:not(:empty)::before {
      display: none;
    }
    body.admin-app .admin-gallery-row--video .admin-gallery-thumb::after {
      content: "VIDEO";
      position: absolute;
      left: 4px;
      bottom: 4px;
      padding: 2px 5px;
      font-family: var(--font-mono);
      font-size: 0.56rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: #fff;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 1px;
      pointer-events: none;
    }
    body.admin-app .admin-gallery-thumb {
      position: relative;
    }
    body.admin-app .admin-gallery-live-ph {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 16 / 10;
      background: color-mix(in srgb, var(--adm-fg) 5%, transparent);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: var(--adm-muted);
    }
    body.admin-app .admin-gallery-live--video {
      position: relative;
    }
    body.admin-app .admin-gallery-live--video img,
    body.admin-app .admin-gallery-live--video .admin-gallery-live-ph {
      position: relative;
    }
    body.admin-app .admin-gallery-live--video::after {
      content: "VIDEO";
      position: absolute;
      left: 6px;
      bottom: 6px;
      padding: 2px 6px;
      font-family: var(--font-mono);
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: #fff;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 1px;
      pointer-events: none;
      z-index: 2;
    }
    body.admin-app .admin-gallery-row__main {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
    }
    body.admin-app .admin-gallery-row__main > input {
      margin: 0;
      padding: 0.38rem 0.45rem !important;
      font-size: 0.8125rem;
      border-radius: var(--radius-sm) !important;
      background: color-mix(in srgb, var(--adm-field-bg) 98%, transparent) !important;
    }
    body.admin-app .admin-gallery-url {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 0.78rem !important;
      letter-spacing: -0.02em;
    }
    body.admin-app .admin-gallery-caption::placeholder {
      color: color-mix(in srgb, var(--adm-muted) 92%, transparent);
    }
    body.admin-app .admin-gallery-more {
      margin: 0.15rem 0 0;
      border: none;
      padding: 0;
    }
    body.admin-app .admin-gallery-more-summary {
      list-style: none;
      cursor: pointer;
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--adm-muted);
      padding: 0.2rem 0;
      user-select: none;
    }
    body.admin-app .admin-gallery-more-summary::-webkit-details-marker {
      display: none;
    }
    body.admin-app .admin-gallery-more-summary::before {
      content: "";
      display: inline-block;
      width: 0.35em;
      height: 0.35em;
      margin-right: 0.45em;
      border-right: 1px solid var(--adm-muted);
      border-bottom: 1px solid var(--adm-muted);
      transform: rotate(-45deg);
      vertical-align: 0.15em;
      opacity: 0.75;
      transition: transform 0.2s ease;
    }
    body.admin-app .admin-gallery-more[open] .admin-gallery-more-summary::before {
      transform: rotate(45deg);
      vertical-align: 0.05em;
    }
    body.admin-app .admin-gallery-more .admin-gallery-alt {
      margin-top: 0.35rem;
      width: 100%;
      font-size: 0.8125rem !important;
    }
    body.admin-app .admin-gallery-remove {
      align-self: flex-start;
      margin: 0;
      padding: 0.2rem 0.45rem;
      font-size: 1.35rem;
      font-weight: 300;
      line-height: 1;
      color: var(--adm-muted);
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: color 0.15s ease, background 0.15s ease;
      max-width: none;
      width: auto;
      box-shadow: none;
    }
    body.admin-app .admin-gallery-remove:hover {
      color: var(--red);
      background: color-mix(in srgb, var(--red) 10%, transparent);
      transform: none;
      opacity: 1;
    }
    body.admin-app .admin-gallery-preview-block {
      margin-top: 1.35rem;
      padding-top: 1rem;
      border-top: 1px solid color-mix(in srgb, var(--adm-line) 92%, transparent);
    }
    body.admin-app .admin-gallery-preview-head {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.7rem;
    }
    body.admin-app .admin-gallery-preview-dot {
      display: inline-block;
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--green) 25%, transparent);
      animation: admin-pulse-dot 2.4s ease-in-out infinite;
    }
    @keyframes admin-pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.55; }
    }
    body.admin-app .admin-gallery-preview-kicker {
      display: none;
    }
    body.admin-app .admin-gallery-preview-title {
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: lowercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-gallery-live.gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 120px), 1fr));
      gap: 0.6rem;
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
      font-size: 0.78rem;
      color: var(--adm-muted);
      line-height: 1.45;
      letter-spacing: 0.02em;
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
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--adm-line);
      font-size: 0.9375rem;
      font-weight: 400;
      letter-spacing: -0.01em;
    }
    body.admin-app .admin-list li.admin-list__row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem 1rem;
    }
    body.admin-app .admin-list__main {
      min-width: 0;
      flex: 1;
    }
    body.admin-app .admin-list__line {
      display: block;
    }
    body.admin-app .admin-list__actions {
      flex-shrink: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      align-items: center;
    }
    body.admin-app .admin-list__btn {
      font-family: inherit;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: -0.01em;
      padding: 0.28rem 0.45rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--adm-line);
      background: transparent;
      color: var(--adm-muted);
      cursor: pointer;
      transition: color 0.14s ease, border-color 0.14s ease, background 0.14s ease;
      margin: 0;
      max-width: none;
      width: auto;
    }
    body.admin-app .admin-list__btn:hover {
      color: var(--adm-fg);
      border-color: var(--adm-line-strong);
      background: var(--adm-scrim);
    }
    body.admin-app .admin-list__btn:focus-visible {
      outline: 1px solid var(--adm-ring);
      outline-offset: 2px;
    }
    body.admin-app .admin-list__btn--danger:hover {
      color: var(--red);
      border-color: color-mix(in srgb, var(--red) 45%, var(--adm-line));
      background: color-mix(in srgb, var(--red) 10%, transparent);
    }
    body.admin-app .admin-list__meta {
      display: block;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      letter-spacing: 0;
      text-transform: lowercase;
      font-variant-numeric: tabular-nums;
      color: var(--adm-muted);
      margin-top: 0.25rem;
    }
    body.admin-app .admin-list__empty {
      color: var(--adm-muted);
      font-style: normal;
      padding: 1rem 0;
    }
    body.admin-app #view-editor .admin-view-title {
      flex-shrink: 0;
      margin: 0;
      padding: 0.55rem 0 0.25rem;
    }
    body.admin-app .admin-editor-toolbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      gap: 1.1rem 2rem;
      padding: 1.1rem 0 1.35rem;
      border-bottom: 1px solid var(--adm-line);
      flex-shrink: 0;
    }
    body.admin-app .admin-editor-toolbar__doc {
      grid-column: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 0;
    }
    body.admin-app .admin-editor-toolbar__crumbs {
      margin: 0;
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.45rem;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-editor-toolbar__crumb-sep {
      color: var(--adm-line-strong);
    }
    body.admin-app .admin-editor-toolbar__state {
      transition: color 0.18s ease;
    }
    body.admin-app .admin-editor-toolbar__state[data-state="new"] {
      color: var(--adm-muted);
    }
    body.admin-app .admin-editor-toolbar__state[data-state="editing"] {
      color: var(--adm-fg-soft);
    }
    body.admin-app .admin-editor-toolbar__state[data-state="dirty"] {
      color: color-mix(in srgb, var(--adm-accent) 60%, var(--adm-fg));
    }
    body.admin-app .admin-editor-toolbar__state[data-state="saved"] {
      color: color-mix(in srgb, var(--green) 65%, var(--adm-fg));
    }
    body.admin-app .admin-editor-toolbar__state::before {
      content: "● ";
      margin-right: 0.15rem;
      font-size: 0.7em;
      vertical-align: 0.08em;
      color: currentColor;
      opacity: 0.7;
    }
    body.admin-app .admin-editor-toolbar__title {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.45rem, 2.5vw, 1.95rem);
      font-weight: 500;
      letter-spacing: -0.022em;
      line-height: 1.1;
      color: var(--adm-fg);
      text-wrap: balance;
      overflow-wrap: anywhere;
      transition: color 0.18s ease;
    }
    body.admin-app .admin-editor-toolbar__title[data-empty="true"] {
      color: color-mix(in srgb, var(--adm-muted) 80%, transparent);
      font-style: italic;
      font-weight: 400;
    }
    body.admin-app .admin-editor-toolbar__meta {
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.3rem 0.85rem;
      min-height: 1.25rem;
      font-family: var(--adm-mono);
      font-size: 0.75rem;
      letter-spacing: 0;
      color: var(--adm-muted);
    }
    body.admin-app .admin-editor-toolbar__id {
      font-variant-numeric: tabular-nums;
      color: var(--adm-fg-soft);
    }
    body.admin-app .admin-editor-toolbar__id[data-empty="true"] {
      color: var(--adm-muted);
      font-style: italic;
    }
    body.admin-app .admin-editor-toolbar__status {
      flex: 0 1 auto;
      min-height: 0;
      font-size: 0.75rem;
    }
    body.admin-app .admin-editor-toolbar__controls {
      grid-column: 2;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.85rem;
      min-width: 16rem;
    }
    body.admin-app .admin-editor-toolbar__switcher {
      display: flex;
      flex-direction: column;
      gap: 0.32rem;
    }
    body.admin-app .admin-editor-toolbar__switcher-label {
      margin: 0;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--adm-muted);
    }
    body.admin-app .admin-editor-toolbar__switcher-label::before {
      content: "↔ ";
      color: var(--adm-line-strong);
      margin-right: 0.15rem;
    }
    body.admin-app .admin-editor-toolbar__switcher-field {
      position: relative;
    }
    body.admin-app .admin-editor-toolbar__select {
      display: block;
      width: 100%;
      margin: 0;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      font-family: var(--adm-mono);
      font-size: 0.8125rem;
      font-weight: 400;
      letter-spacing: -0.01em;
      line-height: 1.35;
      color: var(--adm-fg-soft);
      background-color: var(--adm-bg-soft);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='none' stroke='%235d5c5c' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round' d='M2.5 3.5 L5 6 L7.5 3.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.65rem center;
      background-size: 0.6rem;
      padding: 0.5rem 1.95rem 0.5rem 0.7rem;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      transition: border-color 0.16s ease, color 0.16s ease, background-color 0.16s ease;
      box-shadow: none;
    }
    body.admin-app .admin-editor-toolbar__select:hover {
      border-color: var(--adm-line-strong);
      color: var(--adm-fg);
      background-color: var(--adm-field-bg);
    }
    body.admin-app .admin-editor-toolbar__select:focus {
      outline: none;
      border-color: var(--adm-fg);
      color: var(--adm-fg);
      background-color: var(--adm-field-bg);
    }
    body.admin-app .admin-editor-toolbar__select:focus-visible {
      outline: none;
    }
    body.admin-app .admin-editor-toolbar__index-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      margin: 0;
      padding: 0.35rem 0.55rem;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--adm-muted);
      cursor: pointer;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      background: var(--adm-bg-soft);
      user-select: none;
      flex-shrink: 0;
    }
    body.admin-app .admin-editor-toolbar__index-toggle:has(input:checked) {
      color: var(--adm-fg-soft);
      border-color: color-mix(in srgb, var(--adm-fg) 22%, var(--adm-line));
    }
    body.admin-app .admin-editor-toolbar__index-toggle:has(input:not(:checked)) {
      color: color-mix(in srgb, var(--adm-accent) 55%, var(--adm-muted));
      border-color: color-mix(in srgb, var(--adm-accent) 35%, var(--adm-line));
    }
    body.admin-app .admin-editor-toolbar__index-toggle input {
      margin: 0;
      accent-color: var(--adm-accent);
    }
    body.admin-app .admin-editor-toolbar__settings {
      border-radius: var(--radius-sm);
    }
    body.admin-app .admin-toolbar-rule {
      display: none;
    }
    body.admin-app .admin-editor-toolbar__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
      justify-content: flex-end;
    }
    body.admin-app .admin-toolbar-actions__sep {
      display: none;
    }
    @media (max-width: 52rem) {
      body.admin-app .admin-editor-toolbar {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      body.admin-app .admin-editor-toolbar__controls {
        grid-column: 1;
        min-width: 0;
      }
      body.admin-app .admin-editor-toolbar__actions {
        justify-content: flex-start;
      }
    }
    body.admin-app .admin-editor-rail {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding: 1.15rem 0.65rem 1.35rem 0;
      min-height: 0;
      min-width: 0;
      border-right: 1px solid var(--adm-line);
      box-sizing: border-box;
    }
    body.admin-app .admin-editor-rail__tabs {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    body.admin-app .admin-editor-rail__tab {
      margin: 0;
      padding: 0.28rem 0.35rem;
      font-family: inherit;
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: -0.005em;
      text-align: left;
      color: var(--adm-muted);
      background: transparent;
      border: none;
      border-bottom: 1px solid transparent;
      border-radius: 0;
      cursor: default;
      max-width: none;
      width: 100%;
      box-shadow: none;
      transition: color 0.15s ease, border-color 0.15s ease;
    }
    body.admin-app .admin-editor-rail__tab:hover {
      color: var(--adm-fg);
    }
    body.admin-app .admin-editor-rail__tab.is-active {
      color: var(--adm-fg);
      border-bottom-color: var(--adm-fg);
    }
    body.admin-app .admin-editor-rail__tab:focus-visible {
      outline: 1px solid var(--adm-ring);
      outline-offset: 2px;
    }
    body.admin-app .admin-editor-rail__body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    body.admin-app .admin-editor-rail__hint {
      margin: 0;
      font-family: var(--adm-mono);
      font-size: 0.625rem;
      font-weight: 400;
      letter-spacing: 0;
      line-height: 1.35;
      color: var(--adm-muted);
      opacity: 0.9;
    }
    body.admin-app .admin-editor-media-strip {
      flex: 1;
      min-height: 3rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--adm-muted) 45%, transparent) transparent;
      padding-right: 0.15rem;
    }
    body.admin-app .admin-editor-media-empty {
      margin: 0;
      font-family: var(--adm-mono);
      font-size: 0.625rem;
      line-height: 1.45;
      color: var(--adm-muted);
      opacity: 0.85;
    }
    body.admin-app .admin-editor-media-empty[hidden] {
      display: none !important;
    }
    body.admin-app .admin-editor-media-card {
      position: relative;
      margin: 0;
      padding: 0;
      display: block;
      width: 100%;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      background: var(--adm-bg-soft);
      overflow: hidden;
      cursor: grab;
      max-width: none;
      box-shadow: none;
      transition: border-color 0.14s ease, background 0.14s ease;
    }
    body.admin-app .admin-editor-media-card:hover {
      border-color: var(--adm-line-strong);
      background: var(--adm-scrim);
    }
    body.admin-app .admin-editor-media-card:active {
      cursor: grabbing;
    }
    body.admin-app .admin-editor-media-card:focus-visible {
      outline: 1px solid var(--adm-ring);
      outline-offset: 2px;
    }
    body.admin-app .admin-editor-media-card__tag {
      position: absolute;
      top: 0.22rem;
      left: 0.22rem;
      z-index: 1;
      padding: 0.1rem 0.28rem;
      font-family: var(--adm-mono);
      font-size: 0.5625rem;
      font-weight: 500;
      letter-spacing: 0;
      text-transform: lowercase;
      color: var(--adm-fg-soft);
      background: color-mix(in srgb, var(--adm-bg) 82%, transparent);
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      pointer-events: none;
    }
    body.admin-app .admin-editor-media-card img {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      vertical-align: middle;
    }
    body.admin-app .admin-editor-media-card--broken {
      min-height: 4.25rem;
      background: repeating-linear-gradient(
        -36deg,
        transparent,
        transparent 5px,
        color-mix(in srgb, var(--adm-line) 55%, transparent) 5px,
        color-mix(in srgb, var(--adm-line) 55%, transparent) 6px
      );
    }
    body.admin-app .admin-editor-media-card__ph {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 1;
      background: color-mix(in srgb, var(--adm-fg) 5%, transparent);
      font-family: var(--font-mono);
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: var(--adm-muted);
    }
    body.admin-app .admin-editor-media-card--video {
      position: relative;
    }
    body.admin-app .admin-editor-media-card--video::after {
      content: "VIDEO";
      position: absolute;
      left: 4px;
      bottom: 4px;
      padding: 1px 4px;
      font-family: var(--font-mono);
      font-size: 0.52rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: #fff;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 1px;
      pointer-events: none;
    }
    body.admin-app .admin-editor-layout {
      display: grid;
      grid-template-columns: minmax(6.75rem, 9rem) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr);
      gap: 0;
      align-items: stretch;
      flex: 1;
      min-height: 0;
      margin-top: 0;
      border-top: none;
    }
    body.admin-app .admin-editor-rail {
      grid-row: 1;
    }
    body.admin-app .admin-editor-main {
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
    }
    body.admin-app .admin-editor-pair {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(14rem, 38vw);
      grid-template-rows: minmax(0, 1fr);
      flex: 1 1 50%;
      min-height: 0;
      border-bottom: 1px solid var(--adm-line);
    }
    body.admin-app .admin-editor-pair:last-child {
      border-bottom: none;
    }
    @media (max-width: 60rem) {
      body.admin-app .admin-editor-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto minmax(0, 1fr);
        flex: 1;
        min-height: 0;
      }
      body.admin-app .admin-editor-main {
        min-height: 0;
      }
      body.admin-app .admin-editor-pair {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(12rem, 32vh) minmax(8rem, 28vh);
        flex: 1 1 auto;
      }
      body.admin-app .admin-editor-rail {
        flex-direction: row;
        align-items: flex-start;
        gap: 0.65rem;
        padding: 0.65rem 0 0.75rem;
        border-right: none;
        border-bottom: 1px solid var(--adm-line);
      }
      body.admin-app .admin-editor-rail__tabs {
        flex-direction: column;
        padding-top: 0.12rem;
      }
      body.admin-app .admin-editor-rail__tab {
        width: auto;
        white-space: nowrap;
      }
      body.admin-app .admin-editor-rail__body {
        flex: 1;
        min-width: 0;
      }
      body.admin-app .admin-editor-media-strip {
        flex-direction: row;
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        gap: 0.4rem;
        min-height: auto;
        padding-bottom: 0.2rem;
      }
      body.admin-app .admin-editor-media-card {
        flex: 0 0 4.75rem;
        width: 4.75rem;
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
      padding: 1.25rem 1.75rem 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 0;
      min-width: 0;
      border-right: 1px solid var(--adm-line);
      background: transparent;
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
      min-width: auto;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: -0.005em;
      text-transform: none;
      line-height: 1.1;
      color: var(--adm-muted);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.14s ease, border-color 0.14s ease, color 0.14s ease;
      box-shadow: none;
      max-width: none;
      width: auto;
    }
    body.admin-app .admin-md-tool:hover {
      background: var(--adm-scrim);
      color: var(--adm-fg);
    }
    body.admin-app .admin-md-tool:focus-visible {
      outline: 1px solid var(--adm-ring);
      outline-offset: 2px;
    }
    body.admin-app .admin-md-tool__glyph.admin-md-tool__b {
      font-weight: 800;
    }
    body.admin-app .admin-md-tool__glyph.admin-md-tool__i {
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
    body.admin-app .admin-md-tool--wide .admin-md-tool__glyph {
      font-weight: 600;
      letter-spacing: 0.06em;
    }
    body.admin-app .admin-kbd.admin-kbd--tool {
      display: inline-block;
      margin: 0;
      padding: 0.14rem 0.32rem;
      font-family: var(--adm-mono);
      font-size: 0.625rem;
      font-weight: 500;
      font-style: normal;
      letter-spacing: 0;
      text-transform: none;
      line-height: 1;
      color: var(--adm-muted);
      background: transparent;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
    }
    body.admin-app .admin-editor-md textarea[name="body"] {
      flex: 1 1 auto;
      min-height: 12rem;
      resize: none;
      font-family: var(--adm-mono);
      font-size: 0.9rem;
      line-height: 1.65;
      max-width: none;
      padding: 1rem 1.1rem;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      box-shadow: none;
      background: var(--adm-bg-soft);
      color: var(--adm-fg);
    }
    body.admin-app .admin-editor-md textarea[name="body"]:focus {
      border-color: var(--adm-fg);
      background: var(--adm-field-bg);
    }
    body.admin-app .admin-editor-md--why textarea[name="why"] {
      flex: 1 1 auto;
      min-height: 8rem;
      resize: none;
      font-family: var(--font-sans);
      font-size: 0.9375rem;
      line-height: 1.55;
      letter-spacing: -0.011em;
      max-width: none;
      padding: 1rem 1.1rem;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      box-shadow: none;
      background: var(--adm-bg-soft);
      color: var(--adm-fg);
    }
    body.admin-app .admin-editor-md--why textarea[name="why"]:focus {
      border-color: var(--adm-fg);
      background: var(--adm-field-bg);
    }
    body.admin-app .admin-preview-pane--why .project__why {
      margin: 0;
      max-width: 36rem;
    }
    body.admin-app .admin-preview-pane--why .project__why-p {
      margin: 0 0 0.9em;
      font-family: var(--font-display);
      font-size: 1.0625rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      line-height: 1.55;
      color: color-mix(in srgb, var(--adm-fg) 92%, var(--adm-muted));
      text-wrap: pretty;
    }
    body.admin-app .admin-preview-pane--why .project__why-p:last-child {
      margin-bottom: 0;
    }
    body.admin-app .admin-editor-preview {
      padding: 1.25rem 0 1.5rem 1.75rem;
      border-left: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 0;
      min-width: 0;
      background: transparent;
    }
    body.admin-app .admin-preview-pane {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding: 0.25rem 0;
      border-radius: 0;
      border: none;
      background: transparent;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--adm-muted) 45%, transparent) transparent;
    }
    body.admin-app .admin-preview-placeholder {
      margin: 0;
      color: var(--adm-muted);
      font-size: 0.875rem;
    }
    body.admin-app .admin-preview-pane.article-body {
      color: var(--adm-fg-soft);
      font-size: 0.9375rem;
      line-height: 1.7;
    }
    body.admin-app .admin-preview-pane.article-body h1,
    body.admin-app .admin-preview-pane.article-body h2,
    body.admin-app .admin-preview-pane.article-body h3 {
      color: var(--adm-fg);
    }

    body.admin-app .admin-overlay__panel--settings .admin-collab-picker {
      max-height: 11.5rem;
    }

    body.admin-app .admin-view[hidden] { display: none !important; }

    @media (prefers-reduced-motion: reduce) {
      body.admin-app .admin-overlay:not([hidden]) .admin-overlay__panel {
        animation: none;
      }
      body.admin-app button[type="submit"]:hover,
      body.admin-app .admin-btn:hover,
      body.admin-app .admin-add-btn:hover {
        transform: none;
      }
      body.admin-app .admin-field-more summary::after {
        transition: none;
      }
      body.admin-app .admin-gallery-preview-dot {
        animation: none;
      }
    }
  </style>
</head>
<body${bodyClassAttr}>
${body}
${bodySuffix}
</body>
</html>`;
}
