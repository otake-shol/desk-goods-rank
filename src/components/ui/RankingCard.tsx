/**
 * ランキングカードコンポーネント（ガジェット系デザイン）
 * 仕様書: specs/01-top-page.md
 */

import Link from 'next/link'
import { Item } from '@/types'

interface RankingCardProps {
  item: Item
  showRank?: boolean
}

export function RankingCard({ item, showRank = true }: RankingCardProps) {
  // ランク別のアクセントカラー
  const getRankStyle = (rank: number | undefined) => {
    if (!rank) return { bg: 'bg-[#1a1a24]', border: 'border-white/10' }
    if (rank === 1) return { bg: 'bg-gradient-to-br from-[#ffd700]/20 to-[#ff9500]/10', border: 'border-[#ffd700]/50', glow: 'shadow-[0_0_20px_rgba(255,215,0,0.2)]' }
    if (rank === 2) return { bg: 'bg-gradient-to-br from-[#c0c0c0]/20 to-[#a0a0a0]/10', border: 'border-[#c0c0c0]/50' }
    if (rank === 3) return { bg: 'bg-gradient-to-br from-[#cd7f32]/20 to-[#a0522d]/10', border: 'border-[#cd7f32]/50' }
    return { bg: 'bg-[#1a1a24]', border: 'border-white/10' }
  }

  const rankStyle = getRankStyle(item.rank)

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border ${rankStyle.border} ${rankStyle.bg} ${rankStyle.glow || ''} transition-all duration-300 hover:border-[#00d4ff]/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]`}
    >
      {/* ランク表示 */}
      {showRank && item.rank && (
        <div className="absolute left-3 top-3 z-10">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${
              item.rank === 1
                ? 'bg-gradient-to-br from-[#ffd700] to-[#ff9500] text-black'
                : item.rank === 2
                  ? 'bg-gradient-to-br from-[#e8e8e8] to-[#a8a8a8] text-black'
                  : item.rank === 3
                    ? 'bg-gradient-to-br from-[#cd7f32] to-[#a0522d] text-white'
                    : 'bg-[#2a2a38] text-white'
            }`}
          >
            {item.rank}
          </div>
        </div>
      )}

      {/* NEW バッジ */}
      {item.isNew && (
        <div className="absolute right-3 top-3 z-10">
          <span className="rounded-full bg-[#00ff88] px-2 py-0.5 text-xs font-semibold text-black">
            NEW
          </span>
        </div>
      )}

      {/* 商品画像 */}
      <div className="relative aspect-square overflow-hidden bg-[#12121a]">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* オーバーレイグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60" />
      </div>

      {/* 商品情報 */}
      <div className="flex flex-1 flex-col p-4">
        {/* カテゴリタグ */}
        <div className="mb-2">
          <span className="inline-flex items-center rounded-lg bg-[#00d4ff]/10 px-2.5 py-1 text-xs font-medium text-[#00d4ff]">
            {item.subCategory}
          </span>
        </div>

        {/* 商品名 */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white">
          <Link
            href={`/item/${item.id}`}
            className="transition-colors hover:text-[#00d4ff]"
          >
            {item.name}
          </Link>
        </h3>

        {/* 説明 */}
        <p className="mb-4 line-clamp-2 flex-1 text-xs text-[#8888a0]">
          {item.shortDescription}
        </p>

        {/* スコアと価格 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 rounded-lg bg-[#7c3aed]/20 px-2 py-1">
              <svg className="h-4 w-4 text-[#7c3aed]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-bold text-white">{item.score}</span>
            </div>
          </div>
          {item.amazon.price && (
            <span className="text-sm font-semibold text-white">
              ¥{item.amazon.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Amazonリンク */}
        <a
          href={item.amazon.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#ff9900] px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffad33] hover:shadow-[0_0_20px_rgba(255,153,0,0.4)]"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.126.11.19.03.404-.24.638-.39.34-.863.696-1.422 1.07a20.49 20.49 0 01-8.31 2.62c-3.98.403-7.73-.378-11.25-2.34-.192-.108-.27-.234-.235-.378.032-.135.133-.24.3-.318l-.01.002z" />
          </svg>
          Amazonで見る
        </a>
      </div>
    </div>
  )
}
