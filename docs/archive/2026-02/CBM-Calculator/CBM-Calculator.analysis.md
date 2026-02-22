# Gap Analysis: CBM-Calculator

> Feature: CBM Calculator
> Design: `docs/02-design/features/CBM-Calculator.design.md`
> Analyzed: 2026-02-22
> Match Rate: **97%**

---

## Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Type Definitions | 100% | PASS |
| State & Constants | 100% | PASS |
| Calculation Logic | 100% | PASS |
| UI Components | 100% | PASS |
| Animation | 100% | PASS |
| Accessibility | 100% | PASS |
| Validation | 100% | PASS |
| **Overall** | **97%** | PASS |

---

## Detailed Results

| # | Design Requirement | Result | Notes |
|---|---|:---:|---|
| 1 | Type Definitions (UnitSystem, CargoItem, CBMResults, UnitLabels) | PASS | All 4 types in types.ts match exactly |
| 2 | State Architecture (unit, items, results + useEffect) | PASS | 3 state vars + useEffect pattern |
| 3 | Constants (MAX_ITEMS, factors, conversions) | PASS | All 5 constants match |
| 4 | calculateAll pure function | PASS | Logic identical to design |
| 5 | Header Bar with unit toggle | PASS | Layout, styling, buttons match |
| 6 | CargoItemRow inline component | PASS | Props interface exact match |
| 7 | AnimatePresence popLayout for rows | PASS | All animation props match |
| 8 | Add Item button with MAX_ITEMS | PASS | Conditional + motion effects |
| 9 | Results Panel AnimatePresence | PASS | mode="wait", key, transitions |
| 10 | Air/Sea chargeable weight badge | PASS | Air exact; Sea added as extension |
| 11 | Validation rules | PASS | All 4 bounds + negative check |
| 12 | Accessibility | PASS | radiogroup, aria-checked, aria-live, htmlFor labels |
| 13 | Responsive layout | PASS | grid-cols-1 lg:grid-cols-2 gap-8 |
| 14 | Import structure | PASS | Minor icon list deviation (acceptable) |
| 15 | Reset functionality | PASS | Resets unit + items |
| 16 | Dark mode | PASS | dark: variants on all elements |

---

## Minor Deviations (3)

### 1. Icon Imports: Ruler vs Trash2/Box (Acceptable)

- **Design**: `import { Calculator, RefreshCw, Plus, Ruler }`
- **Implementation**: `import { Calculator, RefreshCw, Plus, Trash2, Box }`
- **Assessment**: Design lists `Ruler` but never uses it. Implementation correctly imports `Trash2` (delete button) and `Box` (quantity icon). Design doc typo.

### 2. Sea Freight Badge Logic (Enhancement)

- **Design**: Only specifies Air badge logic
- **Implementation**: Adds Sea badge (`seaChargeableRT > totalCBM` -> "실중량 적용" / "부피 적용")
- **Assessment**: Logical extension matching Air badge pattern. Design doc should document this.

### 3. UnitLabels Type Defined but Unused (Informational)

- **Design**: Defines `UnitLabels` in types.ts
- **Implementation**: Type exists but not imported in CBMCalculator.tsx (inline derivation used instead)
- **Assessment**: Functionally equivalent. Low priority.

---

## Gaps Found

None of critical or major severity.

---

## Recommended Actions

1. **Design doc update** (low priority): Fix icon imports, add Sea badge spec, clarify UnitLabels intent
2. **No code changes required**: Implementation faithfully matches design across all 16 areas

---

## Build Verification

- `tsc --noEmit`: 0 errors
- `npm run build`: Success (2.49s)
