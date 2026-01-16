'use client'

/**
 * ソート選択コンポーネント（Client Component）
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { SortBy } from '@/data'

interface SortSelectProps {
  defaultValue: SortBy
}

const sortOptions: { value: SortBy; label: string }[] = [
  { value: 'score', label: 'スコア順' },
  { value: 'newest', label: '新着順' },
  { value: 'price_asc', label: '価格（安い順）' },
  { value: 'price_desc', label: '価格（高い順）' },
]

export function SortSelect({ defaultValue }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSort)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-[#8888a0]">
        並び替え:
      </label>
      <select
        id="sort"
        defaultValue={defaultValue}
        onChange={handleChange}
        className="rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-1.5 text-sm text-white focus:border-[#00d4ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/50"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
