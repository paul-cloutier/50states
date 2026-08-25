# Cutover runbook

Phase 6. Everything in the repo is ready; what remains needs your Vercel and DNS
access. Ordered so nothing is irreversible until the last step.

## 1. Set the Maps key, then redeploy

The map is the only part of the site that needs configuration.

- In Vercel → Settings → Environment Variables, add
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for **all environments**.
- **Redeploy afterwards, with the build cache OFF.** `NEXT_PUBLIC_*` values are
  inlined at build time, so adding the variable does not fix an already-built
  deployment — and with "Use existing Build Cache" enabled, Next can reuse
  prerendered output and the new value never reaches the static pages. An empty
  commit (`git commit --allow-empty`) forces a clean build if you would rather not
  rely on the checkbox.

Use a **freshly generated** key, not the 2011 one — that key is readable in
`50states_original`'s public git history. Restrict the new key to the *Maps
JavaScript API* and to these HTTP referrers:

```
50statesorless.com/*
*.50statesorless.com/*
*.vercel.app/*
localhost:3000/*
```

Then delete the old key.

`NEXT_PUBLIC_` means the key ships in the page source. That is unavoidable for a
client-side map and normal for Maps keys — the referrer restriction *is* the security
boundary, not secrecy.

## 2. Verify the map on an HTTPS URL

This is the one check localhost cannot perform, because both `php -S` and
`next dev` serve over plain HTTP.

Open the Vercel preview or production URL and confirm the homepage map draws the
route. If it is a blank grey box, open the console: mixed-content blocking is silent
in the network tab but logs there. `TripMap` degrades to a "Map unavailable"
fallback rather than throwing, so a missing key looks the same as a blocked script —
check the console message to tell them apart.

## 3. Add the domain

**Done.** `www.50statesorless.com` is canonical; the apex 308-redirects to it.

- DNS is live on GoDaddy pointing at Vercel: apex `A` → `216.150.1.1`, `www`
  `CNAME` → `…vercel-dns-016.com`.
- Canonical host is **`www`**, which is the opposite of the old site (it served the
  bare domain). That is a deliberate choice, and the only thing it constrains is
  `SITE_URL` below — which must carry the `www` or every canonical tag and sitemap
  entry points at a URL that redirects.

## 4. Set `SITE_URL`

Sitemap and OpenGraph URLs come from `VERCEL_PROJECT_PRODUCTION_URL`, which is the
`*.vercel.app` hostname. Set it explicitly to the canonical host — **with the
`www`**, to match the domain decision above:

```
SITE_URL=https://www.50statesorless.com
```

Getting this wrong is subtle rather than loud: the site works fine, but every
`rel=canonical` and every `<loc>` in the sitemap points at a URL that 308s.

## 5. Verify after DNS propagates

```bash
# every legacy URL should end in 200 within one hop
for u in /photos/tags/Roadside "/photos/tags/National%20Parks" /users/view/1 \
         /places/view/6 /pages/about "/articles/index/page:2" /articles/6 /photos/44; do
  printf "%-34s %s\n" "$u" \
    "$(curl -s -o /dev/null -L -w '%{http_code} hops=%{num_redirects}' "https://www.50statesorless.com$u")"
done
```

Also check: the homepage map draws, `/sitemap.xml` returns 1,282 URLs on the `www`
host, `/robots.txt` points at the right sitemap, canonical tags carry the `www`, and
a share preview on an article shows its lead photo.

## 6. Retire the old app

**Archive it, do not delete it.**

- Stop serving the CakePHP app, but keep `50states_original` on GitHub.
- Keep the local `data/photos/` mirror — 859 originals, 378 MB, verified. It is
  gitignored, so it exists **only on local disk**. Put it somewhere backed up.
- The S3 bucket stays the live image origin, so it must keep working. Confirm the
  AWS account has current billing, no lifecycle rule that could expire objects, and
  an intact public-read ACL. The failure mode is silent until every image 404s.

### The permanent fallback

If everything else disappears, these rebuild the site:

| What | Where |
| --- | --- |
| Full database dump | `data/source/50_States.sql` (committed, redacted) |
| Route GPS log | `data/source/fullRoute.kml` (committed) |
| Exported content | `data/export/*.json` (committed) |
| Photo originals | `data/photos/` (**local only** — back this up) |
| Original design + templates | `reference/` (committed) |

The repo builds with no MySQL, no PHP and no network. The photos are the only piece
not in git.

## What is already done

- All 1,343 pages prerender; `npm run build` is clean.
- Legacy URL coverage verified by replaying 23 old URLs — all end in 200 within one
  hop, including all 57 raw-name tag URLs and Cake's `page:N` pagination.
- `sitemap.xml` (1,282 URLs), `robots.txt`, the original `favicon.ico`, OpenGraph
  and canonical tags.
- Encoding repaired and diffed against the live old site: zero mismatches.

## Known gaps, accepted

- **The route ends before the trip does.** Last leg is day 213 = 1 Aug 2011; the trip
  ran to 12 Sep 2011. 26 of 283 places fall after it — the last stretch home down the
  Oregon coast into California, plus a September Tennessee run. The old site drew the
  same file, so this is pre-existing.
- **Homepage mileage is the recorded 19,651, not the GPS-derived 16,046** — the log
  stops in Aug 2011, so the derived figure understates the trip.
- **Photos are 2011 resolution.** 357 are 612×612 Instagram exports and can never
  improve; ~500 are 1024px. Display width is capped rather than upscaled.
- **The homepage article is pinned, not random.** The old site used
  `ORDER BY RAND()`, which a static build cannot do.
- **View counts are frozen** at their 2012 totals, by decision.
