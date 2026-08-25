import { notFound } from 'next/navigation';
import { statesWithArticles, articlesForState } from '@/lib/content';
import { ArticleList } from '../../list';

export function generateStaticParams() {
  return statesWithArticles.map((state) => ({ state }));
}

export async function generateMetadata({ params }) {
  return { title: `Articles in ${(await params).state.toUpperCase()}` };
}

export default async function ByState({ params }) {
  const state = (await params).state.toUpperCase();
  if (!statesWithArticles.includes(state)) notFound();
  return (
    <ArticleList
      descriptor={`in ${state}`}
      list={articlesForState(state)}
      active={{ kind: 'state', value: state }}
    />
  );
}
