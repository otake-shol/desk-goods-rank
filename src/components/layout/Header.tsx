'use client'

/**
 * ヘッダーコンポーネント（ガジェット系デザイン）
 * 仕様書: specs/01-top-page.md
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAllCategories } from '@/data'

export function Header() {
  const pathname = usePathname()
  const categories = getAllCategories()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /**
   * カテゴリクリック時の処理
   * トップページ: 該当セクションへスムーズスクロール
   * 他のページ: カテゴリページへ遷移
   */
  const handleCategoryClick = (e: React.MouseEvent, categoryId: string) => {
    setIsMenuOpen(false)

    if (pathname === '/') {
      e.preventDefault()
      const element = document.getElementById(`category-${categoryId}`)
      if (element) {
        const headerHeight = 64 // ヘッダーの高さ（h-16 = 64px）
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: elementPosition - headerHeight - 16,
          behavior: 'smooth',
        })
      }
    }
  }

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

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
              デスクグッズランキング
            </span>
          </Link>

          {/* デスクトップナビゲーション */}
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

          {/* モバイル用カテゴリメニューボタン */}
          <div className="relative md:hidden" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#8888a0] transition-colors hover:bg-white/5 hover:text-white"
              aria-label="カテゴリメニュー"
              aria-expanded={isMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>

            {/* ドロップダウンメニュー */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a24]/95 backdrop-blur-xl shadow-xl">
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-[#8888a0]">
                    カテゴリ
                  </div>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={pathname === '/' ? `#category-${category.id}` : `/category/${category.id}`}
                      onClick={(e) => handleCategoryClick(e, category.id)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white transition-colors hover:bg-white/5"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                        <svg className="h-4 w-4 text-[#00d4ff]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                        </svg>
                      </span>
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
