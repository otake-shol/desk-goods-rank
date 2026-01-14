/**
 * フッターコンポーネント
 * 仕様書: specs/01-top-page.md
 *
 * 重要: アフィリエイト表記は法的要件のため必須
 */

import Link from 'next/link'
import { getAllCategories } from '@/data'

export function Footer() {
  const categories = getAllCategories()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* サイト説明 */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-white">DeskItemRank</h3>
            <p className="mt-2 text-sm">
              デスク環境を充実させるアイテムの人気ランキングサイト。
              SNS・動画・売れ筋データをもとに、本当に人気のアイテムをランキング形式でお届けします。
            </p>
          </div>

          {/* カテゴリリンク */}
          <div>
            <h4 className="text-sm font-semibold text-white">カテゴリ</h4>
            <ul className="mt-4 space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.id}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* その他リンク */}
          <div>
            <h4 className="text-sm font-semibold text-white">リンク</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm hover:text-white transition-colors"
                >
                  このサイトについて
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm hover:text-white transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:text-white transition-colors"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* アフィリエイト表記（法的要件） */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-xs text-gray-400">
            ※ 当サイトは Amazon.co.jp アソシエイトプログラムに参加しています。
            商品リンクには広告が含まれており、リンク経由での購入により当サイトに紹介料が支払われる場合があります。
          </p>
        </div>

        {/* コピーライト */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-center text-xs text-gray-400">
            &copy; {currentYear} DeskItemRank. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
