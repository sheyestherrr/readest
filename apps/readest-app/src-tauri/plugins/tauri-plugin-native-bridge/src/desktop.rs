use serde::de::DeserializeOwned;
use std::collections::HashMap;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<NativeBridge<R>> {
    Ok(NativeBridge(app.clone()))
}

/// Access to the native-bridge APIs.
pub struct NativeBridge<R: Runtime>(AppHandle<R>);

impl<R: Runtime> NativeBridge<R> {
    pub fn auth_with_safari(&self, _payload: AuthRequest) -> crate::Result<AuthResponse> {
        Err(crate::Error::UnsupportedPlatformError)
    }

    pub fn auth_with_custom_tab(&self, _payload: AuthRequest) -> crate::Result<AuthResponse> {
        Err(crate::Error::UnsupportedPlatformError)
    }

    pub fn copy_uri_to_path(&self, _payload: CopyURIRequest) -> crate::Result<CopyURIResponse> {
        Err(crate::Error::UnsupportedPlatformError)
    }

    pub fn use_background_audio(&self, _payload: UseBackgroundAudioRequest) -> crate::Result<()> {
        Err(crate::Error::UnsupportedPlatformError)
    }

    pub fn install_package(
        &self,
        _payload: InstallPackageRequest,
    ) -> crate::Result<InstallPackageResponse> {
        Err(crate::Error::UnsupportedPlatformError)
    }

    pub fn set_system_ui_visibility(
        &self,
        _payload: SetSystemUIVisibilityRequest,
    ) -> crate::Result<SetSystemUIVisibilityResponse> {
        Err(crate::Error::UnsupportedPlatformError)
    }

    pub fn get_status_bar_height(&self) -> crate::Result<GetStatusBarHeightResponse> {
        Err(crate::Error::UnsupportedPlatformError)
    }

    pub fn get_sys_fonts_list(&self) -> crate::Result<GetSysFontsListResponse> {
        let font_collection = font_enumeration::Collection::new().unwrap();
        let mut fonts = HashMap::new();
        for font in font_collection.all() {
            if cfg!(target_os = "windows") {
                // FIXME: temporarily disable font name with style for windows
                fonts.insert(font.family_name.clone(), font.family_name.clone());
            } else {
                fonts.insert(font.font_name.clone(), font.family_name.clone());
            }
        }
        Ok(GetSysFontsListResponse { fonts, error: None })
    }

    pub fn intercept_keys(&self, _payload: InterceptKeysRequest) -> crate::Result<()> {
        Err(crate::Error::UnsupportedPlatformError)
    }

    pub fn lock_screen_orientation(
        &self,
        _payload: LockScreenOrientationRequest,
    ) -> crate::Result<()> {
        Err(crate::Error::UnsupportedPlatformError)
    }
}
