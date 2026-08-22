# 50 States or Less

A static archive of a 2011–2012 road trip around the US in a restored 1977 GMC
motorhome. 53 articles, 859 photos, 283 places, 27 states, 19,000 miles.

The content is closed — nothing new has been published since June 2012 and nothing
will be. This site exists to keep the record readable.

## Status

Migration in progress. Replaces a CakePHP 1.3 app that lived at
`~/Sites/cake_13_sites/50states` (repo: `paul-cloutier/50states`). **That repo is
frozen** — the old site still runs and should keep running until this one is live.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router), fully static |
| Content | Build-time JSON in `data/export/` — ~313 KB of text, no database |
| Photos | Supabase Storage, ~390 MB of originals |
| Maps | Google Maps JS API — **retained** from the old site, not replaced |
| Hosting | Vercel |

There is deliberately **no database at runtime.** Every filter, index, tag page,
prev/next link and map layer is derived at build time from data that stopped changing
in 2012. View counts are frozen as historical figures, which removes the last write
path.

## Layout

```
data/
  source/          Inputs, committed. See "Self-contained" below.
    50_States.sql     Full dump of the original MySQL database
    fullRoute.kml     141 named GPS driving legs, Day 1–213
    map-assets/       Marker + infobox PNGs the map still uses
  export/          Generated content JSON (committed — it's the site's content)
  photos/          Local mirror of the S3 originals (gitignored, ~390 MB)
reference/       The old site, for porting from. Not built or deployed.
  style.css         Original stylesheet
  type/             Museo webfonts — LICENSE UNVERIFIED, see below
  img/              Site chrome (avatars, arrows, map pins)
  js/               homemap.js, article.js, infobox.js — the map to port
  views/            Original .ctp templates, for markup and structure
scripts/         Export + build tooling
```

### Self-contained by design

`data/source/` holds the SQL dump and the route KML so this repo can rebuild the
entire site **without MAMP, PHP 7.4, MySQL 8, or the old repo.** That's ~1.4 MB
committed to avoid depending on a stack that is already hard to stand up and will
only get harder. Don't remove it.

## Migration phases

1. ~~Secure and freeze the old site~~ — *outstanding, see below*
2. Export and normalize content → `data/export/`
3. Mirror photos off S3 → Supabase Storage
4. Static site to parity, no map
5. Port the map
6. Cut over with redirects

### Outstanding on the old repo before it goes public again

Two unauthenticated holes found during the survey, neither fixed yet:

- `/users/view/1` renders the SHA1 password hash and email to anonymous visitors
  (leftover baked scaffold at `views/users/view.ctp`)
- `PlacesController` has no auth guard on `add` / `edit` / `delete`, and its `delete`
  is the only one on the site not commented out — and fires on a GET

## Gotchas carried over

- **The map must be loaded over HTTPS.** The old code used
  `http://maps.google.com/maps/api/js?sensor=false`, which is active mixed content and
  is hard-blocked by browsers on any HTTPS host. It only worked locally because
  `php -S` serves over HTTP. Use `https://maps.googleapis.com/maps/api/js?key=…`.
  Always verify the map on an HTTPS preview URL, never localhost.
- **All 858 photo URLs in the dump are `http://`** and need rewriting on export.
- **Text encoding is in three broken states at once**: mixed utf8/latin1 tables read
  over a latin1 connection, HTML entities stored as literal text (`&#8217;`), and real
  mojibake from an older bad round-trip (`â€"` where an en-dash belongs). The export
  has to repair all three, and should be diffed against the old site's rendered
  output while that site still runs.
- **Article bodies aren't plain prose.** The old `AppHelper::formatBlurb()` split
  blurbs on blank lines, wrapped them in `<p>`, and passed `<blockquote>` through
  untouched — that's how the pull-quotes work. There are inline `<a href>` links too.
- **`state` values are inconsistently cased** (`MT` vs `Mt`), which is why the database
  says 27 states and the old homepage says 28.
- **Museo font license is unverified.** Check it before shipping `reference/type/`.

## Route data

`fullRoute.kml` is not one polyline — it's 141 separate named legs ("Day 1" through
"Day 213"), each with its own GPS trace and a one-line description of that day.
138 distinct driving days across a 213-day span, 31,784 points.

The old site parsed all of it client-side on every page load and drew 141 identical
blue lines, discarding every name and description. Simplified to ~110 m tolerance the
whole route is 82 KB gzipped and visually identical at trip zoom, so it should be
baked to GeoJSON at build time instead.

The day names and descriptions are worth surfacing eventually — Google's polylines
take hover listeners fine. Parked, not part of the migration.
