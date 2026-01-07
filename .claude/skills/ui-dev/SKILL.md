---
name: ui-dev
description: Build UI components with dark theme, shadcn/ui, animations, and responsive design for Ember live commerce dashboard
---

# UI Development Skill - ACTIVE

**USE THIS SKILL FOR ALL FRONTEND/UI WORK.**

---

## BEFORE WRITING ANY CODE - DO THIS FIRST

1. **Check `docs/issues/ui/README.md`** for known pitfalls
2. **Check shadcn/ui via Context7:** Use `/shadcn-ui/ui` library ID to fetch component docs
3. **Verify file size limits:** max 300 lines (page.tsx 150, *-tab.tsx 250, use-*.ts 200, types.ts 100)

---

## FILE SIZE ENFORCEMENT

Before writing ANY component, estimate line count:

- **< 150 lines** → Write as single file
- **150-300 lines** → Consider splitting
- **> 300 lines** → MUST decompose FIRST

### Decomposition Pattern

```
feature/
├── page.tsx          # Orchestration only (< 150)
├── components/
│   ├── main-tab.tsx  # Tab components (< 250 each)
│   ├── other-tab.tsx
│   └── shared/       # Reusable pieces
│       ├── form.tsx
│       └── display.tsx
├── hooks/
│   └── use-feature.ts # Business logic (< 200)
└── types.ts          # Types only (< 100)
```

---

## MANDATORY PATTERNS

### Theme Colors (NEVER hardcode)

```tsx
// WRONG - hardcoded colors
<div className="bg-gray-900 text-white">

// CORRECT - theme variables
<div className="bg-background text-foreground">
```

| Variable | Usage |
|----------|-------|
| `bg-background` | Page background |
| `text-foreground` | Primary text |
| `bg-card` | Card backgrounds |
| `bg-primary` | Primary actions |
| `text-muted-foreground` | Secondary text |
| `bg-destructive` | Error states |

### Loading States (NEVER skip)

```tsx
// WRONG - no loading state
{data && <Component data={data} />}

// CORRECT - all states handled
{isLoading ? (
  <Skeleton className="h-40 w-full" />
) : error ? (
  <div className="text-destructive">{error.message}</div>
) : (
  <Component data={data} />
)}
```

### Responsive Design (mobile-first)

```tsx
// WRONG - desktop only
<div className="flex gap-8">

// CORRECT - responsive
<div className="flex flex-col gap-4 md:flex-row md:gap-8">
```

---

## EMBER-SPECIFIC COMPONENTS

### Product Card
```tsx
<Card className="overflow-hidden">
  <div className="relative aspect-square">
    <Image src={product.image} alt={product.title} fill />
    {product.isLive && (
      <Badge className="absolute top-2 left-2 bg-red-500">LIVE</Badge>
    )}
  </div>
  <CardContent className="p-4">
    <h3 className="font-semibold truncate">{product.title}</h3>
    <p className="text-primary font-bold">{product.price} MOVE</p>
  </CardContent>
</Card>
```

### Live Stream Overlay
```tsx
<div className="absolute bottom-4 right-4 space-y-2">
  {featuredProducts.map(product => (
    <Button
      key={product.id}
      className="bg-primary/90 backdrop-blur"
      onClick={() => handlePurchase(product)}
    >
      Buy {product.title} - {product.price} MOVE
    </Button>
  ))}
</div>
```

### Verified Badge
```tsx
<Badge variant="outline" className="gap-1">
  <CheckCircle className="h-3 w-3 text-green-500" />
  Verified Purchase
</Badge>
```

---

## INSTALLING COMPONENTS

When you need a shadcn component:

```bash
cd frontend && npx shadcn@latest add [component]
```

Common components for Ember:
```bash
npx shadcn@latest add button card dialog input select tabs toast progress skeleton badge avatar
```

---

## QUICK REFERENCE

| Task | Solution |
|------|----------|
| Form input | `shadcn Input` component |
| Dropdown | `shadcn Select` component |
| Modal | `shadcn Dialog` component |
| Video player | HTML5 video or video.js |
| Icons | `lucide-react` |
| Hover effect | `transition-all duration-200 hover:bg-muted` |
| Focus ring | `focus:ring-2 focus:ring-primary` |

---

## CHECKLIST BEFORE SUBMITTING

- [ ] File under 300 lines
- [ ] No hardcoded colors (use theme variables)
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Mobile responsive
- [ ] Accessibility (aria labels, keyboard nav)
- [ ] Follows existing patterns in codebase
