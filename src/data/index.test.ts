/**
 * データ取得関数のテスト
 * 仕様書: specs/04-static-data.md
 *
 * このテストは実装より先に書かれています（テストファースト）
 */

import { describe, it, expect } from 'vitest'
import {
  getAllItems,
  getTopRanking,
  getTopByCategory,
  getNewArrivals,
  getFeaturedItems,
  getAllCategories,
  getItemById,
} from './index'

describe('Static Data - getAllItems', () => {
  it('should return all items from JSON', () => {
    const items = getAllItems()
    expect(items.length).toBeGreaterThan(0)
  })

  it('should return items with required properties', () => {
    const items = getAllItems()
    const item = items[0]

    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('name')
    expect(item).toHaveProperty('category')
    expect(item).toHaveProperty('score')
    expect(item).toHaveProperty('amazon')
    expect(item.amazon).toHaveProperty('asin')
    expect(item.amazon).toHaveProperty('affiliateUrl')
  })
})

describe('Static Data - getTopRanking', () => {
  it('should return items sorted by score descending', () => {
    const ranking = getTopRanking(10)

    for (let i = 0; i < ranking.length - 1; i++) {
      expect(ranking[i].score).toBeGreaterThanOrEqual(ranking[i + 1].score)
    }
  })

  it('should assign correct rank numbers starting from 1', () => {
    const ranking = getTopRanking(10)

    ranking.forEach((item, index) => {
      expect(item.rank).toBe(index + 1)
    })
  })

  it('should respect the limit parameter', () => {
    const top5 = getTopRanking(5)
    const top3 = getTopRanking(3)

    expect(top5.length).toBeLessThanOrEqual(5)
    expect(top3.length).toBeLessThanOrEqual(3)
  })

  it('should default to 10 items when no limit is provided', () => {
    const ranking = getTopRanking()

    expect(ranking.length).toBeLessThanOrEqual(10)
  })
})

describe('Static Data - getTopByCategory', () => {
  it('should return only items from specified category', () => {
    const devices = getTopByCategory('device', 5)

    devices.forEach((item) => {
      expect(item.category).toBe('device')
    })
  })

  it('should sort items by score within category', () => {
    const furniture = getTopByCategory('furniture', 5)

    for (let i = 0; i < furniture.length - 1; i++) {
      expect(furniture[i].score).toBeGreaterThanOrEqual(furniture[i + 1].score)
    }
  })

  it('should assign rank numbers within category', () => {
    const lighting = getTopByCategory('lighting', 3)

    lighting.forEach((item, index) => {
      expect(item.rank).toBe(index + 1)
    })
  })
})

describe('Static Data - getNewArrivals', () => {
  it('should return only items marked as new', () => {
    const newItems = getNewArrivals(5)

    newItems.forEach((item) => {
      expect(item.isNew).toBe(true)
    })
  })

  it('should sort by createdAt descending (newest first)', () => {
    const newItems = getNewArrivals(5)

    for (let i = 0; i < newItems.length - 1; i++) {
      const current = new Date(newItems[i].createdAt).getTime()
      const next = new Date(newItems[i + 1].createdAt).getTime()
      expect(current).toBeGreaterThanOrEqual(next)
    }
  })
})

describe('Static Data - getFeaturedItems', () => {
  it('should return only featured items', () => {
    const featured = getFeaturedItems()

    featured.forEach((item) => {
      expect(item.featured).toBe(true)
    })
  })
})

describe('Static Data - getAllCategories', () => {
  it('should return all categories', () => {
    const categories = getAllCategories()

    expect(categories.length).toBe(3) // device, furniture, lighting
  })

  it('should have required category properties', () => {
    const categories = getAllCategories()
    const category = categories[0]

    expect(category).toHaveProperty('id')
    expect(category).toHaveProperty('name')
    expect(category).toHaveProperty('subCategories')
    expect(Array.isArray(category.subCategories)).toBe(true)
  })
})

describe('Static Data - getItemById', () => {
  it('should return item by id', () => {
    const items = getAllItems()
    const firstItem = items[0]
    const found = getItemById(firstItem.id)

    expect(found).toBeDefined()
    expect(found?.id).toBe(firstItem.id)
  })

  it('should return undefined for non-existent id', () => {
    const found = getItemById('non-existent-id')

    expect(found).toBeUndefined()
  })
})
