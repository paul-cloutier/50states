import { readFileSync } from 'node:fs';

const tags = JSON.parse(readFileSync('./data/export/tags.json', 'utf8'));
const authors = JSON.parse(readFileSync('./data/export/authors.json', 'utf8'));

/**
 * Redirects for the URL surface the CakePHP site exposed for 15 years.
 *
 * Audited against the old app's routes.php plus Cake's default
 * /:controller/:action/:id fallback, and spot-checked against the running old site.
 * Anything that returned 200 there should land somewhere sensible here.
 */
function legacyRedirects() {
  const out = [];

  // NOTE: tag URLs are deliberately NOT redirected here.
  //
  // Next matches redirect sources case-insensitively, so a rule
  // /photos/tags/Roadside -> /photos/tags/roadside also matches the destination
  // and redirects it to itself: an infinite loop (curl reported 50 hops). The old
  // raw-name URLs are instead resolved directly by app/photos/tags/[tag]/page.js,
  // which prerenders both forms and points rel=canonical at the slug.

  // Every article and photo byline linked to /users/view/:id.
  for (const a of authors) {
    out.push({
      source: `/users/view/${a.id}`,
      destination: `/articles/author/${a.slug}`,
      permanent: true,
    });
  }

  return out;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Originals stay in the 2011 S3 bucket. next/image fetches each one once and
    // serves cached derivatives from the edge, so S3 is a cold origin - which is
    // why its missing Cache-Control and lack of a CDN don't matter.
    remotePatterns: [{ protocol: 'https', hostname: '50states.s3.amazonaws.com' }],
    // The archive is closed; these bytes will never change.
    minimumCacheTTL: 31536000,
  },

  async redirects() {
    return [
      ...legacyRedirects(),

      // The old site had no /places/:id route at all - it returned a blank 500.
      { source: '/places/view/:id', destination: '/places/:id', permanent: true },

      // The index no longer offers a visited-vs-posted ordering toggle, so the
      // old "by date added" view collapses into the single canonical index.
      { source: '/articles/date', destination: '/articles', permanent: true },

      // Cake's Paginator used named params. These are real indexed URLs; the new
      // indexes aren't paginated, so they collapse to the index itself.
      // Cake wrote them as /articles/index/page:2 - a literal colon in the
      // segment, which path-to-regexp can't express, so match the whole tail.
      { source: '/articles/index/:rest*', destination: '/articles', permanent: true },
      { source: '/photos/index/:rest*', destination: '/photos', permanent: true },

      // Static pages were served through PagesController.
      { source: '/pages/about', destination: '/about', permanent: true },
      { source: '/pages/:slug*', destination: '/', permanent: true },
      { source: '/coming_soon', destination: '/', permanent: true },

      // The one photo that was never on S3 moved out of /img/photos/.
      { source: '/img/photos/1_1_1000.jpg', destination: '/img/1_1_1000.jpg', permanent: true },

      // Not a feed - the old .rss URL served the HTML index with zero items.
      { source: '/articles/index.rss', destination: '/articles', permanent: true },

      // The CMS is gone. A redirect is friendlier than a dead end for anything
      // still linking these.
      { source: '/articles/add', destination: '/articles', permanent: true },
      { source: '/photos/add', destination: '/photos', permanent: true },
      { source: '/photos/add_tags', destination: '/photos', permanent: true },
      { source: '/photos/fix_thumbs', destination: '/photos', permanent: true },
      { source: '/articles/:id/edit', destination: '/articles/:id', permanent: true },
      { source: '/articles/:id/delete', destination: '/articles/:id', permanent: true },
      { source: '/photos/:id/edit', destination: '/photos/:id', permanent: true },
      { source: '/photos/:id/delete', destination: '/photos/:id', permanent: true },
      { source: '/places/add', destination: '/', permanent: true },
      { source: '/places/edit/:id', destination: '/places/:id', permanent: true },
      { source: '/places/delete/:id', destination: '/places/:id', permanent: true },
      { source: '/places/index', destination: '/', permanent: true },
      { source: '/places', destination: '/', permanent: true },
      { source: '/tags/add', destination: '/photos', permanent: true },
      { source: '/tags', destination: '/photos', permanent: true },

      // Auth went with the CMS.
      { source: '/login', destination: '/', permanent: true },
      { source: '/logout', destination: '/', permanent: true },
      { source: '/users', destination: '/', permanent: true },
      { source: '/users/:path*', destination: '/', permanent: true },

      // Dead integrations that had their own endpoints.
      { source: '/tweets/:path*', destination: '/', permanent: true },
      { source: '/ajax/:path*', destination: '/', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // The route geometry never changes.
        source: '/route.geojson',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
