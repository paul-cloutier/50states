/**
 * Canonical origin, used for sitemap URLs and OpenGraph tags.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the production domain at build time,
 * so preview deploys don't emit production URLs and vice versa. SITE_URL overrides
 * it if the real domain differs from what Vercel thinks.
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
).replace(/\/$/, '');
