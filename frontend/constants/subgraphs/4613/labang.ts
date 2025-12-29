import type { SubgraphConfig } from '../index'

// VeryChain Mainnet - Local graph-node deployment
// Endpoint: http://localhost:8000/subgraphs/name/labang
export const labangSubgraph: SubgraphConfig = {
  name: 'labang',
  description: 'Indexes Labang live commerce contracts on VeryChain Mainnet',
  thegraph: {
    endpoint: 'http://localhost:8000/subgraphs/name/labang',
  },
  goldsky: {
    endpoint: '',
    versionEndpoint: '',
  },
  activeProvider: 'thegraph',
  contracts: [
    {
      name: 'SellerRegistry',
      address: '0xa7e5175e571D6B7391658F1E35120290C38E26a4',
      chainId: 4613,
      chainName: 'VeryChain',
      explorerUrl: 'https://www.veryscan.io/address/0xa7e5175e571D6B7391658F1E35120290C38E26a4',
      startBlock: 4151700,
    },
    {
      name: 'ProductRegistry',
      address: '0xb7f3d139128D54E6F994Bcf0DE88d5Da8D1c71d2',
      chainId: 4613,
      chainName: 'VeryChain',
      explorerUrl: 'https://www.veryscan.io/address/0xb7f3d139128D54E6F994Bcf0DE88d5Da8D1c71d2',
      startBlock: 4151700,
    },
    {
      name: 'OrderEscrow',
      address: '0xE54FB90AFad32c87B45b5E8e20Cc0E02080bf7F5',
      chainId: 4613,
      chainName: 'VeryChain',
      explorerUrl: 'https://www.veryscan.io/address/0xE54FB90AFad32c87B45b5E8e20Cc0E02080bf7F5',
      startBlock: 4151700,
    },
    {
      name: 'ReviewRegistry',
      address: '0x57887E6362c69635de9FEb88627A91c0207061C5',
      chainId: 4613,
      chainName: 'VeryChain',
      explorerUrl: 'https://www.veryscan.io/address/0x57887E6362c69635de9FEb88627A91c0207061C5',
      startBlock: 4151700,
    },
    {
      name: 'TipJar',
      address: '0x2927b1f7C76AA9302621fC3dee30B024ab11d677',
      chainId: 4613,
      chainName: 'VeryChain',
      explorerUrl: 'https://www.veryscan.io/address/0x2927b1f7C76AA9302621fC3dee30B024ab11d677',
      startBlock: 4151700,
    },
    {
      name: 'GiftShop',
      address: '0xA846E4D57cDB3077ED67E5d792949F7A6ef2a75d',
      chainId: 4613,
      chainName: 'VeryChain',
      explorerUrl: 'https://www.veryscan.io/address/0xA846E4D57cDB3077ED67E5d792949F7A6ef2a75d',
      startBlock: 4151700,
    },
  ],
  schemaContent: `
type Seller @entity(immutable: false) {
  id: ID!
  wallet: Bytes!
  shopName: String!
  category: String!
  metadataURI: String!
  isActive: Boolean!
  createdAt: BigInt!
  totalSales: BigInt!
  totalOrders: BigInt!
  products: [Product!]! @derivedFrom(field: "seller")
  txHash: Bytes!
  blockNumber: BigInt!
}

type Product @entity(immutable: false) {
  id: ID!
  seller: Seller!
  title: String!
  category: String!
  priceVery: BigInt!
  inventory: BigInt!
  metadataURI: String!
  isActive: Boolean!
  createdAt: BigInt!
  totalSold: BigInt!
  txHash: Bytes!
  blockNumber: BigInt!
}

type Order @entity(immutable: false) {
  id: ID!
  buyer: Bytes!
  seller: Bytes!
  productId: BigInt!
  amount: BigInt!
  status: OrderStatus!
  createdAt: BigInt!
  confirmedAt: BigInt
  releasedAmount: BigInt
  txHash: Bytes!
  blockNumber: BigInt!
}

enum OrderStatus {
  CREATED
  CONFIRMED
  DISPUTED
  REFUNDED
  AUTO_RELEASED
}

type Review @entity(immutable: true) {
  id: ID!
  order: Order!
  productId: BigInt!
  buyer: Bytes!
  rating: Int!
  contentHash: Bytes!
  createdAt: BigInt!
  txHash: Bytes!
  blockNumber: BigInt!
}

type Tip @entity(immutable: true) {
  id: ID!
  from: Bytes!
  streamer: Bytes!
  amount: BigInt!
  message: String
  createdAt: BigInt!
  txHash: Bytes!
  blockNumber: BigInt!
}

type Gift @entity(immutable: false) {
  id: ID!
  name: String!
  price: BigInt!
  animationURI: String!
  active: Boolean!
  createdAt: BigInt!
  txHash: Bytes!
}

type GiftSent @entity(immutable: true) {
  id: ID!
  from: Bytes!
  streamer: Bytes!
  gift: Gift!
  quantity: BigInt!
  totalValue: BigInt!
  createdAt: BigInt!
  txHash: Bytes!
  blockNumber: BigInt!
}

type StreamerStats @entity(immutable: false) {
  id: ID!
  totalTips: BigInt!
  totalGifts: BigInt!
  tipCount: BigInt!
  giftCount: BigInt!
}

type DailyVolume @entity(immutable: false) {
  id: ID!
  date: BigInt!
  orderVolume: BigInt!
  tipVolume: BigInt!
  giftVolume: BigInt!
  orderCount: BigInt!
  tipCount: BigInt!
  giftCount: BigInt!
}
`,
}
