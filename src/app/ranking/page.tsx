/**
 * 全アイテムランキングページ
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { Header, Footer } from '@/components'
import { RankingCard } from '@/components/ui/RankingCard'
import { getTopRanking, getAllCategories } from '@/data'

export const metadata: Metadata = {
  title: '全アイテムランキング | DeskGoodsRank',
  description:
    'デスク環境アイテムの人気ランキング一覧。SNS・YouTube・note・Amazonのデータをもとに算出したスコアで順位付け。',
}

export default function RankingPage() {
  // 全アイテムをランキング順で取得（100件まで）
  const allItems = getTopRanking(100)
  const categories = getAllCategories()

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
      <Header />

      <main className="flex-1">
        {/* ヒーロー部分 */}
        <section className="border-b border-white/10 bg-gradient-to-b from-[#12121a] to-[#0a0a0f] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/20">
                <svg className="h-5 w-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                全アイテムランキング
              </h1>
            </div>
            {/* カテゴリタブ */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#00d4ff] px-4 py-1.5 text-sm font-medium text-black">
                すべて ({allItems.length})
              </span>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/ranking/${cat.id}`}
                  className="rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-[#8888a0] hover:border-[#00d4ff]/50 hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ランキング一覧 */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {allItems.map((item) => (
                <RankingCard key={item.id} item={item} showRank />
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
