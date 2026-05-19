import type { IndexEntry } from "./types";

export function tagMatches(entry: IndexEntry, tag: string): boolean {
  const t = tag.trim().toLowerCase();
  return entry.tags.some((x) => x.toLowerCase() === t);
}

export function entryMatchesClient(entry: IndexEntry, clientFilter: string): boolean {
  const ids = effectiveEntryClientIds(entry);
  if (ids.includes(clientFilter)) return true;
  return (entry.via_client_ids ?? []).includes(clientFilter);
}

export function effectiveEntryClientIds(entry: IndexEntry): string[] {
  if (entry.client_ids?.length) return entry.client_ids;
  if (entry.client_id) return [entry.client_id];
  return [];
}

/** Rows shown on the public home page (not archived, not unlisted). */
export function entriesForPublicHome(projects: IndexEntry[]): IndexEntry[] {
  return projects.filter((p) => !p.unlisted);
}

export function filterIndexEntries(
  projects: IndexEntry[],
  params: { tag?: string | null; client?: string | null },
): IndexEntry[] {
  let filtered = projects;
  const tag = params.tag?.trim();
  if (tag) filtered = filtered.filter((p) => tagMatches(p, tag));
  const clientFilter = params.client?.trim();
  if (clientFilter) filtered = filtered.filter((p) => entryMatchesClient(p, clientFilter));
  return filtered;
}
