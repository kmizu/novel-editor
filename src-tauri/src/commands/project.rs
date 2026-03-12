use tauri::State;
use crate::models::*;
use crate::AppState;

#[tauri::command]
pub fn list_projects(state: State<'_, AppState>) -> Result<Vec<ProjectMeta>, String> {
    state.storage.list_projects()
}

#[tauri::command]
pub fn create_project(
    state: State<'_, AppState>,
    input: CreateProjectInput,
) -> Result<ProjectMeta, String> {
    state.storage.create_project(input)
}

#[tauri::command]
pub fn update_project_meta(
    state: State<'_, AppState>,
    project_id: String,
    updates: UpdateProjectInput,
) -> Result<ProjectMeta, String> {
    state.storage.update_project_meta(&project_id, updates)
}

#[tauri::command]
pub fn delete_project(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<(), String> {
    state.storage.delete_project(&project_id)
}
