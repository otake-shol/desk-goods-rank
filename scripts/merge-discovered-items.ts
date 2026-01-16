/**
 * 発見したアイテムをitems.jsonにマージ
 *
 * 使用方法:
 *   npx tsx scripts/merge-discovered-items.ts              # ドライラン
 *   npx tsx scripts/merge-discovered-items.ts --apply     # 実際にマージ
 */

import * as fs from 'fs'
import * as path from 'path'

interface Item {
  id: string
  name: string
  amazon?: {
    asin: string
  }
  [key: string]: unknown
}

async function main() {
  console.log('=== 発見アイテムのマージ ===\n')

  const args = process.argv.slice(2)
  const applyMode = args.includes('--apply')

  // 発見データを読み込む
  const discoveredDir = path.join(__dirname, '../data/discovered')

  if (!fs.existsSync(discoveredDir)) {
    console.log('❌ 発見データが見つかりません。')
    console.log('   先に npx tsx scripts/discover-items.ts --save を実行してください。')
    return
  }

  // 最新の発見ファイルを取得
  const files = fs.readdirSync(discoveredDir)
    .filter(f => f.startsWith('discovered-') && f.endsWith('.json'))
    .sort()
    .reverse()

  if (files.length === 0) {
    console.log('❌ 発見データファイルが見つかりません。')
    return
  }

  const latestFile = files[0]
  console.log(`📂 最新の発見データ: ${latestFile}`)

  const discoveredPath = path.join(discoveredDir, latestFile)
  const discoveredItems: Item[] = JSON.parse(fs.readFileSync(discoveredPath, 'utf-8'))

  console.log(`📦 発見アイテム数: ${discoveredItems.length}`)

  // 既存アイテムを読み込む
  const itemsPath = path.join(__dirname, '../src/data/items.json')
  const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'))
  const existingItems: Item[] = itemsData.items

  console.log(`📦 既存アイテム数: ${existingItems.length}`)

  // 既存ASINのセット
  const existingAsins = new Set(
    existingItems.map(item => item.amazon?.asin).filter(Boolean)
  )

  // 新規アイテムをフィルタリング
  const newItems = discoveredItems.filter(item => {
    const asin = item.amazon?.asin
    return asin && !existingAsins.has(asin)
  })

  console.log(`\n✨ 新規追加対象: ${newItems.length}件\n`)

  if (newItems.length === 0) {
    console.log('すべてのアイテムが既に登録されています。')
    return
  }

  // 新規アイテム一覧を表示
  console.log('=' .repeat(60))
  for (const item of newItems) {
    console.log(`\n📍 ${item.name.substring(0, 50)}`)
    console.log(`   ASIN: ${item.amazon?.asin}`)
    console.log(`   ID: ${item.id}`)
  }
  console.log('\n' + '='.repeat(60))

  if (applyMode) {
    // マージを実行
    const mergedItems = [...existingItems, ...newItems]

    const updatedData = {
      ...itemsData,
      items: mergedItems,
    }

    fs.writeFileSync(itemsPath, JSON.stringify(updatedData, null, 2))

    console.log(`\n✅ マージ完了!`)
    console.log(`   既存: ${existingItems.length}件`)
    console.log(`   追加: ${newItems.length}件`)
    console.log(`   合計: ${mergedItems.length}件`)
  } else {
    console.log(`\n💡 実際にマージするには --apply オプションを使用してください`)
    console.log(`   npx tsx scripts/merge-discovered-items.ts --apply`)
  }
}

main().catch(console.error)
