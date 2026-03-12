//! カクヨム形式エクスポート
//!
//! - ルビ記法: |漢字《かんじ》（そのまま）
//! - 章区切り: ===== 章タイトル =====
//! - 改行: 段落間に空行を入れる

use crate::models::{Chapter, ProjectMeta};

pub struct KakuyomuExportSettings {
    pub include_chapter_numbers: bool,
    pub include_author_notes: bool,
}

pub fn export_kakuyomu(
    project: &ProjectMeta,
    chapters: &[Chapter],
    settings: &KakuyomuExportSettings,
) -> String {
    let mut output = String::new();

    // ヘッダー
    output.push_str(&format!("【{}】\n", project.title));
    output.push_str(&format!("作者：{}\n", project.author));
    if !project.synopsis.is_empty() {
        output.push_str("\n");
        output.push_str(&project.synopsis);
    }
    output.push_str("\n\n");

    for (index, chapter) in chapters.iter().enumerate() {
        // 章タイトル
        let title = if settings.include_chapter_numbers {
            format!("第{}話　{}", index + 1, chapter.meta.title)
        } else {
            chapter.meta.title.clone()
        };
        output.push_str(&format!("==========\n{}\n==========\n\n", title));

        // 本文（段落ごとに処理）
        for para in chapter.content.lines() {
            if para.trim().is_empty() {
                output.push('\n');
            } else {
                output.push_str(para);
                output.push('\n');
            }
        }

        // 作者ノート
        if settings.include_author_notes && !chapter.meta.notes.is_empty() {
            output.push_str("\n");
            output.push_str(&chapter.meta.notes);
            output.push('\n');
        }

        output.push('\n');
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{ChapterMeta, ChapterStatus, ProjectStatus};
    use chrono::Utc;

    fn make_project() -> ProjectMeta {
        ProjectMeta {
            id: "p1".to_string(),
            title: "テスト作品".to_string(),
            author: "作者名".to_string(),
            description: String::new(),
            synopsis: "あらすじです".to_string(),
            genre: String::new(),
            tags: vec![],
            status: ProjectStatus::Writing,
            total_word_count: 0,
            chapter_count: 1,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    fn make_chapter(title: &str, content: &str) -> Chapter {
        Chapter {
            meta: ChapterMeta {
                id: "c1".to_string(),
                project_id: "p1".to_string(),
                title: title.to_string(),
                order: 0,
                word_count: 0,
                status: ChapterStatus::Draft,
                notes: String::new(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            content: content.to_string(),
        }
    }

    #[test]
    fn test_kakuyomu_basic_export() {
        let project = make_project();
        let chapters = vec![make_chapter("始まり", "これは本文です。\n続きです。")];
        let settings = KakuyomuExportSettings {
            include_chapter_numbers: true,
            include_author_notes: false,
        };

        let output = export_kakuyomu(&project, &chapters, &settings);
        assert!(output.contains("【テスト作品】"));
        assert!(output.contains("作者：作者名"));
        assert!(output.contains("第1話　始まり"));
        assert!(output.contains("これは本文です。"));
    }

    #[test]
    fn test_kakuyomu_ruby_passthrough() {
        let project = make_project();
        // カクヨムのルビ記法はそのまま通す
        let chapters = vec![make_chapter("章", "|魔法《まほう》を使った。")];
        let settings = KakuyomuExportSettings {
            include_chapter_numbers: false,
            include_author_notes: false,
        };
        let output = export_kakuyomu(&project, &chapters, &settings);
        assert!(output.contains("|魔法《まほう》を使った。"));
    }
}
