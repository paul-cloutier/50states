import Link from 'next/link';
import Image from 'next/image';
import { photoSrc, formatDate, cityState, author } from '@/lib/content';

/**
 * All originals are 1024px wide or smaller (357 are 612x612 Instagram exports), so
 * `sizes` is capped rather than letting next/image upscale into softness. On a 2011
 * archive, rendering at true size reads as deliberate; stretched reads as broken.
 */
export function Photo({ photo, sizes, priority = false, className }) {
  if (!photo) return null;
  return (
    <Image
      src={photoSrc(photo)}
      alt={photo.title || photo.caption || 'Photo from the trip'}
      width={photo.width || 1024}
      height={photo.height || 683}
      sizes={sizes || '(max-width: 700px) 100vw, 700px'}
      priority={priority}
      className={className}
    />
  );
}

export function PhotoCard({ photo }) {
  return (
    <li className="card">
      <Link href={`/photos/${photo.id}`}>
        <span className="thumb">
          <Photo photo={photo} sizes="(max-width: 700px) 45vw, 220px" />
        </span>
        <h3>{photo.title || 'Untitled'}</h3>
        {photo.placeName ? <p className="meta">{cityState(photo)}</p> : null}
      </Link>
    </li>
  );
}

export function ArticleCard({ article, cover }) {
  const who = author(article.authorId);
  return (
    <li className="card">
      <Link href={`/articles/${article.id}`}>
        {cover ? (
          <span className="thumb">
            <Photo photo={cover} sizes="(max-width: 700px) 100vw, 340px" />
          </span>
        ) : null}
        <h3>{article.title}</h3>
        <p>{article.abstract}</p>
        <p className="meta">
          {[cityState(article), formatDate(article.visited), who?.firstName]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </Link>
    </li>
  );
}

export function Pager({ prev, next, base, labelOf }) {
  if (!prev && !next) return null;
  return (
    <nav className="pager" aria-label="Trip navigation">
      {prev ? (
        <Link className="prev" href={`${base}/${prev.id}`} rel="prev">
          &larr; <span>{labelOf(prev)}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link className="next" href={`${base}/${next.id}`} rel="next">
          <span>{labelOf(next)}</span> &rarr;
        </Link>
      ) : null}
    </nav>
  );
}

/**
 * Placeholder for the Google map, which is phase 5. Deliberately a labelled slot
 * rather than nothing, so layout problems show up now instead of after the map
 * lands on top of them.
 */
export function MapSlot({ children }) {
  return (
    <div className="mapSlot" role="img" aria-label="Trip map, not yet implemented">
      {children || 'Map — coming in phase 5'}
    </div>
  );
}

/** Standard content column. Pages opt into it so full-bleed bands stay possible. */
export function Inner({ children }) {
  return <div className="inner">{children}</div>;
}
