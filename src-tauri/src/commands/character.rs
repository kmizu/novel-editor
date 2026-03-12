use tauri::State;
use crate::models::*;
use crate::AppState;

#[tauri::command]
pub fn list_characters(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Vec<Character>, String> {
    state.storage.list_characters(&project_id)
}

#[tauri::command]
pub fn save_character(
    state: State<'_, AppState>,
    project_id: String,
    input: SaveCharacterInput,
) -> Result<Character, String> {
    state.storage.save_character(&project_id, input)
}

#[tauri::command]
pub fn delete_character(
    state: State<'_, AppState>,
    project_id: String,
    character_id: String,
) -> Result<(), String> {
    state.storage.delete_character(&project_id, &character_id)
}
