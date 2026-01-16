/**
 * 検索結果ページ
 * 仕様書: specs/07-search.md
 */

import { Metadata } from 'next'
import { Header, Footer, RankingCard } from '@/components'
import { searchItemsWithCount } from '@/data/search'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const query = q || ''

  return {
    title: query
      ? `「${query}」の検索結果 - DeskGoodsRank`
      : '検索 - DeskGoodsRank',
    description: query
      ? `「${query}」に関連するデスクアイテムの検索結果`
      : 'デスクアイテムを検索',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q || ''
  const { items, totalCount } = searchItemsWithCount(query)

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* 検索結果ヘッダー */}
          <div className="mb-8">
            {query ? (
              <>
                <h1 className="text-2xl font-bold text-white">
                  「<span className="text-[#00d4ff]">{query}</span>」の検索結果
                </h1>
                <p className="mt-2 text-[#8888a0]">
                  {totalCount > 0
                    ? `${totalCount}件のアイテムが見つかりました`
                    : '該当するアイテムがありません'}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">検索</h1>
                <p className="mt-2 text-[#8888a0]">
                  キーワードを入力して検索してください
                </p>
              </>
            )}
          </div>

          {/* 検索結果 */}
          {totalCount > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <RankingCard key={item.id} item={item} showRank={false} />
              ))}
            </div>
          ) : query ? (
            <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-8 text-center">
              <p className="text-[#8888a0]">
                「<span className="text-[#00d4ff]">{query}</span>」に一致するアイテムは見つかりませんでした。
              </p>
              <p className="mt-2 text-sm text-[#8888a0]/70">
                別のキーワードで検索してみてください。
              </p>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  )
}
