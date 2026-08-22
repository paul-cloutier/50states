import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  places, placeById, photoById, articleById, formatDate, cityState,
} from '@/lib/content';
import { PhotoCard, MapSlot, Inner } from '@/app/components';

export function generateStaticParams() {
  return places.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }) {
  const p = placeById.get(Number((await params).id));
  if (!p) return {};
  return { title: `${p.name} - ${cityState(p)}` };
}

export default async function Place({ params }) {
  const p = placeById.get(Number((await params).id));
  if (!p) notFound();

  const photos = (p.photoIds || []).map((id) => photoById.get(id)).filter(Boolean);
  const articles = (p.articleIds || []).map((id) => articleById.get(id)).filter(Boolean);
  const maps = p.lat != null && p.lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`
    : null;

  return (
    <>
      <MapSlot>{`Map — ${p.name}`}</MapSlot>
      <Inner>
        <h1 className="pageTitle">{p.name}</h1>
        <p className="subTitle">{cityState(p)}</p>
        <p className="placeMeta">
          {[p.address, p.zip].filter(Boolean).join(', ')}
          {p.visited ? ` · visited ${formatDate(p.visited)}` : ''}
          {p.website ? <> · <a href={p.website} rel="noopener noreferrer" target="_blank">Website</a></> : null}
          {maps ? <> · <a href={maps} rel="noopener noreferrer" target="_blank">Open in Google Maps</a></> : null}
        </p>
        {p.description ? <div className="prose"><p>{p.description}</p></div> : null}

        {articles.length ? (
          <>
            <h2 className="sectionHead">Stories from here</h2>
            <ul className="grid">
              {articles.map((a) => (
                <li className="card" key={a.id}>
                  <Link href={`/articles/${a.id}`}>
                    <h3>{a.title}</h3>
                    <p>{a.abstract}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {photos.length ? (
          <>
            <h2 className="sectionHead">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} here
            </h2>
            <ul className="grid photos">
              {photos.map((ph) => <PhotoCard key={ph.id} photo={ph} />)}
            </ul>
          </>
        ) : null}
      </Inner>
    </>
  );
}
