/**
 * DO storage + public JSON use snake_case field names (MY-posts convention).
 */

export interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  url?: string;
}

/** Org / school / studio — stored under `client:{id}` in SiteDirectoryDO */
export interface Client {
  id: string;
  name: string;
  url?: string;
  /** Another client (e.g. studio) this engagement rolls up under — Mozilla → IDEO */
  parent_client_id?: string;
}

/** Resolved primary client + optional directory parent (for API / public HTML). */
export interface ProjectClientRef {
  client: Client;
  parent_client?: Client;
}

export interface ProjectData {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  body: string;
  rendered_html: string;
  created_at: string;
  edited_at: string;
  total_views: number;
  hidden: boolean;
  /** @deprecated Stored legacy only — migrated to `client_ids` on read. */
  client_id?: string;
  /** Primary subject(s) of the work, in display order (e.g. Ethereum Foundation, Espresso, Optimism). */
  client_ids?: string[];
  /**
   * Project intermediaries after primaries (closest-to-work first), e.g. [WE3].
   * Must not duplicate any `client_ids` entry.
   */
  via_client_ids?: string[];
  sort_date?: string;
  gallery_images: GalleryImage[];
  preview_image?: string;
  team_member_ids: string[];
}

export interface IndexEntry {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  created_at: string;
  edited_at: string;
  total_views: number;
  hidden: boolean;
  /** @deprecated use `client_ids` */
  client_id?: string;
  /** Primary clients; legacy rows may omit (fall back to `client_id`). */
  client_ids?: string[];
  via_client_ids?: string[];
  sort_date?: string;
  preview_image?: string;
}

/** Public JSON shape for GET /api/projects/{id} */
export interface ProjectEnvelope {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  body: string;
  created_at: string;
  edited_at: string;
  views: number;
  viewers: number;
  /** @deprecated First primary only — prefer `client_ids` / `project_clients`. */
  client_id?: string;
  client_ids?: string[];
  /** @deprecated First primary only — prefer `project_clients`. */
  client?: Client;
  /** @deprecated First primary’s directory parent only. */
  parent_client?: Client;
  /** Resolved primaries in order (each optional directory parent). */
  project_clients?: ProjectClientRef[];
  via_client_ids?: string[];
  /** Resolved `via_client_ids` in order (project intermediaries). */
  via_clients?: Client[];
  sort_date?: string;
  gallery_images: GalleryImage[];
  preview_image?: string;
  team_member_ids: string[];
  team?: TeamMember[];
}

export interface Env {
  PROJECT_DO: DurableObjectNamespace;
  INDEX_DO: DurableObjectNamespace;
  SITE_DIRECTORY_DO: DurableObjectNamespace;

  READ_LIMIT: RateLimit | undefined;
  API_LIMIT: RateLimit | undefined;
  WS_LIMIT: RateLimit | undefined;
  WRITE_LIMIT: RateLimit | undefined;
  INDEX_LIMIT: RateLimit | undefined;

  DEV_BYPASS_AUTH: string;
}

export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export const SLUG_RE = /^[0-9a-hjkmnpqrstvwxyz]{8}$/;
