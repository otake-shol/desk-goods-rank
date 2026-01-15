'use client'

/**
 * 検索サジェストコンポーネント
 * 仕様書: specs/08-search-enhancement.md
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { SuggestionItem } from '@/data/search'

interface SearchSuggestionsProps {
  query: string
  isOpen: boolean
  onClose: () => void
  selectedIndex: number
  onSelectIndex: (index: number) => void
}

export function SearchSuggestions({
  query,
  isOpen,
  onClose,
  selectedIndex,
  onSelectIndex,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()

  // サジェストを取得
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        // クライアントサイドでインポート
        const { getSuggestions } = await import('@/data/search')
        const results = getSuggestions(debouncedQuery, 5)
        setSuggestions(results)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  // アイテム選択
  const handleSelect = useCallback(
    (suggestion: SuggestionItem) => {
      router.push(`/item/${suggestion.id}`)
      onClose()
    },
    [router, onClose]
  )

  // キーボードでEnterが押された時
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      // 選択されたアイテムがある場合は何もしない（親コンポーネントで処理）
    }
  }, [selectedIndex, suggestions])

  if (!isOpen || suggestions.length === 0) {
    return null
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a24] shadow-xl shadow-black/50 backdrop-blur-sm">
      {isLoading ? (
        <div className="p-3 text-center text-sm text-[#8888a0]">
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            読み込み中...
          </span>
        </div>
      ) : (
        <ul role="listbox" className="divide-y divide-white/5">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              role="option"
              aria-selected={index === selectedIndex}
              className={`cursor-pointer px-4 py-3 transition-colors ${
                index === selectedIndex
                  ? 'bg-white/10'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => onSelectIndex(index)}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-white">
                  {suggestion.name}
                </span>
                <span className="shrink-0 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-2 py-0.5 text-xs text-[#00d4ff]">
                  {suggestion.category}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// 現在選択されているサジェストを取得するためのヘルパー
export function getSelectedSuggestion(
  suggestions: SuggestionItem[],
  selectedIndex: number
): SuggestionItem | null {
  if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
    return suggestions[selectedIndex]
  }
  return null
}
