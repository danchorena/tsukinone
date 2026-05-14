use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, Runtime, Emitter};
use tauri::menu::{MenuBuilder, MenuItem};
use tauri::tray::TrayIconBuilder;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SoundEntry {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Manifest {
    pub custom_sounds: Vec<SoundEntry>,
}

fn get_manifest_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    let path = app.path().app_config_dir().map_err(|e| e.to_string())?;
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    Ok(path.join("manifest.json"))
}

fn get_sounds_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    let path = app.path().app_config_dir().map_err(|e| e.to_string())?.join("sounds");
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    Ok(path)
}

#[tauri::command]
async fn load_manifest<R: Runtime>(app: AppHandle<R>) -> Result<Manifest, String> {
    let path = get_manifest_path(&app)?;
    if !path.exists() {
        return Ok(Manifest::default());
    }
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let manifest: Manifest = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(manifest)
}

#[tauri::command]
async fn register_custom_sound<R: Runtime>(
    app: AppHandle<R>,
    name: String,
    icon: String,
    source_path: String,
) -> Result<SoundEntry, String> {
    let id = Uuid::new_v4().to_string();
    let sounds_dir = get_sounds_dir(&app)?;
    
    let source_path_buf = PathBuf::from(&source_path);
    let extension = source_path_buf
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("ogg");
    
    let dest_filename = format!("{}.{}", id, extension);
    let dest_path = sounds_dir.join(&dest_filename);
    
    fs::copy(&source_path, &dest_path).map_err(|e| e.to_string())?;
    
    let entry = SoundEntry {
        id: id.clone(),
        name,
        icon,
        path: dest_path.to_string_lossy().into_owned(),
    };
    
    // Update manifest
    let manifest_path = get_manifest_path(&app)?;
    let mut manifest = if manifest_path.exists() {
        let content = fs::read_to_string(&manifest_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())?
    } else {
        Manifest::default()
    };
    
    manifest.custom_sounds.push(entry.clone());
    let new_content = serde_json::to_string_pretty(&manifest).map_err(|e| e.to_string())?;
    fs::write(manifest_path, new_content).map_err(|e| e.to_string())?;
    
    Ok(entry)
}

#[tauri::command]
async fn delete_sound<R: Runtime>(app: AppHandle<R>, id: String) -> Result<(), String> {
    let manifest_path = get_manifest_path(&app)?;
    if !manifest_path.exists() {
        return Err("Manifest not found".into());
    }
    
    let content = fs::read_to_string(&manifest_path).map_err(|e| e.to_string())?;
    let mut manifest: Manifest = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    if let Some(index) = manifest.custom_sounds.iter().position(|s| s.id == id) {
        let entry = manifest.custom_sounds.remove(index);
        
        // Remove file
        let file_path = PathBuf::from(entry.path);
        if file_path.exists() {
            fs::remove_file(file_path).map_err(|e| e.to_string())?;
        }
        
        // Save manifest
        let new_content = serde_json::to_string_pretty(&manifest).map_err(|e| e.to_string())?;
        fs::write(manifest_path, new_content).map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Sound not found in manifest".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let toggle_i = MenuItem::with_id(app, "toggle", "Show/Hide Window", true, None::<&str>)?;
            let mute_i = MenuItem::with_id(app, "mute", "Toggle Mute", true, None::<&str>)?;
            let about_i = MenuItem::with_id(app, "about", "About Tsukinone", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            
            let menu = MenuBuilder::new(app)
                .item(&toggle_i)
                .item(&mute_i)
                .separator()
                .item(&about_i)
                .item(&quit_i)
                .build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "toggle" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let is_visible = window.is_visible().unwrap_or(false);
                                if is_visible {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                        "mute" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.emit("toggle-mute", ());
                            }
                        }
                        "about" => {
                            use tauri_plugin_dialog::DialogExt;
                            app.dialog()
                                .message("Tsukinone v0.1.0\n\nA minimalist background sound application built with Tauri and React.\n\nHandcrafted for Deep Focus.")
                                .title("About Tsukinone")
                                .show(|_| {});
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;
                
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            load_manifest,
            register_custom_sound,
            delete_sound
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
