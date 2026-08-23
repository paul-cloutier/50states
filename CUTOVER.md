# Cutover runbook

Phase 6. Everything in the repo is ready; what remains needs your Vercel and DNS
access. Ordered so nothing is irreversible until the last step.

## 1. Set the Maps key, then redeploy

The map is the only part of the site that needs configuration.

- In Vercel → Settings → Environment Variables, add
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for **all environments**.
- **Redeploy afterwards.** `NEXT_PUBLIC_*` values are inlined at build time, so
  adding the variable does not fix an already-built deployment.

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

- Vercel → Settings → Domains → add `50statesorless.com` and `www.50statesorless.com`.
- Vercel will offer to redirect one to the other. Pick the apex as canonical to
  match the old site.
- At the registrar (the old site was on GoDaddy), point DNS at Vercel — an `A`
  record for the apex and a `CNAME` for `www`, per whatever Vercel shows.
- Lower the TTL a day beforehand if you want a fast rollback.

## 4. Set `SITE_URL`

Sitemap and OpenGraph URLs come from `VERCEL_PROJECT_PRODUCTION_URL`, which is the
`*.vercel.app` hostname. Once the real domain is live, set:

```
SITE_URL=https://50statesorless.com
```

and redeploy, so `sitemap.xml` and share cards use the real domain.

## 5. Verify after DNS propagates

```bash
# every legacy URL should end in 200 within one hop
for u in /photos/tags/Roadside "/photos/tags/National%20Parks" /users/view/1 \
         /places/view/6 /pages/about "/articles/index/page:2" /articles/6 /photos/44; do
  printf "%-34s %s\n" "$u" \
    "$(curl -s -o /dev/null -L -w '%{http_code} hops=%{num_redirects}' "https://50statesorless.com$u")"
done
```

Also check: the homepage map draws, `/sitemap.xml` returns 1,282 URLs on the real
domain, `/robots.txt` points at the right sitemap, and a share preview on an article
shows its lead photo.

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
  ran to 22 Jun 2012. 26 of 283 places fall after it — the drive home down the Oregon
  coast. The old site drew the same file, so this is pre-existing.
- **Photos are 2011 resolution.** 357 are 612×612 Instagram exports and can never
  improve; ~500 are 1024px. Display width is capped rather than upscaled.
- **The homepage article is pinned, not random.** The old site used
  `ORDER BY RAND()`, which a static build cannot do.
- **View counts are frozen** at their 2012 totals, by decision.
