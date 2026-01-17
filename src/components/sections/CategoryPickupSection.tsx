/**
 * カテゴリ別ピックアップセクション（ガジェット系デザイン）
 * 仕様書: specs/01-top-page.md
 */

import { type ReactNode } from 'react'
import Link from 'next/link'
import { Item, Category } from '@/types'
import { RankingCard } from '@/components/ui/RankingCard'

interface CategoryData {
  category: Category
  items: Item[]
}

interface CategoryPickupSectionProps {
  categories: CategoryData[]
}

// カテゴリ別のアイコン
const categoryIcons: Record<string, ReactNode> = {
  device: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  ),
  furniture: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  lighting: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  audio: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  accessory: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
}

// カテゴリ別のアクセントカラー
const categoryColors: Record<string, { border: string; bg: string; text: string }> = {
  device: { border: 'border-[#00d4ff]/30', bg: 'bg-[#00d4ff]/10', text: 'text-[#00d4ff]' },
  furniture: { border: 'border-[#00ff88]/30', bg: 'bg-[#00ff88]/10', text: 'text-[#00ff88]' },
  lighting: { border: 'border-[#ffaa00]/30', bg: 'bg-[#ffaa00]/10', text: 'text-[#ffaa00]' },
  audio: { border: 'border-[#a855f7]/30', bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]' },
  accessory: { border: 'border-[#f472b6]/30', bg: 'bg-[#f472b6]/10', text: 'text-[#f472b6]' },
}

export function CategoryPickupSection({ categories }: CategoryPickupSectionProps) {
  return (
    <section id="categories" className="py-12 bg-[#12121a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* セクションタイトル */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 px-4 py-1 text-sm text-[#00ff88]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            カテゴリ
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            カテゴリ別ピックアップ
          </h2>
          <p className="mt-3 text-[#8888a0]">
            各カテゴリの人気アイテム TOP3
          </p>
        </div>

        {/* カテゴリ別グリッド */}
        <div className="space-y-10">
          {categories.map(({ category, items }) => {
            const colors = categoryColors[category.id] || categoryColors.device
            const icon = categoryIcons[category.id]

            return (
              <div key={category.id} id={`category-${category.id}`}>
                {/* カテゴリヘッダー */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
                      {icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {category.name}
                    </h3>
                  </div>
                  <Link
                    href={`/category/${category.id}`}
                    className={`group flex items-center gap-1 rounded-lg ${colors.border} ${colors.bg} px-4 py-2 text-sm font-medium ${colors.text} transition-all hover:opacity-80`}
                  >
                    すべて見る
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>

                {/* アイテムリスト */}
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {items.map((item) => (
                    <RankingCard key={item.id} item={item} showRank compact />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
