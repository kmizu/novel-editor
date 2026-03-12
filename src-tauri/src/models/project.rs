use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectMeta {
    pub id: String,
    pub title: String,
    pub author: String,
    pub description: String,
    pub synopsis: String,
    pub genre: String,
    pub tags: Vec<String>,
    pub status: ProjectStatus,
    pub total_word_count: u64,
    pub chapter_count: u64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum ProjectStatus {
    #[default]
    Draft,
    Writing,
    Completed,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectInput {
    pub title: String,
    pub author: String,
    pub description: Option<String>,
    pub synopsis: Option<String>,
    pub genre: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProjectInput {
    pub title: Option<String>,
    pub author: Option<String>,
    pub description: Option<String>,
    pub synopsis: Option<String>,
    pub genre: Option<String>,
    pub tags: Option<Vec<String>>,
    pub status: Option<ProjectStatus>,
}

/// projects.json に保存するプロジェクト一覧
#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ProjectList {
    pub projects: Vec<ProjectMeta>,
}
