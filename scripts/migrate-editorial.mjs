#!/usr/bin/env node
/**
 * scripts/migrate-editorial.mjs
 *
 * One-shot helper that POSTs to /admin/api/migrate-editorial on a deployed
 * (or local-dev) durable-projects worker. Pass --dry-run for a no-op count
 * and --keep-backup to store legacy fields in a _legacy_backup blob per DO.
 *
 * Auth: pass CF Access service-token via env vars
 *       (CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET). For local dev with
 *       DEV_BYPASS_AUTH=true, no auth needed.
 *
 * Usage:
 *   node scripts/migrate-editorial.mjs --base https://work.moldandyeast.com
 *   node scripts/migrate-editorial.mjs --base http://127.0.0.1:8787 --dry-run
 *   node scripts/migrate-editorial.mjs --base ... --keep-backup
 */

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const next = process.argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      i++;
    } else {
      args.set(key, "true");
    }
  }
}

const base = args.get("base");
if (!base) {
  console.error("Missing --base <url>");
  process.exit(2);
}

const dryRun = args.get("dry-run") === "true";
const keepBackup = args.get("keep-backup") === "true";

const headers = { "Content-Type": "application/json" };
const cfAccess = process.env.CF_ACCESS_CLIENT_ID;
const cfAccessSecret = process.env.CF_ACCESS_CLIENT_SECRET;
if (cfAccess && cfAccessSecret) {
  headers["CF-Access-Client-Id"] = cfAccess;
  headers["CF-Access-Client-Secret"] = cfAccessSecret;
}

const url = `${base.replace(/\/$/, "")}/admin/api/migrate-editorial`;
const res = await fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify({ dry_run: dryRun, keep_backup: keepBackup }),
});

if (!res.ok) {
  console.error(`HTTP ${res.status}:`, await res.text());
  process.exit(1);
}

const body = await res.json();
console.log(JSON.stringify(body, null, 2));
