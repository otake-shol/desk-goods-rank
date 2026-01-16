/**
 * アイテム自動発見モジュール
 * note.com記事とYouTube動画説明欄からAmazonリンクを抽出し、新規アイテムを発見
 */

import { chromium } from 'playwright'

export interface DiscoveredItem {
  asin: string
  sourceType: 'note' | 'youtube' | 'zenn' | 'hatena' | 'amazon-bestseller' | 'kakaku' | 'makuake'
  sourceUrl: string
  sourceTitle: string
  mentionCount: number
  totalEngagement: number
}

export interface AmazonProductInfo {
  asin: string
  title: string
  price: number | null
  imageUrl: string | null
  category: string | null
}

/**
 * テキストからAmazon ASINを抽出
 */
export function extractAsinsFromText(text: string): string[] {
  const asins: string[] = []

  // Amazon URLパターン（複数形式に対応）
  const patterns = [
    /amazon\.co\.jp\/dp\/([A-Z0-9]{10})/gi,
    /amazon\.co\.jp\/gp\/product\/([A-Z0-9]{10})/gi,
    /amazon\.co\.jp\/.*\/dp\/([A-Z0-9]{10})/gi,
    /amzn\.to\/([A-Za-z0-9]+)/gi, // 短縮URL（後で展開が必要）
    /amzn\.asia\/d\/([A-Za-z0-9]+)/gi,
    /amazon\.com\/dp\/([A-Z0-9]{10})/gi,
    /amazon\.com\/gp\/product\/([A-Z0-9]{10})/gi,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const asin = match[1].toUpperCase()
      // 10文字のASINのみ追加（短縮URLは除外）
      if (asin.length === 10 && /^[A-Z0-9]+$/.test(asin)) {
        asins.push(asin)
      }
    }
  }

  return Array.from(new Set(asins)) // 重複除去
}

/**
 * note.com記事本文からAmazonリンクを抽出
 */
export async function extractAsinsFromNoteArticle(articleUrl: string): Promise<{
  asins: string[]
  title: string
}> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(articleUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1000)

    // 記事タイトルを取得
    const title = await page.evaluate(() => {
      const h1 = document.querySelector('h1')
      return h1?.textContent?.trim() || ''
    })

    // 記事本文からすべてのリンクを取得
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('article a, .note-common-styles__textnote-body a')
      return Array.from(anchors).map(a => a.getAttribute('href') || '')
    })

    // 記事本文テキストも取得（テキスト内のURLも検出）
    const bodyText = await page.evaluate(() => {
      const article = document.querySelector('article, .note-common-styles__textnote-body')
      return article?.textContent || ''
    })

    // リンクとテキストからASINを抽出
    const allText = [...links, bodyText].join(' ')
    const asins = extractAsinsFromText(allText)

    return { asins, title }
  } catch (error) {
    console.error(`Failed to fetch article: ${articleUrl}`, error)
    return { asins: [], title: '' }
  } finally {
    await browser.close()
  }
}

/**
 * YouTube動画説明欄からAmazonリンクを抽出
 */
export async function extractAsinsFromYouTubeDescription(
  videoId: string,
  apiKey: string
): Promise<{
  asins: string[]
  title: string
  viewCount: number
}> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return { asins: [], title: '', viewCount: 0 }
    }

    const video = data.items[0]
    const description = video.snippet?.description || ''
    const title = video.snippet?.title || ''
    const viewCount = parseInt(video.statistics?.viewCount || '0')

    const asins = extractAsinsFromText(description)

    return { asins, title, viewCount }
  } catch (error) {
    console.error(`Failed to fetch YouTube video: ${videoId}`, error)
    return { asins: [], title: '', viewCount: 0 }
  }
}

/**
 * YouTubeでデスクツアー動画を検索し、説明欄からASINを抽出
 */
export async function discoverItemsFromYouTube(apiKey: string): Promise<DiscoveredItem[]> {
  const searchQueries = [
    'デスクツアー 2024',
    'デスクツアー 2025',
    'デスク環境 紹介',
    'デスクセットアップ',
    'desk tour japan',
    'ガジェット デスク',
  ]

  const discoveredItems: Map<string, DiscoveredItem> = new Map()

  for (const query of searchQueries) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${apiKey}`

    try {
      const response = await fetch(searchUrl)
      const data = await response.json()

      if (!data.items) continue

      for (const item of data.items) {
        const videoId = item.id?.videoId
        if (!videoId) continue

        const { asins, title, viewCount } = await extractAsinsFromYouTubeDescription(videoId, apiKey)

        for (const asin of asins) {
          const existing = discoveredItems.get(asin)
          if (existing) {
            existing.mentionCount++
            existing.totalEngagement += viewCount
          } else {
            discoveredItems.set(asin, {
              asin,
              sourceType: 'youtube',
              sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
              sourceTitle: title,
              mentionCount: 1,
              totalEngagement: viewCount,
            })
          }
        }

        // API制限対策
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } catch (error) {
      console.error(`Failed to search YouTube for: ${query}`, error)
    }
  }

  return Array.from(discoveredItems.values())
}

/**
 * Amazonページから商品情報をスクレイピング
 */
export async function fetchAmazonProductInfo(asin: string): Promise<AmazonProductInfo | null> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // ユーザーエージェントを設定
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ja-JP,ja;q=0.9',
  })

  try {
    const url = `https://www.amazon.co.jp/dp/${asin}`
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)

    const productInfo = await page.evaluate(() => {
      // 商品タイトル
      const titleEl = document.querySelector('#productTitle, #title')
      const title = titleEl?.textContent?.trim() || ''

      // 価格
      const priceEl = document.querySelector('.a-price-whole, #priceblock_ourprice, #priceblock_dealprice, .a-offscreen')
      let price: number | null = null
      if (priceEl) {
        const priceText = priceEl.textContent?.replace(/[^\d]/g, '') || ''
        price = priceText ? parseInt(priceText) : null
      }

      // 画像URL
      const imageEl = document.querySelector('#landingImage, #imgBlkFront') as HTMLImageElement
      const imageUrl = imageEl?.src || null

      // カテゴリ
      const breadcrumb = document.querySelector('#wayfinding-breadcrumbs_feature_div')
      const category = breadcrumb?.textContent?.trim().split('\n').filter(s => s.trim())[0] || null

      return { title, price, imageUrl, category }
    })

    if (!productInfo.title) {
      return null
    }

    return {
      asin,
      ...productInfo,
    }
  } catch (error) {
    console.error(`Failed to fetch Amazon product: ${asin}`, error)
    return null
  } finally {
    await browser.close()
  }
}

/**
 * 発見したアイテムを既存のitems.jsonフォーマットに変換
 */
export function convertToItemFormat(
  productInfo: AmazonProductInfo,
  discovered: DiscoveredItem,
  overrideCategory?: { category: string; subCategory: string }
): Record<string, unknown> {
  // カテゴリを推定
  const categoryMap: Record<string, { category: string; subCategory: string }> = {
    'キーボード': { category: 'device', subCategory: 'keyboard' },
    'マウス': { category: 'device', subCategory: 'mouse' },
    'トラックボール': { category: 'device', subCategory: 'trackball' },
    'モニター': { category: 'device', subCategory: 'monitor' },
    'ディスプレイ': { category: 'device', subCategory: 'monitor' },
    'ヘッドホン': { category: 'device', subCategory: 'headphone' },
    'イヤホン': { category: 'device', subCategory: 'earphone' },
    'マイク': { category: 'device', subCategory: 'microphone' },
    'Webカメラ': { category: 'device', subCategory: 'webcam' },
    'ウェブカメラ': { category: 'device', subCategory: 'webcam' },
    'スピーカー': { category: 'device', subCategory: 'speaker' },
    'デスク': { category: 'furniture', subCategory: 'desk' },
    'チェア': { category: 'furniture', subCategory: 'chair' },
    '椅子': { category: 'furniture', subCategory: 'chair' },
    'モニターアーム': { category: 'furniture', subCategory: 'monitor-arm' },
    'アーム': { category: 'furniture', subCategory: 'monitor-arm' },
    'ライト': { category: 'lighting', subCategory: 'desk-light' },
    '照明': { category: 'lighting', subCategory: 'ambient-light' },
    'デスクマット': { category: 'lighting', subCategory: 'desk-mat' },
    'DAC': { category: 'audio', subCategory: 'dac-amp' },
    'アンプ': { category: 'audio', subCategory: 'dac-amp' },
    'Bluetooth レシーバー': { category: 'audio', subCategory: 'bluetooth-receiver' },
    '充電器': { category: 'accessory', subCategory: 'charger' },
    '電源タップ': { category: 'accessory', subCategory: 'charger' },
    'USBハブ': { category: 'accessory', subCategory: 'hub' },
    'ドック': { category: 'accessory', subCategory: 'hub' },
    'ケーブル': { category: 'accessory', subCategory: 'cable' },
  }

  let category = overrideCategory?.category || 'device'
  let subCategory = overrideCategory?.subCategory || 'other'

  // overrideCategoryがない場合のみキーワードマッチング
  if (!overrideCategory) {
    for (const [keyword, cats] of Object.entries(categoryMap)) {
      if (productInfo.title.includes(keyword)) {
        category = cats.category
        subCategory = cats.subCategory
        break
      }
    }
  }

  // IDを生成
  const id = `${subCategory}-${productInfo.asin.toLowerCase()}`

  // ブランド名を抽出（タイトルの最初の単語、【】を除く）
  const cleanTitle = productInfo.title.replace(/^【[^】]*】\s*/, '')
  const brand = cleanTitle.split(/[\s　]/)[0] || 'Unknown'

  // ソースタイプごとのスコア計算
  const socialScore: Record<string, number> = {
    twitter: 0,
    youtube: 0,
    amazon: 50,
    note: 0,
    zenn: 0,
    hatena: 0,
  }

  switch (discovered.sourceType) {
    case 'youtube':
      socialScore.youtube = Math.min(Math.round(discovered.totalEngagement / 1000), 100)
      break
    case 'note':
      socialScore.note = Math.min(discovered.mentionCount * 10, 100)
      break
    case 'zenn':
      socialScore.zenn = Math.min(discovered.mentionCount * 10 + discovered.totalEngagement, 100)
      break
    case 'hatena':
      socialScore.hatena = Math.min(discovered.mentionCount * 10 + Math.round(discovered.totalEngagement / 10), 100)
      break
    case 'amazon-bestseller':
      socialScore.amazon = Math.min(70 + Math.round(discovered.totalEngagement / 100), 100)
      break
  }

  return {
    id,
    name: productInfo.title,
    description: `${discovered.sourceTitle}で紹介された商品`,
    shortDescription: productInfo.title.substring(0, 30),
    imageUrl: productInfo.imageUrl || 'https://via.placeholder.com/400x300',
    category,
    subCategory,
    score: 0,
    amazon: {
      asin: productInfo.asin,
      url: `https://www.amazon.co.jp/dp/${productInfo.asin}`,
      affiliateUrl: `https://www.amazon.co.jp/dp/${productInfo.asin}?tag=otkshol01-22`,
      price: productInfo.price || 0,
    },
    tags: [],
    brand,
    featured: false,
    isNew: true,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    socialScore,
    discoveredFrom: {
      source: discovered.sourceType,
      url: discovered.sourceUrl,
      title: discovered.sourceTitle,
      mentionCount: discovered.mentionCount,
    },
  }
}
