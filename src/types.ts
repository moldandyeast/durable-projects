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
  /** Primary subject of the work (e.g. Karma3Labs). */
  client_id?: string;
  /**
   * Project-specific intermediary chain in display order (closest-to-work first).
   * Example: Client = Karma3Labs, via_client_ids = [WE3, IDEO Colab Ventures] reads as
   * “… · via WE3 · via IDEO Colab Ventures” after the primary line (and after any
   * directory `parent_client_id` rollup on the primary client record).
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
  client_id?: string;
  /** Matches `ProjectData.via_client_ids` — used for client filters. */
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
  client_id?: string;
  client?: Client;
  /** Present when `client` has `parent_client_id` (e.g. studio / parent org). */
  parent_client?: Client;
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
