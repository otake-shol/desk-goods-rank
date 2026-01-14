/**
 * ヘッダーコンポーネント
 * 仕様書: specs/01-top-page.md
 */

import Link from 'next/link'
import { getAllCategories } from '@/data'

export function Header() {
  const categories = getAllCategories()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              DeskItemRank
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex md:space-x-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
            aria-label="メニューを開く"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
