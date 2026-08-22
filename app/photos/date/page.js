import { photosByIdDesc } from '@/lib/content';
import { PhotoIndex } from '../page';

export const metadata = { title: 'Photos by date added' };

export default function PhotosByDate() {
  return (
    <PhotoIndex
      title="Photos"
      blurb="Ordered by when each photo was uploaded."
      list={photosByIdDesc}
      activeOrder="date"
    />
  );
}
