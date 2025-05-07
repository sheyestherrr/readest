import { create } from 'zustand';
import { interceptKeys } from '@/utils/bridge';
import { eventDispatcher } from '@/utils/event';

declare global {
  interface Window {
    onNativeKeyDown?: (keyName: string) => void;
  }
}

const handleNativeKeyDown = (keyName: string) => {
  if (keyName === 'VolumeUp' || keyName === 'VolumeDown') {
    return eventDispatcher.dispatch('native-key-down', { keyName });
  }
  if (keyName === 'Back') {
    return eventDispatcher.dispatchSync('native-key-down', { keyName });
  }
  return false;
};

type DeviceControlState = {
  volumeKeysIntercepted: boolean;
  backKeyIntercepted: boolean;
  volumeKeysInterceptionCount: number;
  backKeyInterceptionCount: number;
  acquireVolumeKeyInterception: () => void;
  releaseVolumeKeyInterception: () => void;
  acquireBackKeyInterception: () => void;
  releaseBackKeyInterception: () => void;
};

export const useDeviceControlStore = create<DeviceControlState>((set, get) => ({
  volumeKeysIntercepted: false,
  backKeyIntercepted: false,
  volumeKeysInterceptionCount: 0,
  backKeyInterceptionCount: 0,

  acquireVolumeKeyInterception: () => {
    const { volumeKeysInterceptionCount } = get();
    if (volumeKeysInterceptionCount == 0) {
      window.onNativeKeyDown = handleNativeKeyDown;
      interceptKeys({ volumeKeys: true });
      set({ volumeKeysIntercepted: true });
    }
    set({ volumeKeysInterceptionCount: volumeKeysInterceptionCount + 1 });
  },

  releaseVolumeKeyInterception: () => {
    const { volumeKeysInterceptionCount } = get();
    if (volumeKeysInterceptionCount <= 1) {
      interceptKeys({ volumeKeys: false });
      set({ volumeKeysIntercepted: false, volumeKeysInterceptionCount: 0 });
    } else {
      set({ volumeKeysInterceptionCount: volumeKeysInterceptionCount - 1 });
    }
  },

  acquireBackKeyInterception: () => {
    const { backKeyInterceptionCount } = get();
    if (backKeyInterceptionCount == 0) {
      window.onNativeKeyDown = handleNativeKeyDown;
      interceptKeys({ backKey: true });
      set({ backKeyIntercepted: true });
    }
    set({ backKeyInterceptionCount: backKeyInterceptionCount + 1 });
  },

  releaseBackKeyInterception: () => {
    const { backKeyInterceptionCount } = get();
    if (backKeyInterceptionCount <= 1) {
      interceptKeys({ backKey: false });
      set({ backKeyIntercepted: false, backKeyInterceptionCount: 0 });
    } else {
      set({ backKeyInterceptionCount: backKeyInterceptionCount - 1 });
    }
  },
}));
