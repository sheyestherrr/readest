import clsx from 'clsx';
import React from 'react';

interface RibbonProps {
  width: string;
}

const Ribbon: React.FC<RibbonProps> = ({}) => {
  return (
    <div
      className={clsx(
        'fixed inset-0 z-10 flex w-8 justify-center sm:w-6',
        'h-[calc(env(safe-area-inset-top)+44px)]',
      )}
    >
      <svg
        width='100%'
        height='100%'
        preserveAspectRatio='none'
        viewBox='0 0 100 100'
        xmlns='http://www.w3.org/2000/svg'
        shapeRendering='geometricPrecision'
        imageRendering='optimizeQuality'
      >
        <polygon fill='#F44336' points='100 100, 50 78, 0 100, 0 0, 100 0' />
      </svg>
    </div>
  );
};

export default Ribbon;
