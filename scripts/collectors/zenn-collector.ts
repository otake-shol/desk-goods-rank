/**
 * Zenn記事からアイテムを発見するコレクター
 * エンジニア向けデスク環境・ガジェット記事が豊富
 */

import { chromium, Browser, Page } from 'playwright'
import { extractAsinsFromText, DiscoveredItem } from './item-discovery'
import { filterUnexploredArticles, addExploredUrls, getExploredSummary } from './explored-articles'

export interface ZennArticle {
  url: string
  title: string
  author: string
  likes: number
}

/**
 * Zennでデスクツアー関連記事を検索
 */
export async function searchZennArticles(query: string, maxResults: number = 20): Promise<ZennArticle[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const articles: ZennArticle[] = []

  try {
    const searchUrl = `https://zenn.dev/search?q=${encodeURIComponent(query)}&source=articles`
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // 検索結果から記事を抽出
    const results = await page.evaluate(() => {
      const items: Array<{
        url: string
        title: string
        author: string
        likes: number
      }> = []

      // Zennの検索結果の記事カードを取得
      const articleCards = document.querySelectorAll('article, [class*="ArticleCard"], a[href*="/articles/"]')

      articleCards.forEach((card) => {
        const linkEl = card.querySelector('a[href*="/articles/"]') || (card.tagName === 'A' ? card : null)
        const href = linkEl?.getAttribute('href')

        if (href && href.includes('/articles/')) {
          const titleEl = card.querySelector('h2, h3, [class*="title"]')
          const authorEl = card.querySelector('[class*="author"], [class*="user"]')
          const likesEl = card.querySelector('[class*="like"], [class*="heart"]')

          const url = href.startsWith('http') ? href : `https://zenn.dev${href}`
          const title = titleEl?.textContent?.trim() || ''
          const author = authorEl?.textContent?.trim() || ''
          const likesText = likesEl?.textContent?.trim() || '0'
          const likes = parseInt(likesText.replace(/[^\d]/g, '')) || 0

          if (title && !items.some(i => i.url === url)) {
            items.push({ url, title, author, likes })
          }
        }
      })

      return items
    })

    articles.push(...results.slice(0, maxResults))
  } catch (error) {
    console.error(`Failed to search Zenn for: ${query}`, error)
  } finally {
    await browser.close()
  }

  return articles
}

/**
 * Zenn記事本文からAmazonリンクを抽出
 */
export async function extractAsinsFromZennArticle(articleUrl: string): Promise<{
  asins: string[]
  title: string
  likes: number
}> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(articleUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)

    const result = await page.evaluate(() => {
      // 記事タイトル
      const titleEl = document.querySelector('h1, [class*="ArticleHeader"] h1')
      const title = titleEl?.textContent?.trim() || ''

      // いいね数
      const likesEl = document.querySelector('[class*="like"] span, [class*="heart"] span')
      const likesText = likesEl?.textContent?.trim() || '0'
      const likes = parseInt(likesText.replace(/[^\d]/g, '')) || 0

      // 記事本文からリンクを取得
      const articleBody = document.querySelector('article, [class*="ArticleBody"], .znc')
      const links: string[] = []

      if (articleBody) {
        const anchors = articleBody.querySelectorAll('a')
        anchors.forEach(a => {
          const href = a.getAttribute('href')
          if (href) links.push(href)
        })
      }

      // 本文テキストも取得
      const bodyText = articleBody?.textContent || ''

      return { title, likes, links, bodyText }
    })

    // リンクとテキストからASINを抽出
    const allText = [...result.links, result.bodyText].join(' ')
    const asins = extractAsinsFromText(allText)

    return {
      asins,
      title: result.title,
      likes: result.likes,
    }
  } catch (error) {
    console.error(`Failed to fetch Zenn article: ${articleUrl}`, error)
    return { asins: [], title: '', likes: 0 }
  } finally {
    await browser.close()
  }
}

/**
 * Zennからデスクツアー関連アイテムを発見
 */
export async function discoverItemsFromZenn(forceMode: boolean = false): Promise<DiscoveredItem[]> {
  const searchQueries = [
    // メインキーワード
    'デスクツアー',
    'デスク環境',
    'デスクセットアップ',
    'ガジェット 紹介',
    'リモートワーク 環境',
    '在宅ワーク デスク',
    '開発環境 デスク',
    'エンジニア デスク',
    // 追加キーワード - 仕事・職種系
    'テレワーク 環境',
    '在宅勤務 デスク',
    'ホームオフィス 紹介',
    'デザイナー デスク',
    'ライター 仕事環境',
    'フリーランス 作業環境',
    // 追加キーワード - 製品カテゴリ系
    '買ってよかった ガジェット',
    'おすすめ ガジェット',
    'モニター おすすめ',
    'キーボード レビュー',
    'マウス おすすめ',
    '電動昇降デスク',
    'オフィスチェア おすすめ',
    'モニターアーム',
    // 追加キーワード - 年度別
    '2024 ガジェット',
    '2025 デスク環境',
    'ベストバイ ガジェット',
  ]

  const discoveredItems: Map<string, DiscoveredItem> = new Map()
  const processedUrls: Set<string> = new Set()
  const newlyProcessedUrls: string[] = []

  console.log('Searching Zenn articles...')

  // 探索済み記事数を表示
  if (!forceMode) {
    const summary = getExploredSummary()
    if (summary.zenn > 0) {
      console.log(`  📊 ${summary.zenn}件の探索済み記事があります`)
    }
  }

  for (const query of searchQueries) {
    console.log(`  Searching: ${query}`)
    const allArticles = await searchZennArticles(query, 15)
    console.log(`  Found ${allArticles.length} articles`)

    // 探索済み記事をフィルタリング
    const { unexplored: articles, skipped } = forceMode
      ? { unexplored: allArticles, skipped: 0 }
      : filterUnexploredArticles('zenn', allArticles)

    if (skipped > 0) {
      console.log(`  ⏭️  ${skipped}件の探索済み記事をスキップ`)
    }

    for (const article of articles) {
      // 重複チェック（同一実行内）
      if (processedUrls.has(article.url)) continue
      processedUrls.add(article.url)

      console.log(`  Processing: ${article.title.substring(0, 40)}...`)
      const { asins, title, likes } = await extractAsinsFromZennArticle(article.url)
      newlyProcessedUrls.push(article.url)

      if (asins.length > 0) {
        console.log(`    Found ${asins.length} ASINs`)
      }

      for (const asin of asins) {
        const existing = discoveredItems.get(asin)
        if (existing) {
          existing.mentionCount++
          existing.totalEngagement += likes
        } else {
          discoveredItems.set(asin, {
            asin,
            sourceType: 'zenn' as const,
            sourceUrl: article.url,
            sourceTitle: title || article.title,
            mentionCount: 1,
            totalEngagement: likes,
          })
        }
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }

  // 探索済みURLを保存
  if (newlyProcessedUrls.length > 0) {
    addExploredUrls('zenn', newlyProcessedUrls)
    console.log(`  💾 ${newlyProcessedUrls.length}件の記事を探索済みとして保存`)
  }

  console.log(`Discovered ${discoveredItems.size} unique items from Zenn`)
  return Array.from(discoveredItems.values())
}
