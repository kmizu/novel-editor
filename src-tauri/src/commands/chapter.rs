use tauri::State;
use crate::models::*;
use crate::AppState;

#[tauri::command]
pub fn list_chapters(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Vec<ChapterMeta>, String> {
    state.storage.list_chapters(&project_id)
}

#[tauri::command]
pub fn read_chapter(
    state: State<'_, AppState>,
    project_id: String,
    chapter_id: String,
) -> Result<Chapter, String> {
    state.storage.read_chapter(&project_id, &chapter_id)
}

#[tauri::command]
pub fn create_chapter(
    state: State<'_, AppState>,
    project_id: String,
    input: CreateChapterInput,
) -> Result<ChapterMeta, String> {
    state.storage.create_chapter(&project_id, input)
}

#[tauri::command]
pub fn save_chapter_content(
    state: State<'_, AppState>,
    project_id: String,
    chapter_id: String,
    content: String,
) -> Result<ChapterMeta, String> {
    state.storage.save_chapter_content(&project_id, &chapter_id, &content)
}

#[tauri::command]
pub fn update_chapter_meta(
    state: State<'_, AppState>,
    project_id: String,
    chapter_id: String,
    updates: UpdateChapterMetaInput,
) -> Result<ChapterMeta, String> {
    state.storage.update_chapter_meta(&project_id, &chapter_id, updates)
}

#[tauri::command]
pub fn delete_chapter(
    state: State<'_, AppState>,
    project_id: String,
    chapter_id: String,
) -> Result<(), String> {
    state.storage.delete_chapter(&project_id, &chapter_id)
}

#[tauri::command]
pub fn reorder_chapters(
    state: State<'_, AppState>,
    project_id: String,
    chapter_ids: Vec<String>,
) -> Result<(), String> {
    state.storage.reorder_chapters(&project_id, chapter_ids)
}
