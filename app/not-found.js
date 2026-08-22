import Link from 'next/link';
import { Inner } from '@/app/components';

export default function NotFound() {
  return (
    <Inner>
      <h1 className="pageTitle">Not here</h1>
      <p className="subTitle">That page isn&rsquo;t part of the archive.</p>
      <p className="lead">
        Try the <Link href="/articles">articles</Link>, the{' '}
        <Link href="/photos">photos</Link>, or go back to the{' '}
        <Link href="/">beginning of the trip</Link>.
      </p>
    </Inner>
  );
}
