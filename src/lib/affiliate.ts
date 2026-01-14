/**
 * アフィリエイトURL生成
 * 仕様書: specs/04-static-data.md
 */

const DEFAULT_AMAZON_ASSOCIATE_TAG = 'deskitemrank-22'

/**
 * アフィリエイトタグを取得
 * 環境変数が設定されていればそちらを使用
 */
export function getAffiliateTag(): string {
  return process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || DEFAULT_AMAZON_ASSOCIATE_TAG
}

/**
 * Amazon アフィリエイトURLを生成
 * @param asin Amazon ASIN
 */
export function generateAmazonAffiliateUrl(asin: string): string {
  const tag = getAffiliateTag()
  return `https://www.amazon.co.jp/dp/${asin}?tag=${tag}`
}
