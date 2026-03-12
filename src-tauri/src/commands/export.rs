use tauri::State;
use serde::Deserialize;
use crate::AppState;
use crate::export::*;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportSettings {
    pub format: ExportFormat,
    pub include_chapter_numbers: bool,
    pub include_author_notes: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ExportFormat {
    Kakuyomu,
    Narou,
    Text,
    Json,
}

/// エクスポートテキストを返す（ファイル保存はフロント側でダイアログ使用）
#[tauri::command]
pub fn get_export_content(
    state: State<'_, AppState>,
    project_id: String,
    settings: ExportSettings,
) -> Result<String, String> {
    let project = state.storage
        .list_projects()?
        .into_iter()
        .find(|p| p.id == project_id)
        .ok_or("プロジェクトが見つかりません")?;

    let chapter_metas = state.storage.list_chapters(&project_id)?;
    let chapters: Result<Vec<_>, _> = chapter_metas
        .iter()
        .map(|m| state.storage.read_chapter(&project_id, &m.id))
        .collect();
    let chapters = chapters?;

    match settings.format {
        ExportFormat::Kakuyomu => Ok(export_kakuyomu(
            &project,
            &chapters,
            &kakuyomu::KakuyomuExportSettings {
                include_chapter_numbers: settings.include_chapter_numbers,
                include_author_notes: settings.include_author_notes,
            },
        )),
        ExportFormat::Narou => Ok(export_narou(
            &project,
            &chapters,
            &narou::NarouExportSettings {
                include_chapter_numbers: settings.include_chapter_numbers,
                include_author_notes: settings.include_author_notes,
            },
        )),
        ExportFormat::Text => Ok(export_text(&project, &chapters)),
        ExportFormat::Json => {
            let characters = state.storage.list_characters(&project_id)?;
            let world_settings = state.storage.list_world_settings(&project_id)?;
            let plots = state.storage.list_plots(&project_id)?;
            export_backup(&project, chapters, characters, world_settings, plots)
        }
    }
}
