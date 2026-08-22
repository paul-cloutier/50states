import Link from 'next/link';
import { photosNewestFirst, tags } from '@/lib/content';
import { PhotoItem, Inner } from '@/app/components';

export const metadata = { title: 'Photos' };

export function PhotoIndex({ title, count, list, activeTag, activeOrder }) {
  return (
    <div className="main">
      <Inner>
        <div className="photoIndex">
          <h1>{title} <span>{count ?? list.length}</span></h1>
          <div id="sorter">
            <span className="group">
              Order:
              <Link href="/photos" aria-current={activeOrder === 'trip' ? 'page' : undefined}>Trip</Link>
              <Link href="/photos/date" aria-current={activeOrder === 'date' ? 'page' : undefined}>Added</Link>
            </span>
          </div>
          <ul className="tags">
            {tags.map((t) => (
              <li key={t.slug}>
                <Link href={`/photos/tags/${t.slug}`}
                  aria-current={activeTag === t.slug ? 'page' : undefined}>
                  {t.tag} {t.count}
                </Link>
              </li>
            ))}
          </ul>
          <div className="photoGrid" style={{ marginTop: 20 }}>
            {list.map((p) => <PhotoItem key={p.id} photo={p} />)}
          </div>
        </div>
      </Inner>
    </div>
  );
}

export default function Photos() {
  return <PhotoIndex title="Photos" list={photosNewestFirst} activeOrder="trip" />;
}
