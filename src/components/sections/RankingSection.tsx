/**
 * ランキングセクション（ガジェット系デザイン）
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
    <section id="ranking" className="py-20 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* セクションタイトル */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-4 py-1 text-sm text-[#7c3aed]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            ランキング
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-[#8888a0]">
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
        <div className="mt-12 text-center">
          <a
            href="/ranking"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:border-[#00d4ff]/50 hover:bg-white/10"
          >
            すべてのランキングを見る
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
