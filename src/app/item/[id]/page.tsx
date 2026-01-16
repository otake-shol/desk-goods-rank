/**
 * アイテム詳細ページ
 * 仕様書: specs/03-item-detail-page.md
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer, RankingCard } from '@/components'
import { getItemById, getCategoryById, getRelatedItems, getAllItems } from '@/data'
import { generateAmazonAffiliateUrl } from '@/lib/affiliate'

interface ItemPageProps {
  params: Promise<{ id: string }>
}

// 静的生成用のパラメータ
export async function generateStaticParams() {
  const items = getAllItems()
  return items.map((item) => ({ id: item.id }))
}

export async function generateMetadata({
  params,
}: ItemPageProps): Promise<Metadata> {
  const { id } = await params
  const item = getItemById(id)

  if (!item) {
    return { title: 'アイテムが見つかりません - DeskGoodsRanks' }
  }

  return {
    title: `${item.name} - DeskGoodsRanks`,
    description: `${item.name}の詳細情報。スコア: ${item.score}点`,
  }
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params
  const item = getItemById(id)

  if (!item) {
    notFound()
  }

  const category = getCategoryById(item.category)
  const relatedItems = getRelatedItems(item.id, 4)
  const affiliateUrl = generateAmazonAffiliateUrl(item.amazon.asin)

  // スター表示用
  const fullStars = Math.floor(item.score / 20)
  const hasHalfStar = (item.score % 20) >= 10

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* パンくずリスト */}
          <nav className="mb-6 text-sm text-[#8888a0]">
            <Link href="/" className="transition-colors hover:text-[#00d4ff]">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/category/${item.category}`}
              className="transition-colors hover:text-[#00d4ff]"
            >
              {category?.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{item.name}</span>
          </nav>

          {/* メインコンテンツ */}
          <div className="rounded-2xl border border-white/10 bg-[#1a1a24] p-6 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* 画像 */}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#12121a]">
                <Image
                  src={item.imageUrl || '/images/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* 情報 */}
              <div className="flex flex-col">
                {/* カテゴリ・サブカテゴリ */}
                <div className="mb-2 flex items-center gap-2 text-sm text-[#8888a0]">
                  <span>{category?.name}</span>
                  <span>/</span>
                  <span>{item.subCategory}</span>
                </div>

                {/* アイテム名 */}
                <h1 className="mb-4 text-2xl font-bold text-white lg:text-3xl">
                  {item.name}
                </h1>

                {/* スコア */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-3 py-1.5">
                    <svg className="h-5 w-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-bold text-[#7c3aed]">
                      {item.score}
                    </span>
                    <span className="text-sm text-[#8888a0]">/ 100</span>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < fullStars
                            ? 'text-[#ffaa00]'
                            : i === fullStars && hasHalfStar
                              ? 'text-[#ffaa00]'
                              : 'text-[#8888a0]/30'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* 価格 */}
                {item.amazon.price && (
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-white">
                      ¥{item.amazon.price.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* タグ */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-3 py-1 text-sm text-[#00d4ff]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Amazonボタン */}
                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF9900] px-6 py-3 font-semibold text-white transition-all hover:bg-[#ffaa00] hover:shadow-lg hover:shadow-[#FF9900]/25"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.126.11.19.03.404-.24.638-.39.34-.863.696-1.422 1.07a20.49 20.49 0 01-8.31 2.62c-3.98.403-7.73-.378-11.25-2.34-.192-.108-.27-.234-.235-.378.032-.135.133-.24.3-.318l-.01.002zm5.165-2.55c0-.163.14-.303.42-.42l1.543-.636c.28-.116.517-.085.713.093l.602.503c.196.16.295.346.295.557v4.2c0 .212-.1.398-.296.558l-.602.504c-.196.176-.433.207-.713.093l-1.543-.635c-.28-.116-.42-.256-.42-.42v-4.396zM21.22 16.2c.14-.073.27-.103.39-.09.138.02.243.09.32.21.075.12.084.244.025.374-.06.13-.167.274-.32.43l-.602.602a.698.698 0 01-.492.2H17.23c-.236 0-.433-.063-.59-.187l-.602-.476c-.16-.125-.24-.264-.24-.42v-.166c0-.155.08-.294.24-.42l.602-.475c.157-.124.354-.187.59-.187h3.31c.176 0 .332.07.47.2l.21.21v-.405z" />
                  </svg>
                  Amazonで見る
                </a>
              </div>
            </div>
          </div>

          {/* 関連アイテム */}
          {relatedItems.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-6 text-xl font-bold text-white">
                関連アイテム
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedItems.map((relatedItem) => (
                  <RankingCard
                    key={relatedItem.id}
                    item={relatedItem}
                    showRank={false}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
