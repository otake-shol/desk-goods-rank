/**
 * ランキングカードコンポーネント
 * 仕様書: specs/01-top-page.md
 */

import Link from 'next/link'
import { Item } from '@/types'

interface RankingCardProps {
  item: Item
  showRank?: boolean
}

export function RankingCard({ item, showRank = true }: RankingCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* ランク表示 */}
      {showRank && item.rank && (
        <div className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
          {item.rank}
        </div>
      )}

      {/* 商品画像 */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* 商品情報 */}
      <div className="flex flex-1 flex-col p-4">
        {/* カテゴリタグ */}
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {item.subCategory}
          </span>
        </div>

        {/* 商品名 */}
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900">
          <Link href={`/item/${item.id}`} className="hover:underline">
            {item.name}
          </Link>
        </h3>

        {/* 説明 */}
        <p className="mb-4 line-clamp-2 flex-1 text-xs text-gray-500">
          {item.shortDescription}
        </p>

        {/* スコアと価格 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-semibold text-gray-900">
              {item.score}
            </span>
            <span className="text-xs text-gray-500">pt</span>
          </div>
          {item.amazon.price && (
            <span className="text-sm font-medium text-gray-900">
              ¥{item.amazon.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Amazonリンク */}
        <a
          href={item.amazon.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full rounded-md bg-yellow-400 px-4 py-2 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-500"
        >
          Amazonで見る
        </a>
      </div>
    </div>
  )
}
