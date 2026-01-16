/**
 * スコア算出ロジック
 * 仕様書: specs/05-data-collection.md
 */

export interface ScoreFactors {
  twitterMentions: number
  twitterEngagement: number
  youtubeViews: number
  youtubeEngagement: number
  noteArticles: number
  noteLikes: number
}

export interface NormalizedFactors {
  twitterMentions: number
  twitterEngagement: number
  youtubeViews: number
  youtubeEngagement: number
  noteArticles: number
  noteLikes: number
}

// 正規化の基準値（これらの値が1.0に相当）
// デスクアイテムのニッチな市場に合わせた現実的な値
const NORMALIZATION_BASE = {
  twitterMentions: 500, // 500ツイートで満点
  twitterEngagement: 2500, // 2500エンゲージメントで満点
  youtubeViews: 10000, // 1万再生で満点
  youtubeEngagement: 1000, // 1000エンゲージメントで満点
  noteArticles: 10, // 10記事で満点
  noteLikes: 500, // 500スキで満点
}

/**
 * 各ファクターを0-1の範囲に正規化
 */
export function normalizeFactors(factors: ScoreFactors): NormalizedFactors {
  return {
    twitterMentions: Math.min(factors.twitterMentions / NORMALIZATION_BASE.twitterMentions, 1),
    twitterEngagement: Math.min(factors.twitterEngagement / NORMALIZATION_BASE.twitterEngagement, 1),
    youtubeViews: Math.min(factors.youtubeViews / NORMALIZATION_BASE.youtubeViews, 1),
    youtubeEngagement: Math.min(factors.youtubeEngagement / NORMALIZATION_BASE.youtubeEngagement, 1),
    noteArticles: Math.min(factors.noteArticles / NORMALIZATION_BASE.noteArticles, 1),
    noteLikes: Math.min(factors.noteLikes / NORMALIZATION_BASE.noteLikes, 1),
  }
}

/**
 * スコアを算出（0-100の範囲）
 *
 * 重み付け:
 * - Twitterメンション数: 25%
 * - Twitterエンゲージメント: 15%
 * - YouTube再生数: 25%
 * - YouTubeエンゲージメント: 15%
 * - note記事数: 10%
 * - noteスキ数: 10%
 */
export function calculateScore(factors: ScoreFactors): number {
  const normalized = normalizeFactors(factors)

  const rawScore =
    normalized.twitterMentions * 0.25 +
    normalized.twitterEngagement * 0.15 +
    normalized.youtubeViews * 0.25 +
    normalized.youtubeEngagement * 0.15 +
    normalized.noteArticles * 0.1 +
    normalized.noteLikes * 0.1

  // 0-100にスケール
  return Math.round(rawScore * 100)
}

/**
 * モックデータを生成（開発・テスト用）
 */
export function generateMockFactors(): ScoreFactors {
  return {
    twitterMentions: Math.floor(Math.random() * 600),
    twitterEngagement: Math.floor(Math.random() * 3000),
    youtubeViews: Math.floor(Math.random() * 15000),
    youtubeEngagement: Math.floor(Math.random() * 1500),
    noteArticles: Math.floor(Math.random() * 15),
    noteLikes: Math.floor(Math.random() * 600),
  }
}

/**
 * SocialScoreオブジェクトからスコアファクターを生成
 */
export function socialScoreToFactors(socialScore: {
  twitter: number
  youtube: number
  amazon: number
  note?: number
}): ScoreFactors {
  // SocialScoreは既に0-100のスコアなので、逆算してファクターに変換
  return {
    twitterMentions: (socialScore.twitter / 100) * NORMALIZATION_BASE.twitterMentions,
    twitterEngagement: (socialScore.twitter / 100) * NORMALIZATION_BASE.twitterEngagement,
    youtubeViews: (socialScore.youtube / 100) * NORMALIZATION_BASE.youtubeViews,
    youtubeEngagement: (socialScore.youtube / 100) * NORMALIZATION_BASE.youtubeEngagement,
    noteArticles: ((socialScore.note || 0) / 100) * NORMALIZATION_BASE.noteArticles,
    noteLikes: ((socialScore.note || 0) / 100) * NORMALIZATION_BASE.noteLikes,
  }
}
