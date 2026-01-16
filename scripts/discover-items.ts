/**
 * アイテム自動発見スクリプト
 * 複数ソースからAmazonリンクを抽出し、新規アイテムを発見
 *
 * 使用方法:
 *   npx tsx scripts/discover-items.ts              # 発見のみ（ドライラン）
 *   npx tsx scripts/discover-items.ts --save      # 発見して保存
 *   npx tsx scripts/discover-items.ts --note-only # note.comのみ
 *   npx tsx scripts/discover-items.ts --youtube-only # YouTubeのみ
 *   npx tsx scripts/discover-items.ts --zenn-only # Zennのみ
 *   npx tsx scripts/discover-items.ts --hatena-only # はてなブログのみ
 *   npx tsx scripts/discover-items.ts --amazon-only # Amazonベストセラーのみ
 *   npx tsx scripts/discover-items.ts --kakaku-only # 価格.comのみ
 *   npx tsx scripts/discover-items.ts --makuake-only # Makuakeのみ
 *   npx tsx scripts/discover-items.ts --all       # 全ソース
 *   npx tsx scripts/discover-items.ts --force     # 探索済み記事も再探索
 *   npx tsx scripts/discover-items.ts --clear-cache # 探索済みキャッシュをクリア
 */

import * as fs from 'fs'
import * as path from 'path'
import { fetchNoteArticles, NoteArticle } from './collectors/note'
import {
  filterUnexploredArticles,
  addExploredUrls,
  getExploredSummary,
  clearExploredArticles,
} from './collectors/explored-articles'
import {
  extractAsinsFromNoteArticle,
  extractAsinsFromYouTubeDescription,
  fetchAmazonProductInfo,
  convertToItemFormat,
  DiscoveredItem,
} from './collectors/item-discovery'
import { discoverItemsFromZenn } from './collectors/zenn-collector'
import { discoverItemsFromHatena } from './collectors/hatena-collector'
import { discoverItemsFromAmazonBestseller } from './collectors/amazon-bestseller-collector'
import { discoverItemsFromKakaku } from './collectors/kakaku-collector'
import { discoverItemsFromMakuake } from './collectors/makuake-collector'

interface ExistingItem {
  id: string
  amazon?: {
    asin: string
  }
}

async function discoverFromNote(existingAsins: Set<string>, forceMode: boolean = false): Promise<DiscoveredItem[]> {
  console.log('\n📝 note.comからアイテムを発見中...\n')

  const allArticles = await fetchNoteArticles()
  console.log(`  ${allArticles.length}件の記事を取得`)

  // 探索済み記事をフィルタリング
  let articles: NoteArticle[]
  if (forceMode) {
    articles = allArticles
    console.log('  🔄 強制モード: 全記事を再探索')
  } else {
    const { unexplored, skipped } = filterUnexploredArticles('note', allArticles)
    articles = unexplored
    if (skipped > 0) {
      console.log(`  ⏭️  ${skipped}件の探索済み記事をスキップ`)
    }
    console.log(`  📋 ${articles.length}件の未探索記事を処理`)
  }

  if (articles.length === 0) {
    console.log('  ✅ 全ての記事が探索済みです')
    return []
  }

  const discoveredItems: Map<string, DiscoveredItem> = new Map()
  let processedCount = 0
  const processedUrls: string[] = []

  for (const article of articles) {
    processedCount++
    console.log(`  [${processedCount}/${articles.length}] ${article.title.substring(0, 40)}...`)

    try {
      const { asins, title } = await extractAsinsFromNoteArticle(article.url)
      processedUrls.push(article.url)

      for (const asin of asins) {
        // 既存アイテムはスキップ
        if (existingAsins.has(asin)) {
          console.log(`    ⏭️  ${asin} (既存)`)
          continue
        }

        const existing = discoveredItems.get(asin)
        if (existing) {
          existing.mentionCount++
          existing.totalEngagement += article.likes
        } else {
          discoveredItems.set(asin, {
            asin,
            sourceType: 'note',
            sourceUrl: article.url,
            sourceTitle: title || article.title,
            mentionCount: 1,
            totalEngagement: article.likes,
          })
          console.log(`    ✅ 新規発見: ${asin}`)
        }
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 1500))
    } catch (error) {
      console.log(`    ❌ エラー: ${error}`)
      processedUrls.push(article.url) // エラーでも探索済みとしてマーク
    }
  }

  // 探索済みURLを保存
  if (processedUrls.length > 0) {
    addExploredUrls('note', processedUrls)
    console.log(`  💾 ${processedUrls.length}件の記事を探索済みとして保存`)
  }

  return Array.from(discoveredItems.values())
}

async function discoverFromYouTube(existingAsins: Set<string>, forceMode: boolean = false): Promise<DiscoveredItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    console.log('\n⚠️  YOUTUBE_API_KEY が設定されていません。YouTubeからの発見をスキップします。')
    return []
  }

  console.log('\n📺 YouTubeからアイテムを発見中...\n')

  const searchQueries = [
    'デスクツアー 2025',
    'デスクツアー 2026',
    'デスクツアー 2024',
    'デスク環境 紹介',
    'デスクセットアップ ガジェット',
  ]

  const discoveredItems: Map<string, DiscoveredItem> = new Map()
  const { unexplored: _, skipped: exploredCount } = filterUnexploredArticles('youtube', [])
  const exploredUrls = forceMode ? new Set<string>() : new Set(
    Array.from({ length: exploredCount }).map(() => '')
  )
  const processedUrls: string[] = []

  // 探索済みURLを事前に取得
  const { unexplored } = filterUnexploredArticles('youtube',
    searchQueries.map(q => ({ url: q }))
  )
  const exploredVideoUrls = new Set<string>()
  if (!forceMode) {
    const summary = getExploredSummary()
    if (summary.youtube > 0) {
      console.log(`  📊 ${summary.youtube}件の探索済み動画があります`)
    }
  }

  for (const query of searchQueries) {
    console.log(`  🔍 検索: "${query}"`)

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=15&regionCode=JP&key=${apiKey}`

    try {
      const response = await fetch(searchUrl)
      const data = await response.json()

      if (data.error) {
        console.log(`    ❌ APIエラー: ${data.error.message}`)
        continue
      }

      if (!data.items) continue

      // 探索済みフィルタリング
      const videoItems = data.items.map((item: { id?: { videoId?: string }; snippet?: { title?: string } }) => ({
        url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
        videoId: item.id?.videoId,
        title: item.snippet?.title || '',
      })).filter((v: { videoId?: string }) => v.videoId)

      const { unexplored: unexploredVideos, skipped } = forceMode
        ? { unexplored: videoItems, skipped: 0 }
        : filterUnexploredArticles('youtube', videoItems)

      if (skipped > 0) {
        console.log(`    ⏭️  ${skipped}件の探索済み動画をスキップ`)
      }

      for (const video of unexploredVideos) {
        const videoId = video.videoId
        if (!videoId) continue

        console.log(`    📹 ${video.title.substring(0, 40)}...`)

        const { asins, title, viewCount } = await extractAsinsFromYouTubeDescription(videoId, apiKey)
        processedUrls.push(video.url)

        for (const asin of asins) {
          if (existingAsins.has(asin)) {
            console.log(`      ⏭️  ${asin} (既存)`)
            continue
          }

          const existing = discoveredItems.get(asin)
          if (existing) {
            existing.mentionCount++
            existing.totalEngagement += viewCount
          } else {
            discoveredItems.set(asin, {
              asin,
              sourceType: 'youtube',
              sourceUrl: video.url,
              sourceTitle: title || video.title,
              mentionCount: 1,
              totalEngagement: viewCount,
            })
            console.log(`      ✅ 新規発見: ${asin}`)
          }
        }

        // API制限対策
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    } catch (error) {
      console.log(`    ❌ 検索エラー: ${error}`)
    }
  }

  // 探索済みURLを保存
  if (processedUrls.length > 0) {
    addExploredUrls('youtube', processedUrls)
    console.log(`  💾 ${processedUrls.length}件の動画を探索済みとして保存`)
  }

  return Array.from(discoveredItems.values())
}

async function discoverFromZenn(existingAsins: Set<string>, forceMode: boolean = false): Promise<DiscoveredItem[]> {
  console.log('\n📗 Zennからアイテムを発見中...\n')

  try {
    const items = await discoverItemsFromZenn(forceMode)
    return items.filter(item => !existingAsins.has(item.asin))
  } catch (error) {
    console.log(`  ❌ Zenn取得エラー: ${error}`)
    return []
  }
}

async function discoverFromHatena(existingAsins: Set<string>, forceMode: boolean = false): Promise<DiscoveredItem[]> {
  console.log('\n📙 はてなブログからアイテムを発見中...\n')

  try {
    const items = await discoverItemsFromHatena(forceMode)
    return items.filter(item => !existingAsins.has(item.asin))
  } catch (error) {
    console.log(`  ❌ はてなブログ取得エラー: ${error}`)
    return []
  }
}

async function discoverFromAmazonBestseller(existingAsins: Set<string>): Promise<{
  items: DiscoveredItem[]
  categoryInfo: Map<string, { category: string; subCategory: string }>
}> {
  console.log('\n🏆 Amazonベストセラーからアイテムを発見中...\n')

  try {
    const { items, categoryInfo } = await discoverItemsFromAmazonBestseller()
    const filteredItems = items.filter(item => !existingAsins.has(item.asin))
    return { items: filteredItems, categoryInfo }
  } catch (error) {
    console.log(`  ❌ Amazonベストセラー取得エラー: ${error}`)
    return { items: [], categoryInfo: new Map() }
  }
}

async function discoverFromKakaku(existingAsins: Set<string>): Promise<{
  items: DiscoveredItem[]
  categoryInfo: Map<string, { category: string; subCategory: string }>
}> {
  console.log('\n💰 価格.comからアイテムを発見中...\n')

  try {
    const { items, categoryInfo } = await discoverItemsFromKakaku()
    const filteredItems = items.filter(item => !existingAsins.has(item.asin))
    return { items: filteredItems, categoryInfo }
  } catch (error) {
    console.log(`  ❌ 価格.com取得エラー: ${error}`)
    return { items: [], categoryInfo: new Map() }
  }
}

async function discoverFromMakuake(existingAsins: Set<string>): Promise<DiscoveredItem[]> {
  console.log('\n🚀 Makuakeからアイテムを発見中...\n')

  try {
    const items = await discoverItemsFromMakuake()
    return items.filter(item => !existingAsins.has(item.asin))
  } catch (error) {
    console.log(`  ❌ Makuake取得エラー: ${error}`)
    return []
  }
}

async function main() {
  console.log('=== アイテム自動発見 開始 ===\n')

  const args = process.argv.slice(2)
  const saveMode = args.includes('--save')
  const noteOnly = args.includes('--note-only')
  const youtubeOnly = args.includes('--youtube-only')
  const zennOnly = args.includes('--zenn-only')
  const hatenaOnly = args.includes('--hatena-only')
  const amazonOnly = args.includes('--amazon-only')
  const kakakuOnly = args.includes('--kakaku-only')
  const makuakeOnly = args.includes('--makuake-only')
  const forceMode = args.includes('--force')
  const clearCache = args.includes('--clear-cache')
  const allSources = args.includes('--all') || (!noteOnly && !youtubeOnly && !zennOnly && !hatenaOnly && !amazonOnly && !kakakuOnly && !makuakeOnly)

  // キャッシュクリアモード
  if (clearCache) {
    console.log('🗑️  探索済みキャッシュをクリアしています...')
    clearExploredArticles()
    console.log('✅ キャッシュをクリアしました\n')
  }

  // 探索済み記事のサマリーを表示
  const exploredSummary = getExploredSummary()
  const totalExplored = Object.values(exploredSummary).reduce((a, b) => a + b, 0)
  if (totalExplored > 0 && !forceMode) {
    console.log('📊 探索済み記事数:')
    console.log(`   note: ${exploredSummary.note}件`)
    console.log(`   YouTube: ${exploredSummary.youtube}件`)
    console.log(`   Zenn: ${exploredSummary.zenn}件`)
    console.log(`   はてな: ${exploredSummary.hatena}件`)
    console.log('   (これらの記事はスキップされます。--force で再探索可能)\n')
  }

  if (forceMode) {
    console.log('🔄 強制モード: 全ての記事を再探索します\n')
  }

  // 既存アイテムのASINを取得
  const itemsPath = path.join(__dirname, '../src/data/items.json')
  const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'))
  const existingItems: ExistingItem[] = itemsData.items
  const existingAsins = new Set(existingItems.map(item => item.amazon?.asin).filter(Boolean) as string[])

  console.log(`📦 既存アイテム数: ${existingItems.length}`)
  console.log(`🔗 既存ASIN数: ${existingAsins.size}`)

  const allDiscovered: DiscoveredItem[] = []
  let amazonCategoryInfo: Map<string, { category: string; subCategory: string }> = new Map()

  // 各ソースから発見
  if (noteOnly || allSources) {
    const noteItems = await discoverFromNote(existingAsins, forceMode)
    allDiscovered.push(...noteItems)
    console.log(`  📝 note.com: ${noteItems.length}件発見`)
  }

  if (youtubeOnly || allSources) {
    const youtubeItems = await discoverFromYouTube(existingAsins, forceMode)
    allDiscovered.push(...youtubeItems)
    console.log(`  📺 YouTube: ${youtubeItems.length}件発見`)
  }

  if (zennOnly || allSources) {
    const zennItems = await discoverFromZenn(existingAsins, forceMode)
    allDiscovered.push(...zennItems)
    console.log(`  📗 Zenn: ${zennItems.length}件発見`)
  }

  if (hatenaOnly || allSources) {
    const hatenaItems = await discoverFromHatena(existingAsins, forceMode)
    allDiscovered.push(...hatenaItems)
    console.log(`  📙 はてなブログ: ${hatenaItems.length}件発見`)
  }

  if (amazonOnly || allSources) {
    const { items: amazonItems, categoryInfo } = await discoverFromAmazonBestseller(existingAsins)
    allDiscovered.push(...amazonItems)
    amazonCategoryInfo = categoryInfo
    console.log(`  🏆 Amazonベストセラー: ${amazonItems.length}件発見`)
  }

  if (kakakuOnly || allSources) {
    const { items: kakakuItems, categoryInfo } = await discoverFromKakaku(existingAsins)
    allDiscovered.push(...kakakuItems)
    // 価格.comからのカテゴリ情報も統合
    categoryInfo.forEach((info, asin) => {
      if (!amazonCategoryInfo.has(asin)) {
        amazonCategoryInfo.set(asin, info)
      }
    })
    console.log(`  💰 価格.com: ${kakakuItems.length}件発見`)
  }

  if (makuakeOnly || allSources) {
    const makuakeItems = await discoverFromMakuake(existingAsins)
    allDiscovered.push(...makuakeItems)
    console.log(`  🚀 Makuake: ${makuakeItems.length}件発見`)
  }

  // 重複を統合（同じASINは統合）
  const mergedItems: Map<string, DiscoveredItem> = new Map()
  for (const item of allDiscovered) {
    const existing = mergedItems.get(item.asin)
    if (existing) {
      existing.mentionCount += item.mentionCount
      existing.totalEngagement += item.totalEngagement
    } else {
      mergedItems.set(item.asin, { ...item })
    }
  }

  const uniqueDiscovered = Array.from(mergedItems.values())
    .sort((a, b) => b.mentionCount - a.mentionCount) // 言及数順

  console.log(`\n\n🎉 発見したアイテム合計: ${uniqueDiscovered.length}件\n`)

  if (uniqueDiscovered.length === 0) {
    console.log('新規アイテムは見つかりませんでした。')
    return
  }

  // 発見結果を表示
  console.log('=' .repeat(60))
  for (const item of uniqueDiscovered.slice(0, 30)) {
    console.log(`\n📍 ASIN: ${item.asin}`)
    console.log(`   ソース: ${item.sourceType}`)
    console.log(`   言及数: ${item.mentionCount}`)
    console.log(`   URL: ${item.sourceUrl}`)
  }

  if (uniqueDiscovered.length > 30) {
    console.log(`\n... 他 ${uniqueDiscovered.length - 30}件`)
  }

  // 保存モードの場合、商品情報を取得して保存
  if (saveMode) {
    console.log('\n\n📥 商品情報を取得中...\n')

    const newItems: Record<string, unknown>[] = []
    let fetchedCount = 0
    const maxFetch = 50 // 最大50件まで

    for (const discovered of uniqueDiscovered.slice(0, maxFetch)) {
      fetchedCount++
      console.log(`  [${fetchedCount}/${Math.min(uniqueDiscovered.length, maxFetch)}] ${discovered.asin}`)

      const productInfo = await fetchAmazonProductInfo(discovered.asin)

      if (productInfo && productInfo.title) {
        // Amazonベストセラーからのカテゴリ情報があれば使用
        const categoryOverride = amazonCategoryInfo.get(discovered.asin)
        const newItem = convertToItemFormat(productInfo, discovered, categoryOverride)
        newItems.push(newItem)

        // 画像状態をログ出力
        if (productInfo.imageUrl) {
          console.log(`    ✅ ${productInfo.title.substring(0, 40)}...`)
        } else {
          console.log(`    ⚠️ ${productInfo.title.substring(0, 40)}... (画像なし)`)
        }
      } else {
        console.log(`    ❌ 商品情報取得失敗`)
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    if (newItems.length > 0) {
      // 画像状態のサマリー
      const itemsWithImage = newItems.filter((item: Record<string, unknown>) => item.imageUrl)
      const itemsWithoutImage = newItems.filter((item: Record<string, unknown>) => !item.imageUrl)

      console.log(`\n📊 画像取得サマリー:`)
      console.log(`   ✅ 画像あり: ${itemsWithImage.length}件`)
      console.log(`   ⚠️ 画像なし: ${itemsWithoutImage.length}件`)

      if (itemsWithoutImage.length > 0) {
        console.log(`\n⚠️ 画像なしアイテム (要確認):`)
        for (const item of itemsWithoutImage.slice(0, 5) as Record<string, unknown>[]) {
          const amazon = item.amazon as Record<string, unknown>
          console.log(`   - ${(item.name as string).substring(0, 40)}... (${amazon?.asin})`)
        }
        if (itemsWithoutImage.length > 5) {
          console.log(`   ... 他 ${itemsWithoutImage.length - 5}件`)
        }
      }

      // 発見結果を保存
      const outputDir = path.join(__dirname, '../data/discovered')
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const timestamp = new Date().toISOString().split('T')[0]
      const outputPath = path.join(outputDir, `discovered-${timestamp}.json`)
      fs.writeFileSync(outputPath, JSON.stringify(newItems, null, 2))
      console.log(`\n💾 発見データを保存: ${outputPath}`)

      // items.jsonに追加するか確認用のログ
      console.log(`\n📝 items.jsonに追加するには:`)
      console.log(`   npx tsx scripts/merge-discovered-items.ts`)
    }
  } else {
    console.log('\n💡 商品情報を取得して保存するには --save オプションを使用してください')
  }

  console.log('\n=== アイテム自動発見 完了 ===')
}

main().catch(console.error)
