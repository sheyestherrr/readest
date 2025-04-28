import clsx from 'clsx';
import Image from 'next/image';
import { Book } from '@/types/book';
import { LibraryViewModeType } from '@/types/settings';
import { formatAuthors, formatTitle } from '@/utils/book';

interface BookCoverProps {
  book: Book;
  isPreview?: boolean;
  mode?: LibraryViewModeType;
}

const BookCover: React.FC<BookCoverProps> = ({ mode = 'grid', book, isPreview }) => {
  return (
    <div className='relative flex h-full w-full'>
      <Image
        src={book.coverImageUrl!}
        alt={book.title}
        fill={true}
        className='object-cover'
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('invisible');
        }}
      />
      <div
        className={clsx(
          'invisible absolute inset-0 rounded-none p-2',
          'text-neutral-content text-center font-serif font-medium',
          isPreview && 'bg-base-200/50',
        )}
      >
        <div className='flex h-1/2 items-center justify-center'>
          <span
            className={clsx(
              isPreview ? 'line-clamp-2' : mode === 'grid' ? 'line-clamp-3' : 'line-clamp-2',
              isPreview ? 'text-[0.5em]' : mode === 'grid' ? 'text-lg' : 'text-sm',
            )}
          >
            {formatTitle(book.title)}
          </span>
        </div>
        <div className='h-1/6'></div>
        <div className='flex h-1/3 items-center justify-center'>
          <span
            className={clsx(
              'text-neutral-content/50 line-clamp-1',
              isPreview ? 'text-[0.4em]' : mode === 'grid' ? 'text-base' : 'text-xs',
            )}
          >
            {formatAuthors(book.author)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCover;
