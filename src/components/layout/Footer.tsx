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
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative h-8 w-8">
                <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
                  {/* モニター */}
                  <rect x="2" y="4" width="22" height="16" rx="2" fill="#1a1a24" stroke="#00d4ff" strokeWidth="1.5" className="group-hover:stroke-white transition-colors"/>
                  <rect x="4" y="6" width="18" height="12" rx="1" fill="#12121a"/>
                  {/* スタンド */}
                  <path d="M10 20v3h6v-3" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" className="group-hover:stroke-white transition-colors"/>
                  <path d="M8 23h10" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" className="group-hover:stroke-white transition-colors"/>
                  {/* 星 */}
                  <path d="M26 6l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4L26 6z" fill="#ffd700"/>
                </svg>
              </div>
              <span className="text-base font-semibold text-white tracking-tight">
                DeskGoodsRanks
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
        <div className="mt-8 border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-[#8888a0]">
            &copy; {currentYear} DeskGoodsRanks. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
