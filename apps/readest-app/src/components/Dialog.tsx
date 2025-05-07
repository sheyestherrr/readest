import clsx from 'clsx';
import React, { ReactNode, useEffect, useState } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { useEnv } from '@/context/EnvContext';
import { useDrag } from '@/hooks/useDrag';
import { useThemeStore } from '@/store/themeStore';
import { useDeviceControlStore } from '@/store/deviceStore';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { impactFeedback } from '@tauri-apps/plugin-haptics';
import { getDirFromUILanguage } from '@/utils/rtl';
import { eventDispatcher } from '@/utils/event';

const VELOCITY_THRESHOLD = 0.5;
const SNAP_THRESHOLD = 0.2;

interface DialogProps {
  id?: string;
  isOpen: boolean;
  children: ReactNode;
  snapHeight?: number;
  header?: ReactNode;
  title?: string;
  className?: string;
  bgClassName?: string;
  boxClassName?: string;
  contentClassName?: string;
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({
  id,
  isOpen,
  children,
  snapHeight,
  header,
  title,
  className,
  bgClassName,
  boxClassName,
  contentClassName,
  onClose,
}) => {
  const { appService } = useEnv();
  const { systemUIVisible, statusBarHeight } = useThemeStore();
  const { acquireBackKeyInterception, releaseBackKeyInterception } = useDeviceControlStore();
  const [isFullHeightInMobile, setIsFullHeightInMobile] = useState(!snapHeight);
  const [isRtl] = useState(() => getDirFromUILanguage() === 'rtl');
  const iconSize22 = useResponsiveSize(22);
  const isMobile = window.innerWidth < 640;

  const handleKeyDown = (event: KeyboardEvent | CustomEvent) => {
    if (event instanceof CustomEvent) {
      if (event.detail.keyName === 'Back') {
        onClose();
        return true;
      }
    } else if (event.key === 'Escape') {
      onClose();
    }
    return false;
  };

  useEffect(() => {
    if (!isOpen) return;
    setIsFullHeightInMobile(!snapHeight);
    window.addEventListener('keydown', handleKeyDown);
    if (appService?.isAndroidApp) {
      acquireBackKeyInterception();
      eventDispatcher.onSync('native-key-down', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (appService?.isAndroidApp) {
        releaseBackKeyInterception();
        eventDispatcher.offSync('native-key-down', handleKeyDown);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleDragMove = (data: { clientY: number; deltaY: number }) => {
    if (!isMobile) return;

    const modal = document.querySelector('.modal-box') as HTMLElement;
    const overlay = document.querySelector('.overlay') as HTMLElement;

    const heightFraction = data.clientY / window.innerHeight;
    const newTop = Math.max(0.0, Math.min(1, heightFraction));

    if (modal && overlay) {
      modal.style.height = '100%';
      modal.style.transform = `translateY(${newTop * 100}%)`;
      overlay.style.opacity = `${1 - heightFraction}`;

      setIsFullHeightInMobile(data.clientY < 44);
      modal.style.transition = `padding-top 0.3s ease-out`;
    }
  };

  const handleDragEnd = (data: { velocity: number; clientY: number }) => {
    const modal = document.querySelector('.modal-box') as HTMLElement;
    const overlay = document.querySelector('.overlay') as HTMLElement;
    if (!modal || !overlay) return;

    const snapUpper = snapHeight ? 1 - snapHeight - SNAP_THRESHOLD : 0.5;
    const snapLower = snapHeight ? 1 - snapHeight + SNAP_THRESHOLD : 0.5;
    if (
      data.velocity > VELOCITY_THRESHOLD ||
      (data.velocity >= 0 && data.clientY >= window.innerHeight * snapLower)
    ) {
      // dialog is dismissed
      const transitionDuration = 0.15 / Math.max(data.velocity, 0.5);
      modal.style.height = '100%';
      modal.style.transition = `transform ${transitionDuration}s ease-out`;
      modal.style.transform = 'translateY(100%)';
      overlay.style.transition = `opacity ${transitionDuration}s ease-out`;
      overlay.style.opacity = '0';
      onClose();
      setTimeout(() => {
        modal.style.transform = 'translateY(0%)';
      }, 300);
    } else if (
      snapHeight &&
      data.clientY > window.innerHeight * snapUpper &&
      data.clientY < window.innerHeight * snapLower
    ) {
      // dialog is snapped
      overlay.style.transition = `opacity 0.3s ease-out`;
      overlay.style.opacity = `${1 - snapHeight}`;
      modal.style.height = `${snapHeight * 100}%`;
      modal.style.bottom = '0';
      modal.style.transition = `transform 0.3s ease-out`;
      modal.style.transform = '';
    } else {
      // dialog is opened without snap
      setIsFullHeightInMobile(true);
      modal.style.height = '100%';
      modal.style.transition = `transform 0.3s ease-out`;
      modal.style.transform = `translateY(0%)`;
      overlay.style.opacity = '0';
    }
    if (appService?.hasHaptics) {
      impactFeedback('medium');
    }
  };

  const { handleDragStart } = useDrag(handleDragMove, handleDragEnd);

  return (
    <dialog
      id={id ?? 'dialog'}
      open={isOpen}
      className={clsx(
        'modal sm:min-w-90 z-50 h-full w-full !items-start !bg-transparent sm:w-full sm:!items-center',
        className,
      )}
      dir={isRtl ? 'rtl' : undefined}
    >
      <div
        className={clsx('overlay fixed inset-0 z-10 bg-black/50 sm:bg-black/20', bgClassName)}
        onClick={onClose}
      />
      <div
        className={clsx(
          'modal-box settings-content absolute z-20 flex flex-col rounded-none rounded-tl-2xl rounded-tr-2xl p-0 sm:rounded-2xl',
          'h-full max-h-full w-full max-w-full',
          window.innerWidth < window.innerHeight
            ? 'sm:h-[50%] sm:w-3/4'
            : 'sm:h-[65%] sm:w-1/2 sm:max-w-[600px]',
          appService?.hasSafeAreaInset &&
            isFullHeightInMobile &&
            'pt-[env(safe-area-inset-top)] sm:pt-0',
          boxClassName,
        )}
        style={
          snapHeight
            ? {
                height: `${snapHeight * 100}%`,
                bottom: 0,
              }
            : {}
        }
      >
        {window.innerWidth < 640 && (
          <div
            className={clsx(
              'drag-handle flex h-10 max-h-10 min-h-10 w-full cursor-row-resize items-center justify-center',
              'transition-padding-top duration-300 ease-out',
            )}
            style={{
              paddingTop:
                appService?.isAndroidApp && systemUIVisible && isFullHeightInMobile
                  ? statusBarHeight
                  : 0,
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className='bg-base-content/50 h-1 w-10 rounded-full'></div>
          </div>
        )}
        <div className='dialog-header bg-base-100 sticky top-1 z-10 flex items-center justify-between px-4'>
          {header ? (
            header
          ) : (
            <div className='flex h-11 w-full items-center justify-between'>
              <button
                tabIndex={-1}
                onClick={onClose}
                className={
                  'btn btn-ghost btn-circle flex h-8 min-h-8 w-8 hover:bg-transparent focus:outline-none sm:hidden'
                }
              >
                {isRtl ? (
                  <MdArrowForwardIos size={iconSize22} />
                ) : (
                  <MdArrowBackIosNew size={iconSize22} />
                )}
              </button>
              <div className='z-15 pointer-events-none absolute inset-0 flex h-11 items-center justify-center'>
                <span className='line-clamp-1 text-center font-bold'>{title ?? ''}</span>
              </div>
              <button
                tabIndex={-1}
                onClick={onClose}
                className={
                  'bg-base-300/65 btn btn-ghost btn-circle ml-auto hidden h-6 min-h-6 w-6 focus:outline-none sm:flex'
                }
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='1em'
                  height='1em'
                  viewBox='0 0 24 24'
                >
                  <path
                    fill='currentColor'
                    d='M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z'
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div
          className={clsx(
            'text-base-content my-2 flex-grow overflow-y-auto px-6 sm:px-[10%]',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default Dialog;
