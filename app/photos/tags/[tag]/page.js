import { notFound } from 'next/navigation';
import { tags, tagBySlug, photosForTag } from '@/lib/content';
import { PhotoIndex } from '../../page';

/**
 * The old site's tag URLs used the raw tag name - /photos/tags/Roadside,
 * /photos/tags/National%20Parks - and all 57 differ from the new slugs. Rather than
 * redirect (Next matches redirect sources case-insensitively, so slug -> slug rules
 * loop forever), both forms are prerendered and resolved here, with rel=canonical
 * pointing at the slug so the duplicates consolidate.
 */
export function generateStaticParams() {
  const params = [];
  for (const t of tags) {
    params.push({ tag: t.slug });
    if (t.tag !== t.slug) params.push({ tag: t.tag });
  }
  return params;
}

/** Resolve a slug, an original tag name, or any case variation of either. */
function resolveTag(raw) {
  const decoded = decodeURIComponent(raw);
  const direct = tagBySlug.get(decoded);
  if (direct) return direct;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const target = norm(decoded);
  return tags.find((t) => t.slug === target || norm(t.tag) === target) || null;
}

export async function generateMetadata({ params }) {
  const { tag: raw } = await params;
  const t = resolveTag(raw);
  if (!t) return {};
  return {
    title: `Photos tagged ${t.tag}`,
    alternates: { canonical: `/photos/tags/${t.slug}` },
  };
}

export default async function ByTag({ params }) {
  const { tag: raw } = await params;
  const t = resolveTag(raw);
  if (!t) notFound();
  const list = photosForTag(t).sort((a, b) => b.id - a.id);
  return <PhotoIndex title={t.tag} list={list} activeTag={t.slug} />;
}
