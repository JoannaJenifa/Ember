import { gql } from 'graphql-request'

export const GET_SELLER_BY_ID = gql`
  query GetSellerById($id: ID!) {
    seller(id: $id) {
      id
      wallet
      shopName
      category
      metadataURI
      isActive
      createdAt
      totalSales
      totalOrders
      txHash
      blockNumber
      products {
        id
        title
        priceVery
        isActive
      }
    }
  }
`

export const GET_SELLER_BY_WALLET = gql`
  query GetSellerByWallet($wallet: Bytes!) {
    sellers(where: { wallet: $wallet }, first: 1) {
      id
      wallet
      shopName
      category
      metadataURI
      isActive
      createdAt
      totalSales
      totalOrders
      txHash
      blockNumber
      products {
        id
        title
        priceVery
        isActive
      }
    }
  }
`

export const GET_ALL_SELLERS = gql`
  query GetAllSellers($first: Int!, $skip: Int!, $where: Seller_filter) {
    sellers(first: $first, skip: $skip, where: $where, orderBy: createdAt, orderDirection: desc) {
      id
      wallet
      shopName
      category
      metadataURI
      isActive
      createdAt
      totalSales
      totalOrders
    }
  }
`

export const GET_ACTIVE_SELLERS = gql`
  query GetActiveSellers($first: Int!, $skip: Int!) {
    sellers(first: $first, skip: $skip, where: { isActive: true }, orderBy: totalSales, orderDirection: desc) {
      id
      wallet
      shopName
      category
      metadataURI
      isActive
      createdAt
      totalSales
      totalOrders
    }
  }
`

export const GET_SELLERS_BY_CATEGORY = gql`
  query GetSellersByCategory($category: String!, $first: Int!, $skip: Int!) {
    sellers(first: $first, skip: $skip, where: { category: $category, isActive: true }, orderBy: totalSales, orderDirection: desc) {
      id
      wallet
      shopName
      category
      metadataURI
      createdAt
      totalSales
      totalOrders
    }
  }
`

export interface SubgraphSeller {
  id: string
  wallet: string
  shopName: string
  category: string
  metadataURI: string
  isActive: boolean
  createdAt: string
  totalSales: string
  totalOrders: string
  txHash?: string
  blockNumber?: string
  products?: {
    id: string
    title: string
    priceVery: string
    isActive: boolean
  }[]
}
