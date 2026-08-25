import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  livePhotos, photoById, placeById, tags as allTags, mapPlaces,
  formatDate, cityState, author,
} from '@/lib/content';
import TripMap from '@/app/TripMap';
import { Photo, Inner, PhotoPrevNext } from '@/app/components';

export function generateStaticParams() {
  return livePhotos.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }) {
  const p = photoById.get(Number((await params).id));
  if (!p) return {};
  const where = cityState(p);
  return {
    title: where ? `${p.title || 'Photo'} - ${where}` : p.title || 'Photo',
    description: p.caption || undefined,
    alternates: { canonical: `/photos/${p.id}` },
    openGraph: {
      type: 'article',
      title: p.title || 'Photo',
      description: p.caption || undefined,
      url: `/photos/${p.id}`,
      images: [{ url: p.full, width: p.width, height: p.height }],
    },
  };
}

const slugFor = (tag) => allTags.find((t) => t.tag === tag)?.slug;

export default async function PhotoPage({ params }) {
  const p = photoById.get(Number((await params).id));
  if (!p || !p.active) notFound();

  const place = p.placeId ? placeById.get(p.placeId) : null;
  const who = author(p.authorId);
  const prev = p.prevId ? photoById.get(p.prevId) : null;
  const next = p.nextId ? photoById.get(p.nextId) : null;
  const related = (p.relatedIds || []).map((id) => photoById.get(id)).filter(Boolean).slice(0, 8);
  // 612x612 shots are the 2011 Instagram exports; the original matted them on black.
  const isSquare = p.width && p.width === p.height;

  return (
    <>
      <TripMap
        variant="detail"
        places={place ? mapPlaces([place]) : []}
        fallback={place?.name}
      />
      <div className="main">
        <Inner>
          <div className="photo">
            <h1>
              {p.title || 'Untitled'}
              {place ? (
                <span className="where">
                  <Link href={`/places/${place.id}`}>{cityState(place)}</Link>
                </span>
              ) : null}
            </h1>

            <div className={isSquare ? 'instagram' : 'photoFrame'}>
              <Photo photo={p} priority sizes="(max-width: 1000px) 100vw, 985px" />
            </div>

            <div className="photoInfo">
              <PhotoPrevNext prev={prev} next={next} />
              <div className="byLine">
                {who ? <><strong>{who.name}</strong></> : null}
                {p.visited ? formatDate(p.visited) : null}
              </div>
              <div className="caption">
                {p.caption ? <p>{p.caption}</p> : null}
                {p.tags?.length ? (
                  <ul className="tags">
                    {p.tags.map((t) => {
                      const s = slugFor(t);
                      return (
                        <li key={t}>
                          {s ? <Link href={`/photos/tags/${s}`}>{t}</Link> : <span>{t}</span>}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </div>

            {related.length ? (
              /* The original used a bare thumbnail strip here, not the captioned
                 cards - the page already tells you where you are. */
              <div className="photos">
                <h3>Other Photos Taken Near Here</h3>
                <ul>
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link href={`/photos/${r.id}`}>
                        <Photo photo={r} sizes="100px" width={100} height={100} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

          </div>
        </Inner>
      </div>
    </>
  );
}
