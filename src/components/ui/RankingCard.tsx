'use client'

/**
 * ランキングカードコンポーネント（ガジェット系デザイン - コンパクト版）
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
    if (!rank) return { border: 'border-white/10' }
    if (rank === 1) return { border: 'border-[#ffd700]/50', glow: 'shadow-[0_0_15px_rgba(255,215,0,0.15)]' }
    if (rank === 2) return { border: 'border-[#c0c0c0]/50' }
    if (rank === 3) return { border: 'border-[#cd7f32]/50' }
    return { border: 'border-white/10' }
  }

  const rankStyle = getRankStyle(item.rank)

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-[#1a1a24] ${rankStyle.border} ${rankStyle.glow || ''} transition-all duration-300 hover:border-[#00d4ff]/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]`}
    >
      {/* ランク表示 */}
      {showRank && item.rank && (
        <div className="absolute left-2 top-2 z-10">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
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

      {/* 商品画像（リンク） */}
      <Link href={`/item/${item.id}`} className="relative aspect-[4/3] overflow-hidden bg-[#12121a]">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* 商品情報 */}
      <div className="flex flex-1 flex-col p-2">
        {/* 商品名（リンク） */}
        <Link href={`/item/${item.id}`}>
          <h3 className="line-clamp-1 text-xs font-semibold text-white group-hover:text-[#00d4ff]">
            {item.name}
          </h3>
        </Link>

        {/* 商品概要 */}
        <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8888a0]">
          {item.shortDescription}
        </p>

        {/* 価格 */}
        <div className="mt-1.5">
          {item.amazon.price ? (
            <span className="text-xs font-semibold text-white">
              ¥{item.amazon.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-[#8888a0]">
              価格はAmazonで確認
            </span>
          )}
        </div>

        {/* Amazonリンク */}
        <a
          href={item.amazon.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-md bg-[#ff9900] py-1.5 text-[10px] font-semibold text-black transition-colors hover:bg-[#ffad33]"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.126.11.19.03.404-.24.638-.39.34-.863.696-1.422 1.07a20.49 20.49 0 01-8.31 2.62c-3.98.403-7.73-.378-11.25-2.34-.192-.108-.27-.234-.235-.378.032-.135.133-.24.3-.318l-.01.002z" />
          </svg>
          Amazon
        </a>
      </div>
    </div>
  )
}
