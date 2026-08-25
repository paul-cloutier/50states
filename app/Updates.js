import { renderInline, updates } from '@/lib/content';

/**
 * The homepage sidebar, as it stood when the trip ended.
 *
 * Alternating speech bubbles keyed off the author class, exactly as the original:
 * .tweets li.paul has the avatar floated left and the bubble indented from the
 * left; .tweets li.alana mirrors it. The panel scrolls inside a fixed height.
 *
 * Labelled as an archive rather than left to look live, because it is a static
 * snapshot - the live Twitter fetch was commented out before the trip even ended,
 * and the API it used died in 2013.
 */
export default function Updates() {
  return (
    <>
      <div className="tweets">
        <h3>Updates</h3>
        <ul>
          {updates.map((u, i) => (
            <li key={i} className={u.author}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/img/${u.author}_avatar_small.jpg`}
                width={48}
                height={48}
                alt={u.author === 'paul' ? 'Paul' : 'Alana'}
              />
              <div dangerouslySetInnerHTML={{ __html: renderInline(u.text) }} />
            </li>
          ))}
        </ul>
      </div>
      <p className="tweetsNote">
        {updates.length} updates from the road, as they stood when the trip ended in
        2011. The source has no dates.
      </p>
    </>
  );
}
