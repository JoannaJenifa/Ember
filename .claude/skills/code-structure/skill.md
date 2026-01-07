---
name: code-structure
description: File size limits, decomposition patterns, and component architecture. Load before creating any new files. (project)
---

# Code Structure Skill

## CRITICAL: File Size Limits

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

Files over 300 lines cannot be read by AI tools and block development.

### Limits by File Type

| File Type | Max Lines | Purpose |
|-----------|-----------|---------|
| `page.tsx` / `screen.tsx` | 150 | Orchestration only |
| `*-tab.tsx` | 250 | Tab components |
| Component files | 200 | UI components |
| `use-*.ts` | 200 | Hooks with business logic |
| `types.ts` | 100 | Type definitions |
| `constants.ts` | 150 | Addresses, configs |
| `*-service.ts` | 300 | API/chain services |
| `*.move` | 300 | Move modules |

## When to Decompose

| Trigger | Action |
|---------|--------|
| File > 300 lines | MUST decompose immediately |
| File > 200 lines | Consider decomposing |
| 3+ useState hooks | Extract to custom hook |
| Multiple tabs/sections | Split into separate components |
| Types inline in component | Move to types.ts |
| Hardcoded addresses/config | Move to constants.ts |

## Required Structure for Features

Every feature MUST be decomposed:

```
app/{feature}/
├── page.tsx              # Orchestration only (< 150 lines)
├── components/
│   ├── {feature}-main.tsx
│   ├── {feature}-list.tsx
│   └── {feature}-item.tsx
├── hooks/
│   ├── use-{feature}.ts      # Business logic (< 200 lines)
│   └── use-{feature}-query.ts
├── types.ts              # Type definitions (< 100 lines)
└── constants.ts          # Addresses, configs (< 150 lines)
```

## Decomposition Patterns

### Pattern 1: Extract Hook from Component

**Before (bad):**
```tsx
function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { /* fetch logic */ }, [])

  const handleSubmit = async () => { /* submit logic */ }

  return <div>...</div>
}
```

**After (good):**
```tsx
// hooks/use-my-feature.ts
export function useMyFeature() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { /* fetch logic */ }, [])

  const handleSubmit = async () => { /* submit logic */ }

  return { data, loading, error, handleSubmit }
}

// components/my-component.tsx
function MyComponent() {
  const { data, loading, error, handleSubmit } = useMyFeature()
  return <div>...</div>
}
```

### Pattern 2: Split Large Components

**Before (bad):**
```tsx
function ProductPage() {
  return (
    <div>
      {/* 50 lines of header */}
      {/* 80 lines of product grid */}
      {/* 100 lines of live stream */}
      {/* 70 lines of chat */}
    </div>
  )
}
```

**After (good):**
```tsx
// components/product-header.tsx
// components/product-grid.tsx
// components/live-stream.tsx
// components/chat-panel.tsx

function ProductPage() {
  return (
    <div>
      <ProductHeader />
      <ProductGrid />
      <LiveStream />
      <ChatPanel />
    </div>
  )
}
```

### Pattern 3: Extract Types

**Before (bad):**
```tsx
interface Product {
  id: string
  title: string
  // ... 20 more fields
}

interface Order {
  // ... 15 fields
}

function Component({ product, order }: { product: Product; order: Order }) {}
```

**After (good):**
```tsx
// types.ts
export interface Product { /* ... */ }
export interface Order { /* ... */ }

// component.tsx
import type { Product, Order } from './types'
```

## Checklist Before Creating Files

- [ ] Will this file be under 300 lines?
- [ ] Is page.tsx only orchestration (no business logic)?
- [ ] Are types in a separate types.ts file?
- [ ] Are constants in a separate constants.ts file?
- [ ] Are hooks extracted from components?
- [ ] Are large components split into smaller ones?

## Red Flags

Watch for these signs that decomposition is needed:

1. **Scrolling too much** - If you can't see the whole component, split it
2. **Multiple responsibilities** - One component doing many unrelated things
3. **Repeated patterns** - Same code in multiple places → extract to shared component
4. **Deep nesting** - More than 3 levels of JSX nesting → extract inner parts
5. **Long imports** - Too many imports → might be doing too much
