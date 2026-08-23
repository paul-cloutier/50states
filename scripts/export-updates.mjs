#!/usr/bin/env node
/**
 * Extract the homepage "Updates" sidebar out of the old site's template.
 *
 *   node scripts/export-updates.mjs
 *
 * This content has no database row anywhere. The old site originally pulled the
 * tweets live from twitter.com/statuses/user_timeline/*.atom, but that fetch was
 * commented out long before the trip ended and replaced by a hand-pasted snapshot
 * in views/elements/tweets.ctp. That template is therefore the only source, which
 * is why reference/ has to stay in the repo.
 *
 * The result is frozen 2012 content by definition - the Twitter API it came from
 * has been dead since 2013 and both accounts stopped posting when the trip ended.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean } from './lib/text.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'reference/views/elements/tweets.ctp');
const OUT = resolve(ROOT, 'data/export/updates.json');

/** Keep the one inline anchor as Markdown; strip any other stray markup. */
function toText(html) {
  return clean(
    html
      .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis, '[$2]($1)')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/?[a-z][^>]*>/gi, '')
  ).replace(/\s+/g, ' ').trim();
}

const src = readFileSync(SRC, 'utf8');
const updates = [];

// Each entry is <li class="paul|alana"> ... <div>text</div> ... </li>
const re = /<li\s+class=["'](paul|alana)["']\s*>([\s\S]*?)<\/li>/gi;
let m;
while ((m = re.exec(src)) !== null) {
  const who = m[1].toLowerCase();
  const body = m[2].match(/<div>([\s\S]*?)<\/div>/i)?.[1];
  if (!body) continue;
  const text = toText(body);
  if (!text) continue;
  updates.push({ author: who, text });
}

// The template is ordered newest first; preserve it rather than inventing dates,
// since none of these entries carry one.
writeFileSync(
  OUT,
  JSON.stringify(
    {
      source: 'reference/views/elements/tweets.ctp',
      note: 'Frozen snapshot of the Twitter sidebar as it stood when the trip ended in 2012. No dates exist in the source.',
      count: updates.length,
      updates,
    },
    null,
    2
  ) + '\n'
);

const byAuthor = updates.reduce((a, u) => ({ ...a, [u.author]: (a[u.author] || 0) + 1 }), {});
console.log(`  updates.json         ${updates.length} entries ${JSON.stringify(byAuthor)}`);
console.log(`  with inline links:   ${updates.filter((u) => u.text.includes('](')).length}`);
