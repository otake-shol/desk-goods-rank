/**
 * アイテム型定義
 * 仕様書: specs/04-static-data.md
 */

import { CategoryId } from './category'

export interface AmazonInfo {
  asin: string
  url: string
  affiliateUrl: string
  price?: number
  priceUpdatedAt?: string
}

export interface SocialScore {
  twitter: number
  youtube: number
  amazon: number
}

export interface Item {
  id: string
  name: string
  nameEn?: string
  description: string
  shortDescription: string
  imageUrl: string
  images?: string[]
  category: CategoryId
  subCategory: string
  score: number
  rank?: number
  socialScore?: SocialScore
  amazon: AmazonInfo
  tags: string[]
  brand?: string
  releaseDate?: string
  featured: boolean
  isNew: boolean
  createdAt: string
  updatedAt: string
}
