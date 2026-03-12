mod models;
mod storage;
mod commands;

use tauri::Manager;
use storage::NovelStorage;

/// アプリケーション全体で共有するステート
pub struct AppState {
    pub storage: NovelStorage,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // データディレクトリを取得して NovelStorage を初期化
            let data_dir = app
                .path()
                .app_data_dir()
                .expect("app data dir を取得できません");
            let storage = NovelStorage::new(data_dir)
                .expect("ストレージの初期化に失敗しました");
            app.manage(AppState { storage });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // プロジェクト
            commands::list_projects,
            commands::create_project,
            commands::update_project_meta,
            commands::delete_project,
            // 章
            commands::list_chapters,
            commands::read_chapter,
            commands::create_chapter,
            commands::save_chapter_content,
            commands::update_chapter_meta,
            commands::delete_chapter,
            commands::reorder_chapters,
            // キャラクター
            commands::list_characters,
            commands::save_character,
            commands::delete_character,
            // 世界観
            commands::list_world_settings,
            commands::save_world_setting,
            commands::delete_world_setting,
            // プロット
            commands::list_plots,
            commands::save_plot,
            commands::delete_plot,
            commands::reorder_plots,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
