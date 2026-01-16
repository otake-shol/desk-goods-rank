/**
 * note.com デスクツアー記事コレクター
 * デスクツアー記事から商品の言及とスキ数を収集
 */

import { chromium } from 'playwright'

export interface NoteArticle {
  title: string
  url: string
  author: string
  likes: number
  date: string
}

export interface NoteData {
  articleCount: number
  totalLikes: number
  articles: NoteArticle[]
}

const DESK_TOUR_URL = 'https://note.com/interests/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%84%E3%82%A2%E3%83%BC'

/**
 * note.com からデスクツアー記事一覧を取得
 */
export async function fetchNoteArticles(): Promise<NoteArticle[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(DESK_TOUR_URL, { waitUntil: 'networkidle' })

    // ページが読み込まれるまで少し待つ
    await page.waitForTimeout(2000)

    // 記事データを抽出
    const articles = await page.evaluate(() => {
      const results: Array<{
        title: string
        url: string
        author: string
        likes: number
        date: string
      }> = []

      // 記事カードを取得（h3要素を含む親要素を探す）
      const headings = document.querySelectorAll('h3')

      headings.forEach(h3 => {
        const title = h3.textContent?.trim() || ''
        if (!title || title.length < 5) return

        // 親要素から情報を取得
        const card = h3.closest('div')?.parentElement?.parentElement
        if (!card) return

        // URLを取得
        const linkEl = card.querySelector('a[href*="/n/n"]')
        const url = linkEl?.getAttribute('href') || ''
        if (!url) return

        // スキ数を取得
        let likes = 0
        const likeButton = card.querySelector('button[class*="suki"], button[aria-label*="スキ"]')
        if (likeButton) {
          const text = likeButton.textContent || ''
          const match = text.match(/(\d+)/)
          if (match) likes = parseInt(match[1])
        }

        // 著者を取得
        const authorEl = card.querySelector('a[href^="/"][href$="リンク"] span, [class*="author"], [class*="Creator"]')
        const author = authorEl?.textContent?.trim() || ''

        // 日付を取得
        const timeEl = card.querySelector('time')
        const date = timeEl?.textContent?.trim() || ''

        results.push({
          title,
          url: url.startsWith('http') ? url : `https://note.com${url}`,
          author,
          likes,
          date
        })
      })

      return results
    })

    // 重複を除去
    const uniqueArticles = articles.filter((article, index, self) =>
      index === self.findIndex(a => a.url === article.url)
    )

    return uniqueArticles
  } finally {
    await browser.close()
  }
}

/**
 * 商品名が記事タイトルに含まれているかチェック
 */
export function matchProductInArticles(
  productName: string,
  articles: NoteArticle[]
): NoteData {
  // 商品名からキーワードを抽出
  const keywords = extractKeywords(productName)

  // マッチする記事を抽出
  const matchedArticles = articles.filter(article => {
    const titleLower = article.title.toLowerCase()
    return keywords.some(keyword =>
      titleLower.includes(keyword.toLowerCase())
    )
  })

  const totalLikes = matchedArticles.reduce((sum, a) => sum + a.likes, 0)

  return {
    articleCount: matchedArticles.length,
    totalLikes,
    articles: matchedArticles
  }
}

/**
 * 商品名からマッチング用キーワードを抽出
 */
function extractKeywords(productName: string): string[] {
  const keywords: string[] = []

  // 商品名マッピング（商品名 → 検索キーワード）
  const keywordMap: Record<string, string[]> = {
    'Dell U2723QE': ['Dell', 'U2723', '4K', 'USB-C モニター'],
    'HHKB': ['HHKB', 'Happy Hacking', 'ハッピーハッキング'],
    'MX Master': ['MX Master', 'MXマスター', 'ロジクール マウス', 'Logicool マウス'],
    'WH-1000XM5': ['WH-1000XM5', 'XM5', 'ソニー ヘッドホン', 'Sony ノイキャン'],
    'FlexiSpot': ['FlexiSpot', 'フレキシスポット', '電動昇降', 'スタンディングデスク'],
    'エルゴヒューマン': ['エルゴヒューマン', 'Ergohuman', 'オフィスチェア'],
    'エルゴトロン': ['エルゴトロン', 'Ergotron', 'モニターアーム', 'LX'],
    'BenQ ScreenBar': ['BenQ', 'ScreenBar', 'スクリーンバー', 'モニターライト'],
    'Grovemade': ['Grovemade', 'デスクマット', '本革'],
    'Philips Hue': ['Philips Hue', 'フィリップス', 'Hue Play', 'ライトバー', '間接照明'],
  }

  // マッピングからキーワードを取得
  for (const [key, values] of Object.entries(keywordMap)) {
    if (productName.includes(key) || key.includes(productName.split(' ')[0])) {
      keywords.push(...values)
    }
  }

  // マッピングにない場合は商品名を分割
  if (keywords.length === 0) {
    // ブランド名や型番を抽出
    const words = productName.split(/[\s　]+/)
    keywords.push(...words.filter(w => w.length >= 2))
  }

  return Array.from(new Set(keywords)) // 重複除去
}

/**
 * モックデータを生成（テスト用）
 */
export function generateMockNoteData(): NoteData {
  return {
    articleCount: Math.floor(Math.random() * 5),
    totalLikes: Math.floor(Math.random() * 100),
    articles: []
  }
}
