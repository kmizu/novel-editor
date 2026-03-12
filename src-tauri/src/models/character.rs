use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Character {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub furigana: String,
    pub age: String,
    pub gender: String,
    pub role: CharacterRole,
    pub appearance: String,
    pub personality: String,
    pub background: String,
    pub relationships: Vec<CharacterRelationship>,
    pub notes: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub enum CharacterRole {
    Protagonist,
    Antagonist,
    Main,
    Support,
    #[default]
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CharacterRelationship {
    pub character_id: String,
    pub relationship_type: String,
    pub description: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveCharacterInput {
    pub id: Option<String>,
    pub name: String,
    pub furigana: Option<String>,
    pub age: Option<String>,
    pub gender: Option<String>,
    pub role: CharacterRole,
    pub appearance: Option<String>,
    pub personality: Option<String>,
    pub background: Option<String>,
    pub relationships: Option<Vec<CharacterRelationship>>,
    pub notes: Option<String>,
}
