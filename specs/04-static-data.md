# 機能名: 静的データ管理（Phase 1）

## ステータス
- [ ] 仕様確定
- [ ] データ構造定義
- [ ] サンプルデータ作成
- [ ] 型定義完了

## 概要
Phase 1 では、データベースを使用せず JSON ファイルでアイテムデータを管理する。手動でキュレーションしたアイテムを静的データとして提供。

## 背景・目的
- MVP を素早くリリースするため、DB 構築を後回しに
- データ構造を実際に使いながら検証
- Phase 2 への移行を見据えた設計

## ディレクトリ構造
```
src/
├── data/
│   ├── items.json          # 全アイテムデータ
│   ├── categories.json     # カテゴリマスタ
│   └── index.ts            # データ取得関数
└── types/
    └── item.ts             # 型定義
```

## データ型定義

### Category（カテゴリ）
```typescript
// src/types/category.ts

export type CategoryId = 'device' | 'furniture' | 'lighting';

export interface Category {
  id: CategoryId;
  name: string;           // "デバイス"
  nameEn: string;         // "Device"
  description: string;
  icon: string;           // アイコン名
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;             // "monitor", "keyboard" など
  name: string;
  categoryId: CategoryId;
}
```

### Item（アイテム）
```typescript
// src/types/item.ts

import { CategoryId } from './category';

export interface Item {
  id: string;                    // ユニークID
  name: string;                  // 商品名
  nameEn?: string;               // 英語名（検索用）
  description: string;           // 説明文
  shortDescription: string;      // 短い説明（カード用）
  imageUrl: string;              // メイン画像URL
  images?: string[];             // 追加画像

  // カテゴリ
  category: CategoryId;
  subCategory: string;

  // ランキング
  score: number;                 // 総合スコア（0-100）
  rank?: number;                 // 順位（動的に計算）

  // ソーシャルスコア（参考値）
  socialScore?: {
    twitter: number;
    youtube: number;
    amazon: number;
  };

  // Amazon 情報
  amazon: {
    asin: string;                // ASIN
    url: string;                 // 商品URL
    affiliateUrl: string;        // アフィリエイトURL
    price?: number;              // 価格（円）
    priceUpdatedAt?: string;     // 価格更新日
  };

  // メタ情報
  tags: string[];
  brand?: string;
  releaseDate?: string;

  // 管理情報
  featured: boolean;             // 注目アイテム
  isNew: boolean;                // 新着フラグ
  createdAt: string;
  updatedAt: string;
}
```

## サンプルデータ

### items.json の例
```json
{
  "items": [
    {
      "id": "monitor-dell-u2723qe",
      "name": "Dell U2723QE 27インチ 4K USB-Cハブモニター",
      "description": "USB-C 90W給電対応の27インチ4Kモニター。IPS Blackパネル採用で高コントラスト。",
      "shortDescription": "USB-C給電対応の高画質4Kモニター",
      "imageUrl": "/images/items/dell-u2723qe.jpg",
      "category": "device",
      "subCategory": "monitor",
      "score": 92,
      "amazon": {
        "asin": "B09XXXXX",
        "url": "https://www.amazon.co.jp/dp/B09XXXXX",
        "affiliateUrl": "https://www.amazon.co.jp/dp/B09XXXXX?tag=your-tag-22",
        "price": 89800
      },
      "tags": ["4K", "USB-C", "IPS", "27インチ", "Dell"],
      "brand": "Dell",
      "featured": true,
      "isNew": false,
      "createdAt": "2024-01-01",
      "updatedAt": "2024-01-15"
    }
  ]
}
```

### categories.json の例
```json
{
  "categories": [
    {
      "id": "device",
      "name": "デバイス",
      "nameEn": "Device",
      "description": "モニター、キーボード、マウスなどの入出力機器",
      "icon": "monitor",
      "subCategories": [
        { "id": "monitor", "name": "モニター", "categoryId": "device" },
        { "id": "keyboard", "name": "キーボード", "categoryId": "device" },
        { "id": "mouse", "name": "マウス", "categoryId": "device" },
        { "id": "headphone", "name": "イヤホン/ヘッドホン", "categoryId": "device" },
        { "id": "webcam", "name": "Webカメラ", "categoryId": "device" },
        { "id": "microphone", "name": "マイク", "categoryId": "device" },
        { "id": "speaker", "name": "スピーカー", "categoryId": "device" }
      ]
    },
    {
      "id": "furniture",
      "name": "家具",
      "nameEn": "Furniture",
      "description": "デスク、チェア、モニターアームなど",
      "icon": "chair",
      "subCategories": [
        { "id": "desk", "name": "デスク", "categoryId": "furniture" },
        { "id": "chair", "name": "チェア", "categoryId": "furniture" },
        { "id": "monitor-arm", "name": "モニターアーム", "categoryId": "furniture" },
        { "id": "cable-management", "name": "配線整理", "categoryId": "furniture" }
      ]
    },
    {
      "id": "lighting",
      "name": "照明・インテリア",
      "nameEn": "Lighting & Interior",
      "description": "デスクライト、間接照明、デスクマットなど",
      "icon": "lamp",
      "subCategories": [
        { "id": "desk-light", "name": "デスクライト", "categoryId": "lighting" },
        { "id": "ambient-light", "name": "間接照明", "categoryId": "lighting" },
        { "id": "desk-mat", "name": "デスクマット", "categoryId": "lighting" },
        { "id": "plant", "name": "観葉植物", "categoryId": "lighting" },
        { "id": "organizer", "name": "デスクオーガナイザー", "categoryId": "lighting" }
      ]
    }
  ]
}
```

## データ取得関数

### src/data/index.ts
```typescript
import itemsData from './items.json';
import categoriesData from './categories.json';
import { Item } from '@/types/item';
import { Category, CategoryId } from '@/types/category';

// 全アイテム取得
export function getAllItems(): Item[] {
  return itemsData.items;
}

// ランキング順で取得
export function getTopRanking(limit: number = 10): Item[] {
  return getAllItems()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

// カテゴリ別 TOP N
export function getTopByCategory(categoryId: CategoryId, limit: number = 3): Item[] {
  return getAllItems()
    .filter(item => item.category === categoryId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

// 新着アイテム
export function getNewArrivals(limit: number = 5): Item[] {
  return getAllItems()
    .filter(item => item.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// 注目アイテム
export function getFeaturedItems(): Item[] {
  return getAllItems().filter(item => item.featured);
}

// カテゴリ一覧
export function getAllCategories(): Category[] {
  return categoriesData.categories;
}

// 単一アイテム取得
export function getItemById(id: string): Item | undefined {
  return getAllItems().find(item => item.id === id);
}
```

## アフィリエイトURL生成

### Amazon アソシエイト
```typescript
// src/lib/affiliate.ts

const AMAZON_ASSOCIATE_TAG = 'your-tag-22'; // 実際のタグに置き換え

export function generateAmazonAffiliateUrl(asin: string): string {
  return `https://www.amazon.co.jp/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

// 環境変数から取得する場合
export function getAffiliateTag(): string {
  return process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'your-tag-22';
}
```

## 受け入れ基準
- [ ] Item 型が定義されている
- [ ] Category 型が定義されている
- [ ] items.json に最低10件のサンプルデータがある
- [ ] categories.json に3カテゴリが定義されている
- [ ] getTopRanking() がスコア順でアイテムを返す
- [ ] getTopByCategory() がカテゴリ別に正しくフィルタする
- [ ] アフィリエイトURLが正しい形式で生成される
- [ ] TypeScript の型チェックが通る

## テストケース
```typescript
describe('Static Data', () => {
  describe('getAllItems', () => {
    it('should return all items from JSON', () => {
      const items = getAllItems();
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('getTopRanking', () => {
    it('should return items sorted by score descending', () => {
      const ranking = getTopRanking(10);
      for (let i = 0; i < ranking.length - 1; i++) {
        expect(ranking[i].score).toBeGreaterThanOrEqual(ranking[i + 1].score);
      }
    });

    it('should assign correct rank numbers', () => {
      const ranking = getTopRanking(10);
      ranking.forEach((item, index) => {
        expect(item.rank).toBe(index + 1);
      });
    });
  });

  describe('getTopByCategory', () => {
    it('should return only items from specified category', () => {
      const devices = getTopByCategory('device', 5);
      devices.forEach(item => {
        expect(item.category).toBe('device');
      });
    });
  });

  describe('generateAmazonAffiliateUrl', () => {
    it('should include affiliate tag', () => {
      const url = generateAmazonAffiliateUrl('B09XXXXX');
      expect(url).toContain('tag=');
    });
  });
});
```

## 備考
- Phase 2 で Supabase に移行する際、データ取得関数のインターフェースは維持
- 画像は最初は外部URL（Amazon等）を使用、後で自前ホスティングに移行検討
- アフィリエイトタグは環境変数で管理
