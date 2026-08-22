import { notFound } from 'next/navigation';
import { authors, articlesForAuthor } from '@/lib/content';
import { ArticleList } from '../../list';

export function generateStaticParams() {
  return authors.map((a) => ({ author: a.slug }));
}

export async function generateMetadata({ params }) {
  const slug = (await params).author;
  const a = authors.find((x) => x.slug === slug);
  return { title: a ? `Articles by ${a.name}` : 'Articles' };
}

export default async function ByAuthor({ params }) {
  const slug = (await params).author;
  const a = authors.find((x) => x.slug === slug);
  if (!a) notFound();
  const list = articlesForAuthor(slug);
  return (
    <ArticleList
      title={a.name}
      blurb={a.bio}
      list={list}
      active={{ kind: 'author', value: slug }}
    />
  );
}
