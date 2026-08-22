'use client';

/**
 * The original "Slice and Dice It!" panel: three selects that jump to a filtered
 * view. Kept as selects rather than a row of links, because that is what the
 * original was - articleIndex.js bound change handlers to exactly these three.
 *
 * The state list is generated from the content instead of the original's
 * hand-maintained <option> list, which had 22 states hardcoded and drifted out of
 * sync with the data.
 */

import { useRouter } from 'next/navigation';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const STATE_NAMES = {
  AZ:'Arizona', CA:'California', FL:'Florida', GA:'Georgia', IA:'Iowa',
  IL:'Illinois', IN:'Indiana', KS:'Kansas', KY:'Kentucky', LA:'Louisiana',
  MO:'Missouri', MS:'Mississippi', MT:'Montana', NE:'Nebraska', NM:'New Mexico',
  OK:'Oklahoma', OR:'Oregon', SC:'South Carolina', SD:'South Dakota',
  TN:'Tennessee', TX:'Texas', WA:'Washington', WI:'Wisconsin', WY:'Wyoming',
};

export default function Filter({ states, authors, active }) {
  const router = useRouter();
  const go = (prefix) => (e) => {
    const v = e.target.value;
    if (v) router.push(`${prefix}/${v}`);
  };

  return (
    <div className="filter">
      <h3>Slice and Dice It!</h3>
      <p>You can change up how you view the articles here.</p>
      <form>
        <ul>
          <li>
            <label htmlFor="filterState">By State</label>
            <select
              id="filterState"
              defaultValue={active?.kind === 'state' ? active.value : ''}
              onChange={go('/articles/state')}
            >
              <option value="">Choose One</option>
              {states.map((s) => (
                <option key={s} value={s}>{STATE_NAMES[s] || s}</option>
              ))}
            </select>
          </li>
          <li>
            <label htmlFor="filterMonth">By Month</label>
            <select
              id="filterMonth"
              defaultValue={active?.kind === 'month' ? String(active.value) : ''}
              onChange={go('/articles/month')}
            >
              <option value="">Choose One</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
          </li>
          <li>
            <label htmlFor="filterAuthor">By Author</label>
            <select
              id="filterAuthor"
              defaultValue={active?.kind === 'author' ? active.value : ''}
              onChange={go('/articles/author')}
            >
              <option value="">Choose One</option>
              {authors.map((a) => (
                <option key={a.slug} value={a.slug}>{a.firstName}</option>
              ))}
            </select>
          </li>
        </ul>
      </form>
    </div>
  );
}
