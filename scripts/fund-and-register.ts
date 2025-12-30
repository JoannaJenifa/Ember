#!/usr/bin/env npx ts-node

/**
 * Fund and Register Sellers Script
 *
 * Simplified script that:
 * 1. Funds each derived wallet with 0.02 MATIC
 * 2. Verifies the funds arrived
 * 3. Registers each seller on-chain
 */

import { createWalletClient, createPublicClient, http, formatEther, parseEther } from 'viem'
import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts'
import { polygonAmoy } from 'viem/chains'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env
config({ path: resolve(__dirname, '../contracts/.env') })

// Contract
const SELLER_REGISTRY = '0x54bbd5b2ea4bb3365b643fce22038b99d7aedff8' as const

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
  }
] as const

// Test mnemonic
const TEST_MNEMONIC = 'test test test test test test test test test test test junk'

// Seller data from IPFS
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
  console.log('\n🏪 Fund and Register Sellers')
  console.log('━'.repeat(50))

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found')
    process.exit(1)
  }

  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  const funderAccount = privateKeyToAccount(formattedKey as `0x${string}`)

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

  // Get derived accounts
  const sellerAccounts = SELLERS.map((_, i) =>
    mnemonicToAccount(TEST_MNEMONIC, { addressIndex: i })
  )

  console.log(`\nFunder: ${funderAccount.address}`)
  const funderBal = await publicClient.getBalance({ address: funderAccount.address })
  console.log(`Funder balance: ${formatEther(funderBal)} MATIC`)

  // Check current seller count
  const totalBefore = await publicClient.readContract({
    address: SELLER_REGISTRY,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'totalSellers'
  })
  console.log(`Current registered sellers: ${totalBefore}`)

  // PHASE 1: Fund all wallets
  console.log('\n━'.repeat(50))
  console.log('PHASE 1: FUNDING WALLETS')
  console.log('━'.repeat(50))

  const fundAmount = parseEther('0.02')  // 0.02 MATIC each

  for (let i = 0; i < sellerAccounts.length; i++) {
    const seller = sellerAccounts[i]
    console.log(`\n[${i + 1}/${sellerAccounts.length}] ${SELLERS[i].shopName}`)
    console.log(`   Wallet: ${seller.address}`)

    // Check current balance
    const currentBal = await publicClient.getBalance({ address: seller.address })
    console.log(`   Current: ${formatEther(currentBal)} MATIC`)

    if (currentBal >= parseEther('0.01')) {
      console.log(`   ✅ Already funded`)
      continue
    }

    // Send funds
    console.log(`   Sending ${formatEther(fundAmount)} MATIC...`)
    try {
      const hash = await funderWalletClient.sendTransaction({
        to: seller.address,
        value: fundAmount
      })
      console.log(`   TX: ${hash}`)

      // Wait for confirmation
      console.log(`   Waiting for confirmation...`)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        // Verify new balance
        await sleep(2000) // Wait for RPC to sync
        const newBal = await publicClient.getBalance({ address: seller.address })
        console.log(`   ✅ Confirmed! New balance: ${formatEther(newBal)} MATIC`)
      } else {
        console.log(`   ❌ Transaction reverted`)
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : error)
    }

    // Small delay between transactions
    await sleep(1000)
  }

  // PHASE 2: Register all sellers
  console.log('\n━'.repeat(50))
  console.log('PHASE 2: REGISTERING SELLERS')
  console.log('━'.repeat(50))

  const results: { shopName: string; success: boolean; txHash?: string; error?: string }[] = []

  for (let i = 0; i < sellerAccounts.length; i++) {
    const seller = sellerAccounts[i]
    const sellerData = SELLERS[i]

    console.log(`\n[${i + 1}/${sellerAccounts.length}] ${sellerData.shopName}`)
    console.log(`   Wallet: ${seller.address}`)

    // Check if already registered
    const isRegistered = await publicClient.readContract({
      address: SELLER_REGISTRY,
      abi: SELLER_REGISTRY_ABI,
      functionName: 'isRegisteredSeller',
      args: [seller.address]
    })

    if (isRegistered) {
      console.log(`   ⏭️  Already registered`)
      results.push({ shopName: sellerData.shopName, success: true, txHash: 'already-registered' })
      continue
    }

    // Check balance
    const balance = await publicClient.getBalance({ address: seller.address })
    console.log(`   Balance: ${formatEther(balance)} MATIC`)

    if (balance < parseEther('0.005')) {
      console.log(`   ❌ Insufficient balance`)
      results.push({ shopName: sellerData.shopName, success: false, error: 'Insufficient balance' })
      continue
    }

    // Create seller wallet client
    const sellerWalletClient = createWalletClient({
      account: seller,
      chain: polygonAmoy,
      transport: http('https://rpc-amoy.polygon.technology')
    })

    try {
      console.log(`   Registering...`)
      const hash = await sellerWalletClient.writeContract({
        address: SELLER_REGISTRY,
        abi: SELLER_REGISTRY_ABI,
        functionName: 'registerSeller',
        args: [sellerData.shopName, sellerData.category, sellerData.metadataURI]
      })

      console.log(`   TX: ${hash}`)
      console.log(`   Waiting for confirmation...`)

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        console.log(`   ✅ Registered successfully!`)
        console.log(`   Explorer: https://amoy.polygonscan.com/tx/${hash}`)
        results.push({ shopName: sellerData.shopName, success: true, txHash: hash })
      } else {
        console.log(`   ❌ Transaction reverted`)
        results.push({ shopName: sellerData.shopName, success: false, error: 'Transaction reverted' })
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`   ❌ Error:`, msg.slice(0, 200))
      results.push({ shopName: sellerData.shopName, success: false, error: msg.slice(0, 200) })
    }

    await sleep(1000)
  }

  // Summary
  console.log('\n━'.repeat(50))
  console.log('SUMMARY')
  console.log('━'.repeat(50))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`\n✅ Successful: ${successful.length}`)
  successful.forEach(r => console.log(`   - ${r.shopName}`))

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`)
    failed.forEach(r => console.log(`   - ${r.shopName}: ${r.error}`))
  }

  // Final count
  const totalAfter = await publicClient.readContract({
    address: SELLER_REGISTRY,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'totalSellers'
  })
  console.log(`\nTotal registered sellers: ${totalAfter}`)
}

main().catch(console.error)
