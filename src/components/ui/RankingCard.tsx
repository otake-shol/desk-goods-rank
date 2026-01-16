'use client'

/**
 * ランキングカードコンポーネント（ガジェット系デザイン - コンパクト版）
 * 仕様書: specs/01-top-page.md
 */

import Link from 'next/link'
import { Item } from '@/types'
import { generateRakutenAffiliateUrl } from '@/lib/affiliate'

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

        {/* 購入リンク */}
        <div className="mt-1.5 flex gap-1.5">
          {/* Amazonリンク */}
          <a
            href={item.amazon.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group/amazon relative flex flex-1 items-center justify-center gap-1 overflow-hidden rounded-md bg-gradient-to-b from-[#f7dfa5] via-[#f0c14b] to-[#e4a831] py-1.5 text-[10px] font-semibold text-black shadow-sm transition-all hover:shadow-md hover:shadow-[#f0c14b]/30"
          >
            {/* 光沢エフェクト */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
            <span className="relative">Amazon</span>
          </a>

          {/* 楽天リンク */}
          <a
            href={generateRakutenAffiliateUrl(item.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group/rakuten relative flex flex-1 items-center justify-center gap-1 overflow-hidden rounded-md bg-gradient-to-b from-[#e60033] via-[#bf0000] to-[#990000] py-1.5 text-[10px] font-semibold text-white shadow-sm transition-all hover:shadow-md hover:shadow-[#bf0000]/30"
          >
            {/* 光沢エフェクト */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            <span className="relative">楽天</span>
          </a>
        </div>
      </div>
    </div>
  )
}
