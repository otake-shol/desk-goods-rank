/**
 * トップページ
 * 仕様書: specs/01-top-page.md
 */

import { Metadata } from 'next'
import {
  Header,
  Footer,
  HeroSection,
  RankingSection,
  CategoryPickupSection,
} from '@/components'
import { ItemListJsonLd } from '@/components/seo/JsonLd'
import {
  getTopRanking,
  getTopByCategory,
  getAllCategories,
  getAllItems,
} from '@/data'

export const metadata: Metadata = {
  title: 'デスク・グッズ・ランク | デスク環境アイテム人気ランキング',
  description:
    'デスク・グッズ・ランクは、SNS・YouTube・Amazonのデータをもとにデスク環境アイテムの人気ランキングをお届け。モニター、キーボード、チェアなど、本当に人気のデスクグッズが見つかります。',
  openGraph: {
    title: 'デスク・グッズ・ランク | デスク環境アイテム人気ランキング',
    description:
      'デスク・グッズ・ランクは、SNS・YouTube・Amazonのデータをもとに本当に人気のデスクグッズをランキング形式でお届け。',
    type: 'website',
    url: '/',
  },
}

export default function Home() {
  // データ取得
  const allItems = getAllItems()
  const topRanking = getTopRanking(10)
  const categories = getAllCategories()

  // カテゴリ別 TOP3
  const categoryData = categories.map((category) => ({
    category,
    items: getTopByCategory(category.id, 3),
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <ItemListJsonLd
        items={topRanking}
        name="デスク・グッズ・ランク 総合人気ランキング TOP10"
        description="SNS・YouTube・Amazonのデータをもとに算出したデスクグッズの人気ランキング"
        url="/"
      />
      <Header />

      <main className="flex-1">
        {/* ヒーローセクション */}
        <HeroSection />

        {/* 総合ランキング TOP10 */}
        <RankingSection items={topRanking} totalCount={allItems.length} />

        {/* カテゴリ別ピックアップ */}
        <CategoryPickupSection categories={categoryData} />
      </main>

      <Footer />
    </div>
  )
}
