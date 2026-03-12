//! 小説家になろう形式エクスポート
//!
//! - ルビ記法: |漢字《かんじ》（そのまま）
//! - 章区切り: -------
//! - 作者ノート: ※ 記法

use crate::models::{Chapter, ProjectMeta};

pub struct NarouExportSettings {
    pub include_chapter_numbers: bool,
    pub include_author_notes: bool,
}

pub fn export_narou(
    project: &ProjectMeta,
    chapters: &[Chapter],
    settings: &NarouExportSettings,
) -> String {
    let mut output = String::new();

    // ヘッダー（なろうはシンプル）
    output.push_str(&format!("{}\n\n", project.title));
    if !project.synopsis.is_empty() {
        output.push_str(&project.synopsis);
        output.push_str("\n\n");
    }

    for (index, chapter) in chapters.iter().enumerate() {
        let title = if settings.include_chapter_numbers {
            format!("第{}話　{}", index + 1, chapter.meta.title)
        } else {
            chapter.meta.title.clone()
        };

        output.push_str("-------\n");
        output.push_str(&format!("{}\n\n", title));

        for para in chapter.content.lines() {
            if para.trim().is_empty() {
                output.push('\n');
            } else {
                output.push_str(para);
                output.push('\n');
            }
        }

        // 作者ノート（※ 記法）
        if settings.include_author_notes && !chapter.meta.notes.is_empty() {
            output.push_str("\n\n");
            for line in chapter.meta.notes.lines() {
                output.push_str(&format!("※{}\n", line));
            }
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

    fn make_test_data() -> (ProjectMeta, Vec<Chapter>) {
        let project = ProjectMeta {
            id: "p1".to_string(),
            title: "なろう作品".to_string(),
            author: "作者".to_string(),
            description: String::new(),
            synopsis: String::new(),
            genre: String::new(),
            tags: vec![],
            status: ProjectStatus::Writing,
            total_word_count: 0,
            chapter_count: 1,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let chapters = vec![Chapter {
            meta: ChapterMeta {
                id: "c1".to_string(),
                project_id: "p1".to_string(),
                title: "第一話".to_string(),
                order: 0,
                word_count: 0,
                status: ChapterStatus::Draft,
                notes: "作者コメントです".to_string(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            content: "本文です。".to_string(),
        }];
        (project, chapters)
    }

    #[test]
    fn test_narou_separator() {
        let (project, chapters) = make_test_data();
        let output = export_narou(&project, &chapters, &NarouExportSettings {
            include_chapter_numbers: true,
            include_author_notes: false,
        });
        assert!(output.contains("-------"));
        assert!(output.contains("第1話　第一話"));
    }

    #[test]
    fn test_narou_author_notes() {
        let (project, chapters) = make_test_data();
        let output = export_narou(&project, &chapters, &NarouExportSettings {
            include_chapter_numbers: false,
            include_author_notes: true,
        });
        assert!(output.contains("※作者コメントです"));
    }
}
