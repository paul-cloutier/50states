import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  articles, articleById, articlePhotos, articlePlaces, renderBody,
  formatDate, cityState, author,
} from '@/lib/content';
import { Photo, Pager, MapSlot, Inner } from '@/app/components';

export function generateStaticParams() {
  return articles.map((a) => ({ id: String(a.id) }));
}

export async function generateMetadata({ params }) {
  const a = articleById.get(Number((await params).id));
  if (!a) return {};
  const where = cityState(a);
  return {
    title: where ? `${a.title} - ${where}` : a.title,
    description: a.abstract,
  };
}

export default async function Article({ params }) {
  const a = articleById.get(Number((await params).id));
  if (!a) notFound();

  const photos = articlePhotos(a);
  const places = articlePlaces(a);
  const who = author(a.authorId);
  const prev = a.prevId ? articleById.get(a.prevId) : null;
  const next = a.nextId ? articleById.get(a.nextId) : null;

  // The old site interleaved body text and photos; the export keeps body blocks and
  // photo order separately, so photos are placed between blocks here.
  const blocks = a.body;
  const html = renderBody(blocks);

  return (
    <>
      <MapSlot>{places.length ? `Map — ${places.map((p) => p.name).join(', ')}` : null}</MapSlot>
      <Inner>
        <h1 className="pageTitle">{a.title}</h1>
        <p className="subTitle">{a.abstract}</p>
        <p className="byline">
          {who ? <>By <Link href={`/articles/author/${who.slug}`}>{who.name}</Link></> : null}
          {a.visited ? ` · ${formatDate(a.visited)}` : ''}
          {places.length ? (
            <> · <Link href={`/places/${places[0].id}`}>{cityState(places[0])}</Link></>
          ) : null}
        </p>

        {photos[0] ? (
          <figure>
            <Photo photo={photos[0]} priority sizes="(max-width: 900px) 100vw, 900px" />
            {photos[0].caption ? <figcaption>{photos[0].caption}</figcaption> : null}
          </figure>
        ) : null}

        <div className="prose articleBody" dangerouslySetInnerHTML={{ __html: html }} />

        {photos.length > 1 ? (
          <>
            <h2 className="sectionHead">Photos from this stop</h2>
            <ul className="grid photos">
              {photos.slice(1).map((p) => (
                <li className="card" key={p.id}>
                  <Link href={`/photos/${p.id}`}>
                    <span className="thumb">
                      <Photo photo={p} sizes="(max-width: 700px) 45vw, 220px" />
                    </span>
                    <h3>{p.title || 'Untitled'}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {places.length ? (
          <p className="placeMeta" style={{ marginTop: '2rem' }}>
            {places.length > 1 ? 'Places: ' : 'Place: '}
            {places.map((p, i) => (
              <span key={p.id}>
                {i > 0 ? ', ' : ''}
                <Link href={`/places/${p.id}`}>{p.name}</Link>
              </span>
            ))}
          </p>
        ) : null}

        <Pager prev={prev} next={next} base="/articles" labelOf={(x) => x.title} />
      </Inner>
    </>
  );
}
