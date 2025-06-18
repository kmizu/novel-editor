// 組み込みテンプレートのデータ

import { WritingTemplate, BUILT_IN_TEMPLATE_IDS } from '../types/template'

export const builtInTemplates: WritingTemplate[] = [
  {
    id: BUILT_IN_TEMPLATE_IDS.FANTASY_HERO_JOURNEY,
    name: 'ファンタジー：英雄の旅',
    description: 'ジョセフ・キャンベルの「英雄の旅」構造に基づくファンタジー小説テンプレート',
    genre: 'fantasy',
    category: 'complete',
    isBuiltIn: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'システム',
    tags: ['ファンタジー', '冒険', '成長'],

    projectTemplate: {
      genre: 'ファンタジー',
      themes: ['成長', '冒険', '友情', '勇気'],
      targetAudience: '10代〜20代',
    },

    plotTemplates: [
      {
        name: 'メインプロット：英雄の旅',
        type: 'main',
        structure: {
          exposition: '平凡な日常を送る主人公。しかし、運命的な出来事により冒険への召命を受ける。',
          risingAction:
            '最初は拒絶するが、賢者との出会いにより旅立ちを決意。仲間と出会い、試練を乗り越えながら成長していく。',
          climax: '最大の敵との対決。これまでの成長と仲間の力を結集して立ち向かう。',
          fallingAction: '勝利の後、変化した主人公は新たな知恵を持って帰還の道を歩む。',
          resolution:
            '日常世界に戻るが、もはや以前の自分ではない。得た経験と知恵を活かして新たな人生を歩む。',
        },
        keyPoints: [
          '日常世界の描写',
          '冒険への召命',
          '召命の拒否',
          '賢者との出会い',
          '第一関門の通過',
          '試練・仲間・敵',
          '最も危険な場所への接近',
          '最大の試練',
          '報酬',
          '帰路',
          '復活',
          '宝を持っての帰還',
        ],
      },
    ],

    chapterTemplates: [
      {
        order: 0,
        title: '序章：平凡な日常',
        purpose: '主人公の日常生活と性格を描写し、読者に共感を持たせる',
        keyEvents: ['主人公の日常描写', '現状への不満や憧れの暗示'],
        requiredElements: ['主人公の性格描写', '世界観の導入'],
        suggestedLength: 5000,
      },
      {
        order: 1,
        title: '第一章：運命の出会い',
        purpose: '物語の発端となる出来事を描き、主人公を冒険へと導く',
        keyEvents: ['運命的な出来事の発生', '召命の提示', '主人公の葛藤'],
        requiredElements: ['事件の発生', '日常からの逸脱', '選択の提示'],
        suggestedLength: 8000,
      },
    ],

    characterTemplates: [
      {
        role: 'protagonist',
        archetype: '成長する英雄',
        requiredTraits: [
          { category: 'personality', prompt: '最初は平凡だが、潜在的な勇気を持つ', required: true },
          {
            category: 'background',
            prompt: '特別な出自や運命を持つ（本人は知らない）',
            required: true,
          },
          { category: 'skill', prompt: '物語を通じて獲得する特別な能力', required: false },
        ],
        developmentArc: '無知→拒絶→受容→成長→覚醒→帰還',
      },
      {
        role: 'mentor',
        archetype: '賢者/導き手',
        requiredTraits: [
          { category: 'personality', prompt: '知恵と経験を持つ', required: true },
          { category: 'background', prompt: '主人公の運命を知っている', required: true },
        ],
      },
    ],

    worldSettingTemplates: [
      {
        category: 'magic',
        name: '魔法システム',
        prompts: [
          '魔法の源は何か？（マナ、精霊、言葉の力など）',
          '魔法の制限や代償は？',
          '誰が魔法を使えるのか？',
          '魔法の種類と分類は？',
        ],
        requiredElements: ['魔法の基本原理', '使用可能者の条件', '制限事項'],
      },
    ],
  },

  {
    id: BUILT_IN_TEMPLATE_IDS.LIGHTNOVEL_ISEKAI,
    name: 'ライトノベル：異世界転生',
    description: '異世界転生ものの定番構成を押さえたライトノベルテンプレート',
    genre: 'lightnovel',
    category: 'complete',
    isBuiltIn: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'システム',
    tags: ['異世界', '転生', 'チート', '成長'],

    projectTemplate: {
      genre: 'ライトノベル（異世界ファンタジー）',
      themes: ['成長', '友情', '冒険', 'チート能力'],
      targetAudience: '中高生〜20代',
      keywords: ['異世界転生', 'チート', 'ハーレム', '成り上がり'],
    },

    plotTemplates: [
      {
        name: '転生から成り上がりまで',
        type: 'main',
        structure: {
          exposition:
            '現代日本で平凡な生活を送る主人公が、事故により死亡。気がつくと異世界に転生していた。',
          risingAction:
            'チート能力を授かった主人公は、その力を活かして冒険者として活動開始。仲間を集め、様々な困難を乗り越えていく。',
          climax:
            '世界を脅かす魔王や邪神との最終決戦。仲間たちと協力し、チート能力を最大限に発揮。',
          fallingAction: '勝利後、英雄として称えられる主人公。しかし新たな脅威の影も...',
          resolution:
            '平和になった世界で、仲間たちと新たな日常を築く。しかし冒険はまだ終わらない。',
        },
        keyPoints: [
          '死亡・転生シーン',
          'チート能力の獲得',
          '初めての戦闘',
          'ヒロインとの出会い',
          'ギルド登録',
          'パーティー結成',
          '強敵との遭遇',
          '新たな力の覚醒',
        ],
      },
    ],

    characterTemplates: [
      {
        role: 'protagonist',
        archetype: '転生者（元日本人）',
        requiredTraits: [
          { category: 'personality', prompt: '元は平凡だが、優しく正義感が強い', required: true },
          { category: 'background', prompt: '現代日本の知識を持つ', required: true },
          {
            category: 'skill',
            prompt: 'チート能力（ステータス確認、スキル獲得、無限成長など）',
            required: true,
          },
        ],
        developmentArc: '困惑→適応→成長→活躍→英雄',
      },
      {
        role: 'loveInterest',
        archetype: 'メインヒロイン',
        requiredTraits: [
          { category: 'personality', prompt: '主人公に救われ、献身的に支える', required: true },
          {
            category: 'physical',
            prompt: '美少女（種族は様々：エルフ、獣人、王女など）',
            required: true,
          },
        ],
        backstoryPrompts: [
          '主人公と運命的な出会い',
          '過去のトラウマや困難',
          '主人公への想いの芽生え',
        ],
      },
    ],
  },

  {
    id: BUILT_IN_TEMPLATE_IDS.MYSTERY_DETECTIVE,
    name: 'ミステリー：探偵もの',
    description: '本格推理小説の構成を押さえた探偵ものテンプレート',
    genre: 'mystery',
    category: 'complete',
    isBuiltIn: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'システム',
    tags: ['推理', '探偵', '事件', 'トリック'],

    projectTemplate: {
      genre: 'ミステリー',
      themes: ['真実の追求', '正義', '人間の心理'],
      targetAudience: '全年齢',
    },

    plotTemplates: [
      {
        name: '事件の発生から解決まで',
        type: 'main',
        structure: {
          exposition: '探偵の日常。そこに舞い込む奇妙な事件の依頼。',
          risingAction:
            '現場検証、関係者への聞き込み、手がかりの収集。真相は深い霧に包まれている。',
          climax: '探偵が全ての謎を解き明かす。意外な真犯人と巧妙なトリックの解明。',
          fallingAction: '犯人の動機の解明と逮捕。',
          resolution: '事件は解決したが、人間の心の闇について考えさせられる探偵。',
        },
        keyPoints: [
          '事件の発生',
          '探偵の登場',
          '現場検証',
          '容疑者リスト',
          'アリバイ確認',
          '手がかりの発見',
          'ミスディレクション',
          '真相の解明',
        ],
      },
    ],
  },
]
