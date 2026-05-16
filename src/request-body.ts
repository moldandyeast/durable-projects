/** Thrown when request body exceeds configured max bytes. */
export class BodyTooLargeError extends Error {
  override readonly name = "BodyTooLargeError";
  constructor() {
    super("request body too large");
  }
}

function parseContentLength(raw: string | null): number | undefined {
  if (raw === null || raw === "") return undefined;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Read body up to maxBytes; rejects oversized Content-Length early.
 * Parses JSON; empty body becomes {}.
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const declared = parseContentLength(request.headers.get("Content-Length"));
  if (declared !== undefined && declared > maxBytes) {
    throw new BodyTooLargeError();
  }

  const buf = await request.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    throw new BodyTooLargeError();
  }

  const text = new TextDecoder().decode(buf);
  if (!text.trim()) {
    return {};
  }

  return JSON.parse(text) as unknown;
}

/** Raw UTF-8 text with same size limits as {@link readJsonBody}. */
export async function readBoundedText(request: Request, maxBytes: number): Promise<string> {
  const declared = parseContentLength(request.headers.get("Content-Length"));
  if (declared !== undefined && declared > maxBytes) {
    throw new BodyTooLargeError();
  }

  const buf = await request.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    throw new BodyTooLargeError();
  }

  return new TextDecoder().decode(buf);
}
