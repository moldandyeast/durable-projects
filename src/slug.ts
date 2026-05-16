/**
 * 8-char Crockford base32 slug (lowercase).
 */

const ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";

export function generateSlug(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);

  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);

  let out = "";
  for (let i = 0; i < 8; i++) {
    out = ALPHABET[Number(n & 31n)] + out;
    n >>= 5n;
  }
  return out;
}

export function isValidSlug(s: string): boolean {
  return /^[0-9a-hjkmnpqrstvwxyz]{8}$/.test(s);
}
