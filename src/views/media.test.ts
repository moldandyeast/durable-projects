import { describe, expect, it } from "vitest";
import { detectMediaKind, parseStreamUrl, streamIframeUrl, streamThumbnailUrl } from "./media";

describe("detectMediaKind", () => {
  it("returns image for empty or undefined inputs", () => {
    expect(detectMediaKind("")).toBe("image");
    expect(detectMediaKind(undefined)).toBe("image");
    expect(detectMediaKind(null)).toBe("image");
  });

  it("returns image for plain http(s) image URLs", () => {
    expect(detectMediaKind("https://example.com/photo.jpg")).toBe("image");
    expect(detectMediaKind("https://cdn.example.com/path/img.png?v=2")).toBe("image");
  });

  it("returns video-stream for Cloudflare Stream customer subdomain URLs", () => {
    expect(
      detectMediaKind(
        "https://customer-2t8u8918x8ptk20h.cloudflarestream.com/f354f11d95c0c64df26ee89941ac9569/watch",
      ),
    ).toBe("video-stream");
    expect(
      detectMediaKind(
        "https://customer-abc123.cloudflarestream.com/0123456789abcdef0123456789abcdef/iframe",
      ),
    ).toBe("video-stream");
  });

  it("returns video-stream for the legacy videodelivery.net URLs", () => {
    expect(
      detectMediaKind("https://videodelivery.net/0123456789abcdef0123456789abcdef/iframe"),
    ).toBe("video-stream");
  });

  it("returns video-file for direct video files", () => {
    expect(detectMediaKind("https://example.com/clip.mp4")).toBe("video-file");
    expect(detectMediaKind("https://example.com/path/clip.webm?v=1")).toBe("video-file");
    expect(detectMediaKind("https://example.com/clip.MOV")).toBe("video-file");
  });
});

describe("parseStreamUrl", () => {
  it("extracts the base for a customer subdomain Stream URL", () => {
    const ref = parseStreamUrl(
      "https://customer-2t8u8918x8ptk20h.cloudflarestream.com/f354f11d95c0c64df26ee89941ac9569/watch",
    );
    expect(ref).not.toBeNull();
    expect(ref!.base).toBe(
      "https://customer-2t8u8918x8ptk20h.cloudflarestream.com/f354f11d95c0c64df26ee89941ac9569",
    );
  });

  it("extracts the base for a legacy videodelivery.net Stream URL", () => {
    const ref = parseStreamUrl(
      "https://videodelivery.net/0123456789abcdef0123456789abcdef/iframe",
    );
    expect(ref).not.toBeNull();
    expect(ref!.base).toBe("https://videodelivery.net/0123456789abcdef0123456789abcdef");
  });

  it("returns null for non-Stream URLs", () => {
    expect(parseStreamUrl("https://example.com/photo.jpg")).toBeNull();
    expect(parseStreamUrl("https://example.com/video.mp4")).toBeNull();
  });
});

describe("streamIframeUrl", () => {
  const ref = {
    base: "https://customer-x.cloudflarestream.com/0123456789abcdef0123456789abcdef",
  };

  it("returns a controls-on player by default", () => {
    expect(streamIframeUrl(ref)).toBe(`${ref.base}/iframe?preload=metadata`);
  });

  it("returns a looping muted autoplay player when loop is set", () => {
    expect(streamIframeUrl(ref, { loop: true })).toBe(
      `${ref.base}/iframe?autoplay=true&loop=true&muted=true&controls=false&preload=auto`,
    );
  });

  it("returns autoplay+loop+muted with controls visible when autoplay is set", () => {
    expect(streamIframeUrl(ref, { autoplay: true })).toBe(
      `${ref.base}/iframe?autoplay=true&loop=true&muted=true&preload=auto`,
    );
  });
});

describe("streamThumbnailUrl", () => {
  const ref = {
    base: "https://customer-x.cloudflarestream.com/0123456789abcdef0123456789abcdef",
  };

  it("returns the bare thumbnail URL with no opts", () => {
    expect(streamThumbnailUrl(ref)).toBe(`${ref.base}/thumbnails/thumbnail.jpg`);
  });

  it("encodes time and height query params", () => {
    expect(streamThumbnailUrl(ref, { time: "1s", height: 360 })).toBe(
      `${ref.base}/thumbnails/thumbnail.jpg?time=1s&height=360`,
    );
  });
});
