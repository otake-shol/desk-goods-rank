# アイテム管理・運用ガイド

このドキュメントでは、DeskItemRankのアイテムを追加・更新する方法を説明します。

## 目次

1. [アイテム追加方法の概要](#アイテム追加方法の概要)
2. [自動発見による追加](#自動発見による追加)
3. [手動による追加](#手動による追加)
4. [データ収集（スコア更新）](#データ収集スコア更新)
5. [画像チェック・修正](#画像チェック修正)
6. [トラブルシューティング](#トラブルシューティング)

---

## アイテム追加方法の概要

アイテムを追加する方法は2つあります：

| 方法 | 説明 | 推奨用途 |
|------|------|----------|
| 自動発見 | 複数ソースから自動でアイテムを発見 | 大量追加 |
| 手動追加 | items.jsonに直接追加 | 個別追加・品質管理 |

---

## 自動発見による追加

### Step 1: アイテムを発見する

```bash
# ドライラン（発見のみ、保存しない）- 全ソース
npm run discover-items

# 特定ソースのみから発見
npx tsx scripts/discover-items.ts --note-only      # note.comのみ
npx tsx scripts/discover-items.ts --youtube-only   # YouTubeのみ（要：YOUTUBE_API_KEY）
npx tsx scripts/discover-items.ts --zenn-only      # Zennのみ
npx tsx scripts/discover-items.ts --hatena-only    # はてなブログのみ
npx tsx scripts/discover-items.ts --amazon-only    # Amazonベストセラーのみ
npx tsx scripts/discover-items.ts --kakaku-only    # 価格.comのみ
npx tsx scripts/discover-items.ts --makuake-only   # Makuakeのみ
npx tsx scripts/discover-items.ts --all            # 全ソース（デフォルト）
```

### Step 2: 商品情報を取得して保存

```bash
npm run discover-items:save
```

このコマンドは以下を実行します：
1. 各ソースからAmazonリンク/ASINを抽出
2. 発見したASINからAmazon商品情報をスクレイピング
3. `data/discovered/discovered-YYYY-MM-DD.json` に保存

### Step 3: items.jsonにマージ

```bash
# ドライラン（確認のみ）
npx tsx scripts/merge-discovered-items.ts

# 実際にマージ
npm run merge-items
```

### 自動発見のソース

| ソース | 発見方法 | 期待アイテム数 | 特徴 |
|--------|----------|---------------|------|
| note.com | デスクツアー記事本文のAmazonリンク | 30〜50件/回 | 日本のクリエイター向け |
| YouTube | 動画説明欄のAmazonリンク | 20〜40件/回 | 要API KEY |
| Zenn | エンジニア向けデスク環境記事 | 10〜30件/回 | 技術者向けガジェット |
| はてなブログ | デスクツアー関連記事・ホットエントリー | 10〜30件/回 | 日本最大級ブログ |
| Amazonベストセラー | カテゴリ別ベストセラーランキング | 40〜80件/回 | 信頼性高い・カテゴリ自動分類 |
| 価格.com | ランキングページからAmazonリンク抽出 | 50〜80件/回 | 比較サイト（ASIN取得率は低い） |
| Makuake | クラウドファンディングプロジェクト | 5〜20件/回 | 新製品発見（Amazon販売後のみ） |

### 注意事項

- Amazonスクレイピングにはレート制限があります（2秒/リクエスト）
- 発見したアイテムは `data/discovered/` に保存されます
- マージ前に内容を確認することを推奨します

---

## 手動による追加

### アイテムデータの構造

`src/data/items.json` に以下の形式で追加します：

```json
{
  "id": "keyboard-hhkb-hybrid",
  "name": "HHKB Professional HYBRID Type-S",
  "description": "静電容量無接点方式の高級キーボード。Bluetooth/USB両対応。",
  "shortDescription": "プロ御用達の静音高級キーボード",
  "imageUrl": "https://example.com/image.jpg",
  "category": "device",
  "subCategory": "keyboard",
  "score": 0,
  "amazon": {
    "asin": "B082TYNNL2",
    "url": "https://www.amazon.co.jp/dp/B082TYNNL2",
    "affiliateUrl": "https://www.amazon.co.jp/dp/B082TYNNL2?tag=otkshol01-22",
    "price": 36850
  },
  "tags": ["静電容量", "無接点", "Bluetooth", "HHKB"],
  "brand": "PFU",
  "featured": false,
  "isNew": true,
  "createdAt": "2024-01-05",
  "updatedAt": "2024-01-10",
  "socialScore": {
    "twitter": 0,
    "youtube": 0,
    "amazon": 50,
    "note": 0
  }
}
```

### フィールド説明

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `id` | ✅ | 一意のID（`{subCategory}-{識別子}`形式推奨） |
| `name` | ✅ | 商品名 |
| `description` | ✅ | 詳細説明 |
| `shortDescription` | ✅ | 短い説明（30文字以内） |
| `imageUrl` | ✅ | 商品画像URL |
| `category` | ✅ | カテゴリ（device/furniture/lighting） |
| `subCategory` | ✅ | サブカテゴリ（下記参照） |
| `score` | ✅ | スコア（0で初期化、自動更新される） |
| `amazon.asin` | ✅ | Amazon ASIN（10桁） |
| `amazon.affiliateUrl` | ✅ | アフィリエイトURL（tag=otkshol01-22） |
| `amazon.price` | ✅ | 価格（円） |
| `tags` | ❌ | タグ配列 |
| `brand` | ❌ | ブランド名 |
| `featured` | ❌ | 注目アイテムか |
| `isNew` | ❌ | 新着アイテムか |

### カテゴリ・サブカテゴリ一覧

```
device/
├── keyboard      # キーボード
├── mouse         # マウス
├── trackball     # トラックボール
├── monitor       # モニター
├── headphone     # ヘッドホン
├── earphone      # イヤホン
├── webcam        # Webカメラ
├── microphone    # マイク
├── speaker       # スピーカー
├── smart-display # スマートディスプレイ
└── other         # その他デバイス

audio/
├── dac-amp            # DAC/アンプ
├── bluetooth-receiver # Bluetoothレシーバー
└── audio-accessory    # オーディオアクセサリ

furniture/
├── desk             # デスク
├── chair            # チェア
├── monitor-arm      # モニターアーム
├── arm-accessory    # アーム補強プレート
├── cable-management # 配線整理
└── other            # その他家具

lighting/
├── desk-light    # デスクライト
├── ambient-light # 間接照明
├── desk-mat      # デスクマット
├── plant         # 観葉植物
├── organizer     # デスクオーガナイザー
└── other         # その他

accessory/
├── charger          # 充電器・電源タップ
├── hub              # USBハブ・ドック
├── storage          # 収納・ケース
├── cable            # ケーブル
└── mouse-accessory  # マウスアクセサリ
```

### ASINの調べ方

1. Amazon商品ページを開く
2. URLから抽出: `amazon.co.jp/dp/B082TYNNL2` → ASIN: `B082TYNNL2`
3. または商品ページの「商品情報」セクションで確認

---

## データ収集（スコア更新）

### 手動でスコアを更新

```bash
# データ収集のみ（items.jsonは更新しない）
npm run collect-data

# データ収集 + items.json更新
npm run collect-data:update
```

### 収集されるデータ

| ソース | 収集内容 |
|--------|----------|
| Twitter | ツイート数、いいね、RT |
| YouTube | 動画数、再生数、コメント |
| note.com | 記事数、スキ数 |

### GitHub Actionsによる自動収集

毎日 JST 9:00 に自動実行されます。

```yaml
# .github/workflows/collect-data.yml
schedule:
  - cron: '0 0 * * *'  # UTC 0:00 = JST 9:00
```

### 収集データの保存先

```
data/
├── collected/
│   ├── collected-2026-01-15.json  # 日次収集データ
│   └── collected-2026-01-16.json
└── discovered/
    └── discovered-2026-01-15.json  # 発見アイテムデータ
```

---

## 画像チェック・修正

### 画像チェックの実行

```bash
# チェックのみ（変更なし）
npx tsx scripts/check-images.ts

# 問題のある画像を自動修正
npx tsx scripts/check-images.ts --fix
```

### チェック内容

| ステータス | 説明 |
|-----------|------|
| `valid` | 正常な商品画像 |
| `invalid` | HTTPエラー（404など） |
| `missing` | 画像URLがnull |
| `placeholder` | ストック画像（Unsplash等）またはプレースホルダー |

### 自動修正できないケース

以下の場合は手動対応が必要です：

1. **日本のAmazonで入手できない商品**（海外ブランド等）
2. **ASINが無効または商品ページが削除された**
3. **Amazonのレート制限**（時間をおいて再実行）

### 手動で画像を設定する方法

#### Step 1: 問題アイテムを特定

```bash
npx tsx scripts/check-images.ts
```

出力例：
```
🔍 問題のあるアイテム (1件):
  Grovemade デスクマット
  ID: desk-mat-grovemade
  ASIN: B08QS64X7J
  状態: missing
```

#### Step 2: 画像URLを取得

**方法A: Amazon.co.jpから取得**
1. `https://www.amazon.co.jp/dp/{ASIN}` を開く
2. 商品画像を右クリック → 「画像アドレスをコピー」
3. URLの `_AC_SX300_` などを `_AC_SL500_` に変更（高解像度化）

**方法B: 代替商品を探す**
1. Amazon.co.jpで類似商品を検索
2. 正しいASINと画像URLを取得

**方法C: 公式サイトから取得**
1. メーカー公式サイトの商品画像を使用
2. ※著作権に注意

#### Step 3: items.jsonを更新

```bash
# エディタで開く
open -a "Antigravity" src/data/items.json
```

該当アイテムを検索し、以下を更新：

```json
{
  "id": "desk-mat-example",
  "imageUrl": "https://m.media-amazon.com/images/I/xxxxx._AC_SL500_.jpg",
  "needsImageReview": false,  // この行を削除または false に
  "amazon": {
    "asin": "B0XXXXXXXX"  // 必要に応じてASINも更新
  }
}
```

### アイテムを削除する場合

日本で入手できない商品は削除を検討：

```bash
# items.jsonから該当アイテムのオブジェクト全体を削除
# IDで検索して削除
```

削除後はサイトの表示を確認：
```bash
npm run dev
```

### 代替商品に置き換える場合

1. Amazon.co.jpで類似商品を検索
2. 新しいASINで商品情報を取得：

```bash
npx tsx -e "
import { fetchAmazonProductInfo } from './scripts/collectors/item-discovery';
(async () => {
  const info = await fetchAmazonProductInfo('B0XXXXXXXX');
  console.log(JSON.stringify(info, null, 2));
})();
"
```

3. items.jsonの該当アイテムを更新

### needsImageReviewフラグ

画像に問題があるアイテムには `needsImageReview: true` が付与されます：

```json
{
  "id": "some-item",
  "imageUrl": null,
  "needsImageReview": true
}
```

このフラグが付いたアイテムを一括検索：

```bash
grep -l "needsImageReview.*true" src/data/items.json
```

### 運用チェックリスト

```
[ ] 週次で check-images.ts を実行
[ ] placeholder/missing のアイテムを確認
[ ] 自動修正を試行（--fix）
[ ] 修正できないものは手動対応
[ ] needsImageReview フラグをクリア
[ ] 変更をコミット・プッシュ
```

---

## トラブルシューティング

### Q: 発見スクリプトが遅い

note.comの記事をスクレイピングするため、50記事で約2分かかります。
`--note-only` や `--youtube-only` で対象を絞ることができます。

### Q: Amazonの商品情報が取得できない

- ASINが正しいか確認
- Amazonのレート制限に引っかかっている可能性あり（時間をおいて再実行）
- 商品ページが存在しない可能性あり

### Q: YouTubeからの発見ができない

環境変数 `YOUTUBE_API_KEY` が設定されているか確認：

```bash
echo $YOUTUBE_API_KEY
```

設定方法：
```bash
export YOUTUBE_API_KEY="your-api-key"
```

### Q: スコアが0のまま更新されない

`npm run collect-data:update` で `--update` フラグを付けて実行してください。

### Q: 重複アイテムが追加された

`merge-items` コマンドはASINで重複チェックを行います。
同じASINのアイテムは自動的にスキップされます。

---

## 運用フロー（推奨）

### 週次運用

```bash
# 1. 新しいアイテムを発見
npm run discover-items:save

# 2. 発見結果を確認
cat data/discovered/discovered-$(date +%Y-%m-%d).json | jq '.[] | .name'

# 3. 問題なければマージ
npm run merge-items

# 4. スコアを更新
npm run collect-data:update

# 5. 動作確認
npm run dev
```

### 日次運用（自動）

GitHub Actionsにより以下が自動実行されます：
- スコアデータ収集
- items.json更新
- 自動コミット・プッシュ

---

## 関連ファイル

| ファイル | 説明 |
|---------|------|
| `src/data/items.json` | アイテムマスターデータ |
| `src/data/categories.json` | カテゴリ定義 |
| `scripts/discover-items.ts` | アイテム自動発見（統合スクリプト） |
| `scripts/merge-discovered-items.ts` | 発見アイテムのマージ |
| `scripts/collect-data.ts` | スコアデータ収集 |
| `scripts/collectors/note.ts` | note.comスクレイパー |
| `scripts/collectors/youtube.ts` | YouTube API連携 |
| `scripts/collectors/item-discovery.ts` | ASIN抽出・商品情報取得（コア） |
| `scripts/collectors/zenn-collector.ts` | Zenn記事スクレイパー |
| `scripts/collectors/hatena-collector.ts` | はてなブログスクレイパー |
| `scripts/collectors/amazon-bestseller-collector.ts` | Amazonベストセラー取得 |
| `scripts/collectors/kakaku-collector.ts` | 価格.comランキングスクレイパー |
| `scripts/collectors/makuake-collector.ts` | Makuakeクラウドファンディングスクレイパー |
| `scripts/check-images.ts` | 画像チェック・自動修正スクリプト |
