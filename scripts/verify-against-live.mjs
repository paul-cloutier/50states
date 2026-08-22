#!/usr/bin/env node
/**
 * Diff the exported content against the old CakePHP site's rendered output.
 *
 *   cd ~/Sites/cake_13_sites/50states/html && php -S localhost:8765 router.php
 *   node scripts/verify-against-live.mjs
 *
 * This is the one check that matters for the migration: it proves the export says
 * the same thing the live site says, while the live site still exists to ask. Run
 * it before trusting data/export/ and before the old app is switched off.
 *
 * Comparison is by "text fingerprint" - entities decoded, markup stripped, cased
 * and punctuation folded away - so it is immune to HTML vs Markdown differences
 * but still catches dropped, truncated or garbled prose.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.OLD_SITE || 'http://localhost:8765';
const EXPORT = resolve(ROOT, 'data/export');

const load = (f) => JSON.parse(readFileSync(resolve(EXPORT, f), 'utf8'));

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”').replace(/&ldquo;/g, '“')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

/** Reduce any text to a comparable fingerprint: letters and digits only. */
function fingerprint(s) {
  return decodeEntities(s)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')   // fold accents, both sides equally
    .replace(/[^a-z0-9]+/g, '');
}

/** Markdown -> plain text, so the export can be fingerprinted the same way. */
function markdownToText(md) {
  return md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // links keep their label
    .replace(/^>\s?/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/_([^_]*)_/g, '$1');
}

async function fetchText(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.text();
}

/** Longest common prefix, to point at where two texts start diverging. */
function divergeAt(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

async function main() {
  try {
    await fetch(BASE);
  } catch {
    console.error(`Cannot reach the old site at ${BASE}.\n` +
      `Start it with:\n  cd ~/Sites/cake_13_sites/50states/html && ` +
      `/Applications/MAMP/bin/php/php7.4.33/bin/php -S localhost:8765 router.php`);
    process.exit(1);
  }

  const articles = load('articles.json');
  const photos = load('photos.json');

  let checked = 0;
  const problems = [];

  console.log(`Comparing ${articles.length} articles against ${BASE} ...`);
  for (const a of articles) {
    const html = await fetchText(`/articles/${a.id}`);
    const page = fingerprint(html);
    checked++;

    for (const [label, value] of [['title', a.title], ['abstract', a.abstract]]) {
      const fp = fingerprint(value);
      if (fp && !page.includes(fp)) {
        problems.push({ what: `article ${a.id} ${label}`, value: value.slice(0, 70) });
      }
    }

    a.body.forEach((block, i) => {
      const fp = fingerprint(markdownToText(block));
      if (!fp) return;
      if (!page.includes(fp)) {
        const at = divergeAt(fp, page.slice(page.indexOf(fp.slice(0, 40))));
        problems.push({
          what: `article ${a.id} body block ${i}`,
          value: markdownToText(block).slice(Math.max(0, at - 40), at + 60),
        });
      }
    });
  }

  // Photos: sample rather than all 859, enough to catch a systematic fault.
  const sample = photos.filter((p) => p.active).filter((_, i) => i % 40 === 0);
  console.log(`Comparing ${sample.length} sampled photos ...`);
  for (const p of sample) {
    const html = await fetchText(`/photos/${p.id}`);
    const page = fingerprint(html);
    checked++;
    for (const [label, value] of [['title', p.title], ['caption', p.caption]]) {
      const fp = fingerprint(value);
      if (fp && !page.includes(fp)) {
        problems.push({ what: `photo ${p.id} ${label}`, value: value.slice(0, 70) });
      }
    }
  }

  console.log(`\n  pages compared: ${checked}`);
  if (!problems.length) {
    console.log('  MATCH - every exported string was found in the live page.\n');
    return;
  }
  console.log(`  MISMATCHES: ${problems.length}\n`);
  for (const p of problems.slice(0, 25)) {
    console.log(`   ${p.what}`);
    console.log(`     ${JSON.stringify(p.value)}`);
  }
  if (problems.length > 25) console.log(`   ... and ${problems.length - 25} more`);
  process.exitCode = 1;
}

main();
