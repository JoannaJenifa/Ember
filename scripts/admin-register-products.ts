#!/usr/bin/env npx ts-node

/**
 * Admin Register Products Script
 *
 * Uploads product metadata to IPFS and registers products on-chain
 * using adminCreateProduct function via owner wallet
 */

import { createWalletClient, createPublicClient, http, formatEther, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygonAmoy } from 'viem/chains'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from contracts and frontend
config({ path: resolve(__dirname, '../contracts/.env') })
config({ path: resolve(__dirname, '../frontend/.env.local') })

// Contract addresses
const PRODUCT_REGISTRY = '0xa9fa08aef1c34AeB7851Ab5Ac3ed955BD071151A' as const

const PRODUCT_REGISTRY_ABI = [
  {
    name: 'adminCreateProduct',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'sellerId', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'priceVery', type: 'uint256' },
      { name: 'inventory', type: 'uint256' },
      { name: 'metadataURI', type: 'string' }
    ],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'totalProducts',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'getProduct',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'productId', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'sellerId', type: 'uint256' },
        { name: 'title', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'priceVery', type: 'uint256' },
        { name: 'inventory', type: 'uint256' },
        { name: 'metadataURI', type: 'string' },
        { name: 'isActive', type: 'bool' },
        { name: 'createdAt', type: 'uint256' },
        { name: 'totalSold', type: 'uint256' }
      ]
    }]
  }
] as const

// Product definitions for each seller (price in POL, range 0.0003-0.0008)
const PRODUCTS = {
  // Seller 1: Glow Beauty Korea (beauty)
  1: [
    {
      title: 'Glow Serum Set',
      titleKo: '글로우 세럼 세트',
      description: 'Premium Korean skincare serum set with vitamin C and hyaluronic acid',
      descriptionKo: '비타민C와 히알루론산이 함유된 프리미엄 한국 스킨케어 세럼 세트',
      category: 'beauty',
      price: '0.00055',
      inventory: 100,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600']
    },
    {
      title: 'K-Beauty Sheet Mask Pack (10pcs)',
      titleKo: '케이뷰티 시트마스크 팩 (10매)',
      description: 'Hydrating sheet masks with snail mucin and green tea extract',
      descriptionKo: '달팽이 점액과 녹차 추출물이 함유된 수분 시트 마스크',
      category: 'beauty',
      price: '0.00035',
      inventory: 200,
      images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600']
    },
    {
      title: 'Cushion Foundation SPF50',
      titleKo: '쿠션 파운데이션 SPF50',
      description: 'Lightweight cushion foundation with sun protection',
      descriptionKo: '자외선 차단 기능이 있는 가벼운 쿠션 파운데이션',
      category: 'beauty',
      price: '0.00048',
      inventory: 75,
      images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600']
    }
  ],
  // Seller 2: Seoul Street Style (fashion)
  2: [
    {
      title: 'Oversized Korean Blazer',
      titleKo: '오버사이즈 코리안 블레이저',
      description: 'Trendy oversized blazer in Korean street style',
      descriptionKo: '한국 스트릿 스타일의 트렌디한 오버사이즈 블레이저',
      category: 'fashion',
      price: '0.00078',
      inventory: 50,
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600']
    },
    {
      title: 'Wide Leg Pants',
      titleKo: '와이드 레그 팬츠',
      description: 'Comfortable wide leg pants for casual wear',
      descriptionKo: '캐주얼 웨어를 위한 편안한 와이드 레그 팬츠',
      category: 'fashion',
      price: '0.00045',
      inventory: 80,
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600']
    },
    {
      title: 'Korean Style Bucket Hat',
      titleKo: '코리안 스타일 버킷햇',
      description: 'Stylish bucket hat popular in Korean fashion',
      descriptionKo: '한국 패션에서 인기 있는 스타일리시한 버킷햇',
      category: 'fashion',
      price: '0.00032',
      inventory: 150,
      images: ['https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600']
    }
  ],
  // Seller 3: Kimchi Kitchen (food)
  3: [
    {
      title: 'Premium Kimchi Set (3 types)',
      titleKo: '프리미엄 김치 세트 (3종)',
      description: 'Traditional Korean kimchi set with baechu, kkakdugi, and pa kimchi',
      descriptionKo: '배추김치, 깍두기, 파김치가 포함된 전통 한국 김치 세트',
      category: 'food',
      price: '0.00042',
      inventory: 60,
      images: ['https://images.unsplash.com/photo-1583224994076-0c42b8e7f3fc?w=600']
    },
    {
      title: 'Korean Snack Box',
      titleKo: '한국 과자 박스',
      description: 'Assorted Korean snacks and treats box',
      descriptionKo: '다양한 한국 과자와 간식이 담긴 박스',
      category: 'food',
      price: '0.00038',
      inventory: 40,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600']
    },
    {
      title: 'Gochujang Sauce Set',
      titleKo: '고추장 소스 세트',
      description: 'Authentic Korean red pepper paste and sauces',
      descriptionKo: '정통 한국 고추장과 소스 세트',
      category: 'food',
      price: '0.00030',
      inventory: 90,
      images: ['https://images.unsplash.com/photo-1635321593217-40050ad13c74?w=600']
    }
  ],
  // Seller 4: Tech Galaxy Korea (electronics)
  4: [
    {
      title: 'Wireless Earbuds Pro',
      titleKo: '무선 이어버드 프로',
      description: 'High-quality wireless earbuds with noise cancellation',
      descriptionKo: '노이즈 캔슬링 기능이 있는 고품질 무선 이어버드',
      category: 'electronics',
      price: '0.00075',
      inventory: 35,
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600']
    },
    {
      title: 'Smart Watch Band (3 pack)',
      titleKo: '스마트워치 밴드 (3팩)',
      description: 'Interchangeable bands for popular smart watches',
      descriptionKo: '인기 스마트워치용 교체 밴드 세트',
      category: 'electronics',
      price: '0.00040',
      inventory: 120,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600']
    },
    {
      title: 'Portable Charger 20000mAh',
      titleKo: '휴대용 충전기 20000mAh',
      description: 'High capacity portable power bank with fast charging',
      descriptionKo: '고속 충전 기능이 있는 대용량 휴대용 보조배터리',
      category: 'electronics',
      price: '0.00058',
      inventory: 90,
      images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600']
    }
  ],
  // Seller 5: Hanok Living (home)
  5: [
    {
      title: 'Korean Ceramic Tea Set',
      titleKo: '한국 도자기 차 세트',
      description: 'Handcrafted Korean celadon tea set with 4 cups',
      descriptionKo: '수공예 한국 청자 찻잔 세트 (4개 포함)',
      category: 'home',
      price: '0.00068',
      inventory: 25,
      images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600']
    },
    {
      title: 'Hanji Paper Lamp',
      titleKo: '한지 조명',
      description: 'Traditional Korean paper lamp with modern design',
      descriptionKo: '현대적인 디자인의 전통 한지 조명',
      category: 'home',
      price: '0.00055',
      inventory: 30,
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600']
    },
    {
      title: 'Bamboo Organizer Set',
      titleKo: '대나무 정리함 세트',
      description: 'Eco-friendly bamboo organizers for home and office',
      descriptionKo: '가정과 사무실용 친환경 대나무 정리함',
      category: 'home',
      price: '0.00036',
      inventory: 65,
      images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600']
    }
  ]
}

async function uploadToIPFS(metadata: object, name: string): Promise<string> {
  const PINATA_JWT = process.env.PINATA_JWT
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT not found in environment')
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name },
      pinataOptions: { cidVersion: 1 }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`IPFS upload failed: ${error}`)
  }

  const result = await response.json()
  return `ipfs://${result.IpfsHash}`
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('\n📦 Admin Register Products')
  console.log('━'.repeat(50))
  console.log(`Contract: ${PRODUCT_REGISTRY}`)

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found')
    process.exit(1)
  }

  const pinataJwt = process.env.PINATA_JWT
  if (!pinataJwt) {
    console.error('❌ PINATA_JWT not found')
    process.exit(1)
  }

  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  const ownerAccount = privateKeyToAccount(formattedKey as `0x${string}`)

  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http('https://rpc-amoy.polygon.technology')
  })

  const walletClient = createWalletClient({
    account: ownerAccount,
    chain: polygonAmoy,
    transport: http('https://rpc-amoy.polygon.technology')
  })

  console.log(`\nOwner: ${ownerAccount.address}`)
  const balance = await publicClient.getBalance({ address: ownerAccount.address })
  console.log(`Balance: ${formatEther(balance)} POL`)

  const totalBefore = await publicClient.readContract({
    address: PRODUCT_REGISTRY,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'totalProducts'
  })
  console.log(`\nProducts before: ${totalBefore}`)

  const results: any[] = []
  let productCount = 0
  const totalProducts = Object.values(PRODUCTS).flat().length

  console.log(`\nRegistering ${totalProducts} products...`)
  console.log('━'.repeat(50))

  for (const [sellerIdStr, products] of Object.entries(PRODUCTS)) {
    const sellerId = parseInt(sellerIdStr)
    console.log(`\n🏪 Seller ${sellerId}`)

    for (const product of products) {
      productCount++
      console.log(`\n  [${productCount}/${totalProducts}] ${product.title}`)

      try {
        // Create metadata
        const metadata = {
          title: product.title,
          titleKo: product.titleKo,
          description: product.description,
          descriptionKo: product.descriptionKo,
          images: product.images,
          category: product.category
        }

        // Upload to IPFS
        console.log(`    Uploading metadata to IPFS...`)
        const metadataURI = await uploadToIPFS(
          metadata,
          `product-${sellerId}-${product.title.toLowerCase().replace(/\s+/g, '-')}`
        )
        console.log(`    IPFS: ${metadataURI}`)

        // Convert price to wei
        const priceWei = parseEther(product.price)
        console.log(`    Price: ${product.price} POL (${priceWei} wei)`)

        // Register on-chain
        console.log(`    Registering on-chain...`)
        const hash = await walletClient.writeContract({
          address: PRODUCT_REGISTRY,
          abi: PRODUCT_REGISTRY_ABI,
          functionName: 'adminCreateProduct',
          args: [
            BigInt(sellerId),
            product.title,
            product.category,
            priceWei,
            BigInt(product.inventory),
            metadataURI
          ]
        })

        console.log(`    TX: ${hash}`)
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status === 'success') {
          const totalNow = await publicClient.readContract({
            address: PRODUCT_REGISTRY,
            abi: PRODUCT_REGISTRY_ABI,
            functionName: 'totalProducts'
          })
          console.log(`    ✅ Product ID: ${totalNow}`)
          results.push({
            productId: Number(totalNow),
            sellerId,
            title: product.title,
            price: product.price,
            metadataURI,
            txHash: hash
          })
        } else {
          console.log(`    ❌ Transaction reverted`)
          results.push({ sellerId, title: product.title, error: 'Transaction reverted' })
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`    ❌ Error: ${msg.slice(0, 150)}`)
        results.push({ sellerId, title: product.title, error: msg.slice(0, 150) })
      }

      await sleep(1500) // Rate limit
    }
  }

  // Summary
  console.log('\n━'.repeat(50))
  console.log('SUMMARY')
  console.log('━'.repeat(50))

  const successful = results.filter(r => r.txHash)
  const failed = results.filter(r => r.error)

  console.log(`\n✅ Registered: ${successful.length}/${totalProducts}`)
  successful.forEach(r => {
    console.log(`   - [${r.productId}] ${r.title} (${r.price} POL)`)
  })

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`)
    failed.forEach(r => console.log(`   - ${r.title}: ${r.error}`))
  }

  const totalAfter = await publicClient.readContract({
    address: PRODUCT_REGISTRY,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'totalProducts'
  })
  console.log(`\nTotal products: ${totalAfter}`)

  // Save results
  const outputFile = resolve(__dirname, '../.data/product-registration-complete.json')
  writeFileSync(outputFile, JSON.stringify({
    contract: PRODUCT_REGISTRY,
    network: 'Polygon Amoy (80002)',
    registeredAt: new Date().toISOString(),
    priceRange: { min: '0.0003 POL', max: '0.0008 POL' },
    products: successful
  }, null, 2))
  console.log(`\nResults saved to: ${outputFile}`)
}

main().catch(console.error)
