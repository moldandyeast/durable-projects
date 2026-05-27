/**
 * OpenAPI 3.1 description of the public read API.
 * Served at GET /api/openapi.json (CORS-enabled).
 */
export function buildOpenApiSpec(origin: string): Record<string, unknown> {
  const base = origin.replace(/\/$/, "");
  return {
    openapi: "3.1.0",
    info: {
      title: "Durable Projects — Public API",
      version: "1.0.0",
      description:
        "Read-only JSON for the portfolio index, directory (team & clients), and full project envelopes. " +
        "All `/api/*` routes send CORS headers for browser clients on other origins. " +
        "Project pages at `/{slug}` also support cross-origin JSON and markdown when requested with the right `Accept` header.",
    },
    servers: [{ url: base, description: "Site origin (no trailing slash)" }],
    tags: [
      { name: "index", description: "Project catalog" },
      { name: "projects", description: "Single project" },
      { name: "directory", description: "Team and clients" },
    ],
    paths: {
      "/api/index": {
        get: {
          tags: ["index"],
          summary: "List visible projects",
          description:
            "Returns non-archived index rows (includes unlisted). The public home page omits unlisted projects. " +
            "Optional query filters mirror `GET /?tag=&client=`. Sorted by `sort_date` then `edited_at` (newest first).",
          parameters: [
            {
              name: "tag",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Exact tag match (case-insensitive).",
            },
            {
              name: "client",
              in: "query",
              required: false,
              schema: { type: "string", pattern: "^[0-9a-hjkmnpqrstvwxyz]{8}$" },
              description: "Filter by primary or via client id.",
            },
          ],
          responses: {
            "200": {
              description: "Index rows",
              headers: {
                "Cache-Control": { schema: { type: "string" }, description: "public, s-maxage=60" },
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["projects"],
                    properties: { projects: { type: "array", items: { $ref: "#/components/schemas/IndexEntry" } } },
                  },
                },
              },
            },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/projects/{slug}": {
        get: {
          tags: ["projects"],
          summary: "Full project (JSON envelope)",
          parameters: [{ $ref: "#/components/parameters/ProjectSlug" }],
          responses: {
            "200": {
              description: "Project envelope",
              headers: {
                ETag: { schema: { type: "string" }, description: 'Quoted `edited_at` (e.g. `"2026-05-18T…"`).' },
                "Cache-Control": { schema: { type: "string" } },
              },
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ProjectEnvelope" } },
              },
            },
            "404": { description: "Unknown slug" },
            "410": { description: "Archived / deleted" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
        head: {
          tags: ["projects"],
          summary: "Project metadata headers only",
          parameters: [{ $ref: "#/components/parameters/ProjectSlug" }],
          responses: {
            "200": { description: "Headers only (ETag, Cache-Control)" },
            "404": { description: "Unknown slug" },
            "410": { description: "Archived / deleted" },
          },
        },
      },
      "/api/team": {
        get: {
          tags: ["directory"],
          summary: "Team directory",
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["members"],
                    properties: { members: { type: "array", items: { $ref: "#/components/schemas/TeamMember" } } },
                  },
                },
              },
            },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/clients": {
        get: {
          tags: ["directory"],
          summary: "Client directory",
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["clients"],
                    properties: { clients: { type: "array", items: { $ref: "#/components/schemas/Client" } } },
                  },
                },
              },
            },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/{slug}": {
        get: {
          tags: ["projects"],
          summary: "Project page (content negotiation)",
          description:
            "Default: HTML project page. With `Accept: application/json` returns the same envelope as `/api/projects/{slug}` (CORS-enabled). " +
            "With `Accept: text/markdown` or path `/{slug}.md` returns YAML-front-matter markdown export.",
          parameters: [
            { $ref: "#/components/parameters/ProjectSlug" },
            {
              name: "Accept",
              in: "header",
              schema: { type: "string" },
              description: "`application/json`, `text/markdown`, or `text/html` (default).",
            },
          ],
          responses: {
            "200": {
              description: "HTML, JSON, or markdown depending on Accept / path",
              content: {
                "text/html": { schema: { type: "string" } },
                "application/json": { schema: { $ref: "#/components/schemas/ProjectEnvelope" } },
                "text/markdown": { schema: { type: "string" } },
              },
            },
            "404": { description: "Unknown slug" },
            "410": { description: "Archived / deleted" },
          },
        },
      },
    },
    components: {
      parameters: {
        ProjectSlug: {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[0-9a-hjkmnpqrstvwxyz]{8}$" },
          description: "Eight-character Crockford base32 id (no i, l, o, u).",
        },
      },
      responses: {
        RateLimited: {
          description: "Rate limit exceeded",
          headers: { "Retry-After": { schema: { type: "string" }, description: "Seconds (typically 60)." } },
        },
      },
      schemas: {
        GalleryImage: {
          type: "object",
          required: ["url"],
          properties: {
            url: { type: "string", format: "uri" },
            caption: { type: "string" },
            alt: { type: "string" },
          },
        },
        ProjectLink: {
          type: "object",
          required: ["label", "url"],
          properties: { label: { type: "string" }, url: { type: "string", format: "uri" } },
        },
        TeamMember: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: { type: "string", pattern: "^[0-9a-hjkmnpqrstvwxyz]{8}$" },
            name: { type: "string" },
            role: { type: "string" },
            url: { type: "string", format: "uri" },
          },
        },
        Client: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: { type: "string", pattern: "^[0-9a-hjkmnpqrstvwxyz]{8}$" },
            name: { type: "string" },
            url: { type: "string", format: "uri" },
            parent_client_id: { type: "string", pattern: "^[0-9a-hjkmnpqrstvwxyz]{8}$" },
          },
        },
        ProjectClientRef: {
          type: "object",
          required: ["client"],
          properties: {
            client: { $ref: "#/components/schemas/Client" },
            parent_client: { $ref: "#/components/schemas/Client" },
          },
        },
        IndexEntry: {
          type: "object",
          required: ["id", "title", "summary", "tags", "created_at", "edited_at", "total_views"],
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            created_at: { type: "string", format: "date-time" },
            edited_at: { type: "string", format: "date-time" },
            total_views: { type: "integer" },
            unlisted: {
              type: "boolean",
              description: "Omitted from public home index when true; still returned here and via project URLs.",
            },
            client_ids: { type: "array", items: { type: "string" } },
            via_client_ids: { type: "array", items: { type: "string" } },
            sort_date: { type: "string", description: "YYYY-MM-DD display sort key" },
            preview_image: { type: "string", format: "uri" },
            migration_review_needed: {
              type: "boolean",
              description: "True for projects awaiting backfill after the 2026-05 editorial restructure.",
            },
          },
        },
        ProjectEnvelope: {
          type: "object",
          required: [
            "id",
            "title",
            "summary",
            "tags",
            "brief",
            "what_we_did",
            "takeaway",
            "created_at",
            "edited_at",
            "views",
            "viewers",
            "gallery_images",
            "team_member_ids",
          ],
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            summary: { type: "string", description: "Catalog / card / OG one-liner." },
            tags: { type: "array", items: { type: "string" } },
            brief: { type: "string", description: "Page subhead — single editorial sentence framing the project." },
            what_we_did: { type: "string", description: "Long-form markdown — the work itself." },
            takeaway: {
              type: "string",
              description: "Long-form markdown — personal voice bracketing the project (why I cared and what stuck).",
            },
            created_at: { type: "string", format: "date-time" },
            edited_at: { type: "string", format: "date-time" },
            views: { type: "integer" },
            viewers: { type: "integer", description: "Always 0 on read API" },
            client_id: { type: "string", deprecated: true },
            client_ids: { type: "array", items: { type: "string" } },
            client: { $ref: "#/components/schemas/Client", deprecated: true },
            parent_client: { $ref: "#/components/schemas/Client", deprecated: true },
            project_clients: { type: "array", items: { $ref: "#/components/schemas/ProjectClientRef" } },
            via_client_ids: { type: "array", items: { type: "string" } },
            via_clients: { type: "array", items: { $ref: "#/components/schemas/Client" } },
            sort_date: { type: "string" },
            my_role: { type: "string" },
            gallery_images: { type: "array", items: { $ref: "#/components/schemas/GalleryImage" } },
            project_links: { type: "array", items: { $ref: "#/components/schemas/ProjectLink" } },
            preview_image: { type: "string", format: "uri" },
            team_member_ids: { type: "array", items: { type: "string" } },
            team_member_roles: { type: "object", additionalProperties: { type: "string" } },
            team: { type: "array", items: { $ref: "#/components/schemas/TeamMember" } },
          },
        },
      },
    },
    "x-cors": {
      allowOrigin: "*",
      allowMethods: ["GET", "HEAD", "OPTIONS"],
      allowHeaders: ["Accept", "Content-Type", "If-None-Match"],
      exposeHeaders: ["ETag", "Cache-Control", "Content-Type"],
      paths: ["/api/*", "/{slug}", "/{slug}.md"],
      note: "Admin `/admin/api/*` is same-origin only (Cloudflare Access). No CORS on HTML export or WebSocket live.",
    },
  };
}
