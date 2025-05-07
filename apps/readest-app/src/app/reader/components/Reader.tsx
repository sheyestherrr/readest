'use client';

import clsx from 'clsx';
import * as React from 'react';
import { useEffect, Suspense, useRef, useState } from 'react';

import { useEnv } from '@/context/EnvContext';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import { useReaderStore } from '@/store/readerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useNotebookStore } from '@/store/notebookStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDeviceControlStore } from '@/store/deviceStore';
import { useScreenWakeLock } from '@/hooks/useScreenWakeLock';
import { eventDispatcher } from '@/utils/event';
import { setSystemUIVisibility } from '@/utils/bridge';
import { AboutWindow } from '@/components/AboutWindow';
import { UpdaterWindow } from '@/components/UpdaterWindow';
import { Toast } from '@/components/Toast';
import ReaderContent from './ReaderContent';

const Reader: React.FC<{ ids?: string }> = ({ ids }) => {
  const { envConfig, appService } = useEnv();
  const { setLibrary } = useLibraryStore();
  const { hoveredBookKey } = useReaderStore();
  const { settings, setSettings } = useSettingsStore();
  const { isSideBarVisible, setSideBarVisible } = useSidebarStore();
  const { isNotebookVisible, setNotebookVisible } = useNotebookStore();
  const { isDarkMode, showSystemUI, dismissSystemUI } = useThemeStore();
  const { acquireBackKeyInterception, releaseBackKeyInterception } = useDeviceControlStore();
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const isInitiating = useRef(false);

  useTheme({ systemUIVisible: false, appThemeColor: 'base-100' });
  useScreenWakeLock(settings.screenWakeLock);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (appService?.isMobileApp && !document.hidden) {
        dismissSystemUI();
        setSystemUIVisibility({ visible: false, darkMode: isDarkMode });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appService, isDarkMode]);

  const handleKeyDown = (event: CustomEvent) => {
    if (event.detail.keyName === 'Back') {
      setSideBarVisible(false);
      setNotebookVisible(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!appService?.isAndroidApp) return;
    if (isSideBarVisible || isNotebookVisible) {
      acquireBackKeyInterception();
      eventDispatcher.onSync('native-key-down', handleKeyDown);
    }
    if (!isSideBarVisible && !isNotebookVisible) {
      releaseBackKeyInterception();
      eventDispatcher.offSync('native-key-down', handleKeyDown);
    }
    return () => {
      if (appService?.isAndroidApp) {
        releaseBackKeyInterception();
        eventDispatcher.offSync('native-key-down', handleKeyDown);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSideBarVisible, isNotebookVisible]);

  useEffect(() => {
    if (isInitiating.current) return;
    isInitiating.current = true;
    const initLibrary = async () => {
      const appService = await envConfig.getAppService();
      const settings = await appService.loadSettings();
      setSettings(settings);
      setLibrary(await appService.loadLibraryBooks());
      setLibraryLoaded(true);
    };

    initLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!appService?.isMobile) return;
    const systemUIVisible = !!hoveredBookKey;
    setSystemUIVisibility({ visible: systemUIVisible, darkMode: isDarkMode });
    if (systemUIVisible) {
      showSystemUI();
    } else {
      dismissSystemUI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredBookKey]);

  return (
    libraryLoaded &&
    settings.globalReadSettings && (
      <div
        className={clsx(
          `reader-page bg-base-100 text-base-content select-none`,
          !isSideBarVisible && appService?.hasRoundedWindow && 'rounded-window',
        )}
      >
        <Suspense>
          <ReaderContent ids={ids} settings={settings} />
          <AboutWindow />
          {appService?.isAndroidApp && <UpdaterWindow />}
          <Toast />
        </Suspense>
      </div>
    )
  );
};

export default Reader;
