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

/**
 * Previous / next, matching the original's structure: a label above the link, then a
 * 100px thumbnail floated to the outside, the title, the city and state, and the
 * abstract. When there is no neighbour the original showed a bookend graphic
 * (first_article.png / last_article.png) with the label greyed out.
 */
export function NextPrev({ prev, next, base, photoOf, label = 'Article' }) {
  if (!prev && !next) return null;

  const side = (item, cls) => {
    const isPrev = cls === 'left';
    const text = isPrev ? `\u00ab Previous ${label}` : `Next ${label} \u00bb`;

    if (!item) {
      return (
        <div className={cls}>
          <div className="inactive">{text}</div>
          <div className="thumbFloatOff">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isPrev ? '/img/first_article.png' : '/img/last_article.png'}
              width={100}
              height={100}
              alt=""
            />
          </div>
        </div>
      );
    }

    const thumb = photoOf ? photoOf(item) : null;
    return (
      <div className={cls}>
        <div>{text}</div>
        <Link href={`${base}/${item.id}`}>
          {thumb ? (
            <span className="thumbFloat">
              <Photo photo={thumb} sizes="100px" width={100} height={100} />
            </span>
          ) : null}
          <h4>{item.title || 'Untitled'}</h4>
          {cityState(item) ? <div className="byLine">{cityState(item)}</div> : null}
          {item.abstract ? <div className="subTitle">{item.abstract}</div> : null}
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

/**
 * Photo prev/next. The original used a different pattern here from the article
 * pages: not the .nextPrev block, but a 215px pair of 100px thumbnails pinned to
 * the top-right of the white .photoInfo panel, labelled "Older" and "Newer" rather
 * than "Previous" and "Next". Bookend graphics stand in at either end of the run.
 */
export function PhotoPrevNext({ prev, next }) {
  if (!prev && !next) return null;
  return (
    <div className="photoPrevNext">
      <div className="photoPrev">
        {prev ? (
          <>
            <Link href={`/photos/${prev.id}`}>
              <Photo photo={prev} sizes="100px" width={100} height={100} />
            </Link>
            <Link href={`/photos/${prev.id}`}>&laquo; Older Photo</Link>
          </>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src="/img/oldestPhoto.png" width={100} height={100} alt="Oldest photo" />
        )}
      </div>
      <div className="photoNext">
        {next ? (
          <>
            <Link href={`/photos/${next.id}`}>
              <Photo photo={next} sizes="100px" width={100} height={100} />
            </Link>
            <Link href={`/photos/${next.id}`}>Newer Photo &raquo;</Link>
          </>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src="/img/newestPhoto.png" width={100} height={100} alt="Newest photo" />
        )}
      </div>
    </div>
  );
}
