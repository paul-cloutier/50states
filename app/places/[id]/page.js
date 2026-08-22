import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  places, placeById, photoById, articleById, articlePhotos,
  mapPlaces, formatDate, cityState,
} from '@/lib/content';
import TripMap from '@/app/TripMap';
import { Photo, PhotoItem, Inner } from '@/app/components';

export function generateStaticParams() {
  return places.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }) {
  const p = placeById.get(Number((await params).id));
  return p ? { title: `Place: ${p.name} - ${cityState(p)}` } : {};
}

export default async function Place({ params }) {
  const p = placeById.get(Number((await params).id));
  if (!p) notFound();

  const photos = (p.photoIds || []).map((id) => photoById.get(id)).filter(Boolean);
  const articles = (p.articleIds || []).map((id) => articleById.get(id)).filter(Boolean);
  const maps = p.lat != null && p.lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}` : null;

  return (
    <>
      <TripMap variant="detail" places={mapPlaces([p])} fallback={p.name} />
      <div className="main">
        <Inner className="cols">
          <div id="place" style={{ display: 'contents' }}>
            <div className="leftCol">
              <h1>{p.name}</h1>
              <div className="placeAddress">
                {[p.address, cityState(p), p.zip].filter(Boolean).join(', ')}
                {p.visited ? <><br />Visited {formatDate(p.visited)}</> : null}
              </div>
              {p.description ? <div className="description">{p.description}</div> : null}
              <div className="url">
                {p.website ? (
                  <>
                    <a href={p.website} target="_blank" rel="noopener noreferrer">Website</a>
                    {' · '}
                  </>
                ) : null}
                {maps ? (
                  <a href={maps} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps &raquo;
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rightCol">
              {articles.length ? (
                articles.map((a) => {
                  const cover = articlePhotos(a)[0];
                  return (
                    <div className="recentPost" key={a.id} style={{ marginBottom: 20 }}>
                      <h2><Link href={`/articles/${a.id}`}>{a.title}</Link></h2>
                      <div className="subTitle">{a.abstract}</div>
                      {cover ? (
                        <Link href={`/articles/${a.id}`}>
                          <Photo photo={cover} sizes="(max-width: 900px) 100vw, 595px" />
                        </Link>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="noArticle">No story was written about this stop.</div>
              )}
            </div>
          </div>
        </Inner>

        {photos.length ? (
          <Inner>
            <h2 className="sectionHead">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} here
            </h2>
            <div className="photoGrid">
              {photos.map((ph) => <PhotoItem key={ph.id} photo={ph} />)}
            </div>
          </Inner>
        ) : null}
      </div>
    </>
  );
}
