import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { eventDispatcher } from '@/utils/event';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export const Toast = () => {
  const [toastMessage, setToastMessage] = useState('');
  const toastType = useRef<ToastType>('info');
  const toastTimeout = useRef(5000);
  const messageClass = useRef('');
  const toastDismissTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastClassMap = {
    info: 'toast-info toast-center toast-middle',
    success: 'toast-success toast-top toast-end',
    warning: 'toast-warning toast-top toast-end',
    error: 'toast-error toast-top toast-end',
  };
  const alertClassMap = {
    info: 'alert-primary border-base-300',
    success: 'alert-success border-0',
    warning: 'alert-warning border-0',
    error: 'alert-error border-0',
  };

  useEffect(() => {
    if (toastDismissTimeout.current) clearTimeout(toastDismissTimeout.current);
    toastDismissTimeout.current = setTimeout(() => setToastMessage(''), toastTimeout.current);
    return () => {
      if (toastDismissTimeout.current) clearTimeout(toastDismissTimeout.current);
    };
  }, [toastMessage]);

  const handleShowToast = async (event: CustomEvent) => {
    const { message, type = 'info', timeout, className = '' } = event.detail;
    setToastMessage(message);
    toastType.current = type;
    if (timeout) toastTimeout.current = timeout;
    messageClass.current = className;
  };

  useEffect(() => {
    eventDispatcher.on('toast', handleShowToast);
    return () => {
      eventDispatcher.off('toast', handleShowToast);
    };
  }, []);

  return (
    toastMessage && (
      <div
        className={clsx(
          'toast toast-center toast-middle z-50 w-auto max-w-screen-sm',
          toastClassMap[toastType.current],
          toastClassMap[toastType.current].includes('toast-top') &&
            'pt-[calc(44px+env(safe-area-inset-top))]',
        )}
      >
        <div
          className={clsx(
            'alert flex items-center justify-center',
            alertClassMap[toastType.current],
          )}
        >
          <span
            className={clsx(
              'max-h-[50vh] min-w-32',
              'overflow-y-auto text-center',
              toastType.current === 'info'
                ? 'max-w-[80vw]'
                : 'max-w-80 whitespace-normal break-words',
              messageClass.current,
            )}
          >
            {toastMessage.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line || <>&nbsp;</>}
                <br />
              </React.Fragment>
            ))}
          </span>
        </div>
      </div>
    )
  );
};
