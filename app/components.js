import Link from 'next/link';
import Image from 'next/image';
import { photoSrc, formatDate, cityState, author } from '@/lib/content';

/**
 * All originals are 1024px wide or smaller (357 are 612x612 Instagram exports), so
 * sizes is capped rather than letting next/image upscale into softness.
 */
export function Photo({ photo, sizes, priority = false, width, height }) {
  if (!photo) return null;
  return (
    <Image
      src={photoSrc(photo)}
      alt={photo.title || photo.caption || 'Photo from the trip'}
      width={width || photo.width || 1024}
      height={height || photo.height || 683}
      sizes={sizes || '(max-width: 900px) 100vw, 900px'}
      priority={priority}
    />
  );
}

export function Inner({ children, className }) {
  return <div className={className ? `inner ${className}` : 'inner'}>{children}</div>;
}

/** The original photo grid card: white panel, grey 1px border, square thumb. */
export function PhotoItem({ photo }) {
  return (
    <div className="photoItem">
      <Link href={`/photos/${photo.id}`}>
        <Photo photo={photo} sizes="(max-width: 900px) 45vw, 200px" width={200} height={200} />
        <h3>{photo.title || 'Untitled'}</h3>
      </Link>
      <div>{cityState(photo)}</div>
    </div>
  );
}

/** The original article index row: 120px thumb floated left, dashed rule below. */
export function ArticleItem({ article, cover }) {
  const who = author(article.authorId);
  return (
    <div className="articleItem">
      <Link href={`/articles/${article.id}`}>
        {cover ? <Photo photo={cover} sizes="120px" width={120} height={120} /> : null}
        <h3>{article.title}</h3>
      </Link>
      <span>
        {[who?.name && `By ${who.name}`, formatDate(article.visited), cityState(article)]
          .filter(Boolean).join(' · ')}
      </span>
      <p>{article.abstract}</p>
    </div>
  );
}

/** The original hero preview: full-bleed photo with the caption overlaid at bottom. */
/**
 * The original markup: the image is one link, and the overlaid title is a separate
 * link of its own - which is why the title reads blue against the white byline and
 * abstract. Order inside the overlay is title, byline, abstract.
 */
export function ArticlePreview({ article, cover, large = false, priority = false }) {
  const who = author(article.authorId);
  if (!cover) return <ArticleItem article={article} cover={cover} />;
  return (
    <div className={large ? 'articlePreview large' : 'articlePreview'}>
      <Link href={`/articles/${article.id}`} aria-label={article.title}>
        <Photo
          photo={cover}
          priority={priority}
          sizes={large ? '(max-width: 1000px) 100vw, 995px' : '(max-width: 900px) 100vw, 605px'}
        />
      </Link>
      <div className="articleInfo">
        <h3><Link href={`/articles/${article.id}`}>{article.title}</Link></h3>
        <span>
          {[who?.name && `By ${who.name}`, formatDate(article.visited), cityState(article)]
            .filter(Boolean).join(' · ')}
        </span>
        <p>{article.abstract}</p>
      </div>
    </div>
  );
}

/** The original nextPrev block: thumb + title, previous left, next right. */
export function NextPrev({ prev, next, base, photoOf }) {
  if (!prev && !next) return null;
  const side = (item, cls) => {
    if (!item) return <div className={cls} />;
    const thumb = photoOf ? photoOf(item) : null;
    return (
      <div className={cls}>
        <Link href={`${base}/${item.id}`}>
          {thumb ? (
            <span className="thumbFloat">
              <Photo photo={thumb} sizes="60px" width={60} height={60} />
            </span>
          ) : null}
          <h4>{item.title || 'Untitled'}</h4>
          <div className="byLine">{cls === 'left' ? '← Previous' : 'Next →'}</div>
        </Link>
      </div>
    );
  };
  return (
    <div className="nextPrev">
      {side(prev, 'left')}
      {side(next, 'right')}
    </div>
  );
}
