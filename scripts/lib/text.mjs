/**
 * Text repair for the 2011 content.
 *
 * The encoding situation, established empirically against all 2596 text values
 * in the dump (see scripts/audit-encoding.mjs):
 *
 *  1. Every stored value is VALID UTF-8. There is no widespread mojibake. The old
 *     site looked correct because the MySQL connection was pinned to latin1, which
 *     passed the bytes through unconverted, and the page declared UTF-8 - a wrong
 *     but self-consistent pipeline. So we read raw bytes and decode UTF-8.
 *
 *  2. Exactly 5 values are genuinely double-encoded, all in photos.title /
 *     photos.caption (utf8mb3 columns, where MySQL did convert on write):
 *     ids 258, 691, 728, 729. All are accented Latin-1 characters - Molé, coupé,
 *     Jarré - and all repair with a latin1->utf8 reinterpretation.
 *
 *  3. Three HTML entities appear, 457 times total, all smart quotes:
 *     &#8217; (’) x367, &#8221; (”) x50, &#8220; (“) x40.
 */

/** Markers that indicate a string was UTF-8 decoded one time too many. */
const DOUBLE_ENCODED = ['Ã', 'â€', 'Â'];

/**
 * MySQL's "latin1" is actually Windows-1252, which differs from ISO-8859-1 in
 * 0x80-0x9F. Any mangling that passed through a MySQL latin1 connection used these
 * mappings, so undoing it needs the same table - plain latin1 cannot represent
 * characters like U+0192 and the repair fails.
 */
const CP1252_HIGH = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

/** Encode a string back to cp1252 bytes, or null if any char has no mapping. */
function toCp1252(s) {
  const out = Buffer.alloc(s.length);
  for (let i = 0; i < s.length; i++) {
    const cp = s.codePointAt(i);
    if (cp > 0xffff) return null;
    if (cp <= 0xff) out[i] = cp;
    else if (CP1252_HIGH[cp] != null) out[i] = CP1252_HIGH[cp];
    else return null;
  }
  return out;
}

/** Strict UTF-8 decode - returns null rather than inserting U+FFFD. */
function strictUtf8(buf) {
  const s = buf.toString('utf8');
  if (s.includes('�')) return null;
  return s;
}

/**
 * Undo one or more spurious UTF-8 encoding layers.
 *
 * Applied iteratively because content can be mangled more than once, and only
 * while the string still carries a marker AND the round trip succeeds cleanly.
 * If either test fails we stop and keep the last good value, so a false positive
 * can never corrupt real text.
 */
export function repairMojibake(s) {
  let cur = s;
  for (let pass = 0; pass < 4; pass++) {
    if (!cur || !DOUBLE_ENCODED.some((m) => cur.includes(m))) break;
    const bytes = toCp1252(cur);
    if (!bytes) break;
    const next = strictUtf8(bytes);
    if (next == null || next === cur) break;
    cur = next;
  }
  return cur;
}

/** Decode the numeric and named entities that actually occur in this content. */
export function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Ampersand last, so we never create a new entity out of a decoded one.
    .replace(/&amp;/g, '&');
}

/** Full cleaning pipeline for a plain-text field. */
export function clean(s) {
  if (s == null) return '';
  let out = repairMojibake(s);
  out = decodeEntities(out);
  out = out.normalize('NFC');
  // Everything in this content used CRLF. Normalise here rather than only in the
  // blurb converter, or stray CRs survive in photo captions (e.g. photo 289).
  out = out.replace(/\r\n?/g, '\n');
  // Collapse the trailing whitespace and stray tabs the old CMS left behind.
  return out.replace(/[ \t]+$/gm, '').trim();
}

/**
 * Turn the handful of inline HTML tags in this content into Markdown.
 *
 * Note the quote class on href: several links were authored with typographic
 * quotes (href=”http://...”), and because entities are decoded before this runs,
 * &#8221; has already become ”. Matching only straight quotes left five <a> tags
 * intact in articles 10, 33, 37 and 43.
 */
const Q = '["\'\u201c\u201d\u2018\u2019]';

function inlineHtmlToMarkdown(s) {
  return s
    .replace(
      new RegExp(`<a\\s+[^>]*href\\s*=\\s*${Q}([^"'\u201c\u201d\u2018\u2019>]+)${Q}[^>]*>(.*?)<\\/a>`, 'gis'),
      '[$2]($1)'
    )
    .replace(/<strong>(.*?)<\/strong>/gis, '**$1**')
    .replace(/<b>(.*?)<\/b>/gis, '**$1**')
    .replace(/<i>(.*?)<\/i>/gis, '_$1_')
    .replace(/<em>(.*?)<\/em>/gis, '_$1_')
    .replace(/<br\s*\/?>/gi, '\n');
}

/**
 * Port of the old AppHelper::formatBlurb(), which is the formatting contract for
 * every article body:
 *
 *   - split the blurb on a blank line (\r\n\r\n)
 *   - a chunk starting with <blockquote> passes through as-is (these are the
 *     pull-quotes in the articles)
 *   - every other chunk gets wrapped in <p>
 *
 * Here we emit Markdown instead, so the structure is explicit in the data rather
 * than living in a helper function. Lone \r\n inside a chunk becomes a single
 * newline: HTML collapsed it to a space and Markdown soft-wrap does the same, so
 * rendering is preserved.
 */
export function blurbToMarkdown(raw) {
  const text = clean(raw).replace(/\r\n/g, '\n');
  const chunks = text.split(/\n{2,}/);
  const blocks = [];

  for (const chunk of chunks) {
    let c = chunk.trim();
    if (!c) continue;

    if (/^<blockquote>/i.test(c)) {
      const inner = inlineHtmlToMarkdown(
        c.replace(/^<blockquote>/i, '').replace(/<\/blockquote>\s*$/i, '')
      ).trim();
      blocks.push(
        inner
          .split('\n')
          .map((l) => `> ${l}`.trimEnd())
          .join('\n')
      );
      continue;
    }

    if (/<ul>|<li>/i.test(c)) {
      const items = [...c.matchAll(/<li>(.*?)<\/li>/gis)].map((m) =>
        inlineHtmlToMarkdown(m[1]).trim()
      );
      // Anything outside the list items (an intro sentence) keeps its place.
      const lead = inlineHtmlToMarkdown(
        c.replace(/<ul>[\s\S]*?<\/ul>/gi, '').replace(/<li>[\s\S]*?<\/li>/gi, '')
      )
        .replace(/<\/?[a-z][^>]*>/gi, '')
        .trim();
      if (lead) blocks.push(lead);
      if (items.length) blocks.push(items.map((i) => `- ${i}`).join('\n'));
      continue;
    }

    blocks.push(inlineHtmlToMarkdown(c).trim());
  }

  const out = blocks.join('\n\n');
  // Safety net: nothing should reach the site as raw HTML. Record anything the
  // converter missed so a new tag shows up as a reported problem, not as literal
  // markup on the page.
  const leftover = out.match(/<\/?[a-z][^>]*>/gi);
  if (leftover) leftoverHtml.push(...leftover);
  return out;
}

/** Any HTML tag the Markdown conversion failed to handle, for the export to report. */
export const leftoverHtml = [];

/** Photos and avatars were all written as http://. Vercel is HTTPS-only. */
export function httpsUrl(u) {
  if (!u) return '';
  return u.replace(/^http:\/\//i, 'https://');
}

const STATE_ABBRS = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM',
  'NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA',
  'WV','WI','WY',
]);

const STATE_NAMES = {
  ALABAMA:'AL', ALASKA:'AK', ARIZONA:'AZ', ARKANSAS:'AR', CALIFORNIA:'CA',
  COLORADO:'CO', CONNECTICUT:'CT', DELAWARE:'DE', FLORIDA:'FL', GEORGIA:'GA',
  HAWAII:'HI', IDAHO:'ID', ILLINOIS:'IL', INDIANA:'IN', IOWA:'IA', KANSAS:'KS',
  KENTUCKY:'KY', LOUISIANA:'LA', MAINE:'ME', MARYLAND:'MD', MASSACHUSETTS:'MA',
  MICHIGAN:'MI', MINNESOTA:'MN', MISSISSIPPI:'MS', MISSOURI:'MO', MONTANA:'MT',
  NEBRASKA:'NE', NEVADA:'NV', 'NEW HAMPSHIRE':'NH', 'NEW JERSEY':'NJ',
  'NEW MEXICO':'NM', 'NEW YORK':'NY', 'NORTH CAROLINA':'NC', 'NORTH DAKOTA':'ND',
  OHIO:'OH', OKLAHOMA:'OK', OREGON:'OR', PENNSYLVANIA:'PA', 'RHODE ISLAND':'RI',
  'SOUTH CAROLINA':'SC', 'SOUTH DAKOTA':'SD', TENNESSEE:'TN', TEXAS:'TX',
  UTAH:'UT', VERMONT:'VT', VIRGINIA:'VA', WASHINGTON:'WA', 'WEST VIRGINIA':'WV',
  WISCONSIN:'WI', WYOMING:'WY',
};

/**
 * Known bad values in places.state, corrected explicitly rather than guessed.
 *   PENSACOLA - place 136 is Fort Pickens, in the Gulf Islands National Seashore
 *               at Pensacola, Florida. A city was typed into the state field.
 */
const STATE_FIXES = { PENSACOLA: 'FL' };

/** Anything normalizeState() could not resolve, for the export to report on. */
export const unknownStates = new Map();

/**
 * places.state is dirty: mixed case ('MT' vs 'Mt'), full names alongside
 * abbreviations ('OREGON' next to 'OR'), and one city. Resolve to a two-letter
 * code, and record anything unrecognised instead of passing it through silently -
 * a silent pass-through is what produced a wrong state count on the old site.
 */
export function normalizeState(s, context = '') {
  const raw = (s || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (!raw) return '';
  const resolved = STATE_FIXES[raw] || STATE_NAMES[raw] || raw;
  if (!STATE_ABBRS.has(resolved)) {
    if (!unknownStates.has(raw)) unknownStates.set(raw, []);
    unknownStates.get(raw).push(context);
    return raw;
  }
  return resolved;
}

/** The dump is full of '0000-00-00 00:00:00'. */
export function cleanDate(d) {
  if (!d || d === 'NULL' || d.startsWith('0000-00-00')) return null;
  return d.replace(' ', 'T') + 'Z';
}
