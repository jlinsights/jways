# Design: CBM-Calculator

> Feature: 화물 부피(CBM) 및 운임 중량 계산기
> Plan Reference: `docs/01-plan/features/CBM-Calculator.plan.md`
> Created: 2026-02-22
> Status: Design

---

## 1. Architecture Overview

### 1.1 Component Hierarchy

```
App.tsx
└── <section> (CBM 섹션 래퍼 - App.tsx:18-26)
    ├── Section Header (h2 + description)
    └── <CBMCalculator />
        ├── Header Bar (gradient, title, unit toggle, reset)
        ├── Items Area
        │   ├── <CargoItemRow /> × N (다중 품목 행)
        │   └── Add Item Button
        ├── Results Panel
        │   ├── Total CBM (animated number)
        │   ├── Air Freight Card
        │   └── Sea Freight Card
        └── Footer Actions (견적 요청 연동 버튼)
```

### 1.2 State Architecture

```typescript
// CBMCalculator 내부 state
const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
const [items, setItems] = useState<CargoItem[]>([defaultItem()]);
const [results, setResults] = useState<CBMResults>(initialResults);
```

모든 계산은 `useEffect` → `calculateAll(items, unit)` 순수 함수로 파생.
items 또는 unit이 변경될 때마다 자동 재계산.

---

## 2. Type Definitions

`types.ts`에 추가할 타입:

```typescript
// ─── CBM Calculator Types ───

export type UnitSystem = 'metric' | 'imperial';

export interface CargoItem {
  id: string;
  length: string;  // 사용자 입력값은 string으로 유지 (빈 문자열 허용)
  width: string;
  height: string;
  weight: string;
  quantity: string;
}

export interface CBMResults {
  totalCBM: number;
  totalActualWeight: number;     // kg
  airVolumeWeight: number;       // kg
  airChargeableWeight: number;   // kg (적용 운임 중량)
  seaVolumeWeight: number;       // kg
  seaChargeableRT: number;       // Revenue Ton
}

export interface UnitLabels {
  dimension: string;  // 'cm' | 'in'
  weight: string;     // 'kg' | 'lbs'
}
```

---

## 3. Detailed Component Design

### 3.1 CBMCalculator.tsx (주 컴포넌트)

**Props**: 없음 (독립 컴포넌트)

**Imports 추가**:
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, RefreshCw, Plus, Ruler } from 'lucide-react';
import { CargoItem, CBMResults, UnitSystem } from '../types';
```

**State**:
| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `unit` | `UnitSystem` | `'metric'` | cm/kg vs in/lbs 전환 |
| `items` | `CargoItem[]` | `[defaultItem()]` | 다중 품목 행 |
| `results` | `CBMResults` | `initialResults` | 계산 결과 |

**Constants**:
```typescript
const MAX_ITEMS = 20;
const AIR_CBM_FACTOR = 167;       // 1 CBM = 167 kg
const SEA_CBM_FACTOR = 1000;      // 1 CBM = 1,000 kg (1 M/T)
const CM_TO_INCH = 2.54;
const KG_TO_LBS = 2.20462;
```

**Pure calculation function** (useEffect에서 호출):
```typescript
function calculateAll(items: CargoItem[], unit: UnitSystem): CBMResults {
  let totalCBM = 0;
  let totalActualWeight = 0;

  items.forEach(item => {
    let l = parseFloat(item.length) || 0;
    let w = parseFloat(item.width) || 0;
    let h = parseFloat(item.height) || 0;
    let wt = parseFloat(item.weight) || 0;
    const qty = parseInt(item.quantity) || 0;

    // imperial → metric 변환
    if (unit === 'imperial') {
      l *= CM_TO_INCH;
      w *= CM_TO_INCH;
      h *= CM_TO_INCH;
      wt /= KG_TO_LBS;
    }

    totalCBM += (l * w * h) / 1_000_000 * qty;
    totalActualWeight += wt * qty;
  });

  const airVolumeWeight = totalCBM * AIR_CBM_FACTOR;
  const seaVolumeWeight = totalCBM * SEA_CBM_FACTOR;

  return {
    totalCBM: round(totalCBM, 3),
    totalActualWeight: round(totalActualWeight, 2),
    airVolumeWeight: round(airVolumeWeight, 2),
    airChargeableWeight: round(Math.max(totalActualWeight, airVolumeWeight), 2),
    seaVolumeWeight: round(seaVolumeWeight, 2),
    seaChargeableRT: round(Math.max(totalCBM, totalActualWeight / 1000), 3),
  };
}
```

### 3.2 Header Bar 영역

현재 구현을 확장:

```
┌─────────────────────────────────────────────────────────┐
│ [Calculator Icon]  CBM 계산기                           │
│                    해상/항공 화물 부피 및 운송 중량 계산  │
│                                                         │
│                     [cm/kg ↔ in/lbs]  [Reset Button]    │
└─────────────────────────────────────────────────────────┘
```

**단위 토글 UI**:
```tsx
<div className="flex items-center bg-white/10 rounded-full p-0.5">
  <button
    onClick={() => setUnit('metric')}
    className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
      unit === 'metric' ? 'bg-white text-jways-blue' : 'text-blue-100'
    }`}
  >
    cm / kg
  </button>
  <button
    onClick={() => setUnit('imperial')}
    className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
      unit === 'imperial' ? 'bg-white text-jways-blue' : 'text-blue-100'
    }`}
  >
    in / lbs
  </button>
</div>
```

### 3.3 CargoItemRow (인라인 컴포넌트)

각 품목 행. items 배열 내 단일 항목 렌더링.

```
┌──────────────────────────────────────────────────────────────┐
│ #1  [가로 L ___cm]  [세로 W ___cm]  [높이 H ___cm]          │
│     [중량 ___kg]    [수량 ___EA]              [🗑 삭제]      │
└──────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface CargoItemRowProps {
  item: CargoItem;
  index: number;
  unit: UnitSystem;
  onChange: (id: string, field: keyof CargoItem, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;  // items.length > 1 일 때만 삭제 가능
}
```

**AnimatePresence 적용**: 행 추가/삭제 시 `motion.div`로 감싸서 fade+slide 효과.

```tsx
<AnimatePresence mode="popLayout">
  {items.map((item, idx) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <CargoItemRow ... />
    </motion.div>
  ))}
</AnimatePresence>
```

**행 추가 버튼** (MAX_ITEMS 미만일 때만 표시):
```tsx
{items.length < MAX_ITEMS && (
  <motion.button
    onClick={addItem}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700
               rounded-xl text-slate-400 hover:text-jways-blue hover:border-jways-blue
               transition-colors flex items-center justify-center gap-2 text-sm font-medium"
  >
    <Plus size={16} /> 품목 추가
  </motion.button>
)}
```

### 3.4 Results Panel

결과 영역에 framer-motion `animate` 적용. 숫자 변경 시 부드러운 전환.

**CBM 메인 숫자 애니메이션**: `motion.span`의 `key`를 값으로 설정하여 AnimatePresence 전환.

```tsx
<AnimatePresence mode="wait">
  <motion.span
    key={results.totalCBM}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="text-5xl font-bold text-jways-blue tabular-nums"
  >
    {results.totalCBM}
  </motion.span>
</AnimatePresence>
```

**Air/Sea 카드**: 기존 구조 유지. 적용 운임 중량이 부피 중량 기반인지 실중량 기반인지 표시하는 뱃지 추가:

```tsx
{results.airChargeableWeight > results.totalActualWeight ? (
  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded-full">
    부피중량 적용
  </span>
) : (
  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full">
    실중량 적용
  </span>
)}
```

---

## 4. Validation Rules

| Field | Rule | Error Handling |
|-------|------|----------------|
| L / W / H | `>= 0`, 상한 `99999` | 음수 입력 무시 (`handleChange`에서 필터) |
| Weight | `>= 0`, 상한 `999999` | 음수 입력 무시 |
| Quantity | `>= 1`, 정수만, 상한 `9999` | 최소 1, 빈 값이면 0 처리 |
| Items count | `1 ~ 20` | 1개 미만 삭제 불가, 20개 초과 추가 불가 |

유효성은 입력 시점(`handleChange`)에서 필터링. 별도 에러 메시지 없이 잘못된 입력을 무시하는 방식.

---

## 5. Accessibility Design

| 요소 | 적용 사항 |
|------|-----------|
| 모든 `<input>` | `aria-label` 또는 연결된 `<label htmlFor>` |
| 단위 토글 | `role="radiogroup"`, 각 버튼 `role="radio"` + `aria-checked` |
| 행 삭제 버튼 | `aria-label="품목 N 삭제"` |
| 행 추가 버튼 | `aria-label="품목 추가"` |
| Reset 버튼 | `aria-label="Reset Calculator"` (유지) |
| 결과 영역 | `aria-live="polite"` (값 변경 시 스크린 리더 알림) |
| 키보드 네비게이션 | Tab으로 입력 필드 순서대로 이동 |

---

## 6. Responsive Layout

### Mobile (< 768px)
```
┌──────────────────────────┐
│ Header (단위 토글 아래줄) │
├──────────────────────────┤
│ Item #1                  │
│  [L] [W] [H]  (3col)    │
│  [Weight] [Qty] (2col)  │
├──────────────────────────┤
│ + 품목 추가              │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ Total CBM: 0.000     │ │
│ ├──────────────────────┤ │
│ │ Air Card             │ │
│ ├──────────────────────┤ │
│ │ Sea Card             │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Desktop (>= 1024px)
```
┌──────────────────────────────────────────────────────┐
│ Header Bar (title + unit toggle + reset)             │
├────────────────────────┬─────────────────────────────┤
│ Items (left col)       │ Results (right col)         │
│                        │                             │
│ Item #1                │  Total CBM: 0.000           │
│  [L] [W] [H]          │  Total Weight: 0 kg         │
│  [Weight] [Qty] [🗑]  │                             │
│                        │  ┌──────┐  ┌──────┐        │
│ Item #2                │  │ Air  │  │ Sea  │        │
│  [L] [W] [H]          │  └──────┘  └──────┘        │
│  [Weight] [Qty] [🗑]  │                             │
│                        │                             │
│ [+ 품목 추가]          │                             │
└────────────────────────┴─────────────────────────────┘
```

기존 `grid grid-cols-1 lg:grid-cols-2 gap-8` 레이아웃 유지.

---

## 7. Implementation Order

구현 시 아래 순서대로 진행:

| Step | Task | File | FR |
|------|------|------|----|
| 1 | types.ts에 CBM 타입 정의 추가 | `types.ts` | - |
| 2 | 다중 품목 state 리팩터링 (items 배열) | `CBMCalculator.tsx` | FR-08 |
| 3 | `calculateAll` 순수 함수 추출 | `CBMCalculator.tsx` | FR-02~05 |
| 4 | 단위 변환 토글 UI + 로직 | `CBMCalculator.tsx` | FR-07 |
| 5 | CargoItemRow 분리 + 행 추가/삭제 | `CBMCalculator.tsx` | FR-08 |
| 6 | framer-motion 애니메이션 적용 | `CBMCalculator.tsx` | FR-10 |
| 7 | 입력 유효성 검증 강화 | `CBMCalculator.tsx` | FR-11 |
| 8 | 접근성 (aria, label, live region) | `CBMCalculator.tsx` | NFR-01 |
| 9 | 적용 운임 근거 뱃지 추가 | `CBMCalculator.tsx` | - |

---

## 8. Design Constraints

- **외부 의존성 추가 금지**: 기존 `react`, `framer-motion`, `lucide-react`만 사용
- **Tailwind CDN**: PostCSS 빌드 없이 CDN 인라인 설정 사용 (기존 패턴 유지)
- **CargoItemRow는 별도 파일로 분리하지 않음**: CBMCalculator.tsx 내부에 인라인 컴포넌트로 정의 (파일 수 최소화)
- **QuoteModal 연계 (FR-12)**: 이번 스코프에서 제외. 별도 PDCA 사이클로 진행
- **PDF 내보내기 (FR-09)**: 이번 스코프에서 제외. 외부 라이브러리 필요
