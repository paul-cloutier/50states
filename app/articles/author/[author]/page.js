import { notFound } from 'next/navigation';
import { authors, articlesForAuthor } from '@/lib/content';
import { ArticleList } from '../../list';

export function generateStaticParams() {
  return authors.map((a) => ({ author: a.slug }));
}

export async function generateMetadata({ params }) {
  // await must not sit inside the find() callback - that arrow isn't async.
  const { author: slug } = await params;
  const a = authors.find((x) => x.slug === slug);
  return { title: a ? `Articles by ${a.name}` : 'Articles' };
}

export default async function ByAuthor({ params }) {
  const slug = (await params).author;
  const a = authors.find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <ArticleList
      descriptor={`by ${a.firstName}`}
      list={articlesForAuthor(slug)}
      active={{ kind: 'author', value: slug }}
      sorterHref="/articles"
      sorterLabel="view them all"
    />
  );
}
