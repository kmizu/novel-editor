//! ファイルシステムベースのストレージ
//!
//! ディレクトリ構造:
//! - {data_dir}/projects.json        -- プロジェクト一覧
//! - {data_dir}/projects/{id}/       -- プロジェクトフォルダ
//!   - project.json                  -- メタデータ
//!   - chapters/_order.json          -- 章の並び順
//!   - chapters/{id}.json            -- 章メタデータ
//!   - chapters/{id}.txt             -- 章の本文
//!   - characters/{id}.json
//!   - world/{id}.json
//!   - plots/_order.json
//!   - plots/{id}.json

use std::fs;
use std::path::{Path, PathBuf};

use crate::models::*;

pub struct NovelStorage {
    data_dir: PathBuf,
}

impl NovelStorage {
    pub fn new(data_dir: PathBuf) -> Result<Self, String> {
        let storage = Self { data_dir };
        storage.ensure_dirs()?;
        Ok(storage)
    }

    fn ensure_dirs(&self) -> Result<(), String> {
        let dirs = [
            self.data_dir.clone(),
            self.projects_dir(),
        ];
        for dir in &dirs {
            fs::create_dir_all(dir)
                .map_err(|e| format!("ディレクトリ作成エラー {:?}: {}", dir, e))?;
        }
        Ok(())
    }

    // ============================================================
    // パス計算
    // ============================================================

    fn projects_dir(&self) -> PathBuf {
        self.data_dir.join("projects")
    }

    fn projects_index_path(&self) -> PathBuf {
        self.data_dir.join("projects.json")
    }

    fn project_dir(&self, project_id: &str) -> PathBuf {
        self.projects_dir().join(project_id)
    }

    fn project_meta_path(&self, project_id: &str) -> PathBuf {
        self.project_dir(project_id).join("project.json")
    }

    fn chapters_dir(&self, project_id: &str) -> PathBuf {
        self.project_dir(project_id).join("chapters")
    }

    fn chapter_order_path(&self, project_id: &str) -> PathBuf {
        self.chapters_dir(project_id).join("_order.json")
    }

    fn chapter_meta_path(&self, project_id: &str, chapter_id: &str) -> PathBuf {
        self.chapters_dir(project_id).join(format!("{}.json", chapter_id))
    }

    fn chapter_content_path(&self, project_id: &str, chapter_id: &str) -> PathBuf {
        self.chapters_dir(project_id).join(format!("{}.txt", chapter_id))
    }

    fn characters_dir(&self, project_id: &str) -> PathBuf {
        self.project_dir(project_id).join("characters")
    }

    fn character_path(&self, project_id: &str, character_id: &str) -> PathBuf {
        self.characters_dir(project_id).join(format!("{}.json", character_id))
    }

    fn world_dir(&self, project_id: &str) -> PathBuf {
        self.project_dir(project_id).join("world")
    }

    fn world_setting_path(&self, project_id: &str, setting_id: &str) -> PathBuf {
        self.world_dir(project_id).join(format!("{}.json", setting_id))
    }

    fn plots_dir(&self, project_id: &str) -> PathBuf {
        self.project_dir(project_id).join("plots")
    }

    fn plot_order_path(&self, project_id: &str) -> PathBuf {
        self.plots_dir(project_id).join("_order.json")
    }

    fn plot_path(&self, project_id: &str, plot_id: &str) -> PathBuf {
        self.plots_dir(project_id).join(format!("{}.json", plot_id))
    }

    // ============================================================
    // JSON ユーティリティ
    // ============================================================

    fn read_json<T: serde::de::DeserializeOwned>(&self, path: &Path) -> Result<T, String> {
        let content = fs::read_to_string(path)
            .map_err(|e| format!("読み込みエラー {:?}: {}", path, e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("JSONパースエラー {:?}: {}", path, e))
    }

    fn write_json<T: serde::Serialize>(&self, path: &Path, value: &T) -> Result<(), String> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("ディレクトリ作成エラー {:?}: {}", parent, e))?;
        }
        let content = serde_json::to_string_pretty(value)
            .map_err(|e| format!("JSONシリアライズエラー: {}", e))?;
        fs::write(path, content)
            .map_err(|e| format!("書き込みエラー {:?}: {}", path, e))
    }

    fn read_text(&self, path: &Path) -> Result<String, String> {
        if !path.exists() {
            return Ok(String::new());
        }
        fs::read_to_string(path)
            .map_err(|e| format!("読み込みエラー {:?}: {}", path, e))
    }

    fn write_text(&self, path: &Path, content: &str) -> Result<(), String> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("ディレクトリ作成エラー {:?}: {}", parent, e))?;
        }
        fs::write(path, content)
            .map_err(|e| format!("書き込みエラー {:?}: {}", path, e))
    }

    // ============================================================
    // プロジェクト一覧
    // ============================================================

    pub fn load_project_list(&self) -> Result<ProjectList, String> {
        let path = self.projects_index_path();
        if !path.exists() {
            return Ok(ProjectList::default());
        }
        self.read_json(&path)
    }

    fn save_project_list(&self, list: &ProjectList) -> Result<(), String> {
        self.write_json(&self.projects_index_path(), list)
    }

    pub fn list_projects(&self) -> Result<Vec<ProjectMeta>, String> {
        let list = self.load_project_list()?;
        // 更新日時の降順で返す
        let mut projects = list.projects;
        projects.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        Ok(projects)
    }

    pub fn create_project(&self, input: CreateProjectInput) -> Result<ProjectMeta, String> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now();

        let meta = ProjectMeta {
            id: id.clone(),
            title: input.title,
            author: input.author,
            description: input.description.unwrap_or_default(),
            synopsis: input.synopsis.unwrap_or_default(),
            genre: input.genre.unwrap_or_default(),
            tags: input.tags.unwrap_or_default(),
            status: ProjectStatus::Writing,
            total_word_count: 0,
            chapter_count: 0,
            created_at: now,
            updated_at: now,
        };

        // プロジェクトフォルダ + サブディレクトリを作成
        let dirs = [
            self.chapters_dir(&id),
            self.characters_dir(&id),
            self.world_dir(&id),
            self.plots_dir(&id),
        ];
        for dir in &dirs {
            fs::create_dir_all(dir)
                .map_err(|e| format!("ディレクトリ作成エラー {:?}: {}", dir, e))?;
        }

        // project.json を保存
        self.write_json(&self.project_meta_path(&id), &meta)?;

        // projects.json に追加
        let mut list = self.load_project_list()?;
        list.projects.push(meta.clone());
        self.save_project_list(&list)?;

        Ok(meta)
    }

    pub fn update_project_meta(
        &self,
        project_id: &str,
        input: UpdateProjectInput,
    ) -> Result<ProjectMeta, String> {
        let mut meta: ProjectMeta = self.read_json(&self.project_meta_path(project_id))?;

        if let Some(title) = input.title { meta.title = title; }
        if let Some(author) = input.author { meta.author = author; }
        if let Some(description) = input.description { meta.description = description; }
        if let Some(synopsis) = input.synopsis { meta.synopsis = synopsis; }
        if let Some(genre) = input.genre { meta.genre = genre; }
        if let Some(tags) = input.tags { meta.tags = tags; }
        if let Some(status) = input.status { meta.status = status; }
        meta.updated_at = chrono::Utc::now();

        self.write_json(&self.project_meta_path(project_id), &meta)?;

        // projects.json も更新
        let mut list = self.load_project_list()?;
        if let Some(p) = list.projects.iter_mut().find(|p| p.id == project_id) {
            *p = meta.clone();
        }
        self.save_project_list(&list)?;

        Ok(meta)
    }

    pub fn delete_project(&self, project_id: &str) -> Result<(), String> {
        let dir = self.project_dir(project_id);
        if dir.exists() {
            fs::remove_dir_all(&dir)
                .map_err(|e| format!("プロジェクト削除エラー: {}", e))?;
        }

        let mut list = self.load_project_list()?;
        list.projects.retain(|p| p.id != project_id);
        self.save_project_list(&list)?;

        Ok(())
    }

    // ============================================================
    // 章
    // ============================================================

    pub fn list_chapters(&self, project_id: &str) -> Result<Vec<ChapterMeta>, String> {
        let order = self.load_chapter_order(project_id)?;
        let mut chapters = Vec::new();

        for id in &order.ids {
            let path = self.chapter_meta_path(project_id, id);
            if path.exists() {
                let meta: ChapterMeta = self.read_json(&path)?;
                chapters.push(meta);
            }
        }

        Ok(chapters)
    }

    fn load_chapter_order(&self, project_id: &str) -> Result<ChapterOrder, String> {
        let path = self.chapter_order_path(project_id);
        if !path.exists() {
            return Ok(ChapterOrder::default());
        }
        self.read_json(&path)
    }

    fn save_chapter_order(&self, project_id: &str, order: &ChapterOrder) -> Result<(), String> {
        self.write_json(&self.chapter_order_path(project_id), order)
    }

    pub fn read_chapter(&self, project_id: &str, chapter_id: &str) -> Result<Chapter, String> {
        let meta: ChapterMeta = self.read_json(&self.chapter_meta_path(project_id, chapter_id))?;
        let content = self.read_text(&self.chapter_content_path(project_id, chapter_id))?;
        Ok(Chapter { meta, content })
    }

    pub fn create_chapter(
        &self,
        project_id: &str,
        input: CreateChapterInput,
    ) -> Result<ChapterMeta, String> {
        let id = uuid::Uuid::new_v4().to_string();
        let mut order = self.load_chapter_order(project_id)?;
        let chapter_order = order.ids.len() as u32;

        let now = chrono::Utc::now();
        let meta = ChapterMeta {
            id: id.clone(),
            project_id: project_id.to_string(),
            title: input.title,
            order: chapter_order,
            word_count: 0,
            status: ChapterStatus::Draft,
            notes: String::new(),
            created_at: now,
            updated_at: now,
        };

        // メタデータを保存
        self.write_json(&self.chapter_meta_path(project_id, &id), &meta)?;
        // 空の本文ファイルを作成
        self.write_text(&self.chapter_content_path(project_id, &id), "")?;
        // 並び順を更新
        order.ids.push(id);
        self.save_chapter_order(project_id, &order)?;
        // プロジェクトの章数を更新
        self.update_project_stats(project_id)?;

        Ok(meta)
    }

    pub fn save_chapter_content(
        &self,
        project_id: &str,
        chapter_id: &str,
        content: &str,
    ) -> Result<ChapterMeta, String> {
        // 本文を保存
        self.write_text(&self.chapter_content_path(project_id, chapter_id), content)?;

        // 文字数を更新（空白・改行・ルビ記法を除く）
        let word_count = count_characters(content);
        let mut meta: ChapterMeta = self.read_json(&self.chapter_meta_path(project_id, chapter_id))?;
        meta.word_count = word_count;
        meta.updated_at = chrono::Utc::now();
        self.write_json(&self.chapter_meta_path(project_id, chapter_id), &meta)?;

        // プロジェクトの合計文字数を更新
        self.update_project_stats(project_id)?;

        Ok(meta)
    }

    pub fn update_chapter_meta(
        &self,
        project_id: &str,
        chapter_id: &str,
        input: UpdateChapterMetaInput,
    ) -> Result<ChapterMeta, String> {
        let mut meta: ChapterMeta = self.read_json(&self.chapter_meta_path(project_id, chapter_id))?;

        if let Some(title) = input.title { meta.title = title; }
        if let Some(status) = input.status { meta.status = status; }
        if let Some(notes) = input.notes { meta.notes = notes; }
        meta.updated_at = chrono::Utc::now();

        self.write_json(&self.chapter_meta_path(project_id, chapter_id), &meta)?;
        Ok(meta)
    }

    pub fn delete_chapter(&self, project_id: &str, chapter_id: &str) -> Result<(), String> {
        // メタデータと本文を削除
        let meta_path = self.chapter_meta_path(project_id, chapter_id);
        let content_path = self.chapter_content_path(project_id, chapter_id);
        if meta_path.exists() { fs::remove_file(&meta_path).ok(); }
        if content_path.exists() { fs::remove_file(&content_path).ok(); }

        // 並び順から削除
        let mut order = self.load_chapter_order(project_id)?;
        order.ids.retain(|id| id != chapter_id);
        self.save_chapter_order(project_id, &order)?;

        self.update_project_stats(project_id)?;
        Ok(())
    }

    pub fn reorder_chapters(
        &self,
        project_id: &str,
        chapter_ids: Vec<String>,
    ) -> Result<(), String> {
        // orderフィールドを更新
        for (index, id) in chapter_ids.iter().enumerate() {
            let path = self.chapter_meta_path(project_id, id);
            if path.exists() {
                let mut meta: ChapterMeta = self.read_json(&path)?;
                meta.order = index as u32;
                self.write_json(&path, &meta)?;
            }
        }
        let order = ChapterOrder { ids: chapter_ids };
        self.save_chapter_order(project_id, &order)
    }

    // ============================================================
    // キャラクター
    // ============================================================

    pub fn list_characters(&self, project_id: &str) -> Result<Vec<Character>, String> {
        let dir = self.characters_dir(project_id);
        self.load_json_files_from_dir(&dir)
    }

    pub fn save_character(
        &self,
        project_id: &str,
        input: SaveCharacterInput,
    ) -> Result<Character, String> {
        let now = chrono::Utc::now();
        let id = input.id.clone().unwrap_or_else(|| uuid::Uuid::new_v4().to_string());

        // 既存がある場合は読み込んで更新
        let existing: Option<Character> = {
            let path = self.character_path(project_id, &id);
            if path.exists() { self.read_json(&path).ok() } else { None }
        };

        let character = Character {
            id: id.clone(),
            project_id: project_id.to_string(),
            name: input.name,
            furigana: input.furigana.unwrap_or_default(),
            age: input.age.unwrap_or_default(),
            gender: input.gender.unwrap_or_default(),
            role: input.role,
            appearance: input.appearance.unwrap_or_default(),
            personality: input.personality.unwrap_or_default(),
            background: input.background.unwrap_or_default(),
            relationships: input.relationships.unwrap_or_default(),
            notes: input.notes.unwrap_or_default(),
            created_at: existing.as_ref().map(|c| c.created_at).unwrap_or(now),
            updated_at: now,
        };

        self.write_json(&self.character_path(project_id, &id), &character)?;
        Ok(character)
    }

    pub fn delete_character(&self, project_id: &str, character_id: &str) -> Result<(), String> {
        let path = self.character_path(project_id, character_id);
        if path.exists() {
            fs::remove_file(&path).map_err(|e| format!("削除エラー: {}", e))?;
        }
        Ok(())
    }

    // ============================================================
    // 世界観設定
    // ============================================================

    pub fn list_world_settings(&self, project_id: &str) -> Result<Vec<WorldSetting>, String> {
        let dir = self.world_dir(project_id);
        self.load_json_files_from_dir(&dir)
    }

    pub fn save_world_setting(
        &self,
        project_id: &str,
        input: SaveWorldSettingInput,
    ) -> Result<WorldSetting, String> {
        let now = chrono::Utc::now();
        let id = input.id.clone().unwrap_or_else(|| uuid::Uuid::new_v4().to_string());

        let existing: Option<WorldSetting> = {
            let path = self.world_setting_path(project_id, &id);
            if path.exists() { self.read_json(&path).ok() } else { None }
        };

        let setting = WorldSetting {
            id: id.clone(),
            project_id: project_id.to_string(),
            category: input.category,
            title: input.title,
            content: input.content,
            tags: input.tags.unwrap_or_default(),
            created_at: existing.as_ref().map(|s| s.created_at).unwrap_or(now),
            updated_at: now,
        };

        self.write_json(&self.world_setting_path(project_id, &id), &setting)?;
        Ok(setting)
    }

    pub fn delete_world_setting(&self, project_id: &str, setting_id: &str) -> Result<(), String> {
        let path = self.world_setting_path(project_id, setting_id);
        if path.exists() {
            fs::remove_file(&path).map_err(|e| format!("削除エラー: {}", e))?;
        }
        Ok(())
    }

    // ============================================================
    // プロット
    // ============================================================

    pub fn list_plots(&self, project_id: &str) -> Result<Vec<Plot>, String> {
        let order = self.load_plot_order(project_id)?;
        let mut plots = Vec::new();

        for id in &order.ids {
            let path = self.plot_path(project_id, id);
            if path.exists() {
                let plot: Plot = self.read_json(&path)?;
                plots.push(plot);
            }
        }

        // orderにないファイルも拾う
        if let Ok(entries) = fs::read_dir(self.plots_dir(project_id)) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().map(|e| e == "json").unwrap_or(false) {
                    if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                        if stem != "_order" && !order.ids.contains(&stem.to_string()) {
                            if let Ok(plot) = self.read_json::<Plot>(&path) {
                                plots.push(plot);
                            }
                        }
                    }
                }
            }
        }

        Ok(plots)
    }

    fn load_plot_order(&self, project_id: &str) -> Result<PlotOrder, String> {
        let path = self.plot_order_path(project_id);
        if !path.exists() {
            return Ok(PlotOrder::default());
        }
        self.read_json(&path)
    }

    pub fn save_plot(&self, project_id: &str, input: SavePlotInput) -> Result<Plot, String> {
        let now = chrono::Utc::now();
        let id = input.id.clone().unwrap_or_else(|| uuid::Uuid::new_v4().to_string());

        let existing: Option<Plot> = {
            let path = self.plot_path(project_id, &id);
            if path.exists() { self.read_json(&path).ok() } else { None }
        };

        let mut order = self.load_plot_order(project_id)?;
        let plot_order = if existing.is_some() {
            existing.as_ref().map(|p| p.order).unwrap_or(order.ids.len() as u32)
        } else {
            order.ids.len() as u32
        };

        let plot = Plot {
            id: id.clone(),
            project_id: project_id.to_string(),
            title: input.title,
            content: input.content.unwrap_or_default(),
            plot_type: input.plot_type,
            chapter_id: input.chapter_id,
            order: plot_order,
            created_at: existing.as_ref().map(|p| p.created_at).unwrap_or(now),
            updated_at: now,
        };

        self.write_json(&self.plot_path(project_id, &id), &plot)?;

        if existing.is_none() && !order.ids.contains(&id) {
            order.ids.push(id);
            self.write_json(&self.plot_order_path(project_id), &order)?;
        }

        Ok(plot)
    }

    pub fn delete_plot(&self, project_id: &str, plot_id: &str) -> Result<(), String> {
        let path = self.plot_path(project_id, plot_id);
        if path.exists() {
            fs::remove_file(&path).map_err(|e| format!("削除エラー: {}", e))?;
        }
        let mut order = self.load_plot_order(project_id)?;
        order.ids.retain(|id| id != plot_id);
        self.write_json(&self.plot_order_path(project_id), &order)?;
        Ok(())
    }

    pub fn reorder_plots(&self, project_id: &str, plot_ids: Vec<String>) -> Result<(), String> {
        for (index, id) in plot_ids.iter().enumerate() {
            let path = self.plot_path(project_id, id);
            if path.exists() {
                let mut plot: Plot = self.read_json(&path)?;
                plot.order = index as u32;
                self.write_json(&path, &plot)?;
            }
        }
        let order = PlotOrder { ids: plot_ids };
        self.write_json(&self.plot_order_path(project_id), &order)
    }

    // ============================================================
    // 内部ユーティリティ
    // ============================================================

    /// ディレクトリ内の全JSONファイルを読み込む
    fn load_json_files_from_dir<T: serde::de::DeserializeOwned>(
        &self,
        dir: &Path,
    ) -> Result<Vec<T>, String> {
        if !dir.exists() {
            return Ok(Vec::new());
        }
        let mut items = Vec::new();
        for entry in fs::read_dir(dir).map_err(|e| format!("ディレクトリ読み込みエラー: {}", e))? {
            let entry = entry.map_err(|e| format!("エントリ読み込みエラー: {}", e))?;
            let path = entry.path();
            if path.extension().map(|e| e == "json").unwrap_or(false) {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    if stem != "_order" {
                        if let Ok(item) = self.read_json(&path) {
                            items.push(item);
                        }
                    }
                }
            }
        }
        Ok(items)
    }

    /// プロジェクトの合計文字数と章数を再計算して保存
    fn update_project_stats(&self, project_id: &str) -> Result<(), String> {
        let chapters = self.list_chapters(project_id)?;
        let total_word_count: u64 = chapters.iter().map(|c| c.word_count).sum();
        let chapter_count = chapters.len() as u64;

        let path = self.project_meta_path(project_id);
        if !path.exists() {
            return Ok(());
        }

        let mut meta: ProjectMeta = self.read_json(&path)?;
        meta.total_word_count = total_word_count;
        meta.chapter_count = chapter_count;
        meta.updated_at = chrono::Utc::now();
        self.write_json(&path, &meta)?;

        // projects.json も更新
        let mut list = self.load_project_list()?;
        if let Some(p) = list.projects.iter_mut().find(|p| p.id == project_id) {
            p.total_word_count = total_word_count;
            p.chapter_count = chapter_count;
            p.updated_at = meta.updated_at;
        }
        self.save_project_list(&list)
    }
}

/// 文字数カウント（空白・改行・ルビ記法記号を除く）
/// |漢字《ルビ》 → 「漢字」の2文字のみカウント
pub fn count_characters(text: &str) -> u64 {
    // ルビ記法を除去: |text《ruby》 → text
    let re_ruby = regex_lite::Regex::new(r"\|(.+?)《.+?》").unwrap();
    let stripped = re_ruby.replace_all(text, "$1");
    // 空白・改行を除去してカウント
    stripped.chars().filter(|c| !c.is_whitespace()).count() as u64
}

// ============================================================
// テスト
// ============================================================

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn make_storage() -> (NovelStorage, TempDir) {
        let dir = TempDir::new().unwrap();
        let storage = NovelStorage::new(dir.path().to_path_buf()).unwrap();
        (storage, dir)
    }

    #[test]
    fn test_count_characters() {
        assert_eq!(count_characters("あいうえお"), 5);
        assert_eq!(count_characters("あいう えお"), 5); // スペース除く
        assert_eq!(count_characters("あいう\nえお"), 5); // 改行除く
        assert_eq!(count_characters("|漢字《かんじ》"), 2); // ルビ除く
        assert_eq!(count_characters(""), 0);
    }

    #[test]
    fn test_create_and_list_projects() {
        let (storage, _dir) = make_storage();

        let input = CreateProjectInput {
            title: "テスト作品".to_string(),
            author: "作者名".to_string(),
            description: None,
            synopsis: Some("あらすじです".to_string()),
            genre: None,
            tags: None,
        };

        let created = storage.create_project(input).unwrap();
        assert_eq!(created.title, "テスト作品");
        assert_eq!(created.author, "作者名");
        assert_eq!(created.synopsis, "あらすじです");

        let projects = storage.list_projects().unwrap();
        assert_eq!(projects.len(), 1);
        assert_eq!(projects[0].id, created.id);
    }

    #[test]
    fn test_delete_project() {
        let (storage, _dir) = make_storage();
        let input = CreateProjectInput {
            title: "削除テスト".to_string(),
            author: "作者".to_string(),
            description: None, synopsis: None, genre: None, tags: None,
        };
        let created = storage.create_project(input).unwrap();
        storage.delete_project(&created.id).unwrap();
        let projects = storage.list_projects().unwrap();
        assert!(projects.is_empty());
    }

    #[test]
    fn test_create_chapter_and_save_content() {
        let (storage, _dir) = make_storage();
        let project = storage.create_project(CreateProjectInput {
            title: "作品".to_string(),
            author: "作者".to_string(),
            description: None, synopsis: None, genre: None, tags: None,
        }).unwrap();

        let chapter = storage.create_chapter(&project.id, CreateChapterInput {
            title: "第一章".to_string(),
        }).unwrap();

        assert_eq!(chapter.title, "第一章");
        assert_eq!(chapter.word_count, 0);

        let meta = storage.save_chapter_content(
            &project.id,
            &chapter.id,
            "これはテストです。",
        ).unwrap();

        assert_eq!(meta.word_count, 9); // 「これはテストです。」= 9文字

        let full = storage.read_chapter(&project.id, &chapter.id).unwrap();
        assert_eq!(full.content, "これはテストです。");
    }

    #[test]
    fn test_chapter_order() {
        let (storage, _dir) = make_storage();
        let project = storage.create_project(CreateProjectInput {
            title: "作品".to_string(),
            author: "作者".to_string(),
            description: None, synopsis: None, genre: None, tags: None,
        }).unwrap();

        let ch1 = storage.create_chapter(&project.id, CreateChapterInput { title: "一章".to_string() }).unwrap();
        let ch2 = storage.create_chapter(&project.id, CreateChapterInput { title: "二章".to_string() }).unwrap();
        let ch3 = storage.create_chapter(&project.id, CreateChapterInput { title: "三章".to_string() }).unwrap();

        // 逆順に並び替え
        storage.reorder_chapters(&project.id, vec![ch3.id.clone(), ch2.id.clone(), ch1.id.clone()]).unwrap();

        let chapters = storage.list_chapters(&project.id).unwrap();
        assert_eq!(chapters[0].title, "三章");
        assert_eq!(chapters[1].title, "二章");
        assert_eq!(chapters[2].title, "一章");
    }

    #[test]
    fn test_project_stats_updated_after_save() {
        let (storage, _dir) = make_storage();
        let project = storage.create_project(CreateProjectInput {
            title: "作品".to_string(),
            author: "作者".to_string(),
            description: None, synopsis: None, genre: None, tags: None,
        }).unwrap();
        let chapter = storage.create_chapter(&project.id, CreateChapterInput {
            title: "一章".to_string(),
        }).unwrap();

        storage.save_chapter_content(&project.id, &chapter.id, "テスト本文です。").unwrap();

        let projects = storage.list_projects().unwrap();
        let updated = projects.iter().find(|p| p.id == project.id).unwrap();
        assert_eq!(updated.chapter_count, 1);
        assert!(updated.total_word_count > 0);
    }
}
