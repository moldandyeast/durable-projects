import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders headings and emphasis", async () => {
    const html = await renderMarkdown("# Hi\n\n**Bold**");
    expect(html).toContain("<h1");
    expect(html).toContain("Bold");
  });

  it("does not treat wiki tokens as internal links", async () => {
    const html = await renderMarkdown("[[abcdabcd]]");
    expect(html).not.toContain('href="/abcdabcd"');
  });
});
