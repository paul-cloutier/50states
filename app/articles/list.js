import Link from 'next/link';
import { articlePhotos, statesWithArticles, authors } from '@/lib/content';
import { ArticlePreview, Inner } from '@/app/components';
import Filter from './Filter';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/**
 * Matches the original: a full-width heading band with the descriptor in grey and a
 * one-line "or ..." sorter beneath, then a 605px left column of previews with the
 * Slice and Dice panel on the right.
 */
export function ArticleList({ descriptor, list, active, sorterHref, sorterLabel }) {
  return (
    <div className="main">
      <Inner>
        <div className="articleIndex">
          <h1>Articles <span>{descriptor}</span></h1>
          <div id="sorter">
            or <Link href={sorterHref}>{sorterLabel}</Link>
          </div>
        </div>
      </Inner>
      <Inner className="cols">
        <div className="leftCol articleIndex">
          {list.length ? (
            list.map((a, i) => (
              <ArticlePreview key={a.id} article={a} cover={articlePhotos(a)[0]} priority={i === 0} />
            ))
          ) : (
            <p style={{ fontStyle: 'italic', color: 'var(--grey)' }}>
              Nothing filed under that.
            </p>
          )}
        </div>
        <div className="rightCol">
          <Filter states={statesWithArticles} authors={authors} active={active} />
        </div>
      </Inner>
    </div>
  );
}

export { MONTHS };
