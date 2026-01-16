/**
 * アイテム詳細ページ
 * 仕様書: specs/03-item-detail-page.md
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer, RankingCard } from '@/components'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { getItemById, getCategoryById, getRelatedItems, getAllItems } from '@/data'
import { generateAmazonAffiliateUrl, generateRakutenAffiliateUrl } from '@/lib/affiliate'

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
    return { title: 'アイテムが見つかりません' }
  }

  return {
    title: item.name,
    description: `${item.name}の詳細情報・レビュー・価格比較。デスク・グッズ・ランクのスコア: ${item.score}点。${item.shortDescription}`,
    openGraph: {
      title: `${item.name} | デスク・グッズ・ランク`,
      description: `${item.name}の詳細情報。スコア: ${item.score}点`,
      url: `/item/${item.id}`,
      images: item.imageUrl ? [{ url: item.imageUrl, alt: item.name }] : [],
    },
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
  const amazonUrl = generateAmazonAffiliateUrl(item.amazon.asin)
  const rakutenUrl = generateRakutenAffiliateUrl(item.name)

  const breadcrumbs = [
    { name: 'ホーム', url: '/' },
    { name: category?.name || item.category, url: `/category/${item.category}` },
    { name: item.name, url: `/item/${item.id}` },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
      <ProductJsonLd item={item} />
      <BreadcrumbJsonLd items={breadcrumbs} />
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
                  className="object-contain p-4"
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

                {/* 詳細説明 */}
                {item.description && (
                  <div className="mb-6">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#c8c8d0]">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* 購入ボタン */}
                <div className="mt-auto flex flex-col gap-3">
                  {/* Amazonボタン（メイン） */}
                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#f7dfa5] via-[#f0c14b] to-[#e4a831] px-6 py-4 shadow-md transition-all hover:shadow-xl hover:shadow-[#f0c14b]/30 active:scale-[0.98]"
                  >
                    {/* 光沢エフェクト */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-100" />

                    <div className="relative flex items-center justify-center gap-3">
                      {/* カートアイコン */}
                      <svg className="h-6 w-6 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>

                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-[#111]">
                          Amazonで購入する
                        </span>
                        {item.amazon.price && (
                          <span className="text-xs font-medium text-[#111]/70">
                            ¥{item.amazon.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* 矢印 */}
                      <svg className="h-4 w-4 text-[#111]/60 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>

                  {/* 楽天ボタン（サブ） */}
                  <a
                    href={rakutenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#e60033] via-[#bf0000] to-[#990000] px-6 py-3 shadow-md transition-all hover:shadow-lg hover:shadow-[#bf0000]/30 active:scale-[0.98]"
                  >
                    {/* 光沢エフェクト */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

                    <div className="relative flex items-center justify-center gap-2">
                      {/* 楽天Rロゴ */}
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 14.5h-2v-4h-3v4h-2V7.5h2v3h3v-3h2v9z"/>
                      </svg>
                      <span className="text-sm font-bold text-white">楽天市場で見る</span>
                      <svg className="h-4 w-4 text-white/80 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 紹介動画（YouTube） */}
          {item.mediaReferences && item.mediaReferences.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                <svg className="h-6 w-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                紹介動画
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {item.mediaReferences.map((media) => (
                  <a
                    key={media.videoId}
                    href={`https://www.youtube.com/watch?v=${media.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-xl border border-white/10 bg-[#1a1a24] transition-all hover:border-[#00d4ff]/50 hover:shadow-lg"
                  >
                    {/* サムネイル */}
                    <div className="relative aspect-video bg-[#12121a]">
                      <Image
                        src={media.thumbnailUrl}
                        alt={media.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* 再生ボタンオーバーレイ */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF0000]">
                          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* 情報 */}
                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 text-sm font-medium text-white group-hover:text-[#00d4ff]">
                        {media.title}
                      </h3>
                      <p className="text-xs text-[#8888a0]">
                        {media.channelName}
                      </p>
                      {media.viewCount && (
                        <p className="mt-1 text-xs text-[#8888a0]">
                          {media.viewCount.toLocaleString()} 回視聴
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

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
