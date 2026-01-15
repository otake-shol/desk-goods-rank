/**
 * 新着アイテムセクション（ガジェット系デザイン）
 * 仕様書: specs/01-top-page.md
 */

import { Item } from '@/types'
import { RankingCard } from '@/components/ui/RankingCard'

interface NewArrivalsSectionProps {
  items: Item[]
}

export function NewArrivalsSection({ items }: NewArrivalsSectionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* セクションタイトル */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff00aa]/30 bg-[#ff00aa]/10 px-4 py-1 text-sm text-[#ff00aa]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff00aa] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff00aa]"></span>
            </span>
            NEW
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            注目の新着アイテム
          </h2>
          <p className="mt-3 text-[#8888a0]">
            最近追加された注目アイテムをチェック
          </p>
        </div>

        {/* アイテムリスト */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((item) => (
            <RankingCard key={item.id} item={item} showRank={false} />
          ))}
        </div>
      </div>
    </section>
  )
}
