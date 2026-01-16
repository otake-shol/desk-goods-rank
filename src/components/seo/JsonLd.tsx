/**
 * 構造化データ(JSON-LD)コンポーネント
 * SEO対策: リッチリザルト表示用
 */

import { Item } from '@/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://desk-goods-rank.vercel.app'

// WebSite スキーマ（サイト全体）
export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'デスク・グッズ・ランク',
    alternateName: ['DeskGoodsRank', 'デスクグッズランク'],
    url: siteUrl,
    description:
      'デスク・グッズ・ランクは、SNS・YouTube・Amazonのデータをもとにデスク環境アイテムの人気ランキングをお届け。',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'デスク・グッズ・ランク',
      url: siteUrl,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ItemList スキーマ（ランキング一覧）
interface ItemListJsonLdProps {
  items: Item[]
  name: string
  description: string
  url: string
}

export function ItemListJsonLd({ items, name, description, url }: ItemListJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url: `${siteUrl}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: `${siteUrl}/item/${item.id}`,
      image: item.imageUrl,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Product スキーマ（商品詳細）
interface ProductJsonLdProps {
  item: Item
}

export function ProductJsonLd({ item }: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: item.description || item.shortDescription,
    image: item.imageUrl,
    url: `${siteUrl}/item/${item.id}`,
    brand: item.brand
      ? {
          '@type': 'Brand',
          name: item.brand,
        }
      : undefined,
    category: item.category,
    offers: item.amazon.price
      ? {
          '@type': 'Offer',
          price: item.amazon.price,
          priceCurrency: 'JPY',
          availability: 'https://schema.org/InStock',
          url: item.amazon.affiliateUrl,
          seller: {
            '@type': 'Organization',
            name: 'Amazon.co.jp',
          },
        }
      : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (item.score / 20).toFixed(1), // 100点満点を5点満点に変換
      bestRating: '5',
      worstRating: '1',
      ratingCount: 1,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// BreadcrumbList スキーマ（パンくずリスト）
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Organization スキーマ
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'デスク・グッズ・ランク',
    alternateName: ['DeskGoodsRank', 'デスクグッズランク'],
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description:
      'デスク環境アイテムの人気ランキングサイト。SNS・YouTube・Amazonのデータをもとにランキングを算出。',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
