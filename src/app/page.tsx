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
import {
  getTopRanking,
  getTopByCategory,
  getAllCategories,
} from '@/data'

export const metadata: Metadata = {
  title: 'DeskItemRank - デスク環境アイテム人気ランキング',
  description:
    'SNS・YouTube・Amazonのデータをもとに、デスク環境を充実させるアイテムの人気ランキングをお届け。モニター、キーボード、チェアなど、本当に人気のアイテムが見つかります。',
  openGraph: {
    title: 'DeskItemRank - デスク環境アイテム人気ランキング',
    description:
      'SNS・YouTube・Amazonのデータをもとに、本当に人気のデスクアイテムをランキング形式でお届け。',
    type: 'website',
  },
}

export default function Home() {
  // データ取得
  const topRanking = getTopRanking(10)
  const categories = getAllCategories()

  // カテゴリ別 TOP3
  const categoryData = categories.map((category) => ({
    category,
    items: getTopByCategory(category.id, 3),
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* ヒーローセクション */}
        <HeroSection />

        {/* 総合ランキング TOP10 */}
        <RankingSection items={topRanking} />

        {/* カテゴリ別ピックアップ */}
        <CategoryPickupSection categories={categoryData} />
      </main>

      <Footer />
    </div>
  )
}
