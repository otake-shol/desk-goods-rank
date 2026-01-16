/**
 * 価格.comからアイテムを発見するコレクター
 * PC周辺機器のランキング・レビュー情報を取得
 */

import { chromium } from 'playwright'
import { extractAsinsFromText, DiscoveredItem } from './item-discovery'

export interface KakakuItem {
  productId: string
  name: string
  price: number | null
  rating: number | null
  reviewCount: number
  rank: number
  productUrl: string
  categoryName: string
  amazonAsin: string | null
}

// 価格.comのカテゴリ（デスク環境関連）
const KAKAKU_CATEGORIES = [
  {
    name: 'キーボード',
    url: 'https://kakaku.com/pc/keyboard/ranking_0150/',
    category: 'device',
    subCategory: 'keyboard',
  },
  {
    name: 'マウス',
    url: 'https://kakaku.com/pc/mouse/ranking_0160/',
    category: 'device',
    subCategory: 'mouse',
  },
  {
    name: 'トラックボール',
    url: 'https://kakaku.com/pc/trackball/ranking_0161/',
    category: 'device',
    subCategory: 'trackball',
  },
  {
    name: 'PCモニター・液晶ディスプレイ',
    url: 'https://kakaku.com/pc/lcd-monitor/ranking_0085/',
    category: 'device',
    subCategory: 'monitor',
  },
  {
    name: 'モニターアーム',
    url: 'https://kakaku.com/pc/monitor-arm/ranking_0129/',
    category: 'furniture',
    subCategory: 'monitor-arm',
  },
  {
    name: 'ヘッドセット',
    url: 'https://kakaku.com/pc/headset/ranking_0162/',
    category: 'device',
    subCategory: 'headphone',
  },
  {
    name: 'Webカメラ',
    url: 'https://kakaku.com/pc/web-camera/ranking_0117/',
    category: 'device',
    subCategory: 'webcam',
  },
  {
    name: 'PCスピーカー',
    url: 'https://kakaku.com/pc/pc-speaker/ranking_0170/',
    category: 'device',
    subCategory: 'speaker',
  },
  {
    name: 'USBハブ',
    url: 'https://kakaku.com/pc/usb-hub/ranking_0124/',
    category: 'accessory',
    subCategory: 'hub',
  },
  {
    name: 'デスクライト',
    url: 'https://kakaku.com/kaden/desklamp/ranking_2170/',
    category: 'lighting',
    subCategory: 'desk-light',
  },
]

/**
 * 価格.comランキングページから商品リストを取得
 */
export async function fetchKakakuRanking(
  categoryUrl: string,
  categoryName: string,
  maxItems: number = 20
): Promise<KakakuItem[]> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ja-JP',
  })
  const page = await context.newPage()

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ja-JP,ja;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  })

  const items: KakakuItem[] = []

  try {
    await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)

    // ランキングリストから商品を抽出
    const results = await page.evaluate((maxItems: number) => {
      const products: Array<{
        productId: string
        name: string
        price: number | null
        rating: number | null
        reviewCount: number
        rank: number
        productUrl: string
      }> = []

      // 商品リンクを取得
      const itemLinks = Array.from(document.querySelectorAll('a[href*="/item/K"]'))
      const seenIds = new Set<string>()
      let rank = 1

      for (const link of itemLinks) {
        if (products.length >= maxItems) break

        const href = (link as HTMLAnchorElement).href
        const productIdMatch = href.match(/\/item\/(K[0-9]+)/)
        const productId = productIdMatch?.[1] || ''

        // 重複スキップ
        if (!productId || seenIds.has(productId)) continue
        seenIds.add(productId)

        // リンクテキストから商品名を抽出
        const linkText = link.textContent?.trim() || ''
        // 「1位」などのランキング表示を除去
        const nameMatch = linkText.match(/^\d+位[\s\S]*?\n\s*(.+)/)
        const rawName = nameMatch ? nameMatch[1] : linkText

        // 複数行の場合、メーカー名と商品名を結合
        const lines = rawName.split('\n').map(l => l.trim()).filter(l => l)
        const name = lines.slice(0, 2).join(' ')

        // 価格を含むリンクから価格を抽出
        const priceMatch = linkText.match(/¥([\d,]+)/)
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null

        if (name && !name.startsWith('¥') && name.length > 2) {
          products.push({
            productId,
            name: name.substring(0, 100),
            price,
            rating: null,
            reviewCount: 0,
            rank: rank++,
            productUrl: `https://kakaku.com/item/${productId}/`,
          })
        }
      }

      return products
    }, maxItems)

    items.push(...results.map(item => ({
      ...item,
      categoryName,
      amazonAsin: null,
    })))
  } catch (error) {
    console.error(`Failed to fetch Kakaku ranking: ${categoryName}`, error)
  } finally {
    await browser.close()
  }

  return items
}

/**
 * 価格.com商品詳細ページからAmazon ASINを取得
 */
export async function fetchAsinFromKakakuProduct(productUrl: string): Promise<string | null> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ja-JP',
  })
  const page = await context.newPage()

  try {
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)

    // 販売店リンクからAmazonリンクを探す
    const amazonLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="amazon.co.jp"], a[href*="amzn"]'))
      for (const link of links) {
        const href = link.getAttribute('href') || ''
        // ASINを抽出
        const match = href.match(/\/dp\/([A-Z0-9]{10})/) ||
                      href.match(/\/gp\/product\/([A-Z0-9]{10})/)
        if (match) {
          return match[1]
        }
      }
      return null
    })

    return amazonLink
  } catch (error) {
    console.error(`Failed to fetch ASIN from Kakaku product: ${productUrl}`, error)
    return null
  } finally {
    await browser.close()
  }
}

/**
 * 複数カテゴリの価格.comランキングを取得
 */
export async function fetchAllKakakuRankings(): Promise<{
  items: KakakuItem[]
  categoryInfo: Map<string, { category: string; subCategory: string }>
}> {
  const allItems: KakakuItem[] = []
  const categoryInfo = new Map<string, { category: string; subCategory: string }>()

  console.log('Fetching Kakaku.com rankings...')

  for (const cat of KAKAKU_CATEGORIES) {
    console.log(`  Category: ${cat.name}`)
    const items = await fetchKakakuRanking(cat.url, cat.name, 15)
    console.log(`    Found ${items.length} items`)

    // 各商品からASINを取得
    for (const item of items.slice(0, 10)) { // 上位10件のみASIN取得
      console.log(`    Fetching ASIN for: ${item.name.substring(0, 30)}...`)
      const asin = await fetchAsinFromKakakuProduct(item.productUrl)

      if (asin) {
        item.amazonAsin = asin
        categoryInfo.set(asin, {
          category: cat.category,
          subCategory: cat.subCategory,
        })
        console.log(`      ASIN: ${asin}`)
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    allItems.push(...items)

    // カテゴリ間の待機
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log(`Total Kakaku items: ${allItems.length}`)
  return { items: allItems, categoryInfo }
}

/**
 * 価格.comデータをDiscoveredItem形式に変換
 */
export function convertKakakuToDiscovered(item: KakakuItem): DiscoveredItem | null {
  if (!item.amazonAsin) return null

  return {
    asin: item.amazonAsin,
    sourceType: 'kakaku' as const,
    sourceUrl: item.productUrl,
    sourceTitle: `価格.com ${item.categoryName} ランキング #${item.rank}`,
    mentionCount: 1,
    totalEngagement: item.reviewCount,
  }
}

/**
 * 価格.comからアイテムを発見
 */
export async function discoverItemsFromKakaku(): Promise<{
  items: DiscoveredItem[]
  categoryInfo: Map<string, { category: string; subCategory: string }>
}> {
  const { items: kakakuItems, categoryInfo } = await fetchAllKakakuRankings()

  // ASINが取得できたアイテムのみ変換
  const discoveredItems: DiscoveredItem[] = []

  for (const item of kakakuItems) {
    const discovered = convertKakakuToDiscovered(item)
    if (discovered) {
      discoveredItems.push(discovered)
    }
  }

  // 重複除去
  const uniqueItems = new Map<string, DiscoveredItem>()
  for (const item of discoveredItems) {
    const existing = uniqueItems.get(item.asin)
    if (!existing) {
      uniqueItems.set(item.asin, item)
    } else {
      existing.mentionCount++
      existing.totalEngagement = Math.max(existing.totalEngagement, item.totalEngagement)
    }
  }

  console.log(`Discovered ${uniqueItems.size} unique items from Kakaku.com`)
  return {
    items: Array.from(uniqueItems.values()),
    categoryInfo,
  }
}
