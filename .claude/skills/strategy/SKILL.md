---
name: strategy
description: Multi-session prompt planning for complex features. Creates executable prompt files for step-by-step implementation. (project)
---

# Strategy Skill

## Purpose

Break complex goals into executable prompts that can be run across multiple sessions.

## When to Use

- Features requiring multiple components
- Integration work spanning frontend + contracts
- Refactoring that touches many files
- Any task that can't be completed in one session

## Prompt File Format

Each prompt in `prompts/` must follow this structure:

```markdown
# Prompt N: [Title]

**Priority**: [HIGHEST/High/Medium/Low]
**Skill**: [ui-dev/move-dev/code-structure/none]

---

## Objective

[Clear, single objective]

---

## Current State

[What exists now, file paths]

---

## Requirements

### 1. [Requirement]
[Specific details]

### 2. [Requirement]
[Specific details]

---

## Files to Create/Modify

- `path/file.ts` - CREATE - [purpose]
- `path/other.ts` - MODIFY - [what changes]

---

## Verification

```bash
[Commands to verify success]
```

---

## Success Criteria

- [ ] [Testable criterion]
- [ ] [Testable criterion]

---

## Dependencies

- **Requires**: [None or Prompt N]
- **Blocks**: [None or Prompt N]
```

## Dependency Rules

- No circular dependencies
- Each prompt should be independently runnable (after deps complete)
- Verification must be possible without other prompts

## Example: Ember Feature

Goal: "Add product review system"

### Prompt 1: Review Move Module
```markdown
# Prompt 1: Review Registry Move Module

**Priority**: HIGHEST
**Skill**: move-dev

## Objective
Create the review_registry Move module for storing verified reviews.

## Requirements
1. Review struct with rating, content, verified flag
2. Submit review function (requires order completion)
3. Get reviews by product function
4. Events for new reviews

## Files to Create
- `contracts/sources/review_registry.move` - CREATE

## Verification
```bash
cd contracts && aptos move test --filter test_review
```

## Dependencies
- **Requires**: None
- **Blocks**: Prompt 2, Prompt 3
```

### Prompt 2: Review Frontend
```markdown
# Prompt 2: Review UI Components

**Priority**: High
**Skill**: ui-dev

## Objective
Create review display and submission components.

## Requirements
1. ReviewCard component
2. ReviewForm component
3. useReviews hook

## Files to Create
- `frontend/app/products/components/review-card.tsx`
- `frontend/app/products/components/review-form.tsx`
- `frontend/app/products/hooks/use-reviews.ts`

## Verification
```bash
cd frontend && npm run build
```

## Dependencies
- **Requires**: Prompt 1
- **Blocks**: None
```

## Progress Tracking

Update `prompts/README.md` after each prompt:

```markdown
# Ember Implementation Progress

## Status

| Prompt | Title | Status | Blocked By |
|--------|-------|--------|------------|
| 1 | Review Move Module | ✅ Complete | - |
| 2 | Review UI Components | 🔄 In Progress | - |
| 3 | Integration | ⏳ Pending | Prompt 2 |

## Execution Order

1. Prompt 1 (no deps)
2. Prompt 2 (after 1)
3. Prompt 3 (after 2)
```

## Rules

- **NO CODE in strategy mode** - Only prompt files
- **Be specific** - Exact file paths, function names
- **Include verification** - Must be testable
- **Single responsibility** - One clear objective per prompt
