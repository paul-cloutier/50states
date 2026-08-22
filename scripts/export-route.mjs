#!/usr/bin/env node
/**
 * Convert data/source/fullRoute.kml into GeoJSON for the map.
 *
 *   node scripts/export-route.mjs [--tolerance 0.001]
 *
 * The old site shipped all 788 KB of KML to the browser on every homepage load and
 * parsed it with DOMParser before drawing a line. It also threw away everything
 * except the coordinates: the file actually contains 141 separately named driving
 * legs ("Day 1" ... "Day 213"), each with a one-line description of that day.
 *
 * This keeps the names and descriptions as feature properties, and simplifies the
 * geometry with Douglas-Peucker. At the default ~110 m tolerance the whole
 * 19,000-mile route is about 82 KB gzipped and is visually identical at any zoom
 * where more than one town is visible. The coordinates feed straight into the
 * existing google.maps.Polyline calls.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'data/source/fullRoute.kml');
const OUT_DIR = resolve(ROOT, 'data/export');

const argTol = process.argv.indexOf('--tolerance');
const TOLERANCE = argTol > -1 ? Number(process.argv[argTol + 1]) : 0.001;

// ------------------------------------------------------------- KML parsing

/**
 * The KML is machine-generated with a flat, uniform Placemark structure, so a
 * targeted scan is safer here than pulling in an XML dependency. Each Placemark
 * has at most one name, description and coordinates block.
 */
function parsePlacemarks(xml) {
  const out = [];
  const blocks = xml.split(/<Placemark\b/i).slice(1);
  for (const block of blocks) {
    const body = block.split(/<\/Placemark>/i)[0];
    const coordsRaw = body.match(/<coordinates>([\s\S]*?)<\/coordinates>/i)?.[1];
    if (!coordsRaw) continue;

    const name = (body.match(/<name>([\s\S]*?)<\/name>/i)?.[1] || '').trim();
    const description = (body.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '').trim();

    const coords = [];
    for (const tok of coordsRaw.trim().split(/\s+/)) {
      if (!tok) continue;
      const [lon, lat] = tok.split(',');
      const x = Number(lon), y = Number(lat);
      if (Number.isFinite(x) && Number.isFinite(y)) coords.push([x, y]);
    }
    if (coords.length < 2) continue;

    // Names are "Day 1" .. "day 213" - inconsistent case, always one number.
    const day = Number(name.match(/(\d+)/)?.[1]) || null;
    out.push({ name, description, day, coords });
  }
  return out;
}

// ------------------------------------------------------------- simplify

function perpDistance([x, y], [x1, y1], [x2, y2]) {
  const dx = x2 - x1, dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  let t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

/** Douglas-Peucker, iterative so a long leg cannot overflow the stack. */
function simplify(points, tolerance) {
  if (tolerance <= 0 || points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0, index = 0;
    for (let i = first + 1; i < last; i++) {
      const d = perpDistance(points[i], points[first], points[last]);
      if (d > maxDist) { maxDist = d; index = i; }
    }
    if (maxDist > tolerance) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

// ------------------------------------------------------------- distance

const R_MILES = 3958.7613;

function haversine([lon1, lat1], [lon2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_MILES * Math.asin(Math.min(1, Math.sqrt(a)));
}

function lengthMiles(coords) {
  let m = 0;
  for (let i = 1; i < coords.length; i++) m += haversine(coords[i - 1], coords[i]);
  return m;
}

// ------------------------------------------------------------- main

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const legs = parsePlacemarks(readFileSync(SRC, 'utf8'));

  const rawPoints = legs.reduce((n, l) => n + l.coords.length, 0);
  // Distance is measured on the FULL geometry - simplification would shorten it.
  const totalMiles = legs.reduce((n, l) => n + lengthMiles(l.coords), 0);

  let keptPoints = 0;
  const features = legs
    .sort((a, b) => (a.day ?? 1e9) - (b.day ?? 1e9))
    .map((leg) => {
      const coords = simplify(leg.coords, TOLERANCE)
        .map(([x, y]) => [Number(x.toFixed(5)), Number(y.toFixed(5))]);
      keptPoints += coords.length;
      return {
        type: 'Feature',
        properties: {
          day: leg.day,
          label: leg.name.replace(/^day\b/i, 'Day'),
          description: leg.description,
          miles: Number(lengthMiles(leg.coords).toFixed(1)),
        },
        geometry: { type: 'LineString', coordinates: coords },
      };
    });

  const fc = { type: 'FeatureCollection', features };
  const json = JSON.stringify(fc);
  writeFileSync(resolve(OUT_DIR, 'route.geojson'), json + '\n');
  // Also drop it in public/ - the map fetches it as a static file rather than
  // having 300 KB of GeoJSON bundled into the JS payload. Written from here so the
  // two copies cannot drift.
  writeFileSync(resolve(ROOT, 'public/route.geojson'), json + '\n');

  const days = features.map((f) => f.properties.day).filter(Boolean);
  const lons = features.flatMap((f) => f.geometry.coordinates.map((c) => c[0]));
  const lats = features.flatMap((f) => f.geometry.coordinates.map((c) => c[1]));

  const stats = {
    source: 'data/source/fullRoute.kml',
    tolerance: TOLERANCE,
    legs: features.length,
    points: { original: rawPoints, simplified: keptPoints },
    bytes: { geojson: json.length, gzipped: gzipSync(json, { level: 9 }).length },
    days: { first: Math.min(...days), last: Math.max(...days), distinct: new Set(days).size },
    miles: Math.round(totalMiles),
    bbox: [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)]
      .map((v) => Number(v.toFixed(4))),
  };
  writeFileSync(resolve(OUT_DIR, 'route.stats.json'), JSON.stringify(stats, null, 2) + '\n');

  console.log(`  route.geojson      ${stats.legs} legs, ` +
    `${stats.points.simplified} of ${stats.points.original} points`);
  console.log(`  size               ${(stats.bytes.geojson / 1024).toFixed(0)} KB ` +
    `(${(stats.bytes.gzipped / 1024).toFixed(0)} KB gzipped)`);
  console.log(`  days               ${stats.days.first}-${stats.days.last} ` +
    `(${stats.days.distinct} with driving)`);
  console.log(`  measured distance  ${stats.miles.toLocaleString()} miles`);
  console.log(`  bbox               ${stats.bbox.join(', ')}`);
}

main();
