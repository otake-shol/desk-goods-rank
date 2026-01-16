/**
 * サイトマップ生成
 * SEO対策: 検索エンジンのクロール効率化
 */

import { MetadataRoute } from 'next'
import { getAllItems, getAllCategories } from '@/data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deskgoodsrank.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const items = getAllItems()
  const categories = getAllCategories()

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/ranking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // カテゴリページ
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // カテゴリ別ランキングページ
  const rankingCategoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/ranking/${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // アイテム詳細ページ
  const itemPages: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${siteUrl}/item/${item.id}`,
    lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...rankingCategoryPages, ...itemPages]
}
