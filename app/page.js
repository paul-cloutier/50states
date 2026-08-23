import Link from 'next/link';
import {
  manifest, routeStats, places, articleById, articlePhotos, photosByIdDesc,
  mapPlaces, renderBody, author, articlesNewestFirst,
} from '@/lib/content';
import TripMap from './TripMap';
import Updates from './Updates';
import { Photo, Inner } from './components';

export const metadata = { title: { absolute: '50 States Or Less: Welcome!' } };

const STATS = [
  ['Miles Driven', () => routeStats.miles.toLocaleString()],
  ['Days On The Road', () => routeStats.days.last],
  ['Places', () => manifest.counts.places],
  ['Photos', () => manifest.counts.photosActive],
  ['States Visited', () => manifest.trip.statesVisited],
];

export default function Home() {
  // The old homepage picked a random article per request; a static build pins one.
  const featured = articleById.get(1) || articlesNewestFirst[0];
  const cover = articlePhotos(featured)[0];
  const who = author(featured.authorId);
  const firstBlock = featured.body[0] ? renderBody([featured.body[0]]) : '';

  return (
    <>
      <TripMap variant="home" places={mapPlaces(places)} showRoute />

      <div id="homeStats">
        <div className="inner">
          <ul>
            {STATS.map(([label, get]) => (
              <li key={label}>{label} <span>{get()}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="main">
        <Inner className="cols">
          <div className="leftCol">
            <div className="recentPost">
              <h2><Link href={`/articles/${featured.id}`}>{featured.title}</Link></h2>
              <div className="subTitle">{featured.abstract}</div>
              {cover ? (
                <Link href={`/articles/${featured.id}`}>
                  <Photo photo={cover} priority sizes="(max-width: 900px) 100vw, 650px" />
                </Link>
              ) : null}
              <div
                className="postBody"
                dangerouslySetInnerHTML={{ __html: firstBlock }}
              />
              <p>
                <Link href={`/articles/${featured.id}`}>Read the whole thing &raquo;</Link>
              </p>
            </div>

            <div className="photos">
              <h3>Latest photos</h3>
              <ul>
                {photosByIdDesc.slice(0, 18).map((p) => (
                  <li key={p.id}>
                    <Link href={`/photos/${p.id}`}>
                      <Photo photo={p} sizes="100px" width={100} height={100} />
                    </Link>
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: 10 }}>
                <Link href="/photos">All {manifest.counts.photosActive} photos &raquo;</Link>
              </p>
            </div>
          </div>

          <div className="rightCol">
            <Updates />
          </div>
        </Inner>
      </div>
    </>
  );
}
