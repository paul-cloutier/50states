#!/usr/bin/env node
/**
 * Export the 2011-2012 content out of the original MySQL dump into the JSON the
 * static site builds from.
 *
 *   node scripts/export-content.mjs
 *
 * Imports data/source/50_States.sql into a throwaway database, exports from it,
 * then drops it. Nothing here touches the old CakePHP app or its database.
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { importDump, dropDatabase, query, hex, num } from './lib/db.mjs';
import {
  clean, blurbToMarkdown, httpsUrl, normalizeState, cleanDate, unknownStates, leftoverHtml,
} from './lib/text.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DUMP = resolve(ROOT, 'data/source/50_States.sql');
const OUT = resolve(ROOT, 'data/export');
const SCRATCH = process.env.SCRATCH_DB || '50states_export_tmp';

const write = (name, data) => {
  writeFileSync(resolve(OUT, name), JSON.stringify(data, null, 2) + '\n');
  const n = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`  ${name.padEnd(22)} ${String(n).padStart(5)} records`);
};

// ---------------------------------------------------------------- authors

function loadAuthors() {
  // password and email are redacted in the committed dump and are not exported.
  const rows = query(SCRATCH, `
    SELECT id, HEX(first_name), HEX(last_name), HEX(image), HEX(bio), created
    FROM users ORDER BY id`);
  return rows.map(([id, fn, ln, img, bio, created]) => ({
    id: Number(id),
    firstName: clean(hex(fn)),
    lastName: clean(hex(ln)),
    name: `${clean(hex(fn))} ${clean(hex(ln))}`.trim(),
    slug: clean(hex(fn)).toLowerCase(),
    avatar: httpsUrl(clean(hex(img))),
    bio: clean(hex(bio)),
    created: cleanDate(created),
  }));
}

// ---------------------------------------------------------------- places

function loadPlaces() {
  const rows = query(SCRATCH, `
    SELECT id, HEX(name), HEX(description), HEX(address), HEX(city), HEX(state),
           HEX(zip), HEX(website), lat, \`long\`, views, visited, created
    FROM places ORDER BY id`);
  return rows.map((r) => {
    const [id, name, desc, addr, city, state, zip, site, lat, lng, views, visited, created] = r;
    return {
      id: Number(id),
      name: clean(hex(name)),
      description: clean(hex(desc)),
      address: clean(hex(addr)),
      city: clean(hex(city)),
      state: normalizeState(hex(state), `place ${id} ${clean(hex(name))}`),
      zip: clean(hex(zip)),
      website: httpsUrl(clean(hex(site))),
      // Stored as varchar in the original schema; cast to real numbers.
      lat: num(lat),
      lng: num(lng),
      views: Number(views) || 0,
      visited: cleanDate(visited),
      created: cleanDate(created),
    };
  });
}

// ---------------------------------------------------------------- photos

function loadPhotos(placesById) {
  const rows = query(SCRATCH, `
    SELECT id, user_id, place_id, HEX(title), HEX(caption), HEX(url),
           HEX(thumbnail), HEX(med), width, height, active, views, created
    FROM photos ORDER BY id`);

  const tagRows = query(SCRATCH, `
    SELECT pt.photo_id, HEX(t.tag)
    FROM photos_tags pt JOIN tags t ON t.id = pt.tag_id
    ORDER BY pt.photo_id, t.tag`);
  const tagsByPhoto = new Map();
  for (const [pid, t] of tagRows) {
    const k = Number(pid);
    if (!tagsByPhoto.has(k)) tagsByPhoto.set(k, []);
    tagsByPhoto.get(k).push(clean(hex(t)));
  }

  return rows.map((r) => {
    const [id, uid, pid, title, caption, url, thumb, med, w, h, active, views, created] = r;
    const placeId = num(pid);
    const place = placesById.get(placeId);
    return {
      id: Number(id),
      authorId: Number(uid),
      placeId,
      // Denormalised for the static build so photo pages need no joins.
      placeName: place ? place.name : null,
      city: place ? place.city : null,
      state: place ? place.state : null,
      visited: place ? place.visited : null,
      title: clean(hex(title)),
      caption: clean(hex(caption)),
      // All 858 image URLs were written as http://; Vercel is HTTPS-only.
      full: httpsUrl(clean(hex(url))),
      medium: httpsUrl(clean(hex(med))),
      thumb: httpsUrl(clean(hex(thumb))),
      width: num(w),
      height: num(h),
      active: Number(active) === 1,
      views: Number(views) || 0,
      created: cleanDate(created),
      tags: tagsByPhoto.get(Number(id)) || [],
    };
  });
}

// ---------------------------------------------------------------- articles

function loadArticles(placesById, photosById) {
  const rows = query(SCRATCH, `
    SELECT id, user_id, HEX(title), HEX(abstract), views, visited, created
    FROM articles ORDER BY id`);

  const blurbs = query(SCRATCH, `
    SELECT article_id, HEX(blurb), ordinal FROM article_blurbs
    ORDER BY article_id, ordinal`);
  const blurbsByArticle = new Map();
  for (const [aid, b, ord] of blurbs) {
    const k = Number(aid);
    if (!blurbsByArticle.has(k)) blurbsByArticle.set(k, []);
    blurbsByArticle.get(k).push({ ordinal: Number(ord), markdown: blurbToMarkdown(hex(b)) });
  }

  const ap = query(SCRATCH, `
    SELECT article_id, photo_id, ordinal FROM articles_photos
    ORDER BY article_id, ordinal`);
  const photosByArticle = new Map();
  for (const [aid, pid, ord] of ap) {
    const k = Number(aid);
    if (!photosByArticle.has(k)) photosByArticle.set(k, []);
    photosByArticle.get(k).push({ photoId: Number(pid), ordinal: Number(ord) });
  }

  const apl = query(SCRATCH, `SELECT article_id, place_id FROM articles_places ORDER BY article_id`);
  const placesByArticle = new Map();
  for (const [aid, pid] of apl) {
    const k = Number(aid);
    if (!placesByArticle.has(k)) placesByArticle.set(k, []);
    placesByArticle.get(k).push(Number(pid));
  }

  return rows.map((r) => {
    const [id, uid, title, abstract, views, visited, created] = r;
    const aid = Number(id);
    const placeIds = placesByArticle.get(aid) || [];
    const primary = placesById.get(placeIds[0]);
    return {
      id: aid,
      authorId: Number(uid),
      title: clean(hex(title)),
      abstract: clean(hex(abstract)),
      // The old site derived article ordering from its first place's visited date.
      visited: cleanDate(visited) || (primary ? primary.visited : null),
      created: cleanDate(created),
      views: Number(views) || 0,
      placeIds,
      primaryPlaceId: primary ? primary.id : null,
      city: primary ? primary.city : null,
      state: primary ? primary.state : null,
      body: (blurbsByArticle.get(aid) || []).map((b) => b.markdown),
      photoIds: (photosByArticle.get(aid) || [])
        .sort((a, b) => a.ordinal - b.ordinal)
        .map((p) => p.photoId)
        .filter((pid) => photosById.has(pid)),
    };
  });
}

// ---------------------------------------------------------------- navigation

/**
 * Precompute prev/next so the static pages need no queries. The old site ordered
 * articles by their place's visited date, and photos by (Place.visited, Photo.id).
 */
function addNavigation(articles, photos) {
  const byVisited = (a, b) =>
    String(a.visited || '').localeCompare(String(b.visited || '')) || a.id - b.id;

  const sortedArticles = [...articles].sort(byVisited);
  sortedArticles.forEach((a, i) => {
    a.prevId = i > 0 ? sortedArticles[i - 1].id : null;
    a.nextId = i < sortedArticles.length - 1 ? sortedArticles[i + 1].id : null;
  });

  const live = photos.filter((p) => p.active);
  const sortedPhotos = [...live].sort(byVisited);
  const navById = new Map();
  sortedPhotos.forEach((p, i) => {
    navById.set(p.id, {
      prevId: i > 0 ? sortedPhotos[i - 1].id : null,
      nextId: i < sortedPhotos.length - 1 ? sortedPhotos[i + 1].id : null,
    });
  });
  for (const p of photos) {
    const nav = navById.get(p.id) || { prevId: null, nextId: null };
    p.prevId = nav.prevId;
    p.nextId = nav.nextId;
    // "Related" on the old site meant other active photos at the same place.
    p.relatedIds = p.placeId
      ? live.filter((o) => o.placeId === p.placeId && o.id !== p.id).map((o) => o.id)
      : [];
  }
}

// ---------------------------------------------------------------- main

function main() {
  mkdirSync(OUT, { recursive: true });

  console.log(`Importing ${DUMP.replace(ROOT + '/', '')} into ${SCRATCH} ...`);
  importDump(SCRATCH, DUMP);

  try {
    const authors = loadAuthors();
    const places = loadPlaces();
    const placesById = new Map(places.map((p) => [p.id, p]));

    const photos = loadPhotos(placesById);
    const photosById = new Map(photos.map((p) => [p.id, p]));

    const articles = loadArticles(placesById, photosById);
    addNavigation(articles, photos);

    // Counts the old site maintained by hand in controller code, recomputed.
    for (const p of places) {
      p.photoIds = photos.filter((ph) => ph.placeId === p.id && ph.active).map((ph) => ph.id);
      p.articleIds = articles.filter((a) => a.placeIds.includes(p.id)).map((a) => a.id);
      p.photoCount = p.photoIds.length;
      p.articleCount = p.articleIds.length;
      p.hasArticle = p.articleCount > 0;
    }

    const tagCounts = new Map();
    for (const ph of photos) {
      if (!ph.active) continue;
      for (const t of ph.tags) {
        if (!tagCounts.has(t)) tagCounts.set(t, []);
        tagCounts.get(t).push(ph.id);
      }
    }
    const tags = [...tagCounts.entries()]
      .map(([tag, photoIds]) => ({
        tag,
        slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        count: photoIds.length,
        photoIds,
      }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

    console.log('\nWriting data/export/ ...');
    write('authors.json', authors);
    write('places.json', places);
    write('photos.json', photos);
    write('articles.json', articles);
    write('tags.json', tags);

    // Derived facts the old homepage hardcoded as literals.
    const visitedDates = places.map((p) => p.visited).filter(Boolean).sort();
    const statesVisited = [...new Set(places.map((p) => p.state).filter(Boolean))].sort();
    const manifest = {
      generatedFrom: {
        dump: 'data/source/50_States.sql',
        sha256: createHash('sha256').update(readFileSync(DUMP)).digest('hex'),
      },
      counts: {
        articles: articles.length,
        articleBodyBlocks: articles.reduce((n, a) => n + a.body.length, 0),
        photos: photos.length,
        photosActive: photos.filter((p) => p.active).length,
        places: places.length,
        placesWithCoords: places.filter((p) => p.lat != null && p.lng != null).length,
        tags: tags.length,
        authors: authors.length,
      },
      trip: {
        firstVisit: visitedDates[0] || null,
        lastVisit: visitedDates[visitedDates.length - 1] || null,
        statesVisited: statesVisited.length,
        states: statesVisited,
      },
      // Frozen 2012-era figures, kept as historical data rather than live counters.
      historicalViews: {
        articles: articles.reduce((n, a) => n + a.views, 0),
        photos: photos.reduce((n, p) => n + p.views, 0),
        places: places.reduce((n, p) => n + p.views, 0),
      },
    };
    write('manifest.json', manifest);

    if (leftoverHtml.length) {
      console.log('\n  UNCONVERTED HTML in article bodies:');
      for (const t of new Set(leftoverHtml)) console.log(`    ${t}`);
    }
    if (unknownStates.size) {
      console.log('\n  UNRESOLVED state values:');
      for (const [v, where] of unknownStates)
        console.log(`    "${v}" x${where.length}  e.g. ${where[0]}`);
    }
    console.log(`\n  states: ${statesVisited.length} (${statesVisited.join(' ')})`);
    console.log(`  trip:   ${manifest.trip.firstVisit} -> ${manifest.trip.lastVisit}`);
  } finally {
    dropDatabase(SCRATCH);
    console.log(`\nDropped ${SCRATCH}.`);
  }
}

main();
