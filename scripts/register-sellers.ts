#!/usr/bin/env npx ts-node

/**
 * Register Test Sellers Script
 *
 * This script:
 * 1. Downloads profile and banner images from Unsplash
 * 2. Uploads them to IPFS via frontend API
 * 3. Creates metadata JSON and uploads to IPFS
 * 4. Registers sellers on SellerRegistry contract
 *
 * Usage: npx tsx register-sellers.ts
 *
 * Prerequisites:
 * - Frontend running on localhost:3000
 * - MNEMONIC or PRIVATE_KEY in ../contracts/.env
 *
 * Note: Each seller needs their own wallet. This script derives
 * multiple wallets from a mnemonic, or uses a single PRIVATE_KEY
 * for the first seller only.
 */

import { createWalletClient, createPublicClient, http, formatEther } from 'viem'
import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts'
import { polygonAmoy } from 'viem/chains'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from contracts
config({ path: resolve(__dirname, '../contracts/.env') })

// Also try loading from root .env
config({ path: resolve(__dirname, '../.env') })

// Contract addresses (from deployment run-1767179211.json)
const SELLER_REGISTRY = '0x54bbd5b2ea4bb3365b643fce22038b99d7aedff8' as const

// Frontend API URL
const API_BASE = process.env.API_BASE || 'http://localhost:3008'

// Seller Registry ABI (minimal)
const SELLER_REGISTRY_ABI = [
  {
    name: 'registerSeller',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'shopName', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'metadataURI', type: 'string' }
    ],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'totalSellers',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'isRegisteredSeller',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'bool' }]
  }
] as const

// Seller data
const SELLERS = [
  {
    shopName: 'Glow Beauty Korea',
    shopNameKo: '글로우 뷰티 코리아',
    description: 'Premium Korean skincare and makeup products',
    descriptionKo: '프리미엄 한국 스킨케어 및 메이크업 제품',
    category: 'beauty',
    profileImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200'
  },
  {
    shopName: 'Seoul Street Style',
    shopNameKo: '서울 스트릿 스타일',
    description: 'Trendy Korean streetwear and fashion',
    descriptionKo: '트렌디한 한국 스트릿웨어 및 패션',
    category: 'fashion',
    profileImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200'
  },
  {
    shopName: 'Kimchi Kitchen',
    shopNameKo: '김치 키친',
    description: 'Authentic Korean food and ingredients',
    descriptionKo: '정통 한국 음식 및 식재료',
    category: 'food',
    profileImage: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200'
  },
  {
    shopName: 'Tech Galaxy Korea',
    shopNameKo: '테크 갤럭시 코리아',
    description: 'Latest Korean electronics and gadgets',
    descriptionKo: '최신 한국 전자제품 및 가젯',
    category: 'electronics',
    profileImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200'
  },
  {
    shopName: 'Hanok Living',
    shopNameKo: '한옥 리빙',
    description: 'Traditional Korean home decor and lifestyle',
    descriptionKo: '전통 한국 홈 데코 및 라이프스타일',
    category: 'home',
    profileImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200'
  }
]

async function downloadImage(url: string): Promise<Buffer> {
  console.log(`  Downloading: ${url.slice(0, 50)}...`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function uploadFileToIPFS(
  buffer: Buffer,
  filename: string,
  metadata: Record<string, string> = {}
): Promise<{ ipfsHash: string; url: string }> {
  console.log(`  Uploading to IPFS: ${filename}`)

  const formData = new FormData()
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  formData.append('file', blob, filename)
  formData.append('name', filename)
  if (Object.keys(metadata).length > 0) {
    formData.append('metadata', JSON.stringify(metadata))
  }

  const response = await fetch(`${API_BASE}/api/ipfs/file`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload file to IPFS: ${error}`)
  }

  const result = await response.json()
  console.log(`  IPFS Hash: ${result.ipfsHash}`)
  return { ipfsHash: result.ipfsHash, url: result.url }
}

async function uploadJSONToIPFS(
  content: Record<string, unknown>,
  name: string
): Promise<{ ipfsHash: string; url: string }> {
  console.log(`  Uploading metadata to IPFS: ${name}`)

  const response = await fetch(`${API_BASE}/api/ipfs/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, name })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload JSON to IPFS: ${error}`)
  }

  const result = await response.json()
  console.log(`  IPFS Hash: ${result.ipfsHash}`)
  return { ipfsHash: result.ipfsHash, url: result.url }
}

// Test mnemonic for generating multiple wallets
const TEST_MNEMONIC = 'test test test test test test test test test test test junk'

function getWalletsFromMnemonic(mnemonic: string, count: number) {
  const accounts = []
  for (let i = 0; i < count; i++) {
    const account = mnemonicToAccount(mnemonic, { addressIndex: i })
    accounts.push(account)
  }
  return accounts
}

async function main() {
  console.log('\n🏪 Seller Registration Script')
  console.log('━'.repeat(50))

  // Get funder private key (for funding derived wallets)
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found in contracts/.env')
    process.exit(1)
  }

  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  const funderAccount = privateKeyToAccount(formattedKey as `0x${string}`)

  // Get mnemonic (or use test mnemonic)
  const mnemonic = process.env.MNEMONIC || TEST_MNEMONIC
  console.log(`\nFunder wallet: ${funderAccount.address}`)
  console.log(`Contract: ${SELLER_REGISTRY}`)
  console.log(`Network: Polygon Amoy (80002)`)
  console.log(`Using mnemonic: ${mnemonic === TEST_MNEMONIC ? 'TEST MNEMONIC' : 'Custom'}`)

  // Create derived wallets for each seller
  const sellerAccounts = getWalletsFromMnemonic(mnemonic, SELLERS.length)

  console.log('\n📝 Derived seller wallets:')
  sellerAccounts.forEach((acc, i) => {
    console.log(`  ${i + 1}. ${acc.address} (${SELLERS[i].shopName})`)
  })

  // Create clients
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http('https://rpc-amoy.polygon.technology')
  })

  const funderWalletClient = createWalletClient({
    account: funderAccount,
    chain: polygonAmoy,
    transport: http('https://rpc-amoy.polygon.technology')
  })

  // Check funder balance
  const funderBalance = await publicClient.getBalance({ address: funderAccount.address })
  console.log(`\nFunder balance: ${formatEther(funderBalance)} MATIC`)

  // Check current seller count
  const totalBefore = await publicClient.readContract({
    address: SELLER_REGISTRY,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'totalSellers'
  })
  console.log(`Current sellers: ${totalBefore}`)

  // Create output dir for records
  const outputDir = resolve(__dirname, '../.data')
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  // Process each seller
  const results: Array<{
    seller: typeof SELLERS[0]
    wallet: string
    metadataURI: string
    txHash?: string
    error?: string
  }> = []

  for (let i = 0; i < SELLERS.length; i++) {
    const seller = SELLERS[i]
    const sellerAccount = sellerAccounts[i]

    console.log(`\n${'━'.repeat(50)}`)
    console.log(`📦 Processing Seller ${i + 1}/${SELLERS.length}: ${seller.shopName}`)
    console.log(`   Wallet: ${sellerAccount.address}`)
    console.log(`${'━'.repeat(50)}`)

    try {
      // Check if already registered
      const isRegistered = await publicClient.readContract({
        address: SELLER_REGISTRY,
        abi: SELLER_REGISTRY_ABI,
        functionName: 'isRegisteredSeller',
        args: [sellerAccount.address]
      })

      if (isRegistered) {
        console.log('  ⏭️  Already registered, skipping...')
        results.push({ seller, wallet: sellerAccount.address, metadataURI: '', error: 'Already registered' })
        continue
      }

      // Step 1: Download images
      console.log('\n1️⃣ Downloading images...')
      const profileBuffer = await downloadImage(seller.profileImage)
      const bannerBuffer = await downloadImage(seller.bannerImage)

      // Step 2: Upload images to IPFS
      console.log('\n2️⃣ Uploading images to IPFS...')
      const profileResult = await uploadFileToIPFS(
        profileBuffer,
        `${seller.category}-profile.jpg`,
        { seller: seller.shopName, type: 'profile' }
      )
      const bannerResult = await uploadFileToIPFS(
        bannerBuffer,
        `${seller.category}-banner.jpg`,
        { seller: seller.shopName, type: 'banner' }
      )

      // Step 3: Create and upload metadata
      console.log('\n3️⃣ Creating and uploading metadata...')
      const metadata = {
        shopName: seller.shopName,
        shopNameKo: seller.shopNameKo,
        description: seller.description,
        descriptionKo: seller.descriptionKo,
        profileImage: profileResult.url,
        bannerImage: bannerResult.url,
        category: seller.category
      }

      const metadataResult = await uploadJSONToIPFS(
        metadata,
        `${seller.category}-seller-metadata`
      )

      // Step 4: Fund the seller wallet if needed
      console.log('\n4️⃣ Funding seller wallet...')
      const sellerBalance = await publicClient.getBalance({ address: sellerAccount.address })
      const minBalance = BigInt('5000000000000000') // 0.005 MATIC

      if (sellerBalance < minBalance) {
        const fundAmount = BigInt('10000000000000000') // 0.01 MATIC (enough for string-heavy tx)
        console.log(`  Sending ${formatEther(fundAmount)} MATIC...`)
        const fundTx = await funderWalletClient.sendTransaction({
          to: sellerAccount.address,
          value: fundAmount
        })
        await publicClient.waitForTransactionReceipt({ hash: fundTx })
        console.log(`  Funded: ${fundTx}`)
      } else {
        console.log(`  Balance sufficient: ${formatEther(sellerBalance)} MATIC`)
      }

      // Step 5: Register on-chain from seller wallet
      console.log('\n5️⃣ Registering on-chain...')

      const sellerWalletClient = createWalletClient({
        account: sellerAccount,
        chain: polygonAmoy,
        transport: http('https://rpc-amoy.polygon.technology')
      })

      const hash = await sellerWalletClient.writeContract({
        address: SELLER_REGISTRY,
        abi: SELLER_REGISTRY_ABI,
        functionName: 'registerSeller',
        args: [seller.shopName, seller.category, metadataResult.url]
      })

      console.log(`  Transaction: ${hash}`)
      console.log(`  Explorer: https://amoy.polygonscan.com/tx/${hash}`)

      // Wait for confirmation
      console.log('  Waiting for confirmation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        console.log(`  ✅ Successfully registered!`)
        results.push({ seller, wallet: sellerAccount.address, metadataURI: metadataResult.url, txHash: hash })
      } else {
        console.log(`  ❌ Transaction reverted`)
        results.push({ seller, wallet: sellerAccount.address, metadataURI: metadataResult.url, error: 'Transaction reverted' })
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`  ❌ Error: ${errorMsg}`)
      results.push({
        seller,
        wallet: sellerAccount.address,
        metadataURI: '',
        error: errorMsg
      })
    }
  }

  // Summary
  console.log(`\n${'━'.repeat(50)}`)
  console.log('📊 SUMMARY')
  console.log(`${'━'.repeat(50)}`)

  const successful = results.filter(r => r.txHash)
  const failed = results.filter(r => r.error)

  console.log(`\nSuccessful: ${successful.length}`)
  successful.forEach(r => {
    console.log(`  ✅ ${r.seller.shopName}`)
    console.log(`     Wallet: ${r.wallet}`)
    console.log(`     Metadata: ${r.metadataURI}`)
  })

  if (failed.length > 0) {
    console.log(`\nFailed/Skipped: ${failed.length}`)
    failed.forEach(r => {
      console.log(`  ❌ ${r.seller.shopName}: ${r.error}`)
    })
  }

  // Check final count
  const totalAfter = await publicClient.readContract({
    address: SELLER_REGISTRY,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'totalSellers'
  })
  console.log(`\nTotal sellers now: ${totalAfter}`)

  // Save results
  const outputFile = resolve(outputDir, 'seller-registration.json')
  writeFileSync(outputFile, JSON.stringify(results, null, 2))
  console.log(`\nResults saved to: ${outputFile}`)
}

main().catch(console.error)
