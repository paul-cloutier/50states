import { articlesNewestFirst } from '@/lib/content';
import { ArticleList } from './list';

export const metadata = { title: 'Articles' };

export default function Articles() {
  return (
    <ArticleList
      descriptor="by date visited"
      list={articlesNewestFirst}
      active={{ kind: 'trip' }}
      sorterHref="/articles/date"
      sorterLabel="view them in the order we put them on the site"
    />
  );
}
