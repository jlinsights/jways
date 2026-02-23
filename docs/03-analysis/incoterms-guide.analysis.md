# Gap Analysis: incoterms-guide

> **Match Rate: 82% (47/57 items)**
>
> **Project**: jways-logistics
> **Analyst**: Claude Code (gap-detector)
> **Date**: 2026-02-23
> **Design Doc**: [incoterms-guide.design.md](../02-design/features/incoterms-guide.design.md)
> **Implementation**: [IncotermsGuide.tsx](../../components/IncotermsGuide.tsx)

---

## Summary

Implementation closely follows the design document across data model, UI structure, animations, responsive design, dark mode color mappings, and App.tsx integration. The primary gap is the complete absence of accessibility (a11y) attributes specified in Design Section 8 -- all 10 accessibility items (5 Must-Have, 3 Should-Have, 2 Nice-to-Have) are unimplemented. No `role`, `aria-selected`, `aria-label`, `aria-labelledby`, or `aria-hidden` attributes exist in the implementation.

---

## Section-by-Section Analysis

### Section 1: Component Overview (4/4 - 100%)

- [x] File path: `components/IncotermsGuide.tsx`
- [x] Component type: React.FC, self-contained
- [x] Props: none
- [x] Placement: App.tsx between ExchangeRate and LogisticsWiki

### Section 2: Data Model (3/3 - 100%)

- [x] `steps` array: 9 items with `id`, `name`, `short` fields -- all values match
- [x] `incotermsList` array: 5 items (EXW/FOB/CIF/DAP/DDP) with `code`, `name`, `desc`, `sellerSteps`
- [x] `dapMatrix` array: `[true, true, true, true, true, false, true, false, true]` -- exact match

### Section 3: State Management (3/3 - 100%)

- [x] `selectedTerm` state using `useState`
- [x] Default value: `incotermsList[1].code` (FOB)
- [x] Derived value: `currentTermInfo = incotermsList.find(t => t.code === selectedTerm)`

### Section 4: UI Structure (6/6 - 100%)

- [x] 4.1 Root Container: className exact match (L59)
- [x] 4.2 Header Section: gradient, decoration, layout, icon badge, label, title, description, tab buttons all match
- [x] 4.3 Content Section: AnimatePresence mode="wait", motion.div transition all match
- [x] 4.4 Description Card: container, Info icon, title h4, description text all match
- [x] 4.5 Matrix Visualization: scrollable container, labels, progress bar, DAP special, steps grid all match
- [x] 4.6 Disclaimer: container, list items, exact text match

### Section 5: Import Dependencies (3/3 - 100%)

- [x] `react`: React, useState
- [x] `framer-motion`: motion, AnimatePresence
- [x] `lucide-react`: Info, FileText, ChevronRight, Check, X

### Section 6: Animation Specification (3/3 - 100%)

- [x] Content transition: opacity 0->1->0, y 10->0->-10, duration 0.2s
- [x] Progress bar: transition-all duration-700 ease-in-out
- [x] Step icon: transition-colors duration-500

### Section 7: Responsive Design (4/4 - 100%)

- [x] Header: mobile flex-col, desktop flex-row
- [x] Matrix: overflow-x-auto with min-w-[700px]
- [x] Mobile padding: p-6
- [x] Step labels: text-[10px], short field used

### Section 8: Accessibility (0/10 - 0%) -- GAP

#### 8.1 Must Have (0/5)
- [ ] `role="tab"` on Incoterms tab buttons --> **Gap #1**
- [ ] `role="tablist"` on tab group container --> **Gap #2**
- [ ] `aria-selected="true"` on active tab --> **Gap #3**
- [ ] `role="tabpanel"` on content area --> **Gap #4**
- [ ] `aria-labelledby` on tabpanel referencing active tab button id --> **Gap #5**

#### 8.2 Should Have (0/3)
- [ ] `aria-label` on each step grid item --> **Gap #6**
- [ ] `role="img"` + `aria-label` on progress bar --> **Gap #7**
- [ ] `aria-hidden="true"` on Check/X icons --> **Gap #8**

#### 8.3 Nice to Have (0/2)
- [ ] Keyboard arrow navigation between tabs --> **Gap #9**
- [ ] `role="note"` on disclaimer --> **Gap #10**

### Section 9: Dark Mode Color Map (20/20 - 100%)

All 20 element color mappings match exactly between design and implementation.

### Section 10: Integration with App.tsx (3/3 - 100%)

- [x] Import path correct
- [x] Placement order: ExchangeRate -> IncotermsGuide -> LogisticsWiki
- [x] Independent operation: no props, no external state

---

## Overall Score

```
+-------------------------------------------------+
|  Overall Match Rate: 82% (47/57 items)          |
+-------------------------------------------------+
|  Section 1  (Component Overview):   4/4  (100%) |
|  Section 2  (Data Model):          3/3  (100%) |
|  Section 3  (State Management):    3/3  (100%) |
|  Section 4  (UI Structure):        6/6  (100%) |
|  Section 5  (Import Dependencies): 3/3  (100%) |
|  Section 6  (Animation Spec):      3/3  (100%) |
|  Section 7  (Responsive Design):   4/4  (100%) |
|  Section 8  (Accessibility):       0/10 (  0%) |
|  Section 9  (Dark Mode):          20/20 (100%) |
|  Section 10 (Integration):         3/3  (100%) |
+-------------------------------------------------+
```

---

## Gap List

| # | Section | Item | Priority | Description |
|---|---------|------|----------|-------------|
| 1 | 8.1 | `role="tab"` on tab buttons | Must | Tab buttons (L78-88) lack ARIA tab role |
| 2 | 8.1 | `role="tablist"` on container | Must | Tab container (L76) lacks tablist role |
| 3 | 8.1 | `aria-selected` on active tab | Must | Active tab (L82) lacks selected state |
| 4 | 8.1 | `role="tabpanel"` on content | Must | Content area (L97) lacks tabpanel role |
| 5 | 8.1 | `aria-labelledby` on tabpanel | Must | Tabpanel not linked to controlling tab |
| 6 | 8.2 | `aria-label` on step items | Should | Step grid items (L171) missing labels |
| 7 | 8.2 | `role="img"` + `aria-label` on progress bar | Should | Progress bar (L130) not described |
| 8 | 8.2 | `aria-hidden="true"` on icons | Should | Check/X icons (L177) not hidden from AT |
| 9 | 8.3 | Keyboard arrow navigation | Nice | No keyboard tab navigation support |
| 10 | 8.3 | `role="note"` on disclaimer | Nice | Disclaimer (L193) lacks semantic role |

---

## Recommendation

**Match Rate: 82% -- Below 90% threshold. `/pdca iterate` recommended.**

Implementing the 5 Must-Have items brings rate to 91% (52/57). All gaps are concentrated in Accessibility section -- no structural changes needed, only ARIA attribute additions.
