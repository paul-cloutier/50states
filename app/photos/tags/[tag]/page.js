import { notFound } from 'next/navigation';
import { tags, tagBySlug, photosForTag } from '@/lib/content';
import { PhotoIndex } from '../../page';

export function generateStaticParams() {
  return tags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({ params }) {
  const t = tagBySlug.get((await params).tag);
  return { title: t ? `Photos tagged ${t.tag}` : 'Photos' };
}

export default async function ByTag({ params }) {
  const slug = (await params).tag;
  const t = tagBySlug.get(slug);
  if (!t) notFound();
  const list = photosForTag(t).sort((a, b) => b.id - a.id);
  return (
    <PhotoIndex
      title={t.tag}
      blurb={`${list.length} ${list.length === 1 ? 'photo' : 'photos'} tagged ${t.tag}.`}
      list={list}
      activeTag={slug}
    />
  );
}
