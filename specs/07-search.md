# 機能名: 検索機能

## ステータス
- [x] 仕様確定
- [x] テスト作成
- [x] 実装完了
- [ ] レビュー完了

## 概要
アイテム名やタグで検索し、該当するアイテムを絞り込む機能。

## 背景・目的
- ユーザーが目的のアイテムを素早く見つけられるようにする
- カテゴリを横断した検索を可能にする

## 入力
| 名前 | 型 | 必須 | 説明 | 例 |
|------|-----|------|------|-----|
| query | string | Yes | 検索キーワード | "キーボード" |

## 出力
| 名前 | 型 | 説明 |
|------|-----|------|
| items | Item[] | 検索条件に一致するアイテム配列 |
| totalCount | number | 総件数 |

## 振る舞い

### シナリオ1: 通常検索
- **Given**: アイテムが10件登録されている
- **When**: 検索ボックスに「モニター」と入力する
- **Then**:
  - 名前に「モニター」を含むアイテムが表示される
  - タグに「モニター」を含むアイテムも表示される
  - 結果はスコア順で並ぶ

### シナリオ2: 結果なし
- **Given**: アイテムが10件登録されている
- **When**: 検索ボックスに「存在しないワード」と入力する
- **Then**: 「該当するアイテムがありません」と表示される

### シナリオ3: 空入力
- **Given**: 検索ボックスにフォーカスがある
- **When**: 何も入力せずに検索を実行
- **Then**: 全アイテムが表示される（検索なしと同じ）

## 検索ロジック
```typescript
function searchItems(query: string): Item[] {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return getAllItems()
  }

  return getAllItems().filter(item =>
    item.name.toLowerCase().includes(normalizedQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
  )
}
```

## エッジケース
| ケース | 期待する動作 |
|--------|-------------|
| 入力が空白のみ | 全アイテムを表示 |
| 大文字/小文字混在 | 区別せず検索（case-insensitive） |
| 日本語入力 | 正常に検索可能 |
| 特殊文字（&, <, >） | エスケープして安全に処理 |
| 非常に長い入力（1000文字以上） | 最初の100文字で検索 |

## UI/UX
- 検索ボックスはヘッダーに配置
- 入力後300msのデバウンス処理
- 検索中はローディングインジケータを表示
- 検索結果件数を表示（例: 「3件のアイテムが見つかりました」）

## 受け入れ基準
- [x] 検索ボックスに文字を入力すると、300ms後に検索が実行される
- [x] アイテム名に検索ワードを含むアイテムが表示される
- [x] タグに検索ワードを含むアイテムが表示される
- [x] 検索結果が0件の場合、「該当するアイテムがありません」と表示される
- [x] 大文字/小文字を区別せずに検索できる
- [x] 検索結果はスコア順で並んでいる
- [x] モバイルでも検索ボックスが使いやすい

## テストケース
```typescript
describe('Search - searchItems', () => {
  it('should return items matching name', () => {
    const results = searchItems('モニター')
    results.forEach(item => {
      expect(
        item.name.includes('モニター') ||
        item.tags.includes('モニター')
      ).toBe(true)
    })
  })

  it('should be case-insensitive', () => {
    const lower = searchItems('dell')
    const upper = searchItems('DELL')
    expect(lower).toEqual(upper)
  })

  it('should return all items when query is empty', () => {
    const results = searchItems('')
    const all = getAllItems()
    expect(results.length).toBe(all.length)
  })

  it('should return empty array when no matches', () => {
    const results = searchItems('存在しないワード12345')
    expect(results.length).toBe(0)
  })
})
```

## 依存関係
- データ層: `src/data/index.ts`
- UI: ヘッダーコンポーネント

## 備考
- Phase 2 で全文検索（Supabase Full Text Search）に移行予定
- 検索履歴機能は Phase 3 で検討
