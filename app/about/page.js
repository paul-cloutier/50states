import { authors, manifest, routeStats } from '@/lib/content';
import { Inner } from '@/app/components';

export const metadata = { title: 'About' };

export default function About() {
  return (
    <div className="main">
      <Inner>
        <div className="article">
          <h1>About</h1>
          <div className="subTitle">
            One 1977 GMC motorhome, {manifest.trip.statesVisited} states,{' '}
            19,651 miles.
          </div>
          <div className="postBody">
            <div className="prose">
              <p>
                In 2011 Paul and Alana Cloutier sold or stored almost everything they
                owned, finished a ground-up restoration of a 1977 GMC motorhome, and
                drove it around the United States. They replaced the brakes, the
                suspension, the plumbing, the furniture and the electrics, put solar on
                the roof, and left on the first of January.
              </p>
              <p>
                This site is what they posted along the way: {manifest.counts.articles}{' '}
                stories, {manifest.counts.photosActive} photos and{' '}
                {manifest.counts.places} places. The GPS log that draws the map covers{' '}
                {routeStats.miles.toLocaleString()} of those miles across{' '}
                {routeStats.days.distinct} driving days — it stops in August 2011, a few
                months before the trip did.
              </p>
              <p>
                Nothing here has been added since June 2012. It is kept online as a
                record, not a running blog.
              </p>
              {authors.map((a) => (
                <p key={a.id}><strong>{a.name}</strong> &mdash; {a.bio}</p>
              ))}
            </div>
          </div>
        </div>
      </Inner>
    </div>
  );
}
