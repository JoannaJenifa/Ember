---
description: Deploy Move contracts to Movement Network
argument: <network: testnet or mainnet>
---

# Deploy Move Contracts

Deploy Ember Move modules to Movement Network.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `move-dev` skill
- Aptos CLI installed
- Movement profile configured
- Funded wallet for gas

## Steps

### 1. Run Tests First

```bash
cd contracts
aptos move test
```

**STOP if tests fail.** Fix issues before deploying.

### 2. Initialize Profile (First Time Only)

```bash
# For testnet
aptos init --profile movement-testnet \
  --network custom \
  --rest-url https://aptos.testnet.porto.movementlabs.xyz/v1

# For mainnet
aptos init --profile movement-mainnet \
  --network custom \
  --rest-url https://mainnet.movementnetwork.xyz/v1
```

### 3. Fund the Account (Testnet)

```bash
# Get testnet tokens from faucet
# Visit: https://faucet.movementnetwork.xyz
```

### 4. Compile Contracts

```bash
cd contracts
aptos move compile
```

### 5. Publish to Network

```bash
# Testnet
aptos move publish --profile movement-testnet

# Mainnet (requires --max-gas for safety)
aptos move publish --profile movement-mainnet --max-gas 100000
```

### 6. Initialize Modules (If Required)

```bash
# Initialize product registry
aptos move run \
  --function-id 'YOUR_ADDR::product_registry::initialize' \
  --profile movement-testnet

# Initialize order escrow
aptos move run \
  --function-id 'YOUR_ADDR::order_escrow::initialize' \
  --profile movement-testnet
```

### 7. Verify Deployment

```bash
# Test a view function
aptos move view \
  --function-id 'YOUR_ADDR::product_registry::get_product_count' \
  --profile movement-testnet
```

## Ember Contract Deployment Order

Deploy in this order (dependencies matter):

1. `seller_registry` - No dependencies
2. `product_registry` - Depends on seller_registry
3. `order_escrow` - Depends on product_registry
4. `review_registry` - Depends on order_escrow
5. `tip_jar` - No dependencies
6. `gift_shop` - No dependencies

## Success Checklist

- [ ] All tests pass locally
- [ ] Contracts compile without errors
- [ ] Publish transaction succeeds
- [ ] Module initialization succeeds
- [ ] View functions return expected results

## Example Usage

```
/deploy-contracts testnet
```

```
/deploy-contracts mainnet for production launch
```

## If This Fails

### Error: "INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE"
**Fix:** Fund the deployer account with MOVE tokens

### Error: "MODULE_ALREADY_PUBLISHED"
**Fix:** Use a different address or upgrade existing module

### Error: "DEPENDENCY_NOT_RESOLVED"
**Fix:** Check Move.toml dependencies, ensure all referenced modules exist
