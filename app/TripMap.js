'use client';

/**
 * The trip map, ported from the old homemap.js and article.js.
 *
 * Deliberately still Google Maps, not Mapbox. What changed from the original:
 *
 *  - Loads over HTTPS from maps.googleapis.com. The old code used
 *    `http://maps.google.com/maps/api/js?sensor=false`, which is active mixed
 *    content and is hard-blocked on any HTTPS host - it only ever worked because
 *    `php -S` served over plain HTTP. This is the one change that is not optional.
 *  - `sensor` is gone; it was removed from the API years ago.
 *  - The route comes from a prebuilt GeoJSON instead of downloading 788 KB of KML
 *    and parsing it with DOMParser on every page load.
 *
 * Kept as-is on purpose: the InfoBox library, the marker PNGs, and the blue/grey
 * marker distinction for "this place has a story".
 */

import { useEffect, useRef, useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let apiPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.addEventListener('load', () => { s.dataset.loaded = '1'; resolve(); });
    s.addEventListener('error', () => reject(new Error(`failed to load ${src}`)));
    document.head.appendChild(s);
  });
}

function loadMapsApi() {
  if (apiPromise) return apiPromise;
  apiPromise = (async () => {
    if (!API_KEY) throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set');
    await loadScript(`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly`);
    // The original popup chrome. Depends on google.maps being present already.
    await loadScript('/js/infobox.js');
  })();
  return apiPromise;
}

/**
 * @param {'home'|'detail'} variant  500px with the full route, or a 150px band.
 * @param {Array} places  {id, name, lat, lng, where, visited, hasArticle}
 * @param {boolean} showRoute  draw the 141 driving legs.
 */
export default function TripMap({ variant = 'detail', places = [], showRoute = false, fallback }) {
  const holder = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    let infoBox = null;

    (async () => {
      try {
        await loadMapsApi();
        if (cancelled || !holder.current) return;
        const g = window.google.maps;

        const withCoords = places.filter((p) => p.lat != null && p.lng != null);
        const map = new g.Map(holder.current, {
          zoom: variant === 'home' ? 5 : 10,
          center: withCoords.length
            ? new g.LatLng(withCoords[0].lat, withCoords[0].lng)
            : new g.LatLng(38.58, -109.55),
          mapTypeId: g.MapTypeId.ROADMAP,
          disableDefaultUI: variant === 'home',
          zoomControl: variant === 'home',
          gestureHandling: 'cooperative',
        });

        const icon = (file) => ({
          url: file,
          size: new g.Size(17, 19),
          origin: new g.Point(0, 0),
          anchor: new g.Point(10, 10),
        });
        const blue = icon('/img/map_dot.png');
        const grey = icon('/img/map_dot_grey.png');

        const bounds = new g.LatLngBounds();
        if (typeof window.InfoBox === 'function') infoBox = new window.InfoBox();

        const boxOptions = {
          alignBottom: true,
          pixelOffset: new g.Size(-51, 30),
          zIndex: -100,
          boxStyle: {
            background: "url('/img/map_box_bottom.png') center bottom no-repeat",
            opacity: 1,
            width: '199px',
          },
          closeBoxMargin: '5px 5px 5px 5px',
          closeBoxURL: '/img/map_closer_blue.png',
          infoBoxClearance: new g.Size(20, 20),
        };

        for (const p of withCoords) {
          const pos = new g.LatLng(p.lat, p.lng);
          bounds.extend(pos);
          const marker = new g.Marker({
            position: pos,
            map,
            // Blue when the place has a story, grey when it is photos only.
            icon: p.hasArticle ? blue : grey,
            title: p.name,
            clickable: Boolean(infoBox),
          });
          if (!infoBox) continue;

          const content = document.createElement('div');
          content.className = 'infoBoxStyle';
          const link = document.createElement('a');
          link.href = `/places/${p.id}`;
          link.textContent = `${p.name} »`;
          content.appendChild(link);
          for (const line of [p.where, p.visited ? `On ${p.visited}` : null]) {
            if (!line) continue;
            const d = document.createElement('div');
            d.textContent = line;
            content.appendChild(d);
          }
          marker.addListener('click', () => {
            infoBox.close();
            infoBox.setOptions(boxOptions);
            infoBox.setContent(content);
            infoBox.open(map, marker);
          });
        }

        if (variant === 'detail' && withCoords.length > 1) {
          map.fitBounds(bounds);
        } else if (variant === 'detail' && withCoords.length === 1) {
          map.setCenter(new g.LatLng(withCoords[0].lat, withCoords[0].lng));
        }

        setStatus('ready');

        if (showRoute) {
          // Fetched rather than bundled: 312 KB of GeoJSON has no business in the
          // JS payload, and as a static file it is CDN-cached and gzipped to ~98 KB.
          const res = await fetch('/route.geojson');
          if (!res.ok || cancelled) return;
          const fc = await res.json();
          if (cancelled) return;
          const routeBounds = new g.LatLngBounds();
          for (const f of fc.features) {
            const path = f.geometry.coordinates.map(([lng, lat]) => {
              const ll = new g.LatLng(lat, lng);
              routeBounds.extend(ll);
              return ll;
            });
            if (path.length < 2) continue;
            new g.Polyline({
              path,
              // The same blue the original drew the route in.
              strokeColor: '#3c92ba',
              strokeOpacity: 1,
              strokeWeight: 3,
              geodesic: true,
              zIndex: 1,
              map,
            });
          }
          if (variant === 'home' && !routeBounds.isEmpty()) map.fitBounds(routeBounds);
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          console.error('[TripMap]', e.message);
        }
      }
    })();

    return () => { cancelled = true; if (infoBox) infoBox.close(); };
  }, [variant, places, showRoute]);

  return (
    <div className={variant === 'home' ? 'map' : 'mapDetail'}>
      <div ref={holder} className="mapCanvas" />
      {status !== 'ready' ? (
        <div className="mapLoading">
          {status === 'error' ? (
            <span>{fallback || 'Map unavailable'}</span>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/home_loading.gif" alt="" width={16} height={16} />
              <strong>Loading the map</strong>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
