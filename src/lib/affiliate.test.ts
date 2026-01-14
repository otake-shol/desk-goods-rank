/**
 * アフィリエイトURL生成のテスト
 * 仕様書: specs/04-static-data.md
 */

import { describe, it, expect } from 'vitest'
import { generateAmazonAffiliateUrl, getAffiliateTag } from './affiliate'

describe('Affiliate - generateAmazonAffiliateUrl', () => {
  it('should generate valid Amazon URL with ASIN', () => {
    const url = generateAmazonAffiliateUrl('B09XXXXX')

    expect(url).toContain('amazon.co.jp')
    expect(url).toContain('B09XXXXX')
  })

  it('should include affiliate tag in URL', () => {
    const url = generateAmazonAffiliateUrl('B09XXXXX')

    expect(url).toContain('tag=')
  })

  it('should use correct URL format', () => {
    const url = generateAmazonAffiliateUrl('B09XXXXX')

    expect(url).toMatch(/https:\/\/www\.amazon\.co\.jp\/dp\/B09XXXXX\?tag=.+/)
  })
})

describe('Affiliate - getAffiliateTag', () => {
  it('should return a non-empty string', () => {
    const tag = getAffiliateTag()

    expect(typeof tag).toBe('string')
    expect(tag.length).toBeGreaterThan(0)
  })
})
