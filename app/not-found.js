import Link from 'next/link';
import { Inner } from '@/app/components';

export default function NotFound() {
  return (
    <div className="main">
      <Inner>
        <div className="article">
          <h1>Not here</h1>
          <div className="subTitle">That page isn&rsquo;t part of the archive.</div>
          <div className="postBody">
            <div className="prose">
              <p>
                Try the <Link href="/articles">articles</Link>, the{' '}
                <Link href="/photos">photos</Link>, or go back to the{' '}
                <Link href="/">beginning of the trip</Link>.
              </p>
            </div>
          </div>
        </div>
      </Inner>
    </div>
  );
}
