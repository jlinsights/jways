# milestone-tracking Design Document

> **Summary**: 화물 운송 마일스톤 트래킹 고도화 — 카테고리 분류, ETA, 상세 펼침, 다중 시나리오
>
> **Project**: jways
> **Version**: 0.1.0
> **Date**: 2026-02-22
> **Status**: Draft
> **Planning Doc**: [milestone-tracking.plan.md](../../01-plan/features/milestone-tracking.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 기존 `TrackingStep` 타입을 물류 업계 표준 마일스톤 체계로 확장
- 마일스톤 카테고리별 시각적 그룹핑으로 화물 상태 직관적 파악
- 각 마일스톤별 ETA/경과 시간 표시로 정보 밀도 향상
- 상세 정보 expand/collapse로 UI 복잡도 관리
- Air/Sea 다중 Mock 시나리오로 데모 풍부화

### 1.2 Design Principles

- **기존 구조 유지**: 현재 Tracking.tsx, ShipmentMap.tsx의 아키텍처를 최대한 보존
- **타입 안전성**: 모든 마일스톤 데이터를 TypeScript 인터페이스로 엄격히 정의
- **점진적 향상**: 기존 검색/지도/타임라인 기능을 유지하면서 새 기능 추가
- **접근성 우선**: 모든 인터랙션에 aria 속성, 키보드 탐색 지원

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Tracking                          │
│  ┌───────────────────────────────────────────────┐  │
│  │  Search Header (기존 유지)                      │  │
│  ├───────────────────────────────────────────────┤  │
│  │  ┌────────────────┐  ┌──────────────────────┐ │  │
│  │  │  ShipmentMap    │  │  Timeline Panel      │ │  │
│  │  │  (기존 + minor) │  │  ┌────────────────┐  │ │  │
│  │  │                 │  │  │ ProgressHeader  │  │ │  │
│  │  │                 │  │  ├────────────────┤  │ │  │
│  │  │                 │  │  │ MilestoneGroup │  │ │  │
│  │  │                 │  │  │  ├ MilestoneRow │  │ │  │
│  │  │                 │  │  │  ├ MilestoneRow │  │ │  │
│  │  │                 │  │  │  └ (expandable) │  │ │  │
│  │  │                 │  │  ├────────────────┤  │ │  │
│  │  │                 │  │  │ MilestoneGroup │  │ │  │
│  │  │                 │  │  │  ├ MilestoneRow │  │ │  │
│  │  │                 │  │  │  └ ...          │  │ │  │
│  │  │                 │  │  └────────────────┘  │ │  │
│  │  └────────────────┘  └──────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
사용자 입력(trackingId)
  → handleSearch()
  → Mock 데이터 조회 (MOCK_SHIPMENTS Map에서 lookup)
  → ShipmentData 반환
  → ShipmentMap 렌더링 (지도 + 경로)
  → Timeline Panel 렌더링
    → ProgressHeader (전체 진행률 %)
    → milestoneCategories.map() → MilestoneGroup 렌더링
      → group.steps.map() → MilestoneRow 렌더링
        → 클릭 시 expand/collapse (상세 정보)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Tracking | ShipmentMap, types | 메인 컨테이너, 검색/결과 관리 |
| ShipmentMap | ShipmentData (types) | SVG 지도, 경로 애니메이션 |
| Timeline Panel | MilestoneCategory, TrackingStep (types) | 마일스톤 그룹핑 + 상세 |
| Mock Data | ShipmentData, createMockShipment (factory) | Air/Sea 시나리오 |

---

## 3. Data Model

### 3.1 Type Extensions (types.ts)

```typescript
// ─── Milestone Tracking Types ───

/** 마일스톤 카테고리 */
export type MilestoneCategory = 'departure' | 'transit' | 'customs' | 'arrival';

/** 운송 모드 */
export type TransportMode = 'air' | 'sea';

/** TrackingStep 확장 (기존 호환 유지) */
export interface TrackingStep {
  id: string;
  label: string;
  date: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
  location: string;
  // ─── 신규 필드 (optional로 기존 호환) ───
  category?: MilestoneCategory;
  eta?: string;                    // 예상 소요 시간 (예: "2h 30m", "1d 4h")
  completedAt?: string;            // 완료 시각 ISO 문자열 (경과 시간 계산용)
  detail?: string;                 // 상세 설명 (expand 시 표시)
  vessel?: string;                 // 선박명/항공편명
  port?: string;                   // 항구/공항 코드
}

/** 카테고리 그룹 (UI 렌더링용) */
export interface MilestoneCategoryGroup {
  category: MilestoneCategory;
  label: string;
  icon: string;       // lucide-react 아이콘명 참조
  steps: TrackingStep[];
}

/** ShipmentData 확장 */
export interface ShipmentData {
  id: string;
  status: string;
  estimatedDelivery: string;
  origin: GeoLocation;
  destination: GeoLocation;
  current: GeoLocation & { progress: number };
  steps: TrackingStep[];
  // ─── 신규 필드 ───
  mode?: TransportMode;
  totalProgress?: number;           // 0~100 전체 진행률
  categories?: MilestoneCategoryGroup[];
}
```

### 3.2 카테고리 매핑 상수

```typescript
// Tracking.tsx 내 상수

const CATEGORY_CONFIG: Record<MilestoneCategory, {
  label: string;
  labelEn: string;
  color: string;
  darkColor: string;
  icon: LucideIcon;
}> = {
  departure: {
    label: '출발',
    labelEn: 'Departure',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    darkColor: 'dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    icon: Package,        // lucide-react
  },
  transit: {
    label: '운송',
    labelEn: 'Transit',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    darkColor: 'dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    icon: Truck,          // air: Plane 사용
  },
  customs: {
    label: '통관',
    labelEn: 'Customs',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    darkColor: 'dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    icon: FileCheck,
  },
  arrival: {
    label: '도착',
    labelEn: 'Arrival',
    color: 'bg-green-50 text-green-700 border-green-200',
    darkColor: 'dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    icon: MapPin,
  },
};
```

### 3.3 Mock 데이터 팩토리

```typescript
// Tracking.tsx 내 팩토리 함수

function createMockShipment(config: {
  id: string;
  mode: TransportMode;
  status: string;
  estimatedDelivery: string;
  origin: GeoLocation;
  destination: GeoLocation;
  current: GeoLocation & { progress: number };
  steps: TrackingStep[];
}): ShipmentData {
  const completedCount = config.steps.filter(s => s.status === 'completed').length;
  const currentCount = config.steps.filter(s => s.status === 'current').length;
  const total = config.steps.length;
  const totalProgress = Math.round(((completedCount + currentCount * 0.5) / total) * 100);

  const categoryOrder: MilestoneCategory[] = ['departure', 'transit', 'customs', 'arrival'];
  const categories: MilestoneCategoryGroup[] = categoryOrder
    .map(cat => ({
      category: cat,
      label: CATEGORY_CONFIG[cat].label,
      icon: CATEGORY_CONFIG[cat].icon.displayName || cat,
      steps: config.steps.filter(s => s.category === cat),
    }))
    .filter(g => g.steps.length > 0);

  return { ...config, totalProgress, categories };
}
```

---

## 4. Mock 시나리오 (API 없음)

> API 스펙 없음 — Mock 데이터로 시연. `MOCK_SHIPMENTS: Map<string, ShipmentData>` 사용.

### 4.1 항공 운송 시나리오

| ID | Tracking Number | Route | Status |
|----|----------------|-------|--------|
| 1 | `JW-8839-KR` | ICN → LAX | In Transit (기존 확장) |

**마일스톤 (9단계)**:

| # | label | category | status | eta | location |
|---|-------|----------|--------|-----|----------|
| 1 | 화물 접수 (Pickup) | departure | completed | - | Seoul, KR |
| 2 | 출발지 터미널 처리 | departure | completed | - | Incheon Terminal 1 |
| 3 | 수출 통관 (Export Customs) | customs | completed | - | Incheon Customs |
| 4 | 항공기 탑재/출발 | transit | current | 12h 30m | ICN → LAX (KE017) |
| 5 | 도착지 입항 (Arrival) | transit | pending | 2h | Los Angeles Int. Airport |
| 6 | 수입 통관 (Import Customs) | customs | pending | 4h | LAX Customs |
| 7 | 내륙 운송 출발 | arrival | pending | 1h 30m | LAX Cargo Terminal |
| 8 | 배송 완료 (Delivered) | arrival | pending | 3h | Los Angeles, US |

### 4.2 해상 운송 시나리오

| ID | Tracking Number | Route | Status |
|----|----------------|-------|--------|
| 2 | `JW-2201-SEA` | Busan → Rotterdam | In Transit |

**마일스톤 (9단계)**:

| # | label | category | status | eta | location |
|---|-------|----------|--------|-----|----------|
| 1 | 화물 접수 (Pickup) | departure | completed | - | Busan, KR |
| 2 | CFS/CY 입고 | departure | completed | - | Busan New Port |
| 3 | 수출 통관 (Export Customs) | customs | completed | - | Busan Customs |
| 4 | 선적/출항 (Vessel Departure) | transit | completed | - | Busan Port (EVER GIVEN) |
| 5 | 환적 (Transshipment) | transit | current | 2d 8h | Singapore (PSA Terminal) |
| 6 | 도착항 입항 | transit | pending | 18d | Rotterdam, NL |
| 7 | 수입 통관 (Import Customs) | customs | pending | 1d | Rotterdam Customs |
| 8 | 내륙 운송 (Inland Transport) | arrival | pending | 6h | Rotterdam → Amsterdam |
| 9 | 배송 완료 (Delivered) | arrival | pending | 2h | Amsterdam, NL |

**해상 지도 좌표**:
- origin: `{ city: 'Busan, KR', code: 'PUS', x: 82, y: 38 }`
- destination: `{ city: 'Rotterdam, NL', code: 'RTM', x: 35, y: 28 }`
- current: `{ city: 'Singapore', code: 'SIN', x: 74, y: 55, progress: 0.35 }`

---

## 5. UI/UX Design

### 5.1 Timeline Panel 레이아웃

```
┌─────────────────────────────────────────────┐
│  Status Updates                              │
│  Tracking ID: JW-8839-KR  ✈️ Air Freight    │
├─────────────────────────────────────────────┤
│  ┌─── Progress Bar ───────────────────────┐ │
│  │ ████████████████░░░░░░░░  65% Complete │ │
│  │ ETA: Oct 24, 2024                      │ │
│  └────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│                                             │
│  ── 출발 (Departure) ─── [2/2 completed] ── │
│                                             │
│  ✅ 화물 접수 (Pickup)           Oct 21     │
│     Seoul, KR · 14:30            [2일 전]   │
│     ▼ 상세 보기                              │
│     ┌─────────────────────────────────┐     │
│     │ 접수 번호: PKG-2024-1021       │     │
│     │ 화물 종류: 전자부품 (Class A)    │     │
│     └─────────────────────────────────┘     │
│                                             │
│  ✅ 출발지 터미널 처리              Oct 21    │
│     Incheon Terminal 1 · 18:45              │
│                                             │
│  ── 통관 (Customs) ─── [1/1 completed] ──── │
│                                             │
│  ✅ 수출 통관                      Oct 22    │
│     Incheon Customs · 09:15                 │
│                                             │
│  ── 운송 (Transit) ─── [0/2 remaining] ──── │
│                                             │
│  🔵 항공기 탑재/출발 (current)      Oct 22   │
│     ICN → LAX (KE017) · 13:00              │
│     ETA: 12h 30m                            │
│                                             │
│  ⏳ 도착지 입항                   Estimated  │
│     Los Angeles Int. Airport                │
│     ETA: 2h                                 │
│                                             │
│  ── 도착 (Arrival) ─── [0/2 remaining] ──── │
│                                             │
│  ⏳ 내륙 운송 출발               Estimated   │
│  ⏳ 배송 완료                    Estimated   │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.2 컴포넌트 구성

| Component | 위치 | 역할 |
|-----------|------|------|
| `Tracking` | `components/Tracking.tsx` | 메인 컨테이너 (검색, 상태 관리, 레이아웃) |
| `ShipmentMap` | `components/ShipmentMap.tsx` | SVG 지도 (minor: 운송 모드 아이콘 변경) |
| `ProgressHeader` | Tracking.tsx 내 인라인 | 전체 진행률 바 + ETA + 운송 모드 뱃지 |
| `MilestoneGroup` | Tracking.tsx 내 인라인 | 카테고리 헤더 + 완료 카운트 |
| `MilestoneRow` | Tracking.tsx 내 인라인 | 개별 마일스톤 (아이콘 + 내용 + expand) |

> **설계 원칙**: CBM Calculator와 동일하게 서브 컴포넌트를 별도 파일 분리하지 않고 Tracking.tsx 내 인라인으로 구성. 프로젝트 파일 구조 일관성 유지.

### 5.3 User Flow

```
검색 입력 (JW-8839-KR 또는 JW-2201-SEA)
  → 로딩 (1.5s)
  → 결과 표시
    → 지도: 출발지/도착지/현재위치 + 경로
    → Timeline Panel:
      → ProgressHeader: 진행률 바 + ETA + 모드 뱃지(✈️/🚢)
      → MilestoneGroup × N: 카테고리별 그룹
        → MilestoneRow × N: 각 마일스톤
          → 클릭 → expand (detail, vessel, port 표시)
          → 다시 클릭 → collapse
```

### 5.4 반응형 브레이크포인트

| Breakpoint | Layout | 특이사항 |
|------------|--------|----------|
| < 640px (sm) | 단일 컬럼, 지도 위 + 타임라인 아래 | 카테고리 헤더 축소, ETA 줄바꿈 |
| 640-1023px (md) | 단일 컬럼, 여유 패딩 | - |
| ≥ 1024px (lg) | 2:1 그리드 (지도 2/3 + 타임라인 1/3) | 기존 레이아웃 유지 |

---

## 6. 상세 구현 사양

### 6.1 ProgressHeader

```
위치: Timeline Panel 상단 (기존 "Status Updates" 헤더 영역 확장)
```

**구현 요소**:
- 운송 모드 뱃지: `✈️ Air Freight` 또는 `🚢 Sea Freight` (mode에 따라)
- 전체 진행률 바: `totalProgress`% 표시, `motion.div`로 애니메이션
- 진행률 텍스트: `{totalProgress}% Complete`
- ETA 표시: `ETA: {estimatedDelivery}`
- 완료/전체 카운트: `{completedCount}/{totalCount} milestones`

**스타일**:
```
bg-slate-50 dark:bg-slate-950 (기존 패널 배경과 동일)
프로그레스 바: h-2 rounded-full bg-gradient-to-r from-blue-500 to-jways-accent
텍스트: text-sm text-slate-500 dark:text-slate-400
```

### 6.2 MilestoneGroup

**구현 요소**:
- 카테고리 아이콘 + 라벨: `CATEGORY_CONFIG[category].icon` + `label`
- 완료 카운트 뱃지: `{completed}/{total}`
- 구분선: `border-b border-dashed border-slate-200 dark:border-slate-700`
- 카테고리 색상: `CATEGORY_CONFIG[category].color` + `darkColor`

**스타일**:
```
flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wider
카테고리 뱃지: px-2 py-0.5 rounded-full text-[10px] font-bold
```

### 6.3 MilestoneRow

**구현 요소**:
- 타임라인 아이콘: completed(CheckCircle2 blue), current(Truck/Ship amber pulse), pending(Clock gray)
- 라벨 + 날짜: 기존과 동일
- 위치 + 시간: 기존과 동일
- **신규** ETA 뱃지: `eta` 값이 있을 때 `text-[10px] bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded`
- **신규** 경과 시간: `completedAt` → `getRelativeTime()` → "2일 전", "5시간 전"
- **신규** Expand/Collapse:
  - 클릭 트리거: row 전체 또는 `ChevronDown` 버튼
  - `AnimatePresence` + `motion.div` (initial height:0, animate height:auto)
  - 펼침 내용: `detail`, `vessel`, `port`

**Expand 패널 스타일**:
```
ml-12 md:ml-14 mt-1 p-3 rounded-xl
bg-slate-100 dark:bg-slate-800/50
text-xs text-slate-600 dark:text-slate-400
border border-slate-200 dark:border-slate-700
```

### 6.4 경과 시간 헬퍼

```typescript
/** completedAt ISO string → 상대 시간 문자열 */
function getRelativeTime(isoString: string): string {
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}일 전`;
  if (diffHour > 0) return `${diffHour}시간 전`;
  if (diffMin > 0) return `${diffMin}분 전`;
  return '방금 전';
}
```

### 6.5 검색 로직 변경

```typescript
// 기존: 단일 ID 매칭
if (trackingId.toUpperCase() === 'JW-8839-KR') { ... }

// 변경: Map 기반 lookup
const MOCK_SHIPMENTS = new Map<string, ShipmentData>([
  ['JW-8839-KR', createMockShipment({ /* Air 시나리오 */ })],
  ['JW-2201-SEA', createMockShipment({ /* Sea 시나리오 */ })],
]);

const found = MOCK_SHIPMENTS.get(trackingId.toUpperCase());
if (found) {
  setShipment(found);
  setSearchStatus('success');
} else {
  setSearchStatus('error');
  setErrorMessage('운송장 번호를 찾을 수 없습니다. 올바른 번호를 입력해주세요.');
}
```

---

## 7. ShipmentMap 변경 사항

### 7.1 운송 모드 아이콘

```typescript
// ShipmentMap.tsx — Current Location Beacon 아이콘 변경
// 기존: <Truck size={14} />
// 변경: mode에 따라 분기

import { Truck, Ship, Plane } from 'lucide-react';

// props 확장
interface ShipmentMapProps {
  shipment: ShipmentData;
}

// Core Icon 부분
{shipment.mode === 'sea' ? (
  <Ship size={14} className="text-white" />
) : shipment.mode === 'air' ? (
  <Plane size={14} className="text-white" />
) : (
  <Truck size={14} className="text-white" />
)}
```

### 7.2 그 외 변경 없음

- 기존 SVG 경로, 툴팁, 프로그레스 바 로직 유지
- 좌표는 ShipmentData에서 전달받으므로 시나리오별 자동 대응

---

## 8. Accessibility

### 8.1 키보드 탐색

| 요소 | 키보드 액션 | 구현 |
|------|-------------|------|
| MilestoneRow (expand) | `Enter` / `Space` | `onKeyDown` + `role="button"` + `tabIndex={0}` |
| MilestoneGroup | Tab 순서 | 자연 DOM 순서 |
| ProgressHeader | - | `aria-label="전체 진행률"` |
| 운송 모드 뱃지 | - | `aria-label="항공 운송"` 또는 `aria-label="해상 운송"` |

### 8.2 ARIA 속성

```typescript
// MilestoneRow
<div
  role="button"
  tabIndex={0}
  aria-expanded={isExpanded}
  aria-label={`${step.label} - ${step.status === 'completed' ? '완료' : step.status === 'current' ? '진행중' : '대기중'}`}
  onClick={() => toggleExpand(step.id)}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(step.id); } }}
>

// ProgressHeader
<div role="progressbar" aria-valuenow={totalProgress} aria-valuemin={0} aria-valuemax={100} aria-label="전체 운송 진행률">

// MilestoneGroup
<div role="group" aria-label={`${categoryLabel} 마일스톤`}>

// expand 패널
<div role="region" aria-label={`${step.label} 상세 정보`}>
```

### 8.3 스크린 리더

- `aria-live="polite"` on Timeline Panel root (상태 변경 알림)
- 진행률 변경 시 읽어주기: `{totalProgress}% 완료`
- expand/collapse 시 상태 전달: `aria-expanded`

---

## 9. Animation

### 9.1 기존 유지 애니메이션

- 검색 결과 영역 expand: `motion.div` height 0→auto
- 타임라인 step stagger: `delay: idx * 0.1 + 0.5`
- 에러 메시지 slide-in

### 9.2 신규 애니메이션

| 대상 | 애니메이션 | framer-motion 설정 |
|------|-----------|-------------------|
| ProgressHeader 바 | width 0→{progress}% | `initial={{ width: 0 }}, animate={{ width: \`${totalProgress}%\` }}, transition={{ duration: 1, ease: "easeOut" }}` |
| MilestoneGroup 등장 | fade + slide-down | `initial={{ opacity: 0, y: 10 }}, animate={{ opacity: 1, y: 0 }}, transition={{ delay: groupIdx * 0.15 }}` |
| MilestoneRow expand | height 0→auto + fade | `AnimatePresence` + `motion.div` `initial={{ height: 0, opacity: 0 }}, animate={{ height: 'auto', opacity: 1 }}, exit={{ height: 0, opacity: 0 }}` |
| ETA 뱃지 | subtle scale | `whileHover={{ scale: 1.05 }}` |
| 모드 뱃지 | fade-in | `initial={{ opacity: 0 }}, animate={{ opacity: 1 }}` |

---

## 10. Error Handling

### 10.1 검색 에러

| 상태 | 원인 | 처리 |
|------|------|------|
| `error` | trackingId가 MOCK_SHIPMENTS에 없음 | 기존 에러 메시지 표시 (변경 없음) |
| `idle` | 초기 상태 | 검색 폼 표시 |
| `loading` | 검색 중 | 로딩 스피너 (변경 없음) |

### 10.2 데이터 방어

```typescript
// categories가 없는 레거시 데이터 fallback
const groups = shipment.categories || [{
  category: 'transit' as MilestoneCategory,
  label: 'Transit',
  icon: 'Truck',
  steps: shipment.steps,
}];
```

---

## 11. Implementation Guide

### 11.1 파일 구조

```
jways/
├── types.ts                      ← Modify (타입 확장)
├── components/
│   ├── Tracking.tsx              ← Modify (주요 변경)
│   └── ShipmentMap.tsx           ← Minor modify (mode 아이콘)
```

### 11.2 Implementation Order

1. [ ] **types.ts**: `MilestoneCategory`, `TransportMode` 타입 추가, `TrackingStep` 확장, `ShipmentData` 확장
2. [ ] **Tracking.tsx**: `CATEGORY_CONFIG` 상수 정의
3. [ ] **Tracking.tsx**: `getRelativeTime()` 헬퍼 함수 추가
4. [ ] **Tracking.tsx**: `createMockShipment()` 팩토리 함수 추가
5. [ ] **Tracking.tsx**: Air Mock 데이터 (`JW-8839-KR`) 확장 — 카테고리, ETA, detail 포함
6. [ ] **Tracking.tsx**: Sea Mock 데이터 (`JW-2201-SEA`) 신규 추가
7. [ ] **Tracking.tsx**: `MOCK_SHIPMENTS` Map + `handleSearch` 변경
8. [ ] **Tracking.tsx**: `ProgressHeader` 인라인 구현 (진행률 바 + 모드 뱃지)
9. [ ] **Tracking.tsx**: `MilestoneGroup` 인라인 구현 (카테고리 헤더 + 카운트)
10. [ ] **Tracking.tsx**: `MilestoneRow` 인라인 구현 (ETA 뱃지, 경과 시간, expand/collapse)
11. [ ] **Tracking.tsx**: expand 상태 관리 (`expandedIds: Set<string>`)
12. [ ] **Tracking.tsx**: 접근성 적용 (aria, role, keyboard)
13. [ ] **ShipmentMap.tsx**: mode 기반 아이콘 분기 (Ship/Plane/Truck)
14. [ ] `tsc --noEmit` 빌드 검증
15. [ ] `npm run build` 프로덕션 빌드 검증

### 11.3 lucide-react 추가 아이콘

```typescript
// 신규 import 필요
import {
  // 기존
  Search, MapPin, Package, ArrowRight, Truck, CheckCircle2, Clock, X, Loader2,
  // 신규
  Plane, Ship, FileCheck, ChevronDown, Anchor, Timer
} from 'lucide-react';
```

---

## 12. Test Plan

### 12.1 수동 검증 체크리스트

- [ ] `JW-8839-KR` 검색 → Air 시나리오 정상 표시
- [ ] `JW-2201-SEA` 검색 → Sea 시나리오 정상 표시
- [ ] 잘못된 ID 검색 → 에러 메시지 표시
- [ ] 카테고리 그룹핑 정상 (출발/운송/통관/도착)
- [ ] 각 그룹 완료 카운트 정확
- [ ] ETA 뱃지 표시 (pending/current 단계)
- [ ] 경과 시간 표시 (completed 단계)
- [ ] MilestoneRow 클릭 → expand/collapse
- [ ] 키보드 Enter/Space → expand/collapse
- [ ] ProgressHeader 진행률 바 애니메이션
- [ ] 운송 모드 뱃지 (Air ✈️ / Sea 🚢)
- [ ] 지도 아이콘 변경 (Air→Plane, Sea→Ship)
- [ ] 다크 모드 전체 정상
- [ ] 모바일 (320px) 반응형 정상
- [ ] 태블릿 (768px) 반응형 정상
- [ ] 데스크톱 (1440px) 반응형 정상
- [ ] `tsc --noEmit` 에러 0
- [ ] `npm run build` 성공

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-22 | Initial design draft |
