use tauri::State;
use crate::models::*;
use crate::AppState;

#[tauri::command]
pub fn list_world_settings(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Vec<WorldSetting>, String> {
    state.storage.list_world_settings(&project_id)
}

#[tauri::command]
pub fn save_world_setting(
    state: State<'_, AppState>,
    project_id: String,
    input: SaveWorldSettingInput,
) -> Result<WorldSetting, String> {
    state.storage.save_world_setting(&project_id, input)
}

#[tauri::command]
pub fn delete_world_setting(
    state: State<'_, AppState>,
    project_id: String,
    setting_id: String,
) -> Result<(), String> {
    state.storage.delete_world_setting(&project_id, &setting_id)
}
