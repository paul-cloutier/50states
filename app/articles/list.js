import { articlePhotos, statesWithArticles, authors } from '@/lib/content';
import { ArticlePreview, Inner } from '@/app/components';
import Filter from './Filter';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/**
 * The article index: a full-width heading band, then a 605px left column of photo
 * previews with the Slice and Dice panel on the right.
 *
 * The original also carried a one-line "or view them in the order we put them on the
 * site" toggle beneath the heading, switching between visited order and posted order.
 * That needed a query per ordering, and there is now a single canonical order -
 * newest posted first - so the toggle is gone. `visited` still drives the trip
 * chronology used by prev/next and by the month filter.
 */
export function ArticleList({ descriptor, list, active }) {
  return (
    <div className="main">
      <Inner>
        <div className="articleIndex">
          <h1>Articles{descriptor ? <> <span>{descriptor}</span></> : null}</h1>
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
