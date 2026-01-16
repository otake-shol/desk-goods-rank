/**
 * はてなブログからアイテムを発見するコレクター
 * 日本最大級のブログプラットフォーム、デスクツアー記事が豊富
 */

import { chromium } from 'playwright'
import { extractAsinsFromText, DiscoveredItem } from './item-discovery'
import { filterUnexploredArticles, addExploredUrls, getExploredSummary } from './explored-articles'

export interface HatenaArticle {
  url: string
  title: string
  bookmarks: number
}

/**
 * はてなブログ検索で記事を検索
 */
export async function searchHatenaArticles(query: string, maxResults: number = 20): Promise<HatenaArticle[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const articles: HatenaArticle[] = []

  try {
    // はてなブログ検索を使用
    const searchUrl = `https://search.hatena.ne.jp/search?q=${encodeURIComponent(query)}&users=3`
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // 検索結果から記事を抽出
    const results = await page.evaluate(() => {
      const items: Array<{
        url: string
        title: string
        bookmarks: number
      }> = []

      // 検索結果のアイテムを取得
      const searchItems = document.querySelectorAll('.search-result, .searchresult-entry, [class*="result"]')

      searchItems.forEach((item) => {
        const linkEl = item.querySelector('a[href*="hatenablog"], a[href*="hateblo.jp"], a.entry-link, h3 a, .entry-title a')
        const href = linkEl?.getAttribute('href')

        if (href && (href.includes('hatenablog') || href.includes('hateblo.jp') || href.includes('entry'))) {
          const titleEl = item.querySelector('h3, .entry-title, [class*="title"]')
          const bookmarkEl = item.querySelector('.users, [class*="bookmark"], [class*="user"]')

          const title = titleEl?.textContent?.trim() || linkEl?.textContent?.trim() || ''
          const bookmarkText = bookmarkEl?.textContent?.trim() || '0'
          const bookmarks = parseInt(bookmarkText.replace(/[^\d]/g, '')) || 0

          if (title && href) {
            items.push({ url: href, title, bookmarks })
          }
        }
      })

      return items
    })

    articles.push(...results.slice(0, maxResults))
  } catch (error) {
    console.error(`Failed to search Hatena for: ${query}`, error)
  } finally {
    await browser.close()
  }

  return articles
}

/**
 * はてなブックマーク人気エントリーからデスク関連記事を取得
 */
export async function getHatenaHotEntries(): Promise<HatenaArticle[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const articles: HatenaArticle[] = []

  const categories = ['it', 'life']

  try {
    for (const category of categories) {
      const url = `https://b.hatena.ne.jp/hotentry/${category}`
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(1500)

      const results = await page.evaluate(() => {
        const items: Array<{
          url: string
          title: string
          bookmarks: number
        }> = []

        const entries = document.querySelectorAll('.entrylist-contents, [class*="entry-link"]')

        entries.forEach((entry) => {
          const linkEl = entry.querySelector('a.entry-link, h3 a, [class*="title"] a')
          const href = linkEl?.getAttribute('href')

          if (href) {
            const titleEl = entry.querySelector('.entry-link, h3, [class*="title"]')
            const bookmarkEl = entry.querySelector('.entry-users-count, [class*="users"]')

            const title = titleEl?.textContent?.trim() || ''
            const bookmarkText = bookmarkEl?.textContent?.trim() || '0'
            const bookmarks = parseInt(bookmarkText.replace(/[^\d]/g, '')) || 0

            // デスク関連のキーワードでフィルタ
            const keywords = ['デスク', 'ガジェット', 'リモートワーク', '在宅', 'キーボード', 'マウス', 'モニター', '環境']
            if (keywords.some(kw => title.includes(kw))) {
              items.push({ url: href, title, bookmarks })
            }
          }
        })

        return items
      })

      articles.push(...results)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch (error) {
    console.error('Failed to fetch Hatena hot entries', error)
  } finally {
    await browser.close()
  }

  return articles
}

/**
 * はてなブログ記事本文からAmazonリンクを抽出
 */
export async function extractAsinsFromHatenaArticle(articleUrl: string): Promise<{
  asins: string[]
  title: string
  bookmarks: number
}> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(articleUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)

    const result = await page.evaluate(() => {
      // 記事タイトル
      const titleEl = document.querySelector('h1.entry-title, .entry-title, article h1, h1')
      const title = titleEl?.textContent?.trim() || ''

      // 本文からリンクを取得
      const articleBody = document.querySelector('.entry-content, article, .post-content, main')
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

      return { title, links, bodyText }
    })

    // リンクとテキストからASINを抽出
    const allText = [...result.links, result.bodyText].join(' ')
    const asins = extractAsinsFromText(allText)

    return {
      asins,
      title: result.title,
      bookmarks: 0, // 記事ページからは取得困難
    }
  } catch (error) {
    console.error(`Failed to fetch Hatena article: ${articleUrl}`, error)
    return { asins: [], title: '', bookmarks: 0 }
  } finally {
    await browser.close()
  }
}

/**
 * はてなブログからデスクツアー関連アイテムを発見
 */
export async function discoverItemsFromHatena(forceMode: boolean = false): Promise<DiscoveredItem[]> {
  const searchQueries = [
    // メインキーワード
    'デスクツアー',
    'デスク環境 紹介',
    'リモートワーク デスク',
    'ガジェット 買ってよかった',
    '在宅ワーク 環境',
    '作業環境 紹介',
    // 追加キーワード - 仕事・職種系
    'テレワーク 環境',
    '在宅勤務 デスク',
    'ホームオフィス',
    'エンジニア デスク',
    'デザイナー 作業環境',
    'フリーランス デスク',
    // 追加キーワード - 製品カテゴリ系
    '買ってよかった PC周辺機器',
    'おすすめ モニター',
    'おすすめ キーボード',
    'おすすめ マウス',
    '電動昇降デスク レビュー',
    'オフィスチェア おすすめ',
    // 追加キーワード - 年度別
    '2024 ベストバイ ガジェット',
    '2025 デスク環境',
    'ガジェット まとめ',
  ]

  const discoveredItems: Map<string, DiscoveredItem> = new Map()
  const processedUrls: Set<string> = new Set()
  const newlyProcessedUrls: string[] = []

  console.log('Searching Hatena Blog articles...')

  // 探索済み記事数を表示
  if (!forceMode) {
    const summary = getExploredSummary()
    if (summary.hatena > 0) {
      console.log(`  📊 ${summary.hatena}件の探索済み記事があります`)
    }
  }

  // 検索からの記事
  for (const query of searchQueries) {
    console.log(`  Searching: ${query}`)
    const allArticles = await searchHatenaArticles(query, 10)
    console.log(`  Found ${allArticles.length} articles`)

    // 探索済み記事をフィルタリング
    const { unexplored: articles, skipped } = forceMode
      ? { unexplored: allArticles, skipped: 0 }
      : filterUnexploredArticles('hatena', allArticles)

    if (skipped > 0) {
      console.log(`  ⏭️  ${skipped}件の探索済み記事をスキップ`)
    }

    for (const article of articles) {
      if (processedUrls.has(article.url)) continue
      processedUrls.add(article.url)

      console.log(`  Processing: ${article.title.substring(0, 40)}...`)
      const { asins, title, bookmarks } = await extractAsinsFromHatenaArticle(article.url)
      newlyProcessedUrls.push(article.url)

      if (asins.length > 0) {
        console.log(`    Found ${asins.length} ASINs`)
      }

      for (const asin of asins) {
        const existing = discoveredItems.get(asin)
        if (existing) {
          existing.mentionCount++
          existing.totalEngagement += article.bookmarks || bookmarks
        } else {
          discoveredItems.set(asin, {
            asin,
            sourceType: 'hatena' as const,
            sourceUrl: article.url,
            sourceTitle: title || article.title,
            mentionCount: 1,
            totalEngagement: article.bookmarks || bookmarks,
          })
        }
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // ホットエントリーからも取得
  console.log('Fetching Hatena hot entries...')
  const allHotArticles = await getHatenaHotEntries()
  console.log(`  Found ${allHotArticles.length} relevant hot entries`)

  // 探索済みホットエントリーをフィルタリング
  const { unexplored: hotArticles, skipped: hotSkipped } = forceMode
    ? { unexplored: allHotArticles, skipped: 0 }
    : filterUnexploredArticles('hatena', allHotArticles)

  if (hotSkipped > 0) {
    console.log(`  ⏭️  ${hotSkipped}件の探索済みホットエントリーをスキップ`)
  }

  for (const article of hotArticles) {
    if (processedUrls.has(article.url)) continue
    processedUrls.add(article.url)

    console.log(`  Processing hot: ${article.title.substring(0, 40)}...`)
    const { asins, title } = await extractAsinsFromHatenaArticle(article.url)
    newlyProcessedUrls.push(article.url)

    if (asins.length > 0) {
      console.log(`    Found ${asins.length} ASINs`)
    }

    for (const asin of asins) {
      const existing = discoveredItems.get(asin)
      if (existing) {
        existing.mentionCount++
        existing.totalEngagement += article.bookmarks
      } else {
        discoveredItems.set(asin, {
          asin,
          sourceType: 'hatena' as const,
          sourceUrl: article.url,
          sourceTitle: title || article.title,
          mentionCount: 1,
          totalEngagement: article.bookmarks,
        })
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // 探索済みURLを保存
  if (newlyProcessedUrls.length > 0) {
    addExploredUrls('hatena', newlyProcessedUrls)
    console.log(`  💾 ${newlyProcessedUrls.length}件の記事を探索済みとして保存`)
  }

  console.log(`Discovered ${discoveredItems.size} unique items from Hatena`)
  return Array.from(discoveredItems.values())
}
