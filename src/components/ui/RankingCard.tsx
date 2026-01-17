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
  /** コンパクト表示（正方形画像、省スペース） */
  compact?: boolean
}

export function RankingCard({ item, showRank = true, compact = false }: RankingCardProps) {
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
      <Link href={`/item/${item.id}`} className={`relative overflow-hidden bg-[#12121a] ${compact ? 'aspect-square' : 'aspect-[4/3]'}`}>
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

        {/* 商品概要（コンパクトモードでは非表示） */}
        {!compact && (
          <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8888a0]">
            {item.shortDescription}
          </p>
        )}

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
            {/* Amazonスマイルロゴ */}
            <svg className="relative h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.126.11.19.03.404-.24.638-.39.34-.863.696-1.422 1.07a20.49 20.49 0 01-8.31 2.62c-3.98.403-7.73-.378-11.25-2.34-.192-.108-.27-.234-.235-.378.032-.135.133-.24.3-.318z"/>
              <path d="M21.67 16.29c-.31-.24-.93-.12-1.28-.06-.35.07-.98.27-.9.43.07.1.42.1.79.06.38-.04 1.16-.14 1.46.1.3.22.04.91-.24 1.3-.28.4-1.03 1.05-1.94 1.43-.9.38-2.03.53-2.14.31-.07-.14.42-.63.42-.63s-.49.2-1.11.35c-.63.14-1.37.2-1.3-.02.07-.22.97-.55.97-.55s-.87.15-1.57.17c-.7.02-1.17-.12-1.1-.3.07-.17 1.1-.35 1.1-.35s-.95.05-1.37-.03c-.42-.08-.6-.26-.53-.39.07-.13.95-.08 1.6-.17.65-.1 1.4-.3 1.4-.3s-.85.03-1.32-.08c-.47-.12-.67-.36-.58-.48.1-.12 1.18-.06 1.8-.18.62-.12 1.33-.4 1.33-.4"/>
            </svg>
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
            {/* 楽天Rロゴ */}
            <svg className="relative h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h8c2.2 0 4 1.8 4 4 0 1.8-1.2 3.4-3 3.9L18 20h-4l-4.5-7H8v7H4V4zm4 6h4c1.1 0 2-.9 2-2s-.9-2-2-2H8v4z"/>
            </svg>
            <span className="relative">楽天</span>
          </a>
        </div>
      </div>
    </div>
  )
}
