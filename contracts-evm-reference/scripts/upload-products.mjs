#!/usr/bin/env node
/**
 * Upload product metadata to IPFS via Pinata
 * Outputs IPFS hashes for use in Foundry script
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PRODUCTS_DIR = path.join(__dirname, '../data/products')
const OUTPUT_FILE = path.join(__dirname, '../data/product-ipfs-hashes.json')

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

// Load JWT from frontend .env
function loadPinataJWT() {
  const envPath = path.join(__dirname, '../../frontend/.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing .env.local file at ${envPath}`)
  }
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(/PINATA_JWT=(.+)/)
  if (!match) {
    throw new Error('PINATA_JWT not found in .env.local')
  }
  return match[1].trim()
}

async function pinJSONToIPFS(json, name) {
  const jwt = loadPinataJWT()
  const response = await fetch(PINATA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name },
      pinataOptions: { cidVersion: 1 }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to pin ${name}: ${error}`)
  }

  return response.json()
}

// Product definitions with pricing and inventory
const PRODUCTS = [
  // Beauty products (seller ID 1)
  { file: 'beauty-1-glow-serum.json', priceVery: 45, inventory: 100, sellerId: 1 },
  { file: 'beauty-2-sheet-mask.json', priceVery: 25, inventory: 200, sellerId: 1 },
  { file: 'beauty-3-cushion-foundation.json', priceVery: 38, inventory: 75, sellerId: 1 },
  // Fashion products (seller ID 2)
  { file: 'fashion-1-blazer.json', priceVery: 89, inventory: 50, sellerId: 2 },
  { file: 'fashion-2-pants.json', priceVery: 55, inventory: 80, sellerId: 2 },
  { file: 'fashion-3-bucket-hat.json', priceVery: 28, inventory: 150, sellerId: 2 },
  // Food products (seller ID 3)
  { file: 'food-1-kimchi.json', priceVery: 35, inventory: 60, sellerId: 3 },
  { file: 'food-2-snack-box.json', priceVery: 42, inventory: 40, sellerId: 3 },
  // Electronics products (seller ID 4)
  { file: 'electronics-1-earbuds.json', priceVery: 129, inventory: 35, sellerId: 4 },
  { file: 'electronics-2-watch-band.json', priceVery: 45, inventory: 120, sellerId: 4 },
  { file: 'electronics-3-charger.json', priceVery: 59, inventory: 90, sellerId: 4 },
  // Home products (seller ID 5)
  { file: 'home-1-tea-set.json', priceVery: 78, inventory: 25, sellerId: 5 },
  { file: 'home-2-hanji-lamp.json', priceVery: 65, inventory: 30, sellerId: 5 },
]

async function main() {
  console.log('Uploading product metadata to IPFS...\n')

  const results = []

  for (const product of PRODUCTS) {
    const filePath = path.join(PRODUCTS_DIR, product.file)
    const metadata = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    console.log(`Uploading ${product.file}...`)

    try {
      const result = await pinJSONToIPFS(metadata, product.file.replace('.json', ''))
      const ipfsHash = result.IpfsHash

      results.push({
        file: product.file,
        title: metadata.title,
        category: metadata.category,
        sellerId: product.sellerId,
        priceVery: product.priceVery,
        inventory: product.inventory,
        ipfsHash,
        metadataURI: `ipfs://${ipfsHash}`
      })

      console.log(`  ✓ ${metadata.title}: ipfs://${ipfsHash}`)
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`)
    }
  }

  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2))
  console.log(`\nSaved ${results.length} product hashes to ${OUTPUT_FILE}`)

  // Generate Solidity-compatible output
  console.log('\n--- Solidity Deployment Data ---')
  console.log('Copy this to your deployment script:\n')

  for (const r of results) {
    console.log(`// ${r.title}`)
    console.log(`productRegistry.adminCreateProduct(${r.sellerId}, "${r.title}", "${r.category}", ${r.priceVery} ether, ${r.inventory}, "${r.metadataURI}");`)
    console.log('')
  }
}

main().catch(console.error)
