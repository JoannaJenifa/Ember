import { gql } from 'graphql-request'

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      seller {
        id
        wallet
        shopName
      }
      title
      category
      priceVery
      inventory
      metadataURI
      isActive
      createdAt
      totalSold
      txHash
      blockNumber
    }
  }
`

export const GET_PRODUCTS_BY_SELLER = gql`
  query GetProductsBySeller($sellerId: String!, $first: Int!, $skip: Int!) {
    products(first: $first, skip: $skip, where: { seller: $sellerId }, orderBy: createdAt, orderDirection: desc) {
      id
      title
      category
      priceVery
      inventory
      metadataURI
      isActive
      createdAt
      totalSold
    }
  }
`

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts($first: Int!, $skip: Int!, $where: Product_filter) {
    products(first: $first, skip: $skip, where: $where, orderBy: createdAt, orderDirection: desc) {
      id
      seller {
        id
        wallet
        shopName
      }
      title
      category
      priceVery
      inventory
      metadataURI
      isActive
      createdAt
      totalSold
    }
  }
`

export const GET_ACTIVE_PRODUCTS = gql`
  query GetActiveProducts($first: Int!, $skip: Int!) {
    products(first: $first, skip: $skip, where: { isActive: true }, orderBy: totalSold, orderDirection: desc) {
      id
      seller {
        id
        wallet
        shopName
      }
      title
      category
      priceVery
      inventory
      metadataURI
      createdAt
      totalSold
    }
  }
`

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($category: String!, $first: Int!, $skip: Int!) {
    products(first: $first, skip: $skip, where: { category: $category, isActive: true }, orderBy: totalSold, orderDirection: desc) {
      id
      seller {
        id
        wallet
        shopName
      }
      title
      category
      priceVery
      inventory
      metadataURI
      createdAt
      totalSold
    }
  }
`

export interface SubgraphProduct {
  id: string
  seller: {
    id: string
    wallet: string
    shopName: string
  }
  title: string
  category: string
  priceVery: string
  inventory: string
  metadataURI: string
  isActive: boolean
  createdAt: string
  totalSold: string
  txHash?: string
  blockNumber?: string
}
