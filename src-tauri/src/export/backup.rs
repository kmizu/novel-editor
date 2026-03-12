//! JSON バックアップ / リストア

use serde::{Deserialize, Serialize};
use crate::models::*;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupData {
    pub version: String,
    pub exported_at: String,
    pub project: ProjectMeta,
    pub chapters: Vec<Chapter>,
    pub characters: Vec<Character>,
    pub world_settings: Vec<WorldSetting>,
    pub plots: Vec<Plot>,
}

pub fn export_backup(
    project: &ProjectMeta,
    chapters: Vec<Chapter>,
    characters: Vec<Character>,
    world_settings: Vec<WorldSetting>,
    plots: Vec<Plot>,
) -> Result<String, String> {
    let backup = BackupData {
        version: "1.0.0".to_string(),
        exported_at: chrono::Utc::now().to_rfc3339(),
        project: project.clone(),
        chapters,
        characters,
        world_settings,
        plots,
    };
    serde_json::to_string_pretty(&backup)
        .map_err(|e| format!("バックアップのシリアライズに失敗: {}", e))
}

pub fn import_backup_data(json: &str) -> Result<BackupData, String> {
    serde_json::from_str(json)
        .map_err(|e| format!("バックアップの読み込みに失敗: {}", e))
}
