export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  balance: number
  portfolio: PortfolioItem[]
  onboarded: boolean
  interests: string[]
}

export interface Market {
  id: string
  title: string
  description: string
  category: Category
  yesPrice: number   // 0–100 cents on the dollar
  noPrice: number
  volume: number     // USD
  liquidity: number
  endDate: string
  trending: boolean
  featured: boolean
  tags: string[]
  change24h: number  // percentage points
}

export interface PortfolioItem {
  marketId: string
  marketTitle: string
  side: 'YES' | 'NO'
  shares: number
  avgPrice: number
  currentPrice: number
}

export interface Order {
  marketId: string
  side: 'YES' | 'NO'
  amount: number   // USD
  price: number    // cents
}

export type Category =
  | 'crypto'
  | 'meme'
  | 'sports'
  | 'viral'
  | 'stocks'
  | 'politics'
  | 'entertainment'
  | 'science'
  | 'custom'
