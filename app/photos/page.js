import Link from 'next/link';
import { photosNewestFirst, tags } from '@/lib/content';
import { PhotoCard, Inner } from '@/app/components';

export const metadata = { title: 'Photos' };

export function PhotoIndex({ title, blurb, list, activeTag, activeOrder }) {
  return (
    <Inner>
      <h1 className="pageTitle">{title}</h1>
      {blurb ? <p className="subTitle">{blurb}</p> : null}
      <ul className="filters">
        <li className="label">Order</li>
        <li><Link href="/photos" aria-current={activeOrder === 'trip' ? 'page' : undefined}>Trip order</Link></li>
        <li><Link href="/photos/date" aria-current={activeOrder === 'date' ? 'page' : undefined}>Newest added</Link></li>
      </ul>
      <ul className="filters">
        <li className="label">Tags</li>
        {tags.map((t) => (
          <li key={t.slug}>
            <Link href={`/photos/tags/${t.slug}`}
              aria-current={activeTag === t.slug ? 'page' : undefined}>
              {t.tag} <span style={{ opacity: 0.55 }}>{t.count}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="grid photos">
        {list.map((p) => <PhotoCard key={p.id} photo={p} />)}
      </ul>
    </Inner>
  );
}

export default function Photos() {
  return (
    <PhotoIndex
      title="Photos"
      blurb={`${photosNewestFirst.length} photos, most recent stop first.`}
      list={photosNewestFirst}
      activeOrder="trip"
    />
  );
}
