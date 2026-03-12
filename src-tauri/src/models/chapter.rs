use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChapterMeta {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub order: u32,
    pub word_count: u64,
    pub status: ChapterStatus,
    pub notes: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Chapter {
    #[serde(flatten)]
    pub meta: ChapterMeta,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum ChapterStatus {
    #[default]
    Draft,
    Writing,
    Review,
    Completed,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateChapterInput {
    pub title: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateChapterMetaInput {
    pub title: Option<String>,
    pub status: Option<ChapterStatus>,
    pub notes: Option<String>,
}

/// _order.json に保存する章の並び順
#[derive(Debug, Serialize, Deserialize, Default)]
pub struct ChapterOrder {
    pub ids: Vec<String>,
}
