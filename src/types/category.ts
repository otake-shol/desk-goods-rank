/**
 * カテゴリ型定義
 * 仕様書: specs/04-static-data.md
 */

export type CategoryId = 'device' | 'furniture' | 'lighting'

export interface SubCategory {
  id: string
  name: string
  categoryId: CategoryId
}

export interface Category {
  id: CategoryId
  name: string
  nameEn: string
  description: string
  icon: string
  subCategories: SubCategory[]
}
