import { articlesByCreated } from '@/lib/content';
import { ArticleList } from '../list';

export const metadata = { title: 'Articles by date posted' };

export default function ArticlesByDate() {
  return (
    <ArticleList
      title="Articles"
      blurb="Ordered by when each story was written, not when the stop happened."
      list={articlesByCreated}
      active={{ kind: 'date' }}
    />
  );
}
