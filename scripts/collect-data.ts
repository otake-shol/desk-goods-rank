/**
 * データ収集メインスクリプト
 * 仕様書: specs/05-data-collection.md
 *
 * 使用方法:
 *   npx tsx scripts/collect-data.ts
 *   npm run collect-data
 */

import * as fs from 'fs'
import * as path from 'path'
import { searchTwitter, TwitterSearchResult } from './collectors/twitter'
import { searchYouTube, YouTubeSearchResult } from './collectors/youtube'
import { fetchNoteArticles, matchProductInArticles, NoteData, NoteArticle } from './collectors/note'
import { calculateScore, ScoreFactors } from './collectors/score-calculator'

interface ItemData {
  id: string
  name: string
  score: number
  socialScore?: {
    twitter: number
    youtube: number
    amazon: number
    note?: number
  }
}

interface CollectedData {
  itemId: string
  itemName: string
  twitter: TwitterSearchResult | null
  youtube: YouTubeSearchResult | null
  note: NoteData | null
  calculatedScore: number
  timestamp: string
}

async function collectDataForItem(
  itemId: string,
  itemName: string,
  noteArticles: NoteArticle[]
): Promise<CollectedData> {
  console.log(`Collecting data for: ${itemName}`)

  // Twitter/YouTubeからデータ収集
  const [twitterResult, youtubeResult] = await Promise.all([
    searchTwitter(itemName),
    searchYouTube(itemName),
  ])

  // note.comの記事マッチング
  const noteResult = matchProductInArticles(itemName, noteArticles)

  // スコアファクターを生成
  const factors: ScoreFactors = {
    twitterMentions: twitterResult?.tweetCount || 0,
    twitterEngagement:
      (twitterResult?.totalLikes || 0) +
      (twitterResult?.totalRetweets || 0) * 2, // RTは重み付け2倍
    youtubeViews: youtubeResult?.totalViews || 0,
    youtubeEngagement:
      (youtubeResult?.totalLikes || 0) + (youtubeResult?.totalComments || 0) * 3, // コメントは重み付け3倍
    noteArticles: noteResult.articleCount,
    noteLikes: noteResult.totalLikes,
  }

  const calculatedScore = calculateScore(factors)

  return {
    itemId,
    itemName,
    twitter: twitterResult,
    youtube: youtubeResult,
    note: noteResult,
    calculatedScore,
    timestamp: new Date().toISOString(),
  }
}

async function main() {
  console.log('=== Data Collection Started ===\n')

  // 現在のアイテムデータを読み込む
  const itemsPath = path.join(__dirname, '../src/data/items.json')
  const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'))
  const items: ItemData[] = itemsData.items

  // note.comからデスクツアー記事を取得（全アイテム共通で1回だけ）
  console.log('Fetching note.com desk tour articles...')
  let noteArticles: NoteArticle[] = []
  try {
    noteArticles = await fetchNoteArticles()
    console.log(`Found ${noteArticles.length} articles on note.com\n`)
  } catch (error) {
    console.error('Failed to fetch note.com articles:', error)
    console.log('Continuing without note.com data...\n')
  }

  const collectedData: CollectedData[] = []
  const updatedItems: ItemData[] = []

  // 各アイテムのデータを収集
  for (const item of items) {
    try {
      const data = await collectDataForItem(item.id, item.name, noteArticles)
      collectedData.push(data)

      // スコアを更新
      updatedItems.push({
        ...item,
        score: data.calculatedScore,
        socialScore: {
          twitter: Math.round(
            ((data.twitter?.tweetCount || 0) +
              (data.twitter?.totalLikes || 0) / 10) /
              10
          ),
          youtube: Math.round(
            ((data.youtube?.videoCount || 0) * 10 +
              (data.youtube?.totalViews || 0) / 1000) /
              10
          ),
          amazon: item.socialScore?.amazon || 50, // Amazon は既存値を維持
          note: Math.round(
            ((data.note?.articleCount || 0) * 10 +
              (data.note?.totalLikes || 0) / 5) /
              10
          ),
        },
      })

      console.log(`  Score: ${data.calculatedScore}\n`)

      // API制限対策: 1秒待機
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error collecting data for ${item.name}:`, error)
      updatedItems.push(item) // エラー時は既存データを維持
    }
  }

  // 収集データをファイルに保存
  const outputDir = path.join(__dirname, '../data/collected')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().split('T')[0]
  const outputPath = path.join(outputDir, `collected-${timestamp}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(collectedData, null, 2))
  console.log(`\nCollected data saved to: ${outputPath}`)

  // アイテムデータを更新（--updateフラグがある場合のみ）
  if (process.argv.includes('--update')) {
    const updatedItemsData = { ...itemsData, items: updatedItems }
    fs.writeFileSync(itemsPath, JSON.stringify(updatedItemsData, null, 2))
    console.log('Items data updated!')
  } else {
    console.log('\nTo update items.json, run with --update flag')
  }

  console.log('\n=== Data Collection Complete ===')
}

main().catch(console.error)
