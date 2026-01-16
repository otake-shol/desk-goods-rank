/**
 * 探索済み記事URL管理モジュール
 * 一度探索した記事は再度アクセスしないようにするための永続化機能
 */

import * as fs from 'fs'
import * as path from 'path'

interface ExploredArticles {
  note: string[]
  youtube: string[]
  zenn: string[]
  hatena: string[]
  lastUpdated: string
}

const EXPLORED_FILE_PATH = path.join(__dirname, '../../data/explored-articles.json')

/**
 * 探索済み記事データを読み込む
 */
export function loadExploredArticles(): ExploredArticles {
  try {
    if (fs.existsSync(EXPLORED_FILE_PATH)) {
      const data = fs.readFileSync(EXPLORED_FILE_PATH, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.log('  ⚠️ 探索済みデータの読み込みに失敗、新規作成します')
  }

  return {
    note: [],
    youtube: [],
    zenn: [],
    hatena: [],
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * 探索済み記事データを保存する
 */
export function saveExploredArticles(data: ExploredArticles): void {
  const dir = path.dirname(EXPLORED_FILE_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  data.lastUpdated = new Date().toISOString()
  fs.writeFileSync(EXPLORED_FILE_PATH, JSON.stringify(data, null, 2))
}

/**
 * 指定ソースの探索済みURLセットを取得
 */
export function getExploredUrls(source: keyof Omit<ExploredArticles, 'lastUpdated'>): Set<string> {
  const data = loadExploredArticles()
  return new Set(data[source] || [])
}

/**
 * 新しいURLを探索済みとして追加
 */
export function addExploredUrls(
  source: keyof Omit<ExploredArticles, 'lastUpdated'>,
  urls: string[]
): void {
  const data = loadExploredArticles()
  const existingSet = new Set(data[source] || [])

  for (const url of urls) {
    existingSet.add(url)
  }

  data[source] = Array.from(existingSet)
  saveExploredArticles(data)
}

/**
 * 未探索の記事のみをフィルタリング
 */
export function filterUnexploredArticles<T extends { url: string }>(
  source: keyof Omit<ExploredArticles, 'lastUpdated'>,
  articles: T[]
): { unexplored: T[]; skipped: number } {
  const exploredUrls = getExploredUrls(source)
  const unexplored = articles.filter(article => !exploredUrls.has(article.url))
  const skipped = articles.length - unexplored.length

  return { unexplored, skipped }
}

/**
 * 探索済み記事数のサマリーを取得
 */
export function getExploredSummary(): Record<string, number> {
  const data = loadExploredArticles()
  return {
    note: data.note.length,
    youtube: data.youtube.length,
    zenn: data.zenn.length,
    hatena: data.hatena.length,
  }
}

/**
 * 探索済みデータをクリア（特定ソースまたは全て）
 */
export function clearExploredArticles(
  source?: keyof Omit<ExploredArticles, 'lastUpdated'>
): void {
  if (source) {
    const data = loadExploredArticles()
    data[source] = []
    saveExploredArticles(data)
  } else {
    saveExploredArticles({
      note: [],
      youtube: [],
      zenn: [],
      hatena: [],
      lastUpdated: new Date().toISOString(),
    })
  }
}
