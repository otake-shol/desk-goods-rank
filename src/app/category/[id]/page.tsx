/**
 * カテゴリページ
 * 仕様書: specs/02-category-page.md
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer, RankingCard } from '@/components'
import { getItemsByCategory, getAllCategories } from '@/data'
import { CategoryId } from '@/types/category'
import { SortBy } from '@/data'

interface CategoryPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sub?: string; sort?: SortBy }>
}

// 静的生成用のパラメータ
export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((cat) => ({ id: cat.id }))
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { id } = await params
  const { category } = getItemsByCategory(id as CategoryId)

  if (!category) {
    return { title: 'カテゴリが見つかりません - DeskItemRank' }
  }

  return {
    title: `${category.name}ランキング - DeskItemRank`,
    description: `${category.name}カテゴリのデスクアイテムランキング。${category.description}`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { id } = await params
  const { sub, sort } = await searchParams

  const { items, category, subCategories, totalCount } = getItemsByCategory(
    id as CategoryId,
    { subCategory: sub, sortBy: sort }
  )

  if (!category) {
    notFound()
  }

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'score', label: 'スコア順' },
    { value: 'newest', label: '新着順' },
    { value: 'price_asc', label: '価格（安い順）' },
    { value: 'price_desc', label: '価格（高い順）' },
  ]

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
            <span className="text-white">{category.name}</span>
          </nav>

          {/* カテゴリヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            <p className="mt-2 text-[#8888a0]">{category.description}</p>
            <p className="mt-1 text-sm text-[#8888a0]">{totalCount}件のアイテム</p>
          </div>

          {/* フィルター・ソート */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {/* サブカテゴリフィルター */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/category/${id}${sort ? `?sort=${sort}` : ''}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !sub
                    ? 'bg-[#00d4ff] text-[#0a0a0f]'
                    : 'border border-white/10 bg-white/5 text-[#8888a0] hover:bg-white/10 hover:text-white'
                }`}
              >
                すべて
              </Link>
              {subCategories.map((subCat) => (
                <Link
                  key={subCat.id}
                  href={`/category/${id}?sub=${encodeURIComponent(subCat.name)}${sort ? `&sort=${sort}` : ''}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    sub === subCat.name
                      ? 'bg-[#00d4ff] text-[#0a0a0f]'
                      : 'border border-white/10 bg-white/5 text-[#8888a0] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {subCat.name}
                </Link>
              ))}
            </div>

            {/* ソート */}
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-[#8888a0]">
                並び替え:
              </label>
              <select
                id="sort"
                defaultValue={sort || 'score'}
                onChange={(e) => {
                  const newSort = e.target.value
                  const url = new URL(window.location.href)
                  url.searchParams.set('sort', newSort)
                  window.location.href = url.toString()
                }}
                className="rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-1.5 text-sm text-white focus:border-[#00d4ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/50"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* アイテム一覧 */}
          {totalCount > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <RankingCard key={item.id} item={item} showRank />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#1a1a24] p-8 text-center">
              <p className="text-[#8888a0]">
                このカテゴリにはまだアイテムがありません。
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
