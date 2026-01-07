---
name: move-dev
description: Writing Move modules, testing, and deployment on Movement Network. Use for smart contract development. (project)
---

# Move Development Skill

## Movement Network Context

Movement is an Aptos-based L2 with fast finality. Move is the smart contract language.

### Key Differences from Solidity

| Aspect | Solidity | Move |
|--------|----------|------|
| Resources | Mappings | Structs stored under accounts |
| Ownership | Implicit | Explicit resource ownership |
| Reentrancy | Major concern | Prevented by design |
| Generics | Limited | First-class support |
| Testing | Foundry/Hardhat | Aptos CLI |

## BEFORE WRITING ANY CODE

1. **Check `docs/issues/move/README.md`** for known pitfalls
2. **Use Context7 for documentation:** Resolve library ID, then fetch docs with topic

## Project Structure

```
contracts/
├── Move.toml           # Package manifest
├── sources/
│   ├── order_escrow.move
│   ├── review_registry.move
│   ├── product_registry.move
│   ├── seller_registry.move
│   ├── tip_jar.move
│   └── gift_shop.move
└── tests/
    └── *_tests.move
```

## Move Patterns

### Module Declaration
```move
module ember::order_escrow {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::event;

    // Error codes as constants
    const E_NOT_FOUND: u64 = 1;
    const E_UNAUTHORIZED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;

    // Structs with abilities
    struct Order has key, store {
        order_id: u64,
        buyer: address,
        seller: address,
        amount: u64,
        status: u8
    }

    // Entry functions (callable from outside)
    public entry fun create_order(buyer: &signer, seller: address, amount: u64) { }

    // View functions (read-only)
    #[view]
    public fun get_order(order_id: u64): Order { }
}
```

### Resource Management
```move
// Store under account
move_to(account, Resource { ... });

// Borrow immutable
let resource = borrow_global<Resource>(addr);

// Borrow mutable
let resource = borrow_global_mut<Resource>(addr);

// Check existence
exists<Resource>(addr)

// Remove from account
let resource = move_from<Resource>(addr);
```

### Abilities

| Ability | Meaning |
|---------|---------|
| `key` | Can be stored as top-level resource |
| `store` | Can be stored inside other resources |
| `copy` | Can be copied (duplicated) |
| `drop` | Can be dropped (destroyed implicitly) |

### Events
```move
#[event]
struct OrderCreated has drop, store {
    order_id: u64,
    buyer: address,
    seller: address,
    amount: u64
}

public entry fun create_order(buyer: &signer, seller: address, amount: u64) {
    // ... logic
    event::emit(OrderCreated {
        order_id,
        buyer: signer::address_of(buyer),
        seller,
        amount
    });
}
```

## CLI Commands

```bash
# Initialize project
aptos move init --name ember

# Compile
aptos move compile

# Test
aptos move test

# Initialize profile for Movement
aptos init --profile movement-testnet \
  --network custom \
  --rest-url https://aptos.testnet.porto.movementlabs.xyz/v1

# Publish to Movement testnet
aptos move publish --profile movement-testnet

# Call view function
aptos move view \
  --function-id 'MODULE_ADDR::module::view_func' \
  --profile movement-testnet

# Call entry function
aptos move run \
  --function-id 'MODULE_ADDR::module::entry_func' \
  --args TYPE:VALUE \
  --profile movement-testnet
```

## Testing

```move
#[test_only]
module ember::tests {
    use ember::order_escrow;
    use std::signer;

    #[test(buyer = @0x1, seller = @0x2)]
    fun test_create_order(buyer: &signer, seller: &signer) {
        // Setup
        order_escrow::initialize(buyer);

        // Execute
        order_escrow::create_order(buyer, signer::address_of(seller), 100);

        // Assert
        assert!(order_escrow::get_order_count() == 1, 0);
    }

    #[test(buyer = @0x1)]
    #[expected_failure(abort_code = order_escrow::E_NOT_FOUND)]
    fun test_order_not_found(buyer: &signer) {
        // Should abort with E_NOT_FOUND
        order_escrow::get_order(999);
    }
}
```

## File Size Limits

- Each Move module: max 300 lines
- Split large modules into separate files
- Use helper modules for shared logic

## Ember-Specific Patterns

### Order Status Enum
```move
const STATUS_CREATED: u8 = 0;
const STATUS_PAID: u8 = 1;
const STATUS_SHIPPED: u8 = 2;
const STATUS_DELIVERED: u8 = 3;
const STATUS_DISPUTED: u8 = 4;
```

### Verified Purchase Check
```move
public fun is_verified_buyer(buyer: address, product_id: u64): bool {
    // Check if buyer has a completed order for this product
    let orders = borrow_global<Orders>(@ember);
    // ... verification logic
}
```

## Security Checklist

- [ ] All abort codes documented
- [ ] Access control on sensitive functions
- [ ] No integer overflow (use checked math)
- [ ] Resource cleanup (no orphaned resources)
- [ ] Event emission for off-chain tracking
- [ ] Signer validation on entry functions
