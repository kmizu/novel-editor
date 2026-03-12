use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Plot {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub content: String,
    pub plot_type: PlotType,
    pub chapter_id: Option<String>,
    pub order: u32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum PlotType {
    #[default]
    Main,
    Sub,
    Chapter,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavePlotInput {
    pub id: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub plot_type: PlotType,
    pub chapter_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct PlotOrder {
    pub ids: Vec<String>,
}
