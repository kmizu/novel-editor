use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorldSetting {
    pub id: String,
    pub project_id: String,
    pub category: WorldCategory,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum WorldCategory {
    Geography,
    History,
    Culture,
    Politics,
    Magic,
    Technology,
    #[default]
    Other,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveWorldSettingInput {
    pub id: Option<String>,
    pub category: WorldCategory,
    pub title: String,
    pub content: String,
    pub tags: Option<Vec<String>>,
}
