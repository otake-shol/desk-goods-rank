/**
 * ランキングセクション
 * 仕様書: specs/01-top-page.md
 */

import { Item } from '@/types'
import { RankingCard } from '@/components/ui/RankingCard'

interface RankingSectionProps {
  items: Item[]
  title?: string
}

export function RankingSection({
  items,
  title = '総合人気ランキング TOP10',
}: RankingSectionProps) {
  return (
    <section id="ranking" className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* セクションタイトル */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-gray-600">
            SNS・YouTube・Amazonのデータをもとに算出
          </p>
        </div>

        {/* ランキングリスト */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((item) => (
            <RankingCard key={item.id} item={item} showRank />
          ))}
        </div>

        {/* もっと見るリンク */}
        <div className="mt-10 text-center">
          <a
            href="/ranking"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            すべてのランキングを見る
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
