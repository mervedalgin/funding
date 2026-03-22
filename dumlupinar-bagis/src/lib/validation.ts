/**
 * Security validation utilities for the Dumlupinar Bagis application.
 *
 * These helpers harden user-supplied data before it reaches the DOM or
 * external services.  They are intentionally dependency-free so they can
 * be used on both client and server (edge functions) without extra
 * bundling cost.
 */

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

/**
 * Returns `true` only when `url` is a syntactically valid URL that uses the
 * `https:` protocol.  Every other scheme — including `http:`, `javascript:`,
 * `data:`, and `blob:` — is rejected.
 */
export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Returns `true` when the value is considered a safe image source:
 *   - `null` or empty string (no image – perfectly fine)
 *   - A string that starts with `https://`
 *
 * Anything else (e.g. `http://`, `data:`, relative paths) is rejected.
 */
export function isSecureImageUrl(url: string | null): boolean {
  if (url === null || url === "") {
    return true;
  }
  return url.startsWith("https://");
}

// ---------------------------------------------------------------------------
// Text sanitisation
// ---------------------------------------------------------------------------

/**
 * Strips HTML tags and embedded `<script>` content from the supplied string.
 *
 * Processing order:
 *   1. Remove `<script>…</script>` blocks (including content).
 *   2. Remove all remaining HTML / XML tags.
 *   3. Collapse consecutive whitespace into a single space and trim.
 *
 * This is a *defence-in-depth* measure — never rely on regex-based
 * sanitisation alone when rendering user content.  Always pair it with
 * React's default JSX escaping or a purpose-built library such as
 * DOMPurify.
 */
export function sanitizeText(text: string): string {
  let sanitized = text;

  // 1. Strip <script> blocks (case-insensitive, dotAll for multiline).
  sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  // 2. Strip remaining HTML / XML tags.
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // 3. Normalise whitespace.
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  return sanitized;
}

