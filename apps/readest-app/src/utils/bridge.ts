import { invoke } from '@tauri-apps/api/core';

export interface CopyURIRequest {
  uri: string;
  dst: string;
}

export interface CopyURIResponse {
  success: boolean;
  error?: string;
}

export interface UseBackgroundAudioRequest {
  enabled: boolean;
}

export interface InstallPackageRequest {
  path: string;
}

export interface InstallPackageResponse {
  success: boolean;
  error?: string;
}

export interface SetSystemUIVisibilityRequest {
  visible: boolean;
  darkMode: boolean;
}

export interface SetSystemUIVisibilityResponse {
  success: boolean;
  error?: string;
}

export interface GetStatusBarHeightResponse {
  height: number;
  error?: string;
}

export interface GetSystemFontsListResponse {
  fonts: Record<string, string>; // { fontName: fontFamily }
  error?: string;
}

export interface InterceptKeysRequest {
  volumeKeys?: boolean;
  backKey?: boolean;
}

export interface LockScreenRequest {
  orientation: 'portrait' | 'landscape' | 'auto';
}

export async function copyURIToPath(request: CopyURIRequest): Promise<CopyURIResponse> {
  const result = await invoke<CopyURIResponse>('plugin:native-bridge|copy_uri_to_path', {
    payload: request,
  });

  return result;
}

export async function invokeUseBackgroundAudio(request: UseBackgroundAudioRequest): Promise<void> {
  await invoke('plugin:native-bridge|use_background_audio', {
    payload: request,
  });
}

export async function installPackage(
  request: InstallPackageRequest,
): Promise<InstallPackageResponse> {
  const result = await invoke<InstallPackageResponse>('plugin:native-bridge|install_package', {
    payload: request,
  });
  return result;
}

export async function setSystemUIVisibility(
  request: SetSystemUIVisibilityRequest,
): Promise<SetSystemUIVisibilityResponse> {
  const result = await invoke<SetSystemUIVisibilityResponse>(
    'plugin:native-bridge|set_system_ui_visibility',
    {
      payload: request,
    },
  );
  return result;
}

export async function getStatusBarHeight(): Promise<GetStatusBarHeightResponse> {
  const result = await invoke<GetStatusBarHeightResponse>(
    'plugin:native-bridge|get_status_bar_height',
  );
  return result;
}

let cachedSysFontsResult: GetSystemFontsListResponse | null = null;

export async function getSysFontsList(): Promise<GetSystemFontsListResponse> {
  if (cachedSysFontsResult) {
    return cachedSysFontsResult;
  }
  const result = await invoke<GetSystemFontsListResponse>(
    'plugin:native-bridge|get_sys_fonts_list',
  );
  cachedSysFontsResult = result;
  return result;
}

export async function interceptKeys(request: InterceptKeysRequest): Promise<void> {
  await invoke('plugin:native-bridge|intercept_keys', {
    payload: request,
  });
}

export async function lockScreenOrientation(request: LockScreenRequest): Promise<void> {
  await invoke('plugin:native-bridge|lock_screen_orientation', {
    payload: request,
  });
}
