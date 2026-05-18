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
      /* Swiss / editorial — barely-there coordinate grid */
      --grid-cell: 28px;
      --grid-line: color-mix(in srgb, var(--fg) 3.25%, transparent);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        /* Dark theme semantics — BG / CARD / FG / FG-MUTED */
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
        --grid-line: color-mix(in srgb, var(--fg) 4.25%, transparent);
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
      background-color: var(--bg);
      background-image:
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent calc(var(--grid-cell) - 1px),
          var(--grid-line) calc(var(--grid-cell) - 1px),
          var(--grid-line) var(--grid-cell)
        ),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent calc(var(--grid-cell) - 1px),
          var(--grid-line) calc(var(--grid-cell) - 1px),
          var(--grid-line) var(--grid-cell)
        );
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
    /* Project detail — reading column centered (avoid a wide shell with left-ragged text) */
    main.page > .back-row {
      max-width: 48rem;
      margin-inline: auto;
    }
    main.page > article {
      max-width: 48rem;
      margin-inline: auto;
    }
    .muted { color: var(--muted); font-size: 0.92rem; }

    .project-header-date-clients {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0 0.35rem;
      row-gap: 0.35rem;
      margin: 0 0 0.5rem;
      max-width: 48rem;
      font-size: 0.9375rem;
      line-height: 1.52;
      letter-spacing: -0.013em;
      font-weight: 400;
      color: color-mix(in srgb, var(--muted) 52%, var(--fg-soft));
    }
    .project-header-date-clients__muted {
      color: color-mix(in srgb, var(--muted) 72%, transparent);
      font-weight: 400;
    }
    .project-header-date-clients__value {
      color: var(--fg-soft);
      font-weight: 500;
    }
    .project-header-date-clients__date .project-header-date-clients__value {
      font-variant-numeric: tabular-nums;
    }
    .project-header-date-clients__sep {
      color: color-mix(in srgb, var(--muted) 72%, transparent);
      user-select: none;
      flex-shrink: 0;
      margin: 0 0.2rem;
      font-weight: 400;
    }
    .project-header-date-clients__value a.project-client-link {
      color: inherit;
      font-weight: inherit;
      text-decoration: none;
    }
    .project-header-date-clients__value a.project-client-link:hover {
      color: var(--accent);
      text-decoration: underline;
      text-underline-offset: 0.18em;
    }
    .project-header-date-clients__value a.project-client-link:focus-visible {
      outline: 1px solid var(--accent);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

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
      font-weight: 500;
      letter-spacing: -0.022em;
      color: var(--fg-soft);
      line-height: 1.45;
    }
    .hero .hero-hint {
      margin: 0.7rem 0 0;
      max-width: 38rem;
      line-height: 1.45;
    }
    .hero .hero-hint code {
      font-size: 0.88em;
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
    .project-header { margin-bottom: clamp(2rem, 4vw, 2.75rem); }
    .project-header h1 {
      font-family: var(--font-display);
      font-size: clamp(1.9rem, 4.4vw, 2.72rem);
      font-weight: 700;
      letter-spacing: -0.042em;
      line-height: 1.06;
      margin: 0 0 0.72rem;
      color: var(--fg);
      text-wrap: balance;
    }
    .project-header .dek {
      font-size: clamp(1.04rem, 2.15vw, 1.22rem);
      font-weight: 400;
      letter-spacing: -0.02em;
      color: color-mix(in srgb, var(--fg-soft) 94%, var(--muted));
      line-height: 1.52;
      margin: 0 0 1.05rem;
      max-width: 42rem;
    }
    #article-body,
    #project-gallery {
      scroll-margin-top: 1.5rem;
    }

    /* Project gallery — same left edge + measure as .article-body (main.page supplies horizontal padding) */
    .project-gallery {
      margin: 0 0 clamp(2.5rem, 6vw, 3.75rem);
    }
    .gallery-strip {
      box-sizing: border-box;
      width: 100%;
      max-width: 48rem;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: clamp(2rem, 5vw, 3.75rem);
    }
    .gallery-figure {
      margin: 0;
      padding: clamp(4px, 0.65vw, 7px);
      border: 1px solid color-mix(in srgb, var(--border) 92%, transparent);
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: color-mix(in srgb, var(--bg-elevated) 96%, var(--fg) 4%);
      box-shadow:
        0 1px 0 color-mix(in srgb, var(--fg) 3%, transparent),
        0 20px 44px color-mix(in srgb, var(--fg) 4.5%, transparent);
    }
    /* First plate — stronger shadow only; corners stay technical (1px) */
    .gallery-strip .gallery-figure--hero {
      padding: clamp(5px, 0.85vw, 9px);
      border-radius: var(--radius-sm);
      box-shadow:
        0 1px 0 color-mix(in srgb, var(--fg) 4%, transparent),
        0 28px 56px color-mix(in srgb, var(--fg) 6%, transparent);
    }
    @media (prefers-color-scheme: dark) {
      .gallery-figure {
        border-color: var(--border);
        background: var(--bg-elevated);
        box-shadow:
          0 1px 0 color-mix(in srgb, var(--fg) 5%, transparent),
          0 26px 64px rgba(0, 0, 0, 0.36);
      }
      .gallery-strip .gallery-figure--hero {
        box-shadow:
          0 1px 0 color-mix(in srgb, var(--fg) 6%, transparent),
          0 34px 78px rgba(0, 0, 0, 0.42);
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
    .gallery-strip .gallery-figcaption {
      margin: 0;
      padding: 0.75rem clamp(0.85rem, 2.8vw, 1.35rem) 0.65rem;
      font-size: 0.8125rem;
      font-weight: 400;
      color: color-mix(in srgb, var(--muted) 82%, var(--fg-soft));
      line-height: 1.5;
      letter-spacing: -0.014em;
      border-top: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      background: color-mix(in srgb, var(--bg-elevated) 91%, var(--fg) 9%);
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
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .gallery-lightbox__close:hover {
      border-color: var(--accent);
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
      font-size: 0.88rem;
      line-height: 1.45;
      color: color-mix(in srgb, var(--fg) 78%, var(--muted));
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
    .project-team-min {
      margin: 2.75rem 0 0;
      padding-top: 1.25rem;
      border-top: 1px solid color-mix(in srgb, var(--border) 85%, transparent);
      font-size: 0.78rem;
      line-height: 1.55;
      color: var(--muted);
      max-width: 48rem;
    }
    .project-team-min__tag {
      display: inline-block;
      margin-right: 0.35rem;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--muted) 92%, transparent);
      vertical-align: baseline;
    }
    .project-team-min__name {
      font-weight: 500;
      color: var(--fg-soft);
      text-decoration: none;
    }
    a.project-team-min__name:hover {
      color: var(--accent);
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }
    .project-team-min__role {
      font-weight: 400;
      font-size: 0.72rem;
      color: color-mix(in srgb, var(--muted) 95%, transparent);
    }
    .project-team-min__role::before {
      content: "— ";
    }

    .project-footer-meta {
      margin: 1rem 0 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem 0.5rem;
      font-size: 0.68rem;
      letter-spacing: 0.02em;
      color: color-mix(in srgb, var(--muted) 88%, transparent);
      max-width: 48rem;
    }
    .project-footer-meta__tags {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0;
    }
    .project-footer-meta__tag {
      font-weight: 500;
      color: inherit;
      text-transform: lowercase;
    }
    .project-footer-meta__tagsep {
      font-weight: 400;
      color: color-mix(in srgb, var(--muted) 72%, transparent);
      user-select: none;
    }
    .project-footer-meta__sep {
      color: color-mix(in srgb, var(--muted) 70%, transparent);
      user-select: none;
      flex-shrink: 0;
    }
    .project-footer-meta time {
      font-variant-numeric: tabular-nums;
    }

    .project-links {
      list-style: none;
      margin: 0 0 2.5rem;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
    }
    .project-links a {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--fg);
      text-decoration: underline;
      text-underline-offset: 0.18em;
      text-decoration-thickness: 1px;
    }
    .project-links a:hover {
      color: var(--muted);
    }

    /* Markdown body */
    .article-body {
      max-width: 48rem;
      font-size: 1.045rem;
      line-height: 1.68;
      letter-spacing: -0.012em;
      font-weight: 400;
      color: color-mix(in srgb, var(--fg-soft) 97%, var(--muted));
      margin-bottom: 2.5rem;
    }
    .article-body > *:first-child { margin-top: 0; }
    .article-body h1, .article-body h2, .article-body h3, .article-body h4 {
      font-family: var(--font-display);
      color: var(--fg);
      letter-spacing: -0.026em;
      font-weight: 600;
      margin: 1.85rem 0 0.62rem;
      line-height: 1.22;
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
      margin: 0 0 0.9rem;
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
      margin-bottom: 0.85rem;
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
      margin: 0.5rem 0 0.85rem;
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
      gap: 0.65rem 0.75rem;
      align-items: start;
      padding: 0.7rem 0;
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
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem 1.5rem;
      padding: 0.85rem 0 0.95rem;
      border-bottom: 1px solid var(--adm-line);
      flex-shrink: 0;
    }
    body.admin-app .admin-editor-toolbar__left {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 0.55rem 0.85rem;
      min-width: min(100%, 14rem);
    }
    body.admin-app .admin-editor-toolbar__project {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 0.35rem 0.65rem;
      min-width: min(100%, 14rem);
      flex: 1 1 auto;
    }
    body.admin-app .admin-editor-toolbar__label {
      margin: 0;
      padding-bottom: 0.36rem;
      flex-shrink: 0;
    }
    body.admin-app .admin-editor-toolbar__field {
      display: flex;
      flex-direction: column;
      gap: 0.28rem;
      min-width: min(100%, 14rem);
      max-width: min(100%, 22rem);
      flex: 1 1 14rem;
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
      background-color: transparent;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='none' stroke='%235d5c5c' stroke-width='1.1' stroke-linecap='round' stroke-linejoin='round' d='M2.5 3.5 L5 6 L7.5 3.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.55rem center;
      background-size: 0.55rem;
      padding: 0.38rem 1.85rem 0.38rem 0.55rem;
      border: 1px solid var(--adm-line);
      border-radius: var(--radius-sm);
      transition: border-color 0.16s ease, color 0.16s ease, background-color 0.16s ease;
      box-shadow: none;
    }
    body.admin-app .admin-editor-toolbar__select:hover {
      border-color: var(--adm-line-strong);
      color: var(--adm-fg);
    }
    body.admin-app .admin-editor-toolbar__select:focus {
      outline: none;
      border-color: var(--adm-fg);
      color: var(--adm-fg);
      background-color: var(--adm-bg-soft);
    }
    body.admin-app .admin-editor-toolbar__select:focus-visible {
      outline: none;
    }
    body.admin-app .admin-editor-toolbar__hint {
      margin: 0;
      max-width: 22rem;
      font-family: var(--adm-mono);
      font-size: 0.6875rem;
      font-weight: 400;
      letter-spacing: 0;
      color: var(--adm-muted);
      line-height: 1.4;
      opacity: 0.92;
    }
    body.admin-app .admin-editor-toolbar__right {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 0.6rem;
      justify-content: flex-end;
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
    }
    body.admin-app .admin-toolbar-actions__sep {
      display: none;
    }
    body.admin-app .admin-editor-toolbar__status {
      flex: 1 1 100%;
      margin: 0;
      text-align: right;
      min-height: 1.1rem;
      font-size: 0.6875rem;
    }
    @media (min-width: 52rem) {
      body.admin-app .admin-editor-toolbar__status {
        flex: 0 1 auto;
        text-align: left;
        order: -1;
        margin-right: 0.25rem;
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
    body.admin-app .admin-editor-layout {
      display: grid;
      grid-template-columns: minmax(6.75rem, 9rem) minmax(0, 1fr) minmax(14rem, 38vw);
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
        grid-template-rows: auto minmax(16rem, 42vh) minmax(12rem, 1fr);
        flex: 1;
        min-height: 0;
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
