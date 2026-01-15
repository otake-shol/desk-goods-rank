'use client'

/**
 * 検索ボックスコンポーネント（ガジェット系デザイン）
 * 仕様書: specs/07-search.md, specs/08-search-enhancement.md
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SearchSuggestions } from './SearchSuggestions'
import { useDebounce } from '@/hooks/useDebounce'
import type { SuggestionItem } from '@/data/search'

interface SearchBoxProps {
  placeholder?: string
  className?: string
  showSuggestions?: boolean
}

export function SearchBox({
  placeholder = 'アイテムを検索...',
  className = '',
  showSuggestions = true,
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  // サジェスト取得
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!showSuggestions || debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      try {
        const { getSuggestions } = await import('@/data/search')
        const results = getSuggestions(debouncedQuery, 5)
        setSuggestions(results)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      }
    }

    fetchSuggestions()
  }, [debouncedQuery, showSuggestions])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      // サジェストが選択されている場合はその項目に遷移
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        router.push(`/item/${suggestions[selectedIndex].id}`)
        setIsOpen(false)
        return
      }

      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setIsOpen(false)
      }
    },
    [query, router, selectedIndex, suggestions]
  )

  // キーボードナビゲーション
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          break
      }
    },
    [isOpen, suggestions.length]
  )

  // フォーカス外れた時
  const handleBlur = useCallback(() => {
    // 少し遅延させてクリックイベントを先に処理
    setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 200)
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      role="search"
    >
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
          setSelectedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-sm text-white placeholder-[#8888a0] backdrop-blur-sm transition-all focus:border-[#00d4ff]/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/50"
        aria-label="検索"
        aria-expanded={isOpen && suggestions.length > 0}
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        role="combobox"
      />
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8888a0]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      {showSuggestions && (
        <SearchSuggestions
          query={query}
          isOpen={isOpen && query.length >= 2}
          onClose={() => {
            setIsOpen(false)
            setSelectedIndex(-1)
          }}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
        />
      )}
    </form>
  )
}
