import {
  articles, livePhotos, places, tags, authors, statesWithArticles,
} from '@/lib/content';
import { SITE_URL } from '@/lib/site';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * The whole archive, ~1,280 URLs. lastModified is the trip date rather than the
 * build date - the content genuinely has not changed since 2012, and claiming
 * otherwise on every deploy is just noise to a crawler.
 */
export default function sitemap() {
  const url = (path, date, priority) => ({
    url: `${SITE_URL}${path}`,
    lastModified: date ? new Date(date) : undefined,
    priority,
  });

  return [
    url('/', undefined, 1),
    url('/about', undefined, 0.5),
    url('/articles', undefined, 0.9),
    url('/articles/date', undefined, 0.4),
    url('/photos', undefined, 0.9),
    url('/photos/date', undefined, 0.4),
    ...articles.map((a) => url(`/articles/${a.id}`, a.visited, 0.8)),
    ...livePhotos.map((p) => url(`/photos/${p.id}`, p.visited, 0.5)),
    ...places.map((p) => url(`/places/${p.id}`, p.visited, 0.5)),
    ...tags.map((t) => url(`/photos/tags/${t.slug}`, undefined, 0.4)),
    ...statesWithArticles.map((s) => url(`/articles/state/${s}`, undefined, 0.4)),
    ...MONTHS.map((m) => url(`/articles/month/${m}`, undefined, 0.3)),
    ...authors.map((a) => url(`/articles/author/${a.slug}`, undefined, 0.4)),
  ];
}
