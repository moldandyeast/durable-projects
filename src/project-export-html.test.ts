import { describe, expect, it } from "vitest";
import { absolutizeImageUrl, safeExportBasename } from "./project-export-html";

describe("project-export-html", () => {
  it("absolutizeImageUrl resolves against origin", () => {
    expect(absolutizeImageUrl("/x.png", "https://a.com")).toBe("https://a.com/x.png");
    expect(absolutizeImageUrl("https://b.com/i.jpg", "https://a.com")).toBe("https://b.com/i.jpg");
    expect(absolutizeImageUrl("data:image/png;base64,xx", "https://a.com")).toBeNull();
  });

  it("safeExportBasename sanitizes for filenames", () => {
    expect(safeExportBasename("Hello / World", "abc12xyz")).toMatch(/^Hello-World$/);
    expect(safeExportBasename("   ", "abc12xyz")).toBe("abc12xyz");
  });
});
