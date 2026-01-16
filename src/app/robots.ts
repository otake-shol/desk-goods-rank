/**
 * robots.txt生成
 * SEO対策: クロール許可設定
 */

import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deskgoodsrank.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/search?'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
