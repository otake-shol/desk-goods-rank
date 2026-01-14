# 機能名: トップページ

## ステータス
- [ ] 仕様確定
- [ ] テスト作成
- [ ] 実装完了
- [ ] レビュー完了

## 概要
サイトのメインエントリーポイント。人気アイテムのランキング、カテゴリ一覧、最新の注目アイテムを表示する。

## 背景・目的
- ユーザーが最初に訪れるページとして、サイトの価値を即座に伝える
- 人気アイテムへの導線を提供
- カテゴリごとの探索を促す

## ページ構成

### 1. ヘッダー
- サイトロゴ
- ナビゲーション（カテゴリ一覧）
- 検索バー（Phase 2）

### 2. ヒーローセクション
- キャッチコピー
- サブタイトル（説明文）
- メインCTA（「ランキングを見る」など）

### 3. 総合ランキングセクション
- タイトル: 「総合人気ランキング TOP10」
- 表示内容（各アイテム）:
  - 順位
  - 商品画像
  - 商品名
  - カテゴリタグ
  - スコア
  - Amazonリンク（アフィリエイト）
- 「もっと見る」リンク

### 4. カテゴリ別ピックアップ
- 3つのメインカテゴリ（デバイス/家具/照明）
- 各カテゴリ TOP3 を表示
- カテゴリページへのリンク

### 5. 注目の新着アイテム
- 最近追加されたアイテム
- 3-5件表示

### 6. フッター
- サイト説明
- カテゴリリンク
- プライバシーポリシー
- アフィリエイト表記（※必須）

## データ構造

### Item（アイテム）
```typescript
interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: Category;
  subCategory: string;
  score: number;
  rank: number;
  amazonUrl: string;
  amazonAsin: string;
  price?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type Category = 'device' | 'furniture' | 'lighting';
```

### 表示用データ
```typescript
interface TopPageData {
  topRanking: Item[];        // TOP10
  deviceTop3: Item[];        // デバイス TOP3
  furnitureTop3: Item[];     // 家具 TOP3
  lightingTop3: Item[];      // 照明 TOP3
  newArrivals: Item[];       // 新着 3-5件
}
```

## UI コンポーネント

| コンポーネント | 説明 |
|---------------|------|
| Header | サイトヘッダー |
| HeroSection | ヒーローエリア |
| RankingCard | ランキングアイテムカード |
| RankingList | ランキングリスト |
| CategorySection | カテゴリ別セクション |
| ItemCard | アイテムカード（小） |
| Footer | サイトフッター |

## レスポンシブ対応

| ブレークポイント | 表示 |
|-----------------|------|
| mobile (< 768px) | 1カラム、カードは縦並び |
| tablet (768px - 1024px) | 2カラム |
| desktop (> 1024px) | 3カラム、フル表示 |

## SEO 要件
- title: 「DeskItemRank - デスク環境アイテム人気ランキング」
- meta description: サイト説明文
- OGP 設定（title, description, image）
- 構造化データ（ItemList）

## アクセシビリティ
- 画像に alt 属性
- フォーカス可能な要素にフォーカスリング
- カラーコントラスト 4.5:1 以上

## 受け入れ基準
- [ ] ヘッダーが表示され、ナビゲーションが機能する
- [ ] ヒーローセクションにキャッチコピーとCTAが表示される
- [ ] 総合ランキング TOP10 が順位付きで表示される
- [ ] 各アイテムにAmazonアフィリエイトリンクがある
- [ ] カテゴリ別 TOP3 が表示される
- [ ] 新着アイテムが表示される
- [ ] フッターにアフィリエイト表記がある
- [ ] モバイル表示で崩れない
- [ ] Lighthouse パフォーマンススコア 90+
- [ ] OGP が正しく設定されている

## テストケース
```typescript
describe('TopPage', () => {
  it('should render header with navigation', () => {
    // ヘッダーとナビゲーションの表示確認
  });

  it('should display top 10 ranking items', () => {
    // TOP10 アイテムが順位付きで表示されることを確認
  });

  it('should have affiliate links with correct tracking', () => {
    // アフィリエイトリンクが正しく設定されていることを確認
  });

  it('should display category sections with top 3 items each', () => {
    // 各カテゴリ TOP3 が表示されることを確認
  });

  it('should be responsive on mobile', () => {
    // モバイル表示で正しくレイアウトされることを確認
  });

  it('should have correct meta tags for SEO', () => {
    // SEO 用メタタグが設定されていることを確認
  });

  it('should include affiliate disclosure in footer', () => {
    // フッターにアフィリエイト表記があることを確認
  });
});
```

## 依存関係
- データ: `specs/04-static-data.md`（Phase 1）
- コンポーネント: 共通UIコンポーネント

## 備考
- Phase 1 では静的 JSON データを使用
- Phase 2 で Supabase からの動的取得に移行
