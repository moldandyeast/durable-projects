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
  const dek = document.querySelector(".project-header .dek");
  if (!(dek instanceof HTMLElement)) return;

  const ratio = 1.52;
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

function boot(): void {
  initProjectDekLayout();
  initGalleryLightbox();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
