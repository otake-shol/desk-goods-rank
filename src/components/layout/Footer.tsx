/**
 * フッターコンポーネント（ガジェット系デザイン）
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
    <footer className="border-t border-white/5 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* サイト説明 */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7c3aed]">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                DeskItem<span className="text-[#00d4ff]">Rank</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#8888a0]">
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
                    className="text-sm text-[#8888a0] transition-colors hover:text-[#00d4ff]"
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
                  className="text-sm text-[#8888a0] transition-colors hover:text-[#00d4ff]"
                >
                  このサイトについて
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[#8888a0] transition-colors hover:text-[#00d4ff]"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[#8888a0] transition-colors hover:text-[#00d4ff]"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* アフィリエイト表記（法的要件） */}
        <div className="mt-8 rounded-xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-[#8888a0]">
            <span className="font-medium text-[#ff9900]">広告について:</span>{' '}
            当サイトは Amazon.co.jp アソシエイトプログラムに参加しています。
            商品リンクには広告が含まれており、リンク経由での購入により当サイトに紹介料が支払われる場合があります。
          </p>
        </div>

        {/* コピーライト */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-[#8888a0]">
            &copy; {currentYear} DeskItemRank. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#8888a0]">Powered by</span>
            <div className="flex items-center gap-1 text-xs text-[#00d4ff]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Next.js
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
