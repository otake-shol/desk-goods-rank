/**
 * 既存アイテムの画像をチェック・修正するスクリプト
 *
 * 使用方法:
 *   npx tsx scripts/check-images.ts              # チェックのみ
 *   npx tsx scripts/check-images.ts --fix        # 問題のある画像を再取得
 */

import * as fs from 'fs'
import * as path from 'path'
import { validateImageUrl, fetchAmazonProductInfo } from './collectors/item-discovery'

interface Item {
  id: string
  name: string
  imageUrl: string | null
  amazon?: {
    asin: string
  }
}

interface ImageCheckResult {
  id: string
  name: string
  asin: string
  currentUrl: string | null
  status: 'valid' | 'invalid' | 'missing' | 'placeholder'
  reason?: string
  newUrl?: string | null
}

async function checkItemImage(item: Item): Promise<ImageCheckResult> {
  const result: ImageCheckResult = {
    id: item.id,
    name: item.name,
    asin: item.amazon?.asin || '',
    currentUrl: item.imageUrl,
    status: 'valid',
  }

  if (!item.imageUrl) {
    result.status = 'missing'
    result.reason = '画像URLが設定されていません'
    return result
  }

  // プレースホルダーチェック
  if (item.imageUrl.includes('placeholder') || item.imageUrl.includes('via.placeholder')) {
    result.status = 'placeholder'
    result.reason = 'プレースホルダー画像です'
    return result
  }

  // ストック画像チェック（Unsplashなど）
  if (item.imageUrl.includes('unsplash.com') || item.imageUrl.includes('pexels.com') || item.imageUrl.includes('pixabay.com')) {
    result.status = 'placeholder'
    result.reason = 'ストック画像です（実際の商品画像ではありません）'
    return result
  }

  // 画像URLを検証
  const validation = await validateImageUrl(item.imageUrl)
  if (!validation.isValid) {
    result.status = 'invalid'
    result.reason = validation.reason
  }

  return result
}

async function fixItemImage(item: Item): Promise<string | null> {
  if (!item.amazon?.asin) {
    console.log(`    ⚠️ ASINがありません`)
    return null
  }

  console.log(`    🔄 Amazonから再取得中...`)
  const productInfo = await fetchAmazonProductInfo(item.amazon.asin)

  if (productInfo?.imageUrl) {
    console.log(`    ✅ 新しい画像を取得`)
    return productInfo.imageUrl
  } else {
    console.log(`    ❌ 画像を取得できませんでした`)
    return null
  }
}

async function main() {
  const args = process.argv.slice(2)
  const fixMode = args.includes('--fix')

  console.log('=== 画像チェック開始 ===\n')

  // items.jsonを読み込み
  const itemsPath = path.join(__dirname, '../src/data/items.json')
  const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'))
  const items: Item[] = itemsData.items

  console.log(`📦 チェック対象: ${items.length}件\n`)

  const results: ImageCheckResult[] = []
  let checkedCount = 0

  for (const item of items) {
    checkedCount++
    process.stdout.write(`\r  チェック中... ${checkedCount}/${items.length}`)

    const result = await checkItemImage(item)
    results.push(result)

    // レート制限対策
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log('\n')

  // 結果を集計
  const validItems = results.filter(r => r.status === 'valid')
  const invalidItems = results.filter(r => r.status === 'invalid')
  const missingItems = results.filter(r => r.status === 'missing')
  const placeholderItems = results.filter(r => r.status === 'placeholder')

  console.log('📊 チェック結果:')
  console.log(`   ✅ 正常: ${validItems.length}件`)
  console.log(`   ❌ 無効: ${invalidItems.length}件`)
  console.log(`   ⚠️ 未設定: ${missingItems.length}件`)
  console.log(`   🔲 プレースホルダー: ${placeholderItems.length}件`)

  const problemItems = [...invalidItems, ...missingItems, ...placeholderItems]

  if (problemItems.length === 0) {
    console.log('\n✨ すべての画像が正常です!')
    return
  }

  console.log(`\n\n🔍 問題のあるアイテム (${problemItems.length}件):`)
  console.log('─'.repeat(60))

  for (const item of problemItems) {
    console.log(`\n  ${item.name.substring(0, 50)}`)
    console.log(`  ID: ${item.id}`)
    console.log(`  ASIN: ${item.asin}`)
    console.log(`  状態: ${item.status}`)
    if (item.reason) {
      console.log(`  理由: ${item.reason}`)
    }
  }

  // 修正モード
  if (fixMode && problemItems.length > 0) {
    console.log('\n\n🔧 画像を再取得中...\n')

    let fixedCount = 0
    const updatedItems = [...items]

    for (const problem of problemItems) {
      console.log(`\n[${fixedCount + 1}/${problemItems.length}] ${problem.name.substring(0, 40)}...`)

      const itemIndex = updatedItems.findIndex(i => i.id === problem.id)
      if (itemIndex === -1) continue

      const newImageUrl = await fixItemImage(updatedItems[itemIndex])

      if (newImageUrl) {
        updatedItems[itemIndex].imageUrl = newImageUrl
        problem.newUrl = newImageUrl
        fixedCount++
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // 更新されたアイテムを保存
    if (fixedCount > 0) {
      itemsData.items = updatedItems
      fs.writeFileSync(itemsPath, JSON.stringify(itemsData, null, 2))
      console.log(`\n\n💾 ${fixedCount}件の画像を更新しました`)
    } else {
      console.log('\n\n⚠️ 更新できた画像はありませんでした')
    }

    // 修正結果サマリー
    const stillBroken = problemItems.filter(p => !p.newUrl)
    if (stillBroken.length > 0) {
      console.log(`\n⚠️ 修正できなかったアイテム (${stillBroken.length}件):`)
      for (const item of stillBroken) {
        console.log(`   - ${item.name.substring(0, 40)}... (${item.asin})`)
      }
    }
  } else if (!fixMode && problemItems.length > 0) {
    console.log('\n\n💡 画像を修正するには --fix オプションを使用してください')
    console.log('   npx tsx scripts/check-images.ts --fix')
  }

  console.log('\n=== 画像チェック完了 ===')
}

main().catch(console.error)
