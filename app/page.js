import Link from 'next/link';
import {
  manifest, routeStats, articles, photosByIdDesc, articlePhotos,
  articleById, formatDate, cityState, author,
} from '@/lib/content';
import { Photo, PhotoCard, MapSlot, Inner } from './components';

// title.template in the root layout does not apply to a page in the SAME route
// segment, so the homepage sets its title in full.
export const metadata = { title: { absolute: '50 States Or Less: Welcome!' } };

function Stats() {
  const s = [
    ['Miles Driven', routeStats.miles.toLocaleString()],
    ['Days On The Road', routeStats.days.last],
    ['Places', manifest.counts.places],
    ['Photos', manifest.counts.photosActive],
    ['States Visited', manifest.trip.statesVisited],
  ];
  return (
    <section className="stats">
      <div className="inner">
        <ul>
          {s.map(([label, value]) => (
            <li key={label}>{label}<span>{value}</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function Home() {
  // The old homepage picked a random article per request. A static build wants a
  // stable choice, so this pins the trip's opening story.
  const featured = articleById.get(1) || articles[0];
  const cover = articlePhotos(featured)[0];
  const who = author(featured.authorId);

  return (
    <>
      <MapSlot />
      <Stats />
      <Inner>
        <h2 className="sectionHead" style={{ marginTop: '2rem' }}>Start here</h2>
        <article>
          <h3 className="pageTitle">
            <Link href={`/articles/${featured.id}`}>{featured.title}</Link>
          </h3>
          <p className="subTitle">{featured.abstract}</p>
          {cover ? (
            <figure>
              <Photo photo={cover} priority sizes="(max-width: 900px) 100vw, 900px" />
              {cover.caption ? <figcaption>{cover.caption}</figcaption> : null}
            </figure>
          ) : null}
          <p className="byline">
            {[cityState(featured), formatDate(featured.visited), who?.name]
              .filter(Boolean).join(' · ')}
            {' — '}
            <Link href={`/articles/${featured.id}`}>Read it</Link>
          </p>
        </article>

        <h2 className="sectionHead">Latest photos</h2>
        <ul className="grid photos">
          {photosByIdDesc.slice(0, 9).map((p) => <PhotoCard key={p.id} photo={p} />)}
        </ul>
        <p className="byline" style={{ marginTop: '1.25rem' }}>
          <Link href="/photos">All {manifest.counts.photosActive} photos</Link>
          {' · '}
          <Link href="/articles">All {manifest.counts.articles} articles</Link>
        </p>
      </Inner>
    </>
  );
}
