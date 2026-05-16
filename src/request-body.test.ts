import { describe, expect, it } from "vitest";
import { BodyTooLargeError, readBoundedText, readJsonBody } from "./request-body";

describe("readJsonBody", () => {
  it("parses small JSON", async () => {
    const req = new Request("https://x/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"a":1}',
    });
    expect(await readJsonBody(req, 1024)).toEqual({ a: 1 });
  });

  it("rejects when Content-Length exceeds max", async () => {
    const req = new Request("https://x/", {
      method: "POST",
      headers: { "Content-Length": "9999", "Content-Type": "application/json" },
      body: "{}",
    });
    await expect(readJsonBody(req, 10)).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it("rejects when actual body exceeds max", async () => {
    const req = new Request("https://x/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "xxxxxxxxxx",
    });
    await expect(readJsonBody(req, 5)).rejects.toBeInstanceOf(BodyTooLargeError);
  });
});

describe("readBoundedText", () => {
  it("returns utf8 text under limit", async () => {
    const req = new Request("https://x/", { method: "POST", body: "hello" });
    expect(await readBoundedText(req, 100)).toBe("hello");
  });
});
