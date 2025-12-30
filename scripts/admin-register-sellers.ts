#!/usr/bin/env npx ts-node

/**
 * Admin Register Sellers Script
 *
 * Uses the adminRegisterSeller function to register sellers
 * via the owner wallet (no need to fund each seller wallet)
 */

import { createWalletClient, createPublicClient, http, formatEther } from 'viem'
import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts'
import { polygonAmoy } from 'viem/chains'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env
config({ path: resolve(__dirname, '../contracts/.env') })

// NEW Contract address from latest deployment
const SELLER_REGISTRY = '0xa7605db830DBAF9a421ADe8579Bf7a255c875292' as const

const SELLER_REGISTRY_ABI = [
  {
    name: 'adminRegisterSeller',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'wallet', type: 'address' },
      { name: 'shopName', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'metadataURI', type: 'string' }
    ],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'isRegisteredSeller',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'totalSellers',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'getSeller',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'sellerId', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'wallet', type: 'address' },
        { name: 'shopName', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'metadataURI', type: 'string' },
        { name: 'isActive', type: 'bool' },
        { name: 'createdAt', type: 'uint256' },
        { name: 'totalSales', type: 'uint256' },
        { name: 'totalOrders', type: 'uint256' }
      ]
    }]
  }
] as const

// Test mnemonic for generating wallet addresses
const TEST_MNEMONIC = 'test test test test test test test test test test test junk'

// Seller data with IPFS metadata
const SELLERS = [
  {
    shopName: 'Glow Beauty Korea',
    category: 'beauty',
    metadataURI: 'ipfs://bafkreifz3wnshxkbnxejta3sau4asgju6bsan5ixln5oq4fm3e4wpcyoha'
  },
  {
    shopName: 'Seoul Street Style',
    category: 'fashion',
    metadataURI: 'ipfs://bafkreieudoaqd6okgykru7m2lq3vjn6nn6v4e6w335dbupa5wdeyaorlru'
  },
  {
    shopName: 'Kimchi Kitchen',
    category: 'food',
    metadataURI: 'ipfs://bafkreig7ipc22xqx3vbf63uc5xmvv6mrcfepx6zzjr2wqonnhrfcaqzdxa'
  },
  {
    shopName: 'Tech Galaxy Korea',
    category: 'electronics',
    metadataURI: 'ipfs://bafkreib6gzas3zhiy7q5bh2sxsyb6sbo5auc4ttwhswd5bz2teld3ioyoa'
  },
  {
    shopName: 'Hanok Living',
    category: 'home',
    metadataURI: 'ipfs://bafkreihjl3hqfpj5oxiukea5g2kf7wxivq4msvxx4yjsx7mdoohdmp4rmi'
  }
]

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('\n🏪 Admin Register Sellers')
  console.log('━'.repeat(50))
  console.log(`Contract: ${SELLER_REGISTRY}`)

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found')
    process.exit(1)
  }

  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  const ownerAccount = privateKeyToAccount(formattedKey as `0x${string}`)

  // Create clients
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http('https://rpc-amoy.polygon.technology')
  })

  const ownerWalletClient = createWalletClient({
    account: ownerAccount,
    chain: polygonAmoy,
    transport: http('https://rpc-amoy.polygon.technology')
  })

  console.log(`\nOwner: ${ownerAccount.address}`)
  const balance = await publicClient.getBalance({ address: ownerAccount.address })
  console.log(`Balance: ${formatEther(balance)} MATIC`)

  // Get seller wallet addresses from mnemonic
  const sellerWallets = SELLERS.map((_, i) =>
    mnemonicToAccount(TEST_MNEMONIC, { addressIndex: i }).address
  )

  console.log('\nSeller wallets:')
  sellerWallets.forEach((addr, i) => console.log(`  ${i + 1}. ${addr} (${SELLERS[i].shopName})`))

  // Check current count
  const totalBefore = await publicClient.readContract({
    address: SELLER_REGISTRY,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'totalSellers'
  })
  console.log(`\nCurrent sellers: ${totalBefore}`)

  // Register each seller
  console.log('\n━'.repeat(50))
  console.log('REGISTERING SELLERS')
  console.log('━'.repeat(50))

  const results: { shopName: string; wallet: string; sellerId?: number; txHash?: string; error?: string }[] = []

  for (let i = 0; i < SELLERS.length; i++) {
    const seller = SELLERS[i]
    const wallet = sellerWallets[i]

    console.log(`\n[${i + 1}/${SELLERS.length}] ${seller.shopName}`)
    console.log(`   Wallet: ${wallet}`)

    // Check if already registered
    const isRegistered = await publicClient.readContract({
      address: SELLER_REGISTRY,
      abi: SELLER_REGISTRY_ABI,
      functionName: 'isRegisteredSeller',
      args: [wallet]
    })

    if (isRegistered) {
      console.log(`   ⏭️  Already registered`)
      results.push({ shopName: seller.shopName, wallet, error: 'Already registered' })
      continue
    }

    try {
      console.log(`   Registering via admin...`)
      const hash = await ownerWalletClient.writeContract({
        address: SELLER_REGISTRY,
        abi: SELLER_REGISTRY_ABI,
        functionName: 'adminRegisterSeller',
        args: [wallet, seller.shopName, seller.category, seller.metadataURI]
      })

      console.log(`   TX: ${hash}`)
      console.log(`   Waiting for confirmation...`)

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        // Get seller ID from event logs or query
        const totalNow = await publicClient.readContract({
          address: SELLER_REGISTRY,
          abi: SELLER_REGISTRY_ABI,
          functionName: 'totalSellers'
        })
        const sellerId = Number(totalNow)

        console.log(`   ✅ Registered! Seller ID: ${sellerId}`)
        console.log(`   Explorer: https://amoy.polygonscan.com/tx/${hash}`)
        results.push({ shopName: seller.shopName, wallet, sellerId, txHash: hash })
      } else {
        console.log(`   ❌ Transaction reverted`)
        results.push({ shopName: seller.shopName, wallet, error: 'Transaction reverted' })
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`   ❌ Error:`, msg.slice(0, 200))
      results.push({ shopName: seller.shopName, wallet, error: msg.slice(0, 200) })
    }

    await sleep(1000)
  }

  // Summary
  console.log('\n━'.repeat(50))
  console.log('SUMMARY')
  console.log('━'.repeat(50))

  const successful = results.filter(r => r.txHash)
  const failed = results.filter(r => r.error)

  console.log(`\n✅ Registered: ${successful.length}`)
  successful.forEach(r => {
    console.log(`   - ${r.shopName} (ID: ${r.sellerId})`)
    console.log(`     Wallet: ${r.wallet}`)
  })

  if (failed.length > 0) {
    console.log(`\n❌ Failed/Skipped: ${failed.length}`)
    failed.forEach(r => console.log(`   - ${r.shopName}: ${r.error}`))
  }

  // Final count
  const totalAfter = await publicClient.readContract({
    address: SELLER_REGISTRY,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'totalSellers'
  })
  console.log(`\nTotal sellers: ${totalAfter}`)

  // Verify registered sellers
  console.log('\n━'.repeat(50))
  console.log('VERIFICATION')
  console.log('━'.repeat(50))

  for (let id = 1; id <= Number(totalAfter); id++) {
    try {
      const seller = await publicClient.readContract({
        address: SELLER_REGISTRY,
        abi: SELLER_REGISTRY_ABI,
        functionName: 'getSeller',
        args: [BigInt(id)]
      })
      console.log(`\nSeller ${id}:`)
      console.log(`  Shop: ${seller.shopName}`)
      console.log(`  Category: ${seller.category}`)
      console.log(`  Wallet: ${seller.wallet}`)
      console.log(`  Metadata: ${seller.metadataURI}`)
    } catch (e) {
      console.log(`\nSeller ${id}: Error reading`)
    }
  }

  // Save results
  const outputFile = resolve(__dirname, '../.data/seller-registration-complete.json')
  writeFileSync(outputFile, JSON.stringify({
    contract: SELLER_REGISTRY,
    network: 'Polygon Amoy (80002)',
    registeredAt: new Date().toISOString(),
    sellers: results.filter(r => r.txHash).map(r => ({
      sellerId: r.sellerId,
      shopName: r.shopName,
      wallet: r.wallet,
      txHash: r.txHash
    }))
  }, null, 2))
  console.log(`\nResults saved to: ${outputFile}`)
}

main().catch(console.error)
