/**
 * カテゴリ別ランキングページ
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header, Footer } from '@/components'
import { RankingCard } from '@/components/ui/RankingCard'
import { getItemsByCategory, getAllCategories, getCategoryById } from '@/data'
import { CategoryId } from '@/types/category'

interface CategoryRankingPageProps {
  params: Promise<{ category: string }>
}

// 静的生成用のパラメータ
export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((cat) => ({ category: cat.id }))
}

export async function generateMetadata({
  params,
}: CategoryRankingPageProps): Promise<Metadata> {
  const { category } = await params
  const categoryData = getCategoryById(category as CategoryId)

  if (!categoryData) {
    return { title: 'カテゴリが見つかりません - DeskGoodsRank' }
  }

  return {
    title: `${categoryData.name}ランキング | DeskGoodsRank`,
    description: `${categoryData.name}カテゴリのデスクアイテム人気ランキング。${categoryData.description}`,
  }
}

export default async function CategoryRankingPage({
  params,
}: CategoryRankingPageProps) {
  const { category } = await params
  const categories = getAllCategories()
  const categoryData = getCategoryById(category as CategoryId)

  if (!categoryData) {
    notFound()
  }

  const { items, subCategories, totalCount } = getItemsByCategory(
    category as CategoryId,
    { sortBy: 'score' }
  )

  // カテゴリアイコン
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'device':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        )
      case 'furniture':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        )
      case 'lighting':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
      <Header />

      <main className="flex-1">
        {/* ヒーロー部分 */}
        <section className="border-b border-white/10 bg-gradient-to-b from-[#12121a] to-[#0a0a0f] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* パンくず */}
            <nav className="mb-4 text-sm text-[#8888a0]">
              <Link href="/" className="hover:text-[#00d4ff]">ホーム</Link>
              <span className="mx-2">/</span>
              <Link href="/ranking" className="hover:text-[#00d4ff]">ランキング</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{categoryData.name}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/20 text-[#7c3aed]">
                {getCategoryIcon(category)}
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {categoryData.name}ランキング
              </h1>
            </div>
            <p className="text-[#8888a0]">{categoryData.description}</p>

            {/* カテゴリタブ */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/ranking"
                className="rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-[#8888a0] hover:border-[#00d4ff]/50 hover:text-white transition-colors"
              >
                すべて
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/ranking/${cat.id}`}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    cat.id === category
                      ? 'bg-[#00d4ff] text-black font-medium'
                      : 'bg-white/5 border border-white/10 text-[#8888a0] hover:border-[#00d4ff]/50 hover:text-white'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* サブカテゴリ */}
            {subCategories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-[#8888a0] py-1">サブカテゴリ:</span>
                {subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${category}?sub=${encodeURIComponent(sub.name)}`}
                    className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-[#8888a0] hover:border-[#7c3aed]/50 hover:text-white transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ランキング一覧 */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[#8888a0]">
                <span className="text-white font-bold">{totalCount}</span> 件のアイテム
              </p>
              <Link
                href="/about"
                className="text-sm text-[#00d4ff] hover:underline"
              >
                スコアの算出方法 →
              </Link>
            </div>

            {totalCount > 0 ? (
              <>
                {/* TOP3 ハイライト */}
                {items.length >= 3 && (
                  <div className="mb-12">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-[#ffd700]">👑</span> {categoryData.name} TOP 3
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {items.slice(0, 3).map((item) => (
                        <RankingCard key={item.id} item={item} showRank />
                      ))}
                    </div>
                  </div>
                )}

                {/* 4位以降 */}
                {items.length > 3 && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">4位以降</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {items.slice(3).map((item) => (
                        <RankingCard key={item.id} item={item} showRank />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3件以下の場合 */}
                {items.length <= 3 && items.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {items.map((item) => (
                      <RankingCard key={item.id} item={item} showRank />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-12 text-center">
                <p className="text-[#8888a0]">
                  このカテゴリにはまだアイテムがありません。
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 他のカテゴリへのリンク */}
        <section className="border-t border-white/10 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-white mb-6">他のカテゴリを見る</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {categories
                .filter((cat) => cat.id !== category)
                .map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/ranking/${cat.id}`}
                    className="group rounded-xl border border-white/10 bg-[#1a1a24] p-6 transition-all hover:border-[#00d4ff]/50"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-[#7c3aed]">
                        {getCategoryIcon(cat.id)}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00d4ff]">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-sm text-[#8888a0]">{cat.description}</p>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
