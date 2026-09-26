/**
 * Provenance page references and anchors — pure helpers (no fs), usable in the
 * browser (PartyCard) and in the data tests.
 *
 * Page-reference grammar (whole string must match, else `null`):
 *   ref    := [ "PDF" ] part ( ( ";" | "," ) part )*
 *   part   := [ "p" | "pp." | "s." | "side" ] range
 *   range  := N [ ( "–" | "-" ) M ]        with 1 ≤ N ≤ M
 * Examples: "PDF p17", "PDF p11; p46", "PDF p17–24", "s. 12–13", "pp. 4, 7".
 * Page numbers are 1-based pages of the archived text file (form-feed split).
 */

const PART = /^(?:pp?\.?|s\.|side)?\s*(\d+)(?:\s*[–-]\s*(\d+))?$/i;

/** Every page a `pageOrTable` string refers to, ascending and unique; `null` if it is not a page reference. */
export function parsePageRefs(pageOrTable: string): number[] | null {
  const body = pageOrTable.trim().replace(/^PDF\s+/i, '');
  if (!body) return null;
  const pages = new Set<number>();
  for (const raw of body.split(/[;,]/)) {
    const m = PART.exec(raw.trim());
    if (!m) return null;
    const from = Number(m[1]);
    const to = m[2] === undefined ? from : Number(m[2]);
    if (from < 1 || to < from) return null;
    for (let p = from; p <= to; p++) pages.add(p);
  }
  return [...pages].sort((a, b) => a - b);
}

/**
 * Normalise text for anchor matching: lower-case, unify dashes, drop soft
 * hyphens, collapse whitespace, and remove thousands separators inside numbers
 * ("150 000", "150.000", "150 000" → "150000"), so a number matches with or
 * without its separator. Decimal commas are kept ("10,21").
 */
export function normalizeForAnchor(text: string): string {
  let t = text
    .normalize('NFC')
    .toLowerCase()
    .replace(/­/g, '')
    .replace(/[‐-―−]/g, '-')
    .replace(/[\s   ]+/g, ' ');
  // Thousands separator: a digit, then space or dot, then exactly three digits not followed by another digit.
  const sep = /(\d)[ .](\d{3})(?!\d)/g;
  let prev: string;
  do {
    prev = t;
    t = t.replace(sep, '$1$2');
  } while (t !== prev);
  return t.trim();
}

const WORD_CHAR = /[\p{L}\p{N}]/u;

/**
 * True when `anchor` occurs in `text` as a contiguous phrase (after
 * normalisation) that starts and ends on word boundaries — "55" does not match
 * inside "155" or "550", "strøm" does not match inside "strømstøtte".
 */
export function anchorInText(anchor: string, text: string): boolean {
  const needle = normalizeForAnchor(anchor);
  if (!needle) return false;
  const hay = normalizeForAnchor(text);
  const startsWord = WORD_CHAR.test(needle[0]!);
  const endsWord = WORD_CHAR.test(needle[needle.length - 1]!);
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) {
    const before = i > 0 ? hay[i - 1]! : ' ';
    const after = i + needle.length < hay.length ? hay[i + needle.length]! : ' ';
    const okBefore = !startsWord || !WORD_CHAR.test(before);
    const okAfter = !endsWord || !WORD_CHAR.test(after);
    if (okBefore && okAfter) return true;
  }
  return false;
}
