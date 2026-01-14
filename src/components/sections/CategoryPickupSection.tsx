/**
 * カテゴリ別ピックアップセクション
 * 仕様書: specs/01-top-page.md
 */

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

export function CategoryPickupSection({ categories }: CategoryPickupSectionProps) {
  return (
    <section id="categories" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* セクションタイトル */}
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            カテゴリ別ピックアップ
          </h2>
          <p className="mt-2 text-gray-600">
            各カテゴリの人気アイテム TOP3
          </p>
        </div>

        {/* カテゴリ別グリッド */}
        <div className="space-y-16">
          {categories.map(({ category, items }) => (
            <div key={category.id}>
              {/* カテゴリヘッダー */}
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {category.name}
                </h3>
                <Link
                  href={`/category/${category.id}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  すべて見る →
                </Link>
              </div>

              {/* アイテムリスト */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <RankingCard key={item.id} item={item} showRank />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
