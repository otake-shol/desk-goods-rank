/**
 * データ取得関数
 * 仕様書: specs/04-static-data.md
 */

import itemsData from './items.json'
import categoriesData from './categories.json'
import { Item } from '@/types/item'
import { Category, CategoryId } from '@/types/category'

/**
 * 全アイテム取得
 */
export function getAllItems(): Item[] {
  return itemsData.items as Item[]
}

/**
 * ランキング順で取得
 * @param limit 取得件数（デフォルト: 10）
 */
export function getTopRanking(limit: number = 10): Item[] {
  return getAllItems()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

/**
 * カテゴリ別 TOP N
 * @param categoryId カテゴリID
 * @param limit 取得件数（デフォルト: 3）
 */
export function getTopByCategory(categoryId: CategoryId, limit: number = 3): Item[] {
  return getAllItems()
    .filter((item) => item.category === categoryId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

/**
 * 新着アイテム取得
 * @param limit 取得件数（デフォルト: 5）
 */
export function getNewArrivals(limit: number = 5): Item[] {
  return getAllItems()
    .filter((item) => item.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

/**
 * 注目アイテム取得
 */
export function getFeaturedItems(): Item[] {
  return getAllItems().filter((item) => item.featured)
}

/**
 * カテゴリ一覧取得
 */
export function getAllCategories(): Category[] {
  return categoriesData.categories as Category[]
}

/**
 * 単一アイテム取得
 * @param id アイテムID
 */
export function getItemById(id: string): Item | undefined {
  return getAllItems().find((item) => item.id === id)
}
