'use client'

/**
 * ヘッダーコンポーネント（ガジェット系デザイン）
 * 仕様書: specs/01-top-page.md
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAllCategories } from '@/data'

export function Header() {
  const pathname = usePathname()
  const categories = getAllCategories()

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ロゴ */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 shrink-0 group">
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
              デスク・グッズ・ランク
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex md:items-center md:gap-1 shrink-0">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#8888a0] transition-colors hover:bg-white/5 hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
