import { articlesNewestFirst } from '@/lib/content';
import { ArticleList } from './list';

export const metadata = { title: 'Articles' };

export default function Articles() {
  return (
    <ArticleList
      title="Articles"
      blurb={`${articlesNewestFirst.length} stories from the road, most recent stop first.`}
      list={articlesNewestFirst}
      active={{ kind: 'trip' }}
    />
  );
}
