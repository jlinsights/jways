# Advanced Tracking & Tracing Design Document

> **Summary**: 화물 추적 시스템 고도화 — ETA 카드, 이벤트 타임라인, 다중 비교, 관련 문서, 지도 경유지, 대시보드
>
> **Project**: Jways Logistics
> **Version**: 1.0.0
> **Author**: Claude Code (PDCA Cycle #7)
> **Date**: 2026-02-23
> **Status**: Draft
> **Planning Doc**: [advanced-tracking-tracing.plan.md](../01-plan/features/advanced-tracking-tracing.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | N/A |
| Phase 2 | Coding Conventions | N/A |
| Phase 3 | Mockup | N/A |
| Phase 4 | API Spec | N/A |

> Starter 레벨 SPA — Pipeline 미적용

---

## 1. Overview

### 1.1 Design Goals

1. **컴포넌트 분리**: Tracking.tsx(598줄)의 책임을 5개 서브컴포넌트로 분리하여 유지보수성 향상
2. **시각적 고도화**: ETA 원형 차트, 세로 타임라인, 대시보드 요약으로 정보 가시성 강화
3. **비파괴적 확장**: 기존 types.ts, Tracking.tsx, ShipmentMap.tsx의 인터페이스를 깨지 않고 확장
4. **접근성 우선**: 모든 신규 컴포넌트에 WCAG 2.1 AA 기준 ARIA 속성 적용

### 1.2 Design Principles

- **Single Responsibility**: 각 서브컴포넌트는 하나의 역할만 담당
- **Progressive Enhancement**: 기존 추적 기능은 그대로 유지하면서 새 기능을 레이어로 추가
- **Consistent Patterns**: 기존 framer-motion, Tailwind CDN, lucide-react 패턴 일관 유지

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Tracking.tsx (Container - 기존 + 탭/뷰 전환 로직 추가)           │
├─────────────┬───────────────────────────────────────────────────┤
│             │  ┌─ TrackingDashboard.tsx (FR-06)                 │
│             │  │   - 전체 진행률 원형 차트                        │
│             │  │   - 현재 단계 요약                              │
│             │  │   - 지연 경고 배너                              │
│ ShipmentMap │  ├─ ETACard.tsx (FR-01)                           │
│  .tsx       │  │   - 예상 도착일                                 │
│ (기존 +     │  │   - D-day 카운트다운                            │
│  경유지     │  │   - 신뢰도 뱃지                                 │
│  FR-05)     │  ├─ EventTimeline.tsx (FR-03)                     │
│             │  │   - 세로 타임라인 UI                            │
│             │  │   - 시간 간격 시각화                            │
│             │  │   - 현재 단계 하이라이트                         │
│             │  ├─ ShipmentDocuments.tsx (FR-04)                  │
│             │  │   - 문서 타입 아이콘                             │
│             │  │   - 상태 뱃지 (발행/미발행)                      │
│             │  ├─ CargoDetailPanel (FR-08, Tracking.tsx 내 인라인)│
│             │  │   - 중량/CBM/컨테이너 타입                       │
│             │  └─ ShipmentCompare.tsx (FR-02)                    │
│             │      - 최대 3건 병렬 비교                           │
│             │      - 탭 전환 (단일/비교 모드)                     │
└─────────────┴───────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User 검색 → Mock 데이터 조회 → ShipmentData (확장) 반환
  ├→ TrackingDashboard: totalProgress, currentStep, delayWarning 렌더
  ├→ ETACard: eta.estimatedArrival, eta.confidence, 카운트다운 계산
  ├→ ShipmentMap: origin, destination, current, waypoints[] 렌더
  ├→ EventTimeline: steps[] → 세로 타임라인 렌더
  ├→ ShipmentDocuments: documents[] → 문서 목록 렌더
  └→ CargoDetailPanel: cargoDetails → 화물 상세 렌더

User 비교 모드 → 최대 3건 선택
  └→ ShipmentCompare: selectedShipments[] → 병렬 타임라인 렌더
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| TrackingDashboard | ShipmentData | 진행률/상태 요약 데이터 |
| ETACard | ShipmentData.eta | ETA 정보 렌더링 |
| EventTimeline | TrackingStep[] | 타임라인 데이터 |
| ShipmentDocuments | ShipmentDocument[] | 문서 목록 데이터 |
| ShipmentCompare | ShipmentData[] | 다중 화물 비교 |
| ShipmentMap | ShipmentData, Waypoint[] | 지도 + 경유지 |
| CargoDetailPanel | CargoDetails | 화물 상세 |

---

## 3. Data Model

### 3.1 신규 타입 정의 (types.ts 확장)

```typescript
// ─── Advanced Tracking Types ───

export interface ETAInfo {
  estimatedArrival: string;       // ISO date string (e.g., "2024-11-28T00:00:00Z")
  confidence: 'high' | 'medium' | 'low';
  delayDays?: number;             // 지연일수 (양수: 지연, 0: 정상)
  lastUpdated: string;            // ISO date string
}

export interface ShipmentDocument {
  id: string;
  type: 'bl' | 'invoice' | 'packing-list' | 'certificate';
  name: string;
  status: 'issued' | 'pending' | 'draft';
  date?: string;                  // 발행일
  fileSize?: string;              // e.g., "2.4 MB"
}

export interface Waypoint {
  name: string;
  code: string;
  location: GeoLocation;
  arrivalDate?: string;
  departureDate?: string;
  type: 'port' | 'airport' | 'terminal';
}

export interface CargoDetails {
  weight: string;                 // e.g., "1,250 kg"
  cbm: string;                   // e.g., "3.2 CBM"
  containerType?: string;        // e.g., "20ft FCL"
  packages: number;
  hsCode?: string;
}
```

### 3.2 ShipmentData 확장 (비파괴적)

```typescript
export interface ShipmentData {
  // ── 기존 필드 (변경 없음) ──
  id: string;
  status: string;
  estimatedDelivery: string;
  origin: GeoLocation;
  destination: GeoLocation;
  current: GeoLocation & { progress: number };
  steps: TrackingStep[];
  mode?: TransportMode;
  totalProgress?: number;
  categories?: MilestoneCategoryGroup[];

  // ── 신규 필드 (모두 optional) ──
  eta?: ETAInfo;
  documents?: ShipmentDocument[];
  waypoints?: Waypoint[];
  cargoDetails?: CargoDetails;
}
```

### 3.3 Mock 데이터 확장

JW-8839-KR (항공) 추가 필드:
```typescript
eta: {
  estimatedArrival: '2024-10-24T18:00:00Z',
  confidence: 'high',
  delayDays: 0,
  lastUpdated: '2024-10-22T13:00:00Z',
},
documents: [
  { id: 'd1', type: 'bl', name: 'Air Waybill (AWB)', status: 'issued', date: '2024-10-21', fileSize: '1.2 MB' },
  { id: 'd2', type: 'invoice', name: 'Commercial Invoice', status: 'issued', date: '2024-10-21', fileSize: '0.8 MB' },
  { id: 'd3', type: 'packing-list', name: 'Packing List', status: 'issued', date: '2024-10-21', fileSize: '0.5 MB' },
  { id: 'd4', type: 'certificate', name: 'Certificate of Origin', status: 'pending' },
],
waypoints: [
  { name: 'Anchorage', code: 'ANC', location: { city: 'Anchorage, US', code: 'ANC', x: 12, y: 22 }, type: 'airport', arrivalDate: '2024-10-22T19:00:00Z', departureDate: '2024-10-22T20:30:00Z' },
],
cargoDetails: {
  weight: '450 kg',
  cbm: '1.8 CBM',
  packages: 12,
  hsCode: '8542.31',
},
```

JW-2201-SEA (해상) 추가 필드:
```typescript
eta: {
  estimatedArrival: '2024-11-28T00:00:00Z',
  confidence: 'medium',
  delayDays: 2,
  lastUpdated: '2024-11-05T08:00:00Z',
},
documents: [
  { id: 'd5', type: 'bl', name: 'Bill of Lading (B/L)', status: 'issued', date: '2024-10-30', fileSize: '1.5 MB' },
  { id: 'd6', type: 'invoice', name: 'Commercial Invoice', status: 'issued', date: '2024-10-28', fileSize: '0.9 MB' },
  { id: 'd7', type: 'packing-list', name: 'Packing List', status: 'issued', date: '2024-10-28', fileSize: '0.6 MB' },
  { id: 'd8', type: 'certificate', name: 'Insurance Certificate', status: 'draft' },
],
waypoints: [
  { name: 'Singapore', code: 'SIN', location: { city: 'Singapore', code: 'SIN', x: 74, y: 55 }, type: 'port', arrivalDate: '2024-11-05T08:00:00Z', departureDate: '2024-11-07T06:00:00Z' },
  { name: 'Colombo', code: 'CMB', location: { city: 'Colombo, LK', code: 'CMB', x: 64, y: 52 }, type: 'port', arrivalDate: '2024-11-12T00:00:00Z', departureDate: '2024-11-13T00:00:00Z' },
  { name: 'Suez Canal', code: 'SUZ', location: { city: 'Suez, EG', code: 'SUZ', x: 44, y: 40 }, type: 'terminal', arrivalDate: '2024-11-18T00:00:00Z' },
],
cargoDetails: {
  weight: '8,500 kg',
  cbm: '33.2 CBM',
  containerType: '20ft FCL',
  packages: 240,
  hsCode: '8471.30',
},
```

---

## 4. API Specification

> N/A — Mock 데이터 기반 SPA. API 연동은 향후 별도 PDCA Cycle로 진행.

---

## 5. UI/UX Design

### 5.1 전체 레이아웃 (검색 결과 화면)

```
┌────────────────────────────────────────────────────────────┐
│ [Search Bar + Search Type Select]  [Live Tracking] [비교]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─ TrackingDashboard (FR-06) ───────────────────────────┐ │
│  │  [진행률 원형차트]  [현재단계]  [ETA요약]  [지연경고?] │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─ Map (2/3) ──────────┐  ┌─ Right Panel (1/3) ────────┐ │
│  │                       │  │  ┌ ETACard (FR-01) ───────┐│ │
│  │  ShipmentMap          │  │  │ D-Day | 도착일 | 신뢰도 ││ │
│  │  + Waypoints (FR-05)  │  │  └────────────────────────┘│ │
│  │  + 경유지 마커         │  │                            │ │
│  │                       │  │  ┌ EventTimeline (FR-03) ─┐│ │
│  │                       │  │  │ ● 출발 ──── 2h ago     ││ │
│  │                       │  │  │ │                       ││ │
│  │                       │  │  │ ● 운송 ──── current     ││ │
│  │                       │  │  │ │                       ││ │
│  │                       │  │  │ ○ 통관 ──── pending     ││ │
│  │                       │  │  │ │                       ││ │
│  │                       │  │  │ ○ 도착 ──── pending     ││ │
│  │                       │  │  └────────────────────────┘│ │
│  └───────────────────────┘  └────────────────────────────┘ │
│                                                            │
│  ┌─ Bottom Panels (탭 전환) ─────────────────────────────┐ │
│  │  [문서] [화물상세] 탭                                  │ │
│  │  ┌ ShipmentDocuments (FR-04) / CargoDetail (FR-08) ──┐│ │
│  │  │ B/L ✅ | Invoice ✅ | Packing List ✅ | CoO ⏳     ││ │
│  │  └───────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 5.2 비교 모드 레이아웃 (ShipmentCompare, FR-02)

```
┌────────────────────────────────────────────────────────────┐
│ [비교 모드]  선택: JW-8839-KR ✕ | JW-2201-SEA ✕ | + 추가  │
├──────────────────────┬─────────────────────────────────────┤
│  JW-8839-KR (Air)   │  JW-2201-SEA (Sea)                  │
│  ─────────────────   │  ─────────────────                  │
│  ETA: Oct 24         │  ETA: Nov 28 (+2d 지연)             │
│  진행률: 55%         │  진행률: 35%                        │
│  ● 출발 완료         │  ● 출발 완료                        │
│  ● 운송 진행중       │  ● 운송 진행중                      │
│  ○ 통관 대기         │  ○ 통관 대기                        │
│  ○ 도착 대기         │  ○ 도착 대기                        │
└──────────────────────┴─────────────────────────────────────┘
```

### 5.3 Component Specifications

#### 5.3.1 TrackingDashboard (FR-06)

**위치**: 검색 결과 상단, 검색 바 바로 아래
**Props**:
```typescript
interface TrackingDashboardProps {
  shipment: ShipmentData;
}
```

**UI 요소**:
| 요소 | 설명 | 스타일 |
|------|------|--------|
| 진행률 원형 차트 | SVG `<circle>` stroke-dasharray 기반, 중앙에 %값 | 60x60px, stroke-width 4 |
| 현재 단계 텍스트 | 현재 'current' 상태인 step.label 표시 | font-bold, text-jways-blue |
| ETA 요약 | 예상 도착일 한줄 표시 | text-sm, text-slate-500 |
| 지연 경고 배너 | eta.delayDays > 0일 때만 노출 | bg-amber-50, border-amber-200, 아이콘 AlertTriangle |

**접근성**:
- 원형 차트: `role="img"` + `aria-label="전체 진행률 {n}%"`
- 지연 경고: `role="alert"` + `aria-live="polite"`

**애니메이션**:
- 원형 차트 stroke: `motion` transition duration 1s easeOut
- 지연 배너 입장: `motion.div` initial opacity 0, height 0

---

#### 5.3.2 ETACard (FR-01)

**위치**: 우측 패널 상단 (기존 ProgressHeader 영역 교체)
**Props**:
```typescript
interface ETACardProps {
  eta: ETAInfo;
  estimatedDelivery: string;
  mode?: TransportMode;
}
```

**UI 요소**:
| 요소 | 설명 | 스타일 |
|------|------|--------|
| D-day 카운트다운 | `D-{n}` 또는 `D+{n}` 형식 | text-2xl font-bold |
| 예상 도착일 | 날짜 포맷 (YYYY.MM.DD) | text-sm text-slate-600 |
| 신뢰도 뱃지 | high=초록, medium=주황, low=빨강 | rounded-full px-2 py-0.5 text-xs |
| 마지막 업데이트 | "n분/시간 전 업데이트" | text-xs text-slate-400 |

**접근성**:
- 전체 카드: `aria-label="예상 도착 정보"`
- 카운트다운: `aria-live="polite"` (실시간 갱신은 없지만 semantic)
- 신뢰도 뱃지: `aria-label="예측 신뢰도: {level}"`

**애니메이션**:
- D-day 숫자: spring 애니메이션으로 카운트 효과
- 카드 입장: fadeInUp (opacity 0→1, y 10→0)

---

#### 5.3.3 EventTimeline (FR-03)

**위치**: 우측 패널, ETACard 아래 (기존 MilestoneRow 대체)
**Props**:
```typescript
interface EventTimelineProps {
  categories: MilestoneCategoryGroup[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  mode?: TransportMode;
}
```

**UI 요소**:
| 요소 | 설명 | 스타일 |
|------|------|--------|
| 타임라인 라인 | 세로 연결선 (기존 유지) | absolute, w-0.5, bg-slate-200 |
| 시간 간격 표시 | 두 이벤트 사이 경과 시간 | text-[10px] text-slate-400, 라인 중간 |
| 카테고리 헤더 | 기존 CATEGORY_CONFIG 재사용 | 동일 스타일 유지 |
| MilestoneRow | 기존 컴포넌트 재사용 (import) | 변경 없음 |

**시간 간격 계산 로직**:
```typescript
function getTimeBetween(step1: TrackingStep, step2: TrackingStep): string | null {
  if (!step1.completedAt || !step2.completedAt) return null;
  const diff = new Date(step2.completedAt).getTime() - new Date(step1.completedAt).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
```

**접근성**:
- 타임라인 전체: `role="list"` + `aria-label="운송 이벤트 타임라인"`
- 각 이벤트: `role="listitem"`
- 시간 간격: `aria-hidden="true"` (시각적 보조 정보)
- 카테고리 헤더: `role="heading" aria-level={4}`

**애니메이션**:
- 기존 MilestoneRow 애니메이션 유지 (stagger delay)
- 시간 간격 라벨: fadeIn delay

---

#### 5.3.4 ShipmentDocuments (FR-04)

**위치**: 하단 탭 패널 (문서 탭)
**Props**:
```typescript
interface ShipmentDocumentsProps {
  documents: ShipmentDocument[];
}
```

**UI 요소**:
| 요소 | 설명 | 스타일 |
|------|------|--------|
| 문서 카드 | 가로 카드 레이아웃 (아이콘 + 이름 + 상태) | grid grid-cols-2, gap-3 |
| 타입 아이콘 | bl=FileText, invoice=Receipt, packing-list=ClipboardList, certificate=Award | lucide-react, 24px |
| 상태 뱃지 | issued=초록, pending=주황, draft=회색 | rounded-full text-xs |
| 발행일 | 날짜 표시 | text-xs text-slate-400 |
| 파일 크기 | fileSize 표시 | text-xs text-slate-400 |

**접근성**:
- 문서 목록: `role="list"` + `aria-label="관련 문서 목록"`
- 각 문서: `role="listitem"`
- 상태 뱃지: `aria-label="{문서명} - {상태}"`
- 아이콘: `aria-hidden="true"`

**애니메이션**:
- 카드 입장: stagger fadeInUp (delay 0.05 * index)

---

#### 5.3.5 ShipmentMap 경유지 확장 (FR-05)

**기존 ShipmentMap.tsx 수정** — 새 파일 없음
**추가 Props**:
```typescript
interface ShipmentMapProps {
  shipment: ShipmentData;  // 기존 — waypoints는 ShipmentData 내 optional
}
```

**추가 UI 요소**:
| 요소 | 설명 | 스타일 |
|------|------|--------|
| 경유지 마커 | waypoints[]에 대한 작은 다이아몬드 마커 | w-2.5 h-2.5, rotate-45, bg-sky-400 |
| 경유지 툴팁 | hover/click 시 이름+코드+일정 표시 | 기존 tooltip 스타일 재사용 |
| 경로 세그먼트 | 경유지를 잇는 다중 SVG path 세그먼트 | strokeDasharray, 세그먼트별 색상 |

**접근성**:
- 경유지 마커: `aria-label="{name} 경유지"`
- 경유지 툴팁: 기존 tooltip 패턴 유지

**애니메이션**:
- 경유지 마커: stagger scale 0→1 (delay 기반)
- 경유지 간 경로: pathLength 0→1 순차 애니메이션

---

#### 5.3.6 ShipmentCompare (FR-02)

**위치**: 비교 모드 전체 화면 교체
**Props**:
```typescript
interface ShipmentCompareProps {
  shipments: ShipmentData[];
  onRemove: (id: string) => void;
  onClose: () => void;
}
```

**상태 관리 (Tracking.tsx에서)**:
```typescript
const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');
const [compareIds, setCompareIds] = useState<string[]>([]);
```

**UI 요소**:
| 요소 | 설명 | 스타일 |
|------|------|--------|
| 상단 바 | 선택된 화물 칩 + 추가 버튼 | flex gap-2, 칩: rounded-full |
| 비교 그리드 | 2~3 컬럼 병렬 레이아웃 | grid grid-cols-2 lg:grid-cols-3 |
| 요약 카드 | 각 화물의 ETA/진행률/현재 단계 | 컬럼 내 상단 |
| 카테고리 비교 | 카테고리별 마일스톤 수평 정렬 | 동일 카테고리 row 맞춤 |

**접근성**:
- 비교 영역: `role="region"` + `aria-label="화물 비교"`
- 각 컬럼: `aria-label="{shipmentId} 추적 정보"`
- 제거 버튼: `aria-label="{shipmentId} 비교에서 제거"`

**애니메이션**:
- 컬럼 입장: AnimatePresence + layoutId for smooth transitions
- 칩 추가/제거: scale spring animation

---

#### 5.3.7 CargoDetailPanel (FR-08)

**위치**: 하단 탭 패널 (화물상세 탭) — Tracking.tsx 내 인라인 구현
**데이터**: `shipment.cargoDetails`

**UI 요소**:
| 요소 | 설명 | 스타일 |
|------|------|--------|
| 중량 | weight 값 + Scale 아이콘 | flex items-center gap-2 |
| 부피 | cbm 값 + Box 아이콘 | flex items-center gap-2 |
| 컨테이너 타입 | containerType (해상만) | text-sm, badge 스타일 |
| 포장 수 | packages 값 + Package 아이콘 | flex items-center gap-2 |
| HS Code | hsCode (있으면) | font-mono text-xs |

**접근성**:
- 패널: `aria-label="화물 상세 정보"`
- 각 항목: 아이콘 `aria-hidden="true"`, 텍스트로 의미 전달

---

#### 5.3.8 운송 모드 아이콘/색상 (FR-07)

**수정 위치**: Tracking.tsx의 기존 모드 뱃지 + 각 서브컴포넌트

| 모드 | 아이콘 | 색상 | 뱃지 텍스트 |
|------|--------|------|------------|
| air | `Plane` | sky-50/sky-700, dark:sky-900/sky-300 | Air Freight |
| sea | `Ship` | teal-50/teal-700, dark:teal-900/teal-300 | Sea Freight |

> 기존 스타일과 동일. TransportMode에 'multimodal' 추가는 Out of Scope (Plan 2.2 참조).

---

### 5.4 User Flow

```
1. 검색 → 결과 표시 (기존 동일)
2. Dashboard 요약 확인 → 지연 경고 있으면 배너 표시
3. ETACard에서 도착 예정일 확인
4. EventTimeline에서 세부 이벤트 확인 (아코디언 펼치기)
5. 지도에서 경유지 포함 경로 시각 확인
6. 하단 탭에서 문서/화물상세 전환 확인
7. (Optional) 비교 버튼 → 추가 화물 선택 → 병렬 비교
```

---

## 6. Error Handling

### 6.1 에러 시나리오

| 시나리오 | 처리 | UI 표시 |
|---------|------|---------|
| ETA 데이터 없음 (eta === undefined) | 기존 estimatedDelivery 폴백 | ETACard 대신 기존 ETA 텍스트 표시 |
| 문서 데이터 없음 (documents === undefined) | 문서 탭 비활성화 | "등록된 문서가 없습니다" 메시지 |
| 경유지 데이터 없음 (waypoints === undefined) | 기존 직선 경로 | 변경 없음 (기존 동작) |
| 화물 상세 없음 (cargoDetails === undefined) | 화물상세 탭 비활성화 | "화물 상세 정보가 없습니다" 메시지 |
| 비교 모드 데이터 1건 미만 | 비교 버튼 비활성화 | disabled 상태 + 툴팁 안내 |

### 6.2 폴백 전략

모든 신규 필드는 `optional`이므로, 해당 데이터가 없으면 기존 UI 그대로 렌더링. 새 기능은 데이터가 있을 때만 점진적으로 노출.

---

## 7. Security Considerations

- [x] Input validation — 기존 검색 입력 검증 유지
- [ ] Authentication — N/A (공개 마케팅 사이트)
- [ ] Sensitive data — Mock 데이터만 사용, 실제 화물 정보 없음
- [x] XSS prevention — React JSX 자동 이스케이프, dangerouslySetInnerHTML 미사용

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| Build Test | Vite build 성공 | `npm run build` |
| Visual Test | 반응형 레이아웃 | 브라우저 수동 확인 |
| A11y Test | WCAG 2.1 AA | axe DevTools / 수동 검증 |

> 프로젝트에 테스트 러너 미설정 (CLAUDE.md 참조). 빌드 테스트 + 수동 검증.

### 8.2 Test Cases (Key)

- [ ] JW-8839-KR 검색 → Dashboard + ETACard + EventTimeline + Documents + Map(경유지 1개) 정상 렌더
- [ ] JW-2201-SEA 검색 → 지연 경고 배너 노출 (delayDays: 2)
- [ ] ETA 없는 화물 → ETACard 폴백 (기존 estimatedDelivery 텍스트)
- [ ] 비교 모드 진입 → 2건 선택 → 병렬 타임라인 정상 렌더
- [ ] 모바일(320px) → 비교 모드 1컬럼 스택, 탭 패널 정상 동작
- [ ] 키보드 탐색 → Tab으로 모든 인터랙티브 요소 접근 가능
- [ ] 스크린 리더 → 모든 aria-label 정상 읽힘

---

## 9. Clean Architecture

### 9.1 Layer Structure (Starter Level)

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI 컴포넌트, 이벤트 핸들링 | `components/` |
| **Domain** | 타입 정의, 비즈니스 규칙 | `types.ts` |

> Starter 레벨 — Application/Infrastructure 레이어 불필요 (Mock 데이터 인라인)

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| TrackingDashboard | Presentation | `components/TrackingDashboard.tsx` |
| ETACard | Presentation | `components/ETACard.tsx` |
| EventTimeline | Presentation | `components/EventTimeline.tsx` |
| ShipmentDocuments | Presentation | `components/ShipmentDocuments.tsx` |
| ShipmentCompare | Presentation | `components/ShipmentCompare.tsx` |
| ShipmentMap | Presentation | `components/ShipmentMap.tsx` (기존 수정) |
| Tracking | Presentation | `components/Tracking.tsx` (기존 수정) |
| ETAInfo, ShipmentDocument, Waypoint, CargoDetails | Domain | `types.ts` (확장) |

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| Components | PascalCase | `ETACard`, `EventTimeline` |
| Props interfaces | PascalCase + Props suffix | `ETACardProps`, `EventTimelineProps` |
| Helper functions | camelCase | `getTimeBetween()`, `getDDayString()` |
| Constants | UPPER_SNAKE_CASE | `CATEGORY_CONFIG`, `MOCK_SHIPMENTS` |
| Files (component) | PascalCase.tsx | `ETACard.tsx`, `ShipmentCompare.tsx` |

### 10.2 Import Order

```typescript
// 1. React
import React, { useState } from 'react';
// 2. External libraries
import { motion, AnimatePresence } from 'framer-motion';
// 3. lucide-react icons
import { Clock, FileText, Package } from 'lucide-react';
// 4. Internal types
import { ShipmentData, ETAInfo } from '../types';
// 5. Internal components
import ETACard from './ETACard';
```

### 10.3 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase, 역할 명시 (ETACard, EventTimeline) |
| File organization | components/ 플랫 구조 (기존 패턴 유지) |
| State management | useState in Tracking.tsx (container), props drilling |
| Error handling | Optional chaining + 폴백 UI |
| Animation | framer-motion (motion.div, AnimatePresence) |
| Styling | Tailwind CSS CDN classes (인라인) |
| Icons | lucide-react, decorative icons에 aria-hidden="true" |

---

## 11. Implementation Guide

### 11.1 File Structure

```
components/
├── Tracking.tsx              # 수정 — 탭/뷰 전환, compareIds 상태, 서브컴포넌트 통합
├── ShipmentMap.tsx           # 수정 — 경유지 마커 + 다중 세그먼트 경로
├── TrackingDashboard.tsx     # 신규 — 요약 대시보드
├── ETACard.tsx               # 신규 — ETA 예측 카드
├── EventTimeline.tsx         # 신규 — 세로 타임라인
├── ShipmentDocuments.tsx     # 신규 — 관련 문서
└── ShipmentCompare.tsx       # 신규 — 다중 비교 뷰

types.ts                      # 수정 — ETAInfo, ShipmentDocument, Waypoint, CargoDetails 추가
```

### 11.2 Implementation Order

1. [ ] **types.ts 확장** — ETAInfo, ShipmentDocument, Waypoint, CargoDetails 인터페이스 추가 + ShipmentData 확장
2. [ ] **Tracking.tsx Mock 데이터 확장** — 기존 2건에 eta, documents, waypoints, cargoDetails 필드 추가
3. [ ] **TrackingDashboard.tsx** (FR-06) — 진행률 원형차트, 현재 단계, 지연 경고
4. [ ] **ETACard.tsx** (FR-01) — D-day 카운트다운, 예상 도착일, 신뢰도 뱃지
5. [ ] **EventTimeline.tsx** (FR-03) — 세로 타임라인, 시간 간격, MilestoneRow 재사용
6. [ ] **ShipmentDocuments.tsx** (FR-04) — 문서 카드, 상태 뱃지
7. [ ] **ShipmentMap.tsx 수정** (FR-05) — 경유지 마커 + 다중 경로 세그먼트
8. [ ] **Tracking.tsx 통합** — 서브컴포넌트 배치, 탭 패널, 뷰 모드 전환
9. [ ] **ShipmentCompare.tsx** (FR-02) — 다중 비교 뷰, 화물 선택 UI
10. [ ] **CargoDetailPanel 인라인** (FR-08) — 하단 탭 화물상세
11. [ ] **운송 모드 아이콘/색상 정리** (FR-07) — 기존 패턴 확인 + 일관성 보장
12. [ ] **접근성 전수 검증** — 모든 컴포넌트 ARIA, keyboard nav, screen reader

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-23 | Initial draft | Claude Code |
