//! プレーンテキストエクスポート

use crate::models::{Chapter, ProjectMeta};

pub fn export_text(project: &ProjectMeta, chapters: &[Chapter]) -> String {
    let mut output = String::new();

    output.push_str(&format!("{}\n", project.title));
    output.push_str(&format!("著者：{}\n", project.author));
    if !project.genre.is_empty() {
        output.push_str(&format!("ジャンル：{}\n", project.genre));
    }
    let total_words: u64 = chapters.iter().map(|c| c.meta.word_count).sum();
    output.push_str(&format!("全{}話・{}字\n", chapters.len(), total_words));
    output.push_str("\n");

    for (index, chapter) in chapters.iter().enumerate() {
        output.push_str(&format!("■ 第{}話　{}\n\n", index + 1, chapter.meta.title));
        output.push_str(&chapter.content);
        output.push_str("\n\n");
    }

    output
}
