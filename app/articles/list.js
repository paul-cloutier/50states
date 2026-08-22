import Link from 'next/link';
import { articlePhotos, statesWithArticles, authors } from '@/lib/content';
import { ArticleCard, Inner } from '@/app/components';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/** The old site's filter set: state, month, author, plus date vs trip order. */
export function ArticleFilters({ active }) {
  return (
    <>
      <ul className="filters">
        <li className="label">Order</li>
        <li><Link href="/articles" aria-current={active?.kind === 'trip' ? 'page' : undefined}>Trip order</Link></li>
        <li><Link href="/articles/date" aria-current={active?.kind === 'date' ? 'page' : undefined}>Date posted</Link></li>
      </ul>
      <ul className="filters">
        <li className="label">State</li>
        {statesWithArticles.map((s) => (
          <li key={s}>
            <Link href={`/articles/state/${s}`}
              aria-current={active?.kind === 'state' && active.value === s ? 'page' : undefined}>
              {s}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="filters">
        <li className="label">Month</li>
        {MONTHS.map((m, i) => (
          <li key={m}>
            <Link href={`/articles/month/${i + 1}`}
              aria-current={active?.kind === 'month' && Number(active.value) === i + 1 ? 'page' : undefined}>
              {m.slice(0, 3)}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="filters">
        <li className="label">Author</li>
        {authors.map((a) => (
          <li key={a.id}>
            <Link href={`/articles/author/${a.slug}`}
              aria-current={active?.kind === 'author' && active.value === a.slug ? 'page' : undefined}>
              {a.firstName}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ArticleList({ title, blurb, list, active }) {
  return (
    <Inner>
      <h1 className="pageTitle">{title}</h1>
      {blurb ? <p className="subTitle">{blurb}</p> : null}
      <ArticleFilters active={active} />
      {list.length ? (
        <ul className="grid">
          {list.map((a) => (
            <ArticleCard key={a.id} article={a} cover={articlePhotos(a)[0]} />
          ))}
        </ul>
      ) : (
        <p className="lead">Nothing filed under that.</p>
      )}
    </Inner>
  );
}

export { MONTHS };
