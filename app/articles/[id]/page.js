import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  articles, articleById, articlePhotos, articlePlaces, renderBody,
  mapPlaces, formatDate, cityState, author,
} from '@/lib/content';
import TripMap from '@/app/TripMap';
import { Photo, Inner, NextPrev, PhotoItem } from '@/app/components';

export function generateStaticParams() {
  return articles.map((a) => ({ id: String(a.id) }));
}

export async function generateMetadata({ params }) {
  const a = articleById.get(Number((await params).id));
  if (!a) return {};
  const where = cityState(a);
  return { title: where ? `${a.title} - ${where}` : a.title, description: a.abstract };
}

export default async function Article({ params }) {
  const a = articleById.get(Number((await params).id));
  if (!a) notFound();

  const photos = articlePhotos(a);
  const places = articlePlaces(a);
  const who = author(a.authorId);
  const prev = a.prevId ? articleById.get(a.prevId) : null;
  const next = a.nextId ? articleById.get(a.nextId) : null;
  const lead = photos[0];
  const rest = photos.slice(1);

  return (
    <>
      <TripMap
        variant="detail"
        places={mapPlaces(places)}
        fallback={places.map((p) => p.name).join(', ')}
      />
      <div className="main">
        <Inner>
          <div className="article">
            <h1>{a.title}</h1>
            <div className="subTitle">{a.abstract}</div>

            {lead ? (
              <div className="leadImage">
                <Link href={`/photos/${lead.id}`}>
                  <Photo photo={lead} priority sizes="(max-width: 1000px) 100vw, 985px" />
                </Link>
              </div>
            ) : null}

            <div className="postBody">
              <div className="caption">
                {lead?.caption ? (
                  <>
                    <strong>{lead.title}</strong>
                    {lead.caption}
                  </>
                ) : null}
                <div style={{ marginTop: 14 }}>
                  {who ? (
                    <>
                      <strong>Written by</strong>
                      <Link href={`/articles/author/${who.slug}`}>{who.name}</Link>
                      <br />
                    </>
                  ) : null}
                  {a.visited ? formatDate(a.visited) : null}
                  {places[0] ? (
                    <>
                      <br />
                      <Link href={`/places/${places[0].id}`}>{cityState(places[0])}</Link>
                    </>
                  ) : null}
                </div>
              </div>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: renderBody(a.body) }}
              />
            </div>

            <div className="endMark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/endit_aligned.png" alt="" />
            </div>

            {rest.length ? (
              <>
                <h2 className="sectionHead">Photos from this stop</h2>
                <div className="photoGrid">
                  {rest.map((p) => <PhotoItem key={p.id} photo={p} />)}
                </div>
              </>
            ) : null}

            {places.length > 1 ? (
              <p className="placeAddress">
                Also here:{' '}
                {places.slice(1).map((p, i) => (
                  <span key={p.id}>
                    {i > 0 ? ', ' : ''}<Link href={`/places/${p.id}`}>{p.name}</Link>
                  </span>
                ))}
              </p>
            ) : null}

            <NextPrev
              prev={prev} next={next} base="/articles"
              photoOf={(x) => articlePhotos(x)[0]}
            />
          </div>
        </Inner>
      </div>
    </>
  );
}
