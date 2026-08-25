import { articlesByCreated } from '@/lib/content';
import { ArticleList } from './list';

export const metadata = { title: 'Articles' };

export default function Articles() {
  // The single canonical order: newest posted first.
  return <ArticleList list={articlesByCreated} active={{ kind: 'all' }} />;
}
