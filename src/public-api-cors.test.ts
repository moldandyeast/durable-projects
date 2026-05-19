import { describe, expect, it } from "vitest";
import {
  PUBLIC_CORS_ALLOW_HEADERS,
  PUBLIC_CORS_EXPOSE_HEADERS,
  corsPreflightResponse,
  isPublicCorsPath,
  withPublicCors,
} from "./public-api-cors";

describe("isPublicCorsPath", () => {
  it("matches /api routes", () => {
    expect(isPublicCorsPath("/api/index")).toBe(true);
    expect(isPublicCorsPath("/api/openapi.json")).toBe(true);
    expect(isPublicCorsPath("/api/projects/abc12345")).toBe(true);
  });

  it("matches project slug paths", () => {
    expect(isPublicCorsPath("/abc12345")).toBe(true);
    expect(isPublicCorsPath("/abc12345.md")).toBe(true);
  });

  it("does not match admin or export", () => {
    expect(isPublicCorsPath("/admin")).toBe(false);
    expect(isPublicCorsPath("/admin/api/projects")).toBe(false);
    expect(isPublicCorsPath("/abc12345/export.html")).toBe(false);
    expect(isPublicCorsPath("/")).toBe(false);
  });
});

describe("withPublicCors", () => {
  it("adds CORS headers on public paths", () => {
    const res = withPublicCors("/api/index", new Response("{}", { status: 200 }));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Expose-Headers")).toBe(PUBLIC_CORS_EXPOSE_HEADERS);
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe(PUBLIC_CORS_ALLOW_HEADERS);
  });

  it("leaves non-public paths unchanged", () => {
    const res = withPublicCors("/", new Response("ok"));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("corsPreflightResponse", () => {
  it("returns 204 with allow headers", () => {
    const res = corsPreflightResponse();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("OPTIONS");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("If-None-Match");
  });
});
