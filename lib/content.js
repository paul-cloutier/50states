/**
 * Content access for the static build.
 *
 * Everything is read from data/export/*.json at build time - there is no database
 * and no runtime fetching. The whole corpus is ~313 KB of text, so loading it
 * eagerly and indexing it in memory is cheaper than any alternative.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const DIR = join(process.cwd(), 'data/export');
const read = (f) => JSON.parse(readFileSync(join(DIR, f), 'utf8'));

export const articles = read('articles.json');
export const photos = read('photos.json');
export const places = read('places.json');
export const tags = read('tags.json');
export const authors = read('authors.json');
export const manifest = read('manifest.json');
export const routeStats = read('route.stats.json');
/** Frozen Twitter sidebar as of the trip's end in 2011, extracted from the old
 *  template. Carries no dates - none exist in the source. See
 *  scripts/export-updates.mjs - there is no database row for any of this. */
export const updates = read('updates.json').updates;

const indexById = (list) => new Map(list.map((x) => [x.id, x]));

export const articleById = indexById(articles);
export const photoById = indexById(photos);
export const placeById = indexById(places);
export const authorById = indexById(authors);

/** Photo 1 is not in the S3 bucket, so it ships from public/ instead. */
const LOCAL_PHOTOS = { 1: '/img/1_1_1000.jpg' };

export function photoSrc(photo) {
  return LOCAL_PHOTOS[photo.id] || photo.full;
}

/** Only active photos are ever shown; the flag predates the archive being closed. */
export const livePhotos = photos.filter((p) => p.active);

/** Chronological order for the whole trip, matching the old site's ordering. */
const byVisited = (a, b) =>
  String(a.visited || '').localeCompare(String(b.visited || '')) || a.id - b.id;

/**
 * Articles have a single order: newest posted first.
 *
 * The old site offered a toggle between "by date visited" and "by date added",
 * which needed a query per ordering. All 53 articles carry a `created` date, so
 * posted order is the one canonical list. `visited` is still used for the trip
 * chronology - prev/next links and the month filter - just not for the index.
 */
export const articlesByCreated = [...articles].sort(
  (a, b) => String(b.created || '').localeCompare(String(a.created || '')) || b.id - a.id
);

/** Retained for the homepage's fallback pick. */
export const articlesNewestFirst = articlesByCreated;
export const photosNewestFirst = [...livePhotos].sort((a, b) => byVisited(b, a));
export const photosByIdDesc = [...livePhotos].sort((a, b) => b.id - a.id);

export const author = (id) => authorById.get(id) || null;

export function articlePhotos(article) {
  return article.photoIds.map((id) => photoById.get(id)).filter(Boolean).filter((p) => p.active);
}

export function articlePlaces(article) {
  return article.placeIds.map((id) => placeById.get(id)).filter(Boolean);
}

/** States that actually have articles, for the filter nav. */
export const statesWithArticles = [...new Set(
  articles.flatMap((a) => articlePlaces(a).map((p) => p.state)).filter(Boolean)
)].sort();

export const tagBySlug = new Map(tags.map((t) => [t.slug, t]));

export function photosForTag(tag) {
  return tag.photoIds.map((id) => photoById.get(id)).filter(Boolean).filter((p) => p.active);
}

export function articlesForState(state) {
  const s = String(state).toUpperCase();
  return articlesByCreated.filter((a) => articlePlaces(a).some((p) => p.state === s));
}

export function articlesForMonth(month) {
  const m = Number(month);
  // Filters on when the stop happened - "from March" means stops made in March -
  // but the results are still listed in posted order like everything else.
  return articlesByCreated.filter(
    (a) => a.visited && new Date(a.visited).getUTCMonth() + 1 === m
  );
}

export function articlesForAuthor(slug) {
  const a = authors.find((x) => x.slug === String(slug).toLowerCase());
  return a ? articlesByCreated.filter((x) => x.authorId === a.id) : [];
}

/**
 * Article bodies are stored as Markdown blocks - the export's port of the old
 * AppHelper::formatBlurb(). Rendered at build time, so marked never ships to the
 * browser.
 */
export function renderBody(blocks) {
  return blocks.map((b) => marked.parse(b)).join('\n');
}

export function renderInline(md) {
  return marked.parseInline(md || '');
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

export function cityState(x) {
  return [x?.city, x?.state].filter(Boolean).join(', ');
}

/** Trim places down to just what the map needs, so little is serialized. */
export function mapPlaces(list) {
  return list
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      where: cityState(p),
      visited: p.visited ? formatDate(p.visited) : null,
      hasArticle: Boolean(p.hasArticle),
    }));
}
