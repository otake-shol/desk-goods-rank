/**
 * Makuakeからアイテムを発見するコレクター
 * クラウドファンディングの新製品・話題のガジェットを取得
 */

import { chromium } from 'playwright'
import { extractAsinsFromText, DiscoveredItem } from './item-discovery'

export interface MakuakeProject {
  projectId: string
  title: string
  description: string
  supporterCount: number
  totalAmount: number
  imageUrl: string | null
  projectUrl: string
  categoryName: string
  amazonAsin: string | null
}

// Makuakeのカテゴリ（デスク環境関連）
const MAKUAKE_CATEGORIES = [
  {
    name: 'ガジェット',
    url: 'https://www.makuake.com/discover/gadget/',
    keywords: ['デスク', 'キーボード', 'マウス', 'モニター', 'ライト', 'チェア', 'オフィス'],
  },
  {
    name: 'プロダクト',
    url: 'https://www.makuake.com/discover/product/',
    keywords: ['デスク', 'ワーク', 'オフィス', 'PC', 'パソコン'],
  },
  {
    name: 'テクノロジー',
    url: 'https://www.makuake.com/discover/technology/',
    keywords: ['デスク', 'モニター', 'スピーカー', 'ヘッドホン', 'マイク'],
  },
]

/**
 * Makuakeカテゴリページからプロジェクトを取得
 */
export async function fetchMakuakeProjects(
  categoryUrl: string,
  categoryName: string,
  keywords: string[],
  maxItems: number = 30
): Promise<MakuakeProject[]> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ja-JP',
  })
  const page = await context.newPage()

  const projects: MakuakeProject[] = []

  try {
    await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)

    // スクロールして追加コンテンツを読み込む
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight))
      await page.waitForTimeout(1000)
    }

    // プロジェクトリストを取得
    const results = await page.evaluate((keywords: string[]) => {
      const items: Array<{
        projectId: string
        title: string
        description: string
        supporterCount: number
        totalAmount: number
        imageUrl: string | null
        projectUrl: string
      }> = []

      // プロジェクトカードを取得
      const projectCards = document.querySelectorAll('[class*="project"], [class*="card"], article')

      projectCards.forEach((card) => {
        // プロジェクトリンク
        const linkEl = card.querySelector('a[href*="/project/"]') as HTMLAnchorElement
        const href = linkEl?.href || ''
        const projectIdMatch = href.match(/\/project\/([^/?]+)/)
        const projectId = projectIdMatch?.[1] || ''

        // タイトル
        const titleEl = card.querySelector('h2, h3, [class*="title"], [class*="name"]')
        const title = titleEl?.textContent?.trim() || ''

        // 説明
        const descEl = card.querySelector('p, [class*="desc"], [class*="summary"]')
        const description = descEl?.textContent?.trim() || ''

        // サポーター数
        const supporterEl = card.querySelector('[class*="supporter"], [class*="backer"]')
        const supporterText = supporterEl?.textContent?.replace(/[^\d]/g, '') || '0'
        const supporterCount = parseInt(supporterText) || 0

        // 金額
        const amountEl = card.querySelector('[class*="amount"], [class*="total"], [class*="raised"]')
        const amountText = amountEl?.textContent?.replace(/[^\d]/g, '') || '0'
        const totalAmount = parseInt(amountText) || 0

        // 画像
        const imgEl = card.querySelector('img') as HTMLImageElement
        const imageUrl = imgEl?.src || null

        // キーワードフィルタ
        const text = `${title} ${description}`.toLowerCase()
        const isRelevant = keywords.some(kw => text.includes(kw.toLowerCase()))

        if (projectId && title && isRelevant) {
          items.push({
            projectId,
            title,
            description,
            supporterCount,
            totalAmount,
            imageUrl,
            projectUrl: href || `https://www.makuake.com/project/${projectId}/`,
          })
        }
      })

      return items
    }, keywords)

    projects.push(...results.slice(0, maxItems).map(p => ({
      ...p,
      categoryName,
      amazonAsin: null,
    })))
  } catch (error) {
    console.error(`Failed to fetch Makuake projects: ${categoryName}`, error)
  } finally {
    await browser.close()
  }

  return projects
}

/**
 * Makuakeプロジェクトページから関連Amazonリンクを取得
 * （プロジェクト終了後にAmazon販売されているケースがある）
 */
export async function fetchAsinFromMakuakeProject(projectUrl: string): Promise<string | null> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ja-JP',
  })
  const page = await context.newPage()

  try {
    await page.goto(projectUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)

    // プロジェクトページからAmazonリンクを探す
    const amazonAsin = await page.evaluate(() => {
      // 本文内のリンク
      const links = Array.from(document.querySelectorAll('a[href*="amazon.co.jp"], a[href*="amzn"]'))
      for (const link of links) {
        const href = link.getAttribute('href') || ''
        const match = href.match(/\/dp\/([A-Z0-9]{10})/) ||
                      href.match(/\/gp\/product\/([A-Z0-9]{10})/)
        if (match) {
          return match[1]
        }
      }

      // 本文テキストからURLを抽出
      const bodyText = document.body.textContent || ''
      const urlMatch = bodyText.match(/amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)
      if (urlMatch) {
        return urlMatch[1]
      }

      return null
    })

    return amazonAsin
  } catch (error) {
    console.error(`Failed to fetch ASIN from Makuake project: ${projectUrl}`, error)
    return null
  } finally {
    await browser.close()
  }
}

/**
 * Makuake人気プロジェクト検索
 */
export async function searchMakuakeByKeyword(keyword: string, maxItems: number = 20): Promise<MakuakeProject[]> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ja-JP',
  })
  const page = await context.newPage()
  const projects: MakuakeProject[] = []

  try {
    const searchUrl = `https://www.makuake.com/discover/?keyword=${encodeURIComponent(keyword)}`
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)

    const results = await page.evaluate(() => {
      const items: Array<{
        projectId: string
        title: string
        description: string
        supporterCount: number
        totalAmount: number
        imageUrl: string | null
        projectUrl: string
      }> = []

      const projectCards = document.querySelectorAll('[class*="project"], [class*="card"], article, a[href*="/project/"]')

      projectCards.forEach((card) => {
        const linkEl = card.closest('a[href*="/project/"]') || card.querySelector('a[href*="/project/"]')
        const href = (linkEl as HTMLAnchorElement)?.href || ''
        const projectIdMatch = href.match(/\/project\/([^/?]+)/)
        const projectId = projectIdMatch?.[1] || ''

        const titleEl = card.querySelector('h2, h3, [class*="title"]') || card
        const title = titleEl?.textContent?.trim().substring(0, 100) || ''

        const supporterEl = card.querySelector('[class*="supporter"]')
        const supporterText = supporterEl?.textContent?.replace(/[^\d]/g, '') || '0'
        const supporterCount = parseInt(supporterText) || 0

        const amountEl = card.querySelector('[class*="amount"]')
        const amountText = amountEl?.textContent?.replace(/[^\d]/g, '') || '0'
        const totalAmount = parseInt(amountText) || 0

        const imgEl = card.querySelector('img') as HTMLImageElement
        const imageUrl = imgEl?.src || null

        if (projectId && title && !items.some(i => i.projectId === projectId)) {
          items.push({
            projectId,
            title,
            description: '',
            supporterCount,
            totalAmount,
            imageUrl,
            projectUrl: href || `https://www.makuake.com/project/${projectId}/`,
          })
        }
      })

      return items
    })

    projects.push(...results.slice(0, maxItems).map(p => ({
      ...p,
      categoryName: `検索: ${keyword}`,
      amazonAsin: null,
    })))
  } catch (error) {
    console.error(`Failed to search Makuake for: ${keyword}`, error)
  } finally {
    await browser.close()
  }

  return projects
}

/**
 * Makuakeからデスク関連プロジェクトを発見
 */
export async function discoverItemsFromMakuake(): Promise<DiscoveredItem[]> {
  const searchKeywords = [
    'デスク',
    'キーボード',
    'モニター',
    'チェア オフィス',
    'ガジェット PC',
    'ワークスペース',
    'スタンディングデスク',
  ]

  const allProjects: MakuakeProject[] = []
  const processedIds = new Set<string>()

  console.log('Searching Makuake projects...')

  // キーワード検索
  for (const keyword of searchKeywords) {
    console.log(`  Searching: ${keyword}`)
    const projects = await searchMakuakeByKeyword(keyword, 15)
    console.log(`    Found ${projects.length} projects`)

    for (const project of projects) {
      if (!processedIds.has(project.projectId)) {
        processedIds.add(project.projectId)
        allProjects.push(project)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log(`Total unique Makuake projects: ${allProjects.length}`)

  // 人気順にソート
  allProjects.sort((a, b) => b.supporterCount - a.supporterCount)

  // 上位プロジェクトからASINを取得
  const discoveredItems: DiscoveredItem[] = []
  const topProjects = allProjects.slice(0, 20)

  console.log('Fetching ASINs from top projects...')
  for (const project of topProjects) {
    console.log(`  Processing: ${project.title.substring(0, 40)}...`)
    const asin = await fetchAsinFromMakuakeProject(project.projectUrl)

    if (asin) {
      console.log(`    ASIN: ${asin}`)
      discoveredItems.push({
        asin,
        sourceType: 'makuake' as const,
        sourceUrl: project.projectUrl,
        sourceTitle: `Makuake: ${project.title.substring(0, 50)}`,
        mentionCount: 1,
        totalEngagement: project.supporterCount,
      })
    }

    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // 重複除去
  const uniqueItems = new Map<string, DiscoveredItem>()
  for (const item of discoveredItems) {
    if (!uniqueItems.has(item.asin)) {
      uniqueItems.set(item.asin, item)
    }
  }

  console.log(`Discovered ${uniqueItems.size} unique items from Makuake`)
  return Array.from(uniqueItems.values())
}
