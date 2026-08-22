import { notFound } from 'next/navigation';
import { articlesForMonth } from '@/lib/content';
import { ArticleList, MONTHS } from '../../list';

export function generateStaticParams() {
  return MONTHS.map((_, i) => ({ month: String(i + 1) }));
}

export async function generateMetadata({ params }) {
  const m = Number((await params).month);
  return { title: `Articles from ${MONTHS[m - 1] || 'that month'}` };
}

export default async function ByMonth({ params }) {
  const m = Number((await params).month);
  if (!(m >= 1 && m <= 12)) notFound();
  const list = articlesForMonth(m);
  return (
    <ArticleList
      title={MONTHS[m - 1]}
      blurb={`Stops made in ${MONTHS[m - 1]}, any year of the trip.`}
      list={list}
      active={{ kind: 'month', value: m }}
    />
  );
}
