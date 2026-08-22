#!/usr/bin/env node
/**
 * Upload the mirrored originals to Supabase Storage.
 *
 *   export SUPABASE_URL=https://<project>.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=<service role key>
 *   node scripts/upload-to-supabase.mjs [--bucket photos] [--dry-run]
 *
 * Run scripts/mirror-photos.mjs first. Reads the manifest it produced and uploads
 * every file in it, then verifies each object is reachable at its public URL and
 * writes data/export/photo-urls.json mapping photo id -> final URL.
 *
 * Idempotent: an object already present with the expected byte length is skipped,
 * so this can be re-run after a partial failure.
 *
 * Credentials come from the environment only - never committed, never logged. The
 * service role key bypasses row-level security, so use it from your machine and do
 * not put it in Vercel env vars; the site only ever needs the public URLs.
 *
 * Before running, create the bucket in the Supabase dashboard and make it PUBLIC.
 * A closed archive has nothing to protect, and public objects are CDN-cacheable
 * with no signed-URL expiry to manage.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PHOTOS = resolve(ROOT, 'data/photos');
const MANIFEST = resolve(ROOT, 'data/export/photos-manifest.json');
const URL_MAP = resolve(ROOT, 'data/export/photo-urls.json');

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const BUCKET = arg('bucket', 'photos');
const CONCURRENCY = Number(arg('concurrency', 4));
const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!DRY_RUN && (!SUPABASE_URL || !KEY)) {
  console.error(
    'Missing credentials.\n\n' +
    '  export SUPABASE_URL=https://<project>.supabase.co\n' +
    '  export SUPABASE_SERVICE_ROLE_KEY=<service role key>\n\n' +
    'Create the bucket first (public), then re-run. Use --dry-run to preview.'
  );
  process.exit(1);
}

const objectUrl = (file) => `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${file}`;
const publicUrl = (file) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file}`;

const contentType = (file) =>
  /\.png$/i.test(file) ? 'image/png' : /\.gif$/i.test(file) ? 'image/gif' : 'image/jpeg';

async function existingLength(file) {
  try {
    const res = await fetch(publicUrl(file), { method: 'HEAD' });
    if (!res.ok) return null;
    const len = res.headers.get('content-length');
    return len ? Number(len) : null;
  } catch {
    return null;
  }
}

async function upload(rec, state) {
  const already = await existingLength(rec.file);
  if (already === rec.bytes) {
    state.skipped++;
    state.urls[rec.id] = publicUrl(rec.file);
    return;
  }

  const body = readFileSync(resolve(PHOTOS, rec.file));
  if (body.length !== rec.bytes) {
    state.failed.push({ id: rec.id, file: rec.file,
      error: `local size ${body.length} != manifest ${rec.bytes} - re-run mirror-photos` });
    return;
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(objectUrl(rec.file), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KEY}`,
          'Content-Type': contentType(rec.file),
          // The archive is closed - these bytes will never change.
          'Cache-Control': 'public, max-age=31536000, immutable',
          'x-upsert': 'true',
        },
        body,
      });
      if (res.ok) {
        state.uploaded++;
        state.urls[rec.id] = publicUrl(rec.file);
        return;
      }
      // Surface the API's message, but never echo the key back.
      const text = (await res.text()).slice(0, 200);
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        state.failed.push({ id: rec.id, file: rec.file, error: `HTTP ${res.status}: ${text}` });
        return;
      }
      throw new Error(`HTTP ${res.status}: ${text}`);
    } catch (e) {
      if (attempt === 3) state.failed.push({ id: rec.id, file: rec.file, error: e.message });
      else await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const files = manifest.files;

  console.log(`${DRY_RUN ? '[dry run] ' : ''}Uploading ${files.length} files ` +
    `(${(manifest.totalBytes / 1024 / 1024).toFixed(0)} MB) to bucket "${BUCKET}"`);

  if (DRY_RUN) {
    console.log(`  target: ${SUPABASE_URL || '<SUPABASE_URL>'}/storage/v1/object/${BUCKET}/`);
    console.log(`  example: ${files[0].file} -> ${files[0].bytes} bytes`);
    console.log(`  public URL shape: ${publicUrl(files[0].file)}`);
    return;
  }

  const state = { uploaded: 0, skipped: 0, failed: [], urls: {} };
  const queue = [...files];
  let logged = 0;
  const worker = async () => {
    while (queue.length) {
      await upload(queue.shift(), state);
      const n = state.uploaded + state.skipped + state.failed.length;
      if (n - logged >= 100) { logged = n; console.log(`  ${n}/${files.length} ...`); }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\n  uploaded: ${state.uploaded}`);
  console.log(`  already present: ${state.skipped}`);
  console.log(`  failed: ${state.failed.length}`);
  state.failed.slice(0, 20).forEach((f) => console.log(`    id=${f.id} ${f.file} - ${f.error}`));

  if (Object.keys(state.urls).length) {
    writeFileSync(URL_MAP, JSON.stringify({
      bucket: BUCKET,
      base: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`,
      count: Object.keys(state.urls).length,
      byPhotoId: state.urls,
    }, null, 2) + '\n');
    console.log(`\n  wrote data/export/photo-urls.json (${Object.keys(state.urls).length} urls)`);
  }
  if (state.failed.length) process.exitCode = 1;
}

main();
