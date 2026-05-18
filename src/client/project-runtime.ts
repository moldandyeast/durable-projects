/**
 * Public project pages — gallery lightbox + @chenglou/pretext measurements (dek + captions).
 * Bundled to src/project-runtime-bundled.ts via npm run build:client.
 */
import { layout, prepare } from "@chenglou/pretext";

function firstFontFamily(stack: string): string {
  const part = stack.split(",")[0]?.trim() ?? "Onest";
  const unquoted = part.replace(/^["']|["']$/g, "");
  return unquoted || "Onest";
}

function canvasFontFromComputed(cs: CSSStyleDeclaration): string {
  const weight = cs.fontWeight || "400";
  const size = cs.fontSize;
  const raw = firstFontFamily(cs.fontFamily);
  const family = raw.includes(" ") ? `"${raw}"` : raw;
  return `${weight} ${size} ${family}`;
}

function letterSpacingPrepareOpts(cs: CSSStyleDeclaration): { letterSpacing?: number } | undefined {
  const ls = cs.letterSpacing;
  if (!ls || ls === "normal") return undefined;
  const n = parseFloat(ls);
  return Number.isFinite(n) ? { letterSpacing: n } : undefined;
}

function lineHeightToPx(cs: CSSStyleDeclaration, fallbackRatio: number): number {
  const fs = parseFloat(cs.fontSize);
  const lh = cs.lineHeight;
  if (!Number.isFinite(fs)) return 16 * fallbackRatio;
  if (lh === "normal") return fs * fallbackRatio;
  if (typeof lh === "string" && lh.endsWith("px")) {
    const px = parseFloat(lh);
    return Number.isFinite(px) ? px : fs * fallbackRatio;
  }
  const ratio = parseFloat(String(lh));
  return Number.isFinite(ratio) ? fs * ratio : fs * fallbackRatio;
}

/** Reserve vertical space from Pretext layout (matches CSS font/line-height after fonts settle). */
function syncTextBlockMinHeight(el: HTMLElement, rawText: string, lineHeightFallbackRatio: number): void {
  const text = rawText.trim();
  if (!text) {
    el.style.minHeight = "";
    return;
  }
  const maxWidth = el.clientWidth;
  if (maxWidth <= 0) return;

  const measure = (): void => {
    const cs = getComputedStyle(el);
    const font = canvasFontFromComputed(cs);
    const opts = letterSpacingPrepareOpts(cs);
    const lh = lineHeightToPx(cs, lineHeightFallbackRatio);
    const prepared = prepare(text, font, opts);
    const { height } = layout(prepared, maxWidth, lh);
    el.style.minHeight = `${Math.ceil(height)}px`;
  };

  if (document.fonts?.ready) {
    void document.fonts.ready.then(measure);
  } else {
    measure();
  }
}

function initProjectDekLayout(): void {
  const dek = document.querySelector(".project__dek");
  if (!(dek instanceof HTMLElement)) return;

  const ratio = 1.42;
  const run = (): void => syncTextBlockMinHeight(dek, dek.textContent ?? "", ratio);

  run();

  let raf = 0;
  window.addEventListener("resize", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      syncTextBlockMinHeight(dek, dek.textContent ?? "", ratio);
    });
  });
}

/**
 * Pick the largest font-size at which `text` fits within `width` in <= maxLines
 * lines, using @chenglou/pretext for accurate measurement. Mutates el.style.
 */
function fitTextToWidth(
  el: HTMLElement,
  opts: { minPx: number; maxPx: number; maxLines: number },
): void {
  const text = (el.textContent ?? "").trim();
  if (!text) return;
  const width = el.clientWidth;
  if (width <= 0) return;

  const cs = getComputedStyle(el);
  const rawFamily = firstFontFamily(cs.fontFamily);
  const family = rawFamily.includes(" ") ? `"${rawFamily}"` : rawFamily;
  const weight = cs.fontWeight || "400";
  const baseFs = parseFloat(cs.fontSize) || 16;
  const lhStr = cs.lineHeight;
  const lhRatio = (() => {
    if (lhStr === "normal") return 1.05;
    if (lhStr.endsWith("px")) {
      const px = parseFloat(lhStr);
      return Number.isFinite(px) ? px / baseFs : 1.05;
    }
    const r = parseFloat(lhStr);
    return Number.isFinite(r) ? r : 1.05;
  })();
  const lsOpts = letterSpacingPrepareOpts(cs);

  const measure = (px: number): number => {
    const font = `${weight} ${px}px ${family}`;
    const prepared = prepare(text, font, lsOpts);
    const lh = px * lhRatio;
    const { height } = layout(prepared, width, lh);
    return Math.max(1, Math.round(height / lh));
  };

  let lo = opts.minPx;
  let hi = opts.maxPx;
  let best = opts.minPx;
  for (let i = 0; i < 18 && hi - lo > 0.5; i++) {
    const mid = (lo + hi) / 2;
    if (measure(mid) <= opts.maxLines) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  el.style.fontSize = `${best}px`;
  el.style.lineHeight = `${best * lhRatio}px`;
}

function initIndexTitleFit(): void {
  const titles = Array.prototype.slice.call(
    document.querySelectorAll(".index__title"),
  ) as HTMLElement[];
  if (!titles.length) return;

  const fit = (el: HTMLElement): void => {
    const isHero = !!el.closest(".index__row--hero");
    fitTextToWidth(el, {
      minPx: isHero ? 56 : 26,
      maxPx: isHero ? 176 : 88,
      maxLines: isHero ? 2 : 2,
    });
  };

  const runAll = (): void => titles.forEach(fit);

  // First pass with fallback fonts so we reserve space; refine after webfonts.
  runAll();
  if (document.fonts?.ready) {
    void document.fonts.ready.then(runAll);
  }

  let raf = 0;
  window.addEventListener("resize", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(runAll);
  });
}

function initProjectWhyLayout(): void {
  const nodes = Array.prototype.slice.call(
    document.querySelectorAll(".project__why-p"),
  ) as HTMLElement[];
  if (!nodes.length) return;

  const ratio = 1.55;
  const measureAll = (): void => {
    nodes.forEach((p) => syncTextBlockMinHeight(p, p.textContent ?? "", ratio));
  };

  measureAll();

  let raf = 0;
  window.addEventListener("resize", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(measureAll);
  });
}

function initGalleryLightbox(): void {
  const strip = document.querySelector("[data-gallery-strip]");
  const dlg = document.getElementById("gallery-lightbox");
  if (!strip || !(dlg instanceof HTMLDialogElement) || typeof dlg.showModal !== "function") return;

  const imgEl = dlg.querySelector(".gallery-lightbox__img");
  const capEl = dlg.querySelector(".gallery-lightbox__caption");
  const prevBtn = dlg.querySelector("[data-gallery-prev]");
  const nextBtn = dlg.querySelector("[data-gallery-next]");
  if (!(imgEl instanceof HTMLImageElement) || !(capEl instanceof HTMLElement)) return;

  const thumbs = Array.prototype.slice.call(strip.querySelectorAll(".gallery-thumb")) as HTMLElement[];
  let idx = 0;

  const captionRatio = 1.45;

  function scheduleCaptionMeasure(): void {
    requestAnimationFrame(() => {
      syncTextBlockMinHeight(capEl, capEl.textContent ?? "", captionRatio);
    });
  }

  function setSlide(i: number): void {
    if (!thumbs.length) return;
    idx = (i + thumbs.length) % thumbs.length;
    const b = thumbs[idx];
    if (!b) return;
    imgEl.src = b.getAttribute("data-gallery-src") ?? "";
    imgEl.alt = b.getAttribute("data-gallery-alt") ?? "";
    const c = b.getAttribute("data-gallery-caption") ?? "";
    capEl.textContent = c;
    const multi = thumbs.length > 1;
    if (prevBtn instanceof HTMLElement) prevBtn.hidden = !multi;
    if (nextBtn instanceof HTMLElement) nextBtn.hidden = !multi;
  }

  function applySlide(i: number): void {
    setSlide(i);
    scheduleCaptionMeasure();
  }

  strip.addEventListener("click", (ev: MouseEvent) => {
    const btn = (ev.target as Element | null)?.closest(".gallery-thumb");
    if (!(btn instanceof HTMLElement)) return;
    const j = thumbs.indexOf(btn);
    if (j < 0) return;
    setSlide(j);
    dlg.showModal();
    scheduleCaptionMeasure();
  });

  dlg.addEventListener("click", (ev: MouseEvent) => {
    if (ev.target === dlg) dlg.close();
    if ((ev.target as Element | null)?.closest("[data-gallery-close]")) dlg.close();
    if ((ev.target as Element | null)?.closest("[data-gallery-prev]")) {
      ev.preventDefault();
      applySlide(idx - 1);
    }
    if ((ev.target as Element | null)?.closest("[data-gallery-next]")) {
      ev.preventDefault();
      applySlide(idx + 1);
    }
  });

  dlg.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (!dlg.open) return;
    if (ev.key === "ArrowRight") {
      ev.preventDefault();
      applySlide(idx + 1);
    }
    if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      applySlide(idx - 1);
    }
  });
}

function initProjectStickyTitle(): void {
  const h1 = document.getElementById("project-heading");
  const navTitle = document.getElementById("site-nav-doc-title");
  if (!(h1 instanceof HTMLElement) || !(navTitle instanceof HTMLElement)) return;

  const sync = (crossing: boolean): void => {
    const show = !crossing;
    navTitle.classList.toggle("is-visible", show);
    navTitle.setAttribute("aria-hidden", show ? "false" : "true");
  };

  const io = new IntersectionObserver(
    (entries) => {
      const e = entries[0];
      sync(e?.isIntersecting ?? false);
    },
    { root: null, threshold: 0, rootMargin: "-56px 0px 0px 0px" },
  );
  io.observe(h1);
}

function initProjectShare(): void {
  const btn = document.querySelector("[data-project-share]");
  if (!(btn instanceof HTMLButtonElement)) return;

  btn.addEventListener("click", async () => {
    const url = location.href;
    const title = document.title.trim() || "Project";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        /* continue to clipboard fallback */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      const prev = btn.textContent?.trim() ?? "Share";
      btn.textContent = "Copied";
      window.setTimeout(() => {
        btn.textContent = prev;
      }, 1600);
    } catch {
      window.prompt("Copy link:", url);
    }
  });
}

function boot(): void {
  if (document.body.classList.contains("page-project")) {
    initProjectStickyTitle();
    initProjectShare();
  }
  if (document.body.classList.contains("page-index")) {
    initIndexTitleFit();
  }
  initProjectDekLayout();
  initProjectWhyLayout();
  initGalleryLightbox();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
