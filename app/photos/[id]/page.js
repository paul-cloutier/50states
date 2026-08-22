import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  livePhotos, photoById, placeById, tags as allTags, formatDate, cityState, author,
} from '@/lib/content';
import { Photo, PhotoCard, Pager, Inner } from '@/app/components';

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

  return (
    <Inner>
      <h1 className="pageTitle">{p.title || 'Untitled'}</h1>
      <p className="byline">
        {who ? `By ${who.name}` : null}
        {p.visited ? ` · ${formatDate(p.visited)}` : ''}
        {place ? <> · <Link href={`/places/${place.id}`}>{cityState(place)}</Link></> : null}
      </p>

      <figure>
        <Photo photo={p} priority sizes="(max-width: 1024px) 100vw, 1024px" />
        {p.caption ? <figcaption>{p.caption}</figcaption> : null}
      </figure>

      {p.tags?.length ? (
        <ul className="tagList">
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

      {related.length ? (
        <>
          <h2 className="sectionHead">
            More from {place ? place.name : 'this stop'}
          </h2>
          <ul className="grid photos">
            {related.map((r) => <PhotoCard key={r.id} photo={r} />)}
          </ul>
        </>
      ) : null}

      <Pager prev={prev} next={next} base="/photos" labelOf={(x) => x.title || 'Untitled'} />
    </Inner>
  );
}
