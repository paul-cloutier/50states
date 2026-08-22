import Link from 'next/link';
import { authors } from '@/lib/content';
import './globals.css';

export const metadata = {
  title: { default: '50 States Or Less', template: '50 States Or Less: %s' },
  description:
    'Paul and Alana Cloutier got rid of all their stuff and spent 2011 and 2012 ' +
    'driving the US in a 1977 GMC motorhome they restored from the ground up.',
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="header">
          <div className="inner">
            <h1><Link href="/">50 States&hellip; Or Less</Link></h1>
            <nav>
              <ul>
                <li><Link href="/articles">Articles</Link></li>
                <li><Link href="/photos">Photos</Link></li>
                <li><Link href="/articles/1">The RV</Link></li>
              </ul>
            </nav>
          </div>
        </div>

        {children}

        <div className="footer">
          <div className="inner">
            <p className="about">
              Realizing that they both really just wanted to travel and take pictures,
              Paul and Alana decided to get rid of all their stuff and hit the road for
              a year in a 1977 GMC Motorhome that they restored from the ground up.
              This is their trip.
            </p>
            <ul className="bios">
              {authors.map((a, i) => (
                <li key={a.id} className={i === 0 ? 'left' : 'right'}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/img/${a.firstName.toLowerCase()}_avatar_small.jpg`}
                    width={100} height={100} alt={a.name}
                  />
                  <h4>{a.name}</h4>
                  <p>{a.bio}</p>
                </li>
              ))}
            </ul>
            <p className="archived">
              An archive of a trip that ended in 2012. Nothing here has changed since.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
