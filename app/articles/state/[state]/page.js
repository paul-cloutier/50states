import { notFound } from 'next/navigation';
import { statesWithArticles, articlesForState } from '@/lib/content';
import { ArticleList } from '../../list';

export function generateStaticParams() {
  return statesWithArticles.map((state) => ({ state }));
}

export async function generateMetadata({ params }) {
  return { title: `Articles from ${(await params).state.toUpperCase()}` };
}

export default async function ByState({ params }) {
  const state = (await params).state.toUpperCase();
  if (!statesWithArticles.includes(state)) notFound();
  const list = articlesForState(state);
  return (
    <ArticleList
      title={state}
      blurb={`${list.length} ${list.length === 1 ? 'story' : 'stories'} from ${state}.`}
      list={list}
      active={{ kind: 'state', value: state }}
    />
  );
}
