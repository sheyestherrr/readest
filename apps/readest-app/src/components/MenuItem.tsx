import clsx from 'clsx';
import React from 'react';
import { IconType } from 'react-icons';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';

interface MenuItemProps {
  label: string;
  buttonClass?: string;
  labelClass?: string;
  shortcut?: string;
  disabled?: boolean;
  noIcon?: boolean;
  Icon?: React.ReactNode | IconType;
  children?: React.ReactNode;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  buttonClass,
  labelClass,
  shortcut,
  disabled,
  noIcon = false,
  Icon,
  children,
  onClick,
}) => {
  const iconSize = useResponsiveSize(16);
  const menuButton = (
    <button
      className={clsx(
        'hover:bg-base-300 text-base-content flex h-10 w-full items-center justify-between rounded-md p-1',
        disabled && 'btn-disabled text-gray-400',
        buttonClass,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className='flex min-w-0 items-center'>
        {!noIcon && (
          <span style={{ minWidth: `${iconSize}px` }}>
            {typeof Icon === 'function' ? (
              <Icon className='text-base-content' size={iconSize} />
            ) : (
              Icon
            )}
          </span>
        )}
        <span
          className={clsx('mx-2 flex-1 truncate text-base sm:text-sm', labelClass)}
          style={{ minWidth: 0 }}
        >
          {label}
        </span>
      </div>
      {shortcut && (
        <kbd
          className={clsx(
            'border-base-300/40 bg-base-300/75 text-neutral-content hidden rounded-md border shadow-sm sm:flex',
            'shrink-0 px-1.5 py-0.5 text-xs font-medium',
          )}
        >
          {shortcut}
        </kbd>
      )}
    </button>
  );

  if (children) {
    return (
      <ul className='menu rounded-box m-0 p-0'>
        <li>
          <details>
            <summary className='hover:bg-base-300 p-0 pr-3'>{menuButton}</summary>
            {children}
          </details>
        </li>
      </ul>
    );
  }
  return menuButton;
};

export default MenuItem;
