import { articlesByCreated } from '@/lib/content';
import { ArticleList } from '../list';

export const metadata = { title: 'Articles by date added' };

export default function ArticlesByDate() {
  return (
    <ArticleList
      descriptor="by date added"
      list={articlesByCreated}
      active={{ kind: 'date' }}
      sorterHref="/articles"
      sorterLabel="view them by the date we visited them"
    />
  );
}
