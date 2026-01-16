/**
 * データ取得関数
 * 仕様書: specs/04-static-data.md
 */

import itemsData from './items.json'
import categoriesData from './categories.json'
import { Item } from '@/types/item'
import { Category, CategoryId } from '@/types/category'

/**
 * 全アイテム取得（画像がないアイテムは除外）
 */
export function getAllItems(): Item[] {
  return (itemsData.items as Item[]).filter((item) => item.imageUrl)
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

/**
 * 単一カテゴリ取得
 * @param id カテゴリID
 */
export function getCategoryById(id: CategoryId): Category | undefined {
  return getAllCategories().find((cat) => cat.id === id)
}

/**
 * カテゴリ別アイテム取得（フィルター・ソート対応）
 */
export type SortBy = 'score' | 'newest' | 'price_asc' | 'price_desc'

interface GetItemsByCategoryOptions {
  subCategory?: string
  sortBy?: SortBy
}

interface CategoryPageData {
  items: Item[]
  category: Category | undefined
  subCategories: { id: string; name: string }[]
  totalCount: number
}

export function getItemsByCategory(
  categoryId: CategoryId,
  options: GetItemsByCategoryOptions = {}
): CategoryPageData {
  const { subCategory, sortBy = 'score' } = options

  const category = getCategoryById(categoryId)
  let items = getAllItems().filter((item) => item.category === categoryId)

  // サブカテゴリフィルター
  if (subCategory) {
    items = items.filter((item) => item.subCategory === subCategory)
  }

  // ソート
  switch (sortBy) {
    case 'newest':
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'price_asc':
      items.sort((a, b) => (a.amazon.price || 0) - (b.amazon.price || 0))
      break
    case 'price_desc':
      items.sort((a, b) => (b.amazon.price || 0) - (a.amazon.price || 0))
      break
    case 'score':
    default:
      items.sort((a, b) => b.score - a.score)
  }

  // ランク付け
  items = items.map((item, index) => ({ ...item, rank: index + 1 }))

  // サブカテゴリ一覧を取得
  const subCategories = category?.subCategories || []

  return {
    items,
    category,
    subCategories,
    totalCount: items.length,
  }
}

/**
 * 関連アイテム取得（同カテゴリ、現在のアイテムを除く）
 * @param itemId 現在のアイテムID
 * @param limit 取得件数
 */
export function getRelatedItems(itemId: string, limit: number = 4): Item[] {
  const currentItem = getItemById(itemId)
  if (!currentItem) {
    return []
  }

  return getAllItems()
    .filter((item) => item.category === currentItem.category && item.id !== itemId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
