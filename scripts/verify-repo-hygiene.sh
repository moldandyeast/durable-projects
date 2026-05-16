#!/usr/bin/env bash
# Fail if tracked files look like secrets or common credential filenames leak in.
set -euo pipefail
cd "$(dirname "$0")/.."

RED='\033[0;31m'
NC='\033[0m'

fail() {
  echo -e "${RED}repo hygiene check failed:${NC} $*" >&2
  exit 1
}

# --- No tracked files whose names imply secrets ---
while IFS= read -r f; do
  case "$f" in
    .env.example|.dev.vars.example) continue ;;
    .env|.env.*|.dev.vars|.dev.vars.*|*.pem|*.pfx|*.key|credentials.json|*-credentials.json|.secrets)
      fail "tracked file must not be committed: $f"
      ;;
  esac
done < <(git ls-files)

# --- No obvious secret assignments in tracked content ---
# Only high-confidence patterns (assignment-style); avoids doc mentions of header names.
patterns=(
  'CLOUDFLARE_API_TOKEN=[^[:space:]]+'
  'CF_API_TOKEN=[^[:space:]]+'
  'WRANGLER_AUTH_TOKEN=[^[:space:]]+'
  'AWS_SECRET_ACCESS_KEY=[^[:space:]]+'
  '-----BEGIN [A-Z ]+PRIVATE KEY-----'
)
for p in "${patterns[@]}"; do
  if git grep -nE "$p" -- . \
    ":(exclude).env.example" \
    ":(exclude).dev.vars.example" \
    ":(exclude)scripts/verify-repo-hygiene.sh" 2>/dev/null |
    grep -v '^Binary' >/dev/null; then
    git grep -nE "$p" -- . \
      ":(exclude).env.example" \
      ":(exclude).dev.vars.example" \
      ":(exclude)scripts/verify-repo-hygiene.sh" 2>/dev/null || true
    fail "possible secret pattern matched: $p"
  fi
done

echo "repo hygiene OK (tracked filenames + basic secret-pattern scan)"
