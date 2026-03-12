use tauri::State;
use crate::models::*;
use crate::AppState;

#[tauri::command]
pub fn list_plots(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Vec<Plot>, String> {
    state.storage.list_plots(&project_id)
}

#[tauri::command]
pub fn save_plot(
    state: State<'_, AppState>,
    project_id: String,
    input: SavePlotInput,
) -> Result<Plot, String> {
    state.storage.save_plot(&project_id, input)
}

#[tauri::command]
pub fn delete_plot(
    state: State<'_, AppState>,
    project_id: String,
    plot_id: String,
) -> Result<(), String> {
    state.storage.delete_plot(&project_id, &plot_id)
}

#[tauri::command]
pub fn reorder_plots(
    state: State<'_, AppState>,
    project_id: String,
    plot_ids: Vec<String>,
) -> Result<(), String> {
    state.storage.reorder_plots(&project_id, plot_ids)
}
