/**
 * Amazonベストセラーからアイテムを発見するコレクター
 * PC周辺機器、オフィス家具カテゴリのランキングから人気商品を取得
 */

import { chromium } from 'playwright'
import { DiscoveredItem } from './item-discovery'

export interface AmazonBestsellerItem {
  asin: string
  title: string
  price: number | null
  rank: number
  rating: number | null
  reviewCount: number
  imageUrl: string | null
  categoryName: string
}

// Amazonベストセラーのカテゴリ（デスク環境関連）
const BESTSELLER_CATEGORIES = [
  // === 入力デバイス ===
  {
    name: 'PC用キーボード',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151901051',
    category: 'device',
    subCategory: 'keyboard',
  },
  {
    name: 'PC用マウス',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151946051',
    category: 'device',
    subCategory: 'mouse',
  },
  {
    name: 'トラックボール',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151947051',
    category: 'device',
    subCategory: 'trackball',
  },
  {
    name: 'リストレスト',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151973051',
    category: 'accessory',
    subCategory: 'wristrest',
  },
  // === ディスプレイ関連 ===
  {
    name: 'ディスプレイ',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151582051',
    category: 'device',
    subCategory: 'monitor',
  },
  {
    name: 'モニターアーム',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151983051',
    category: 'furniture',
    subCategory: 'monitor-arm',
  },
  {
    name: 'モニター台',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151984051',
    category: 'furniture',
    subCategory: 'monitor-stand',
  },
  // === オーディオ・通話 ===
  {
    name: 'PC用ヘッドセット',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151909051',
    category: 'device',
    subCategory: 'headphone',
  },
  {
    name: 'イヤホン・ヘッドホン',
    url: 'https://www.amazon.co.jp/gp/bestsellers/electronics/3477981',
    category: 'device',
    subCategory: 'earphone',
  },
  {
    name: 'ワイヤレスイヤホン',
    url: 'https://www.amazon.co.jp/gp/bestsellers/electronics/16410941',
    category: 'device',
    subCategory: 'wireless-earphone',
  },
  {
    name: 'Webカメラ',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151963051',
    category: 'device',
    subCategory: 'webcam',
  },
  {
    name: 'PCマイク',
    url: 'https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2285465051',
    category: 'device',
    subCategory: 'microphone',
  },
  {
    name: 'PCスピーカー',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151914051',
    category: 'device',
    subCategory: 'speaker',
  },
  // === 接続・ハブ ===
  {
    name: 'USBハブ',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151953051',
    category: 'accessory',
    subCategory: 'hub',
  },
  {
    name: 'ドッキングステーション',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151986051',
    category: 'accessory',
    subCategory: 'dock',
  },
  // === 照明 ===
  {
    name: 'デスクライト',
    url: 'https://www.amazon.co.jp/gp/bestsellers/kitchen/5765350051',
    category: 'lighting',
    subCategory: 'desk-light',
  },
  {
    name: 'クリップライト',
    url: 'https://www.amazon.co.jp/gp/bestsellers/kitchen/5765351051',
    category: 'lighting',
    subCategory: 'clip-light',
  },
  // === 家具 ===
  {
    name: 'オフィスチェア',
    url: 'https://www.amazon.co.jp/gp/bestsellers/kitchen/89104051',
    category: 'furniture',
    subCategory: 'chair',
  },
  {
    name: 'パソコンデスク',
    url: 'https://www.amazon.co.jp/gp/bestsellers/kitchen/89103051',
    category: 'furniture',
    subCategory: 'desk',
  },
  {
    name: 'デスクワゴン',
    url: 'https://www.amazon.co.jp/gp/bestsellers/kitchen/89099051',
    category: 'furniture',
    subCategory: 'wagon',
  },
  // === アクセサリー ===
  {
    name: 'デスクマット',
    url: 'https://www.amazon.co.jp/gp/bestsellers/office-products/86732051',
    category: 'accessory',
    subCategory: 'desk-mat',
  },
  {
    name: 'ケーブルボックス',
    url: 'https://www.amazon.co.jp/gp/bestsellers/home/2546090051',
    category: 'accessory',
    subCategory: 'cable-box',
  },
  {
    name: 'ノートPCスタンド',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151972051',
    category: 'accessory',
    subCategory: 'laptop-stand',
  },
  // === その他デバイス ===
  {
    name: '外付けSSD',
    url: 'https://www.amazon.co.jp/gp/bestsellers/computers/2151962051',
    category: 'device',
    subCategory: 'ssd',
  },
  {
    name: '電卓',
    url: 'https://www.amazon.co.jp/gp/bestsellers/office-products/86743051',
    category: 'accessory',
    subCategory: 'calculator',
  },
]

/**
 * Amazonベストセラーページから商品リストを取得
 */
export async function fetchBestsellerCategory(
  categoryUrl: string,
  categoryName: string,
  maxItems: number = 20
): Promise<AmazonBestsellerItem[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // ユーザーエージェントを設定
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ja-JP,ja;q=0.9',
  })

  const items: AmazonBestsellerItem[] = []

  try {
    await page.goto(categoryUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // ベストセラーリストから商品を抽出
    const results = await page.evaluate((maxItems: number) => {
      const products: Array<{
        asin: string
        title: string
        price: number | null
        rank: number
        rating: number | null
        reviewCount: number
        imageUrl: string | null
      }> = []

      // ベストセラーの商品カードを取得
      const productCards = document.querySelectorAll('[data-asin], .zg-grid-general-faceout, .p13n-sc-uncoverable-faceout')

      let rank = 1
      productCards.forEach((card) => {
        if (products.length >= maxItems) return

        // ASINを取得
        const asin = card.getAttribute('data-asin') ||
          card.querySelector('a[href*="/dp/"]')?.getAttribute('href')?.match(/\/dp\/([A-Z0-9]{10})/)?.[1]

        if (!asin || asin.length !== 10) return

        // タイトル
        const titleEl = card.querySelector('.p13n-sc-truncate, ._cDEzb_p13n-sc-css-line-clamp-1_1Fn1y, .a-link-normal span, a[title]')
        const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || ''

        // 価格
        const priceEl = card.querySelector('.p13n-sc-price, ._cDEzb_p13n-sc-price_3mJ9Z, .a-price-whole')
        const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || ''
        const price = priceText ? parseInt(priceText) : null

        // 評価
        const ratingEl = card.querySelector('.a-icon-alt, [class*="a-icon-star"]')
        const ratingText = ratingEl?.textContent?.match(/(\d+\.?\d*)/)?.[1]
        const rating = ratingText ? parseFloat(ratingText) : null

        // レビュー数
        const reviewEl = card.querySelector('.a-size-small:last-of-type, [class*="review"]')
        const reviewText = reviewEl?.textContent?.replace(/[^\d]/g, '') || '0'
        const reviewCount = parseInt(reviewText) || 0

        // 画像URL
        const imgEl = card.querySelector('img')
        const imageUrl = imgEl?.src || null

        if (title && asin) {
          products.push({
            asin,
            title,
            price,
            rank: rank++,
            rating,
            reviewCount,
            imageUrl,
          })
        }
      })

      return products
    }, maxItems)

    items.push(...results.map(item => ({ ...item, categoryName })))
  } catch (error) {
    console.error(`Failed to fetch bestseller category: ${categoryName}`, error)
  } finally {
    await browser.close()
  }

  return items
}

/**
 * 複数カテゴリのベストセラーを取得
 */
export async function fetchAllBestsellers(): Promise<{
  items: AmazonBestsellerItem[]
  categoryInfo: Map<string, { category: string; subCategory: string }>
}> {
  const allItems: AmazonBestsellerItem[] = []
  const categoryInfo = new Map<string, { category: string; subCategory: string }>()

  console.log('Fetching Amazon bestsellers...')

  for (const cat of BESTSELLER_CATEGORIES) {
    console.log(`  Category: ${cat.name}`)
    const items = await fetchBestsellerCategory(cat.url, cat.name, 15)
    console.log(`    Found ${items.length} items`)

    for (const item of items) {
      categoryInfo.set(item.asin, {
        category: cat.category,
        subCategory: cat.subCategory,
      })
    }

    allItems.push(...items)

    // レート制限対策
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  console.log(`Total bestseller items: ${allItems.length}`)
  return { items: allItems, categoryInfo }
}

/**
 * ベストセラーデータをDiscoveredItem形式に変換
 */
export function convertBestsellerToDiscovered(item: AmazonBestsellerItem): DiscoveredItem {
  return {
    asin: item.asin,
    sourceType: 'amazon-bestseller' as const,
    sourceUrl: `https://www.amazon.co.jp/dp/${item.asin}`,
    sourceTitle: `Amazon ${item.categoryName} ベストセラー #${item.rank}`,
    mentionCount: 1,
    totalEngagement: item.reviewCount,
  }
}

/**
 * Amazonベストセラーからアイテムを発見
 */
export async function discoverItemsFromAmazonBestseller(): Promise<{
  items: DiscoveredItem[]
  categoryInfo: Map<string, { category: string; subCategory: string }>
}> {
  const { items: bestsellerItems, categoryInfo } = await fetchAllBestsellers()

  // 重複を除去しつつ、最も高いランクの情報を保持
  const uniqueItems = new Map<string, DiscoveredItem>()

  for (const item of bestsellerItems) {
    const existing = uniqueItems.get(item.asin)
    if (!existing) {
      uniqueItems.set(item.asin, convertBestsellerToDiscovered(item))
    } else {
      // 複数カテゴリに登場する場合はカウントを増やす
      existing.mentionCount++
      existing.totalEngagement = Math.max(existing.totalEngagement, item.reviewCount)
    }
  }

  console.log(`Discovered ${uniqueItems.size} unique items from Amazon bestsellers`)
  return {
    items: Array.from(uniqueItems.values()),
    categoryInfo,
  }
}
