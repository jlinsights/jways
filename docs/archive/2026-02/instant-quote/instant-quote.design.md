# Instant Quote Enhancement Design Document

> **Summary**: 빠른 운임 조회 페이지 고도화 — Tariff Engine, 해상/항공 비교, 견적 이력, QuoteModal 연결
>
> **Project**: Jways Logistics
> **Version**: 1.0.0
> **Author**: Claude Code (PDCA Cycle #10)
> **Date**: 2026-02-24
> **Status**: Draft
> **Planning Doc**: [instant-quote.plan.md](../../01-plan/features/instant-quote.plan.md)

### Pipeline References

> Dynamic 레벨 SPA (Mock Backend) — Pipeline 미적용

---

## 1. Overview

### 1.1 Design Goals

1. **고급 Tariff Engine**: 구간별 차등 요금, Incoterms, 컨테이너 타입 반영
2. **해상/항공 비교**: Side-by-side 동시 비교 뷰 with 추천 뱃지
3. **견적 이력**: localStorage 기반 최근 조회 10건 저장/복원
4. **QuoteModal 연결**: 결과에서 "정식 견적 의뢰" → 데이터 프리필
5. **접근성 완성**: WCAG 2.1 AA 준수, 키보드 네비게이션, ARIA
6. **비파괴적 확장**: 기존 QuoteModal, LandingPage, Header 유지

### 1.2 Design Principles

- **API-Ready**: `lib/tariff.ts`를 통해 모든 요금 계산 → 향후 실제 API 교체 시 함수 내부만 변경
- **Single File Focus**: `pages/InstantQuote.tsx`를 주요 변경 대상으로, 서브 컴포넌트는 인라인 정의
- **Progressive Enhancement**: 기존 2-step 패턴을 3-step (입력 → 비교 → 상세)으로 확장
- **Consistent Patterns**: 기존 프로젝트 Tailwind CDN, lucide-react, framer-motion 유지

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ App.tsx                                                         │
│  ├── /instant-quote → <InstantQuote />                         │
│  │     ├── PortSearchInput (자동완성 포트 검색)                  │
│  │     ├── ComparisonView (해상/항공 비교)                       │
│  │     ├── CostBreakdown (비용 상세 내역)                        │
│  │     ├── QuoteHistory (견적 이력 사이드)                       │
│  │     └── QuoteModal (기존 컴포넌트 재사용)                     │
│  ├── Header.tsx → "빠른 견적" 링크 추가                          │
│  └── LandingPage.tsx → Hero CTA 연결                            │
│                                                                  │
│ lib/tariff.ts (NEW)                                              │
│  ├── ROUTE_TARIFFS: 10개 주요 항로 요금 데이터                    │
│  ├── MAJOR_PORTS: 20개 주요 항구/공항 목록                       │
│  ├── calculateQuote(): 견적 산출 메인 함수                       │
│  ├── getRouteMatch(): 항로 매칭                                  │
│  └── formatCurrency(): 통화 포맷팅                               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User Input (origin, destination, weight, cbm, mode, incoterms, container)
  │
  ▼
lib/tariff.ts → calculateQuote()
  │  ├── getRouteMatch(origin, destination)
  │  ├── seaQuote = calculateSeaFreight(route, weight, cbm, container, incoterms)
  │  └── airQuote = calculateAirFreight(route, weight, cbm, incoterms)
  │
  ▼
QuoteResult { sea: TariffResult, air: TariffResult }
  │
  ▼
ComparisonView → CostBreakdown → "정식 견적 의뢰" → QuoteModal (prefill)
  │
  ▼
localStorage → quoteHistory[] (최근 10건)
```

---

## 3. Type Definitions

### 3.1 New Types (`types.ts`에 추가)

```typescript
// ─── Instant Quote Types ───

export type Incoterms = 'FOB' | 'CIF' | 'DDP' | 'EXW';
export type ContainerType = '20ft' | '40ft' | '40ft-hc';

export interface PortInfo {
  code: string;       // e.g., "KRPUS"
  name: string;       // e.g., "부산항"
  nameEn: string;     // e.g., "Busan Port"
  country: string;    // e.g., "KR"
  type: 'sea' | 'air' | 'both';
}

export interface TariffBreakdown {
  baseFreight: number;     // 기본운임
  baf: number;             // BAF/FSC (유류할증)
  thc: number;             // 터미널 비용
  docFee: number;          // 서류비
  insurance?: number;      // 보험료 (CIF, DDP)
  customs?: number;        // 관세 (DDP only)
  inland?: number;         // 내륙운송 (DDP only)
}

export interface TariffResult {
  mode: 'sea' | 'air';
  totalPrice: number;
  currency: string;        // "USD"
  breakdown: TariffBreakdown;
  transitDays: string;     // "25-30"
  co2Kg: number;
  containerType?: ContainerType;
  chargeableWeight?: number;
}

export interface QuoteComparisonResult {
  sea: TariffResult | null;
  air: TariffResult | null;
  recommended: 'sea' | 'air' | null;
  recommendReason: string;
}

export interface QuoteHistoryItem {
  id: string;
  timestamp: string;      // ISO string
  origin: PortInfo;
  destination: PortInfo;
  weight: number;
  cbm: number;
  incoterms: Incoterms;
  containerType?: ContainerType;
  result: QuoteComparisonResult;
}

export interface InstantQuoteFormData {
  origin: string;
  destination: string;
  weight: string;
  cbm: string;
  mode: 'sea' | 'air' | 'both';
  incoterms: Incoterms;
  containerType: ContainerType;
}
```

---

## 4. Tariff Engine (`lib/tariff.ts`)

### 4.1 Major Ports (20개)

```typescript
export const MAJOR_PORTS: PortInfo[] = [
  // Korea
  { code: 'KRPUS', name: '부산항', nameEn: 'Busan', country: 'KR', type: 'sea' },
  { code: 'KRICN', name: '인천항', nameEn: 'Incheon', country: 'KR', type: 'both' },
  { code: 'KRICN-AIR', name: '인천공항', nameEn: 'Incheon Airport', country: 'KR', type: 'air' },
  // Asia
  { code: 'CNSHA', name: '상하이항', nameEn: 'Shanghai', country: 'CN', type: 'sea' },
  { code: 'CNPEK', name: '베이징공항', nameEn: 'Beijing Airport', country: 'CN', type: 'air' },
  { code: 'JPTYO', name: '도쿄항', nameEn: 'Tokyo', country: 'JP', type: 'both' },
  { code: 'SGSIN', name: '싱가포르항', nameEn: 'Singapore', country: 'SG', type: 'both' },
  { code: 'HKHKG', name: '홍콩항', nameEn: 'Hong Kong', country: 'HK', type: 'both' },
  { code: 'VNSGN', name: '호치민항', nameEn: 'Ho Chi Minh', country: 'VN', type: 'sea' },
  // Americas
  { code: 'USLAX', name: 'LA항', nameEn: 'Los Angeles', country: 'US', type: 'sea' },
  { code: 'USLAX-AIR', name: 'LA공항', nameEn: 'LAX Airport', country: 'US', type: 'air' },
  { code: 'USNYC', name: '뉴욕항', nameEn: 'New York', country: 'US', type: 'both' },
  // Europe
  { code: 'DEHAM', name: '함부르크항', nameEn: 'Hamburg', country: 'DE', type: 'sea' },
  { code: 'DEFRA', name: '프랑크푸르트공항', nameEn: 'Frankfurt Airport', country: 'DE', type: 'air' },
  { code: 'NLRTM', name: '로테르담항', nameEn: 'Rotterdam', country: 'NL', type: 'sea' },
  { code: 'GBFXT', name: '펠릭스토우항', nameEn: 'Felixstowe', country: 'GB', type: 'sea' },
  // Middle East / Others
  { code: 'AEJEA', name: '제벨알리항', nameEn: 'Jebel Ali', country: 'AE', type: 'sea' },
  { code: 'AEDXB', name: '두바이공항', nameEn: 'Dubai Airport', country: 'AE', type: 'air' },
  { code: 'AUBNE', name: '브리즈번항', nameEn: 'Brisbane', country: 'AU', type: 'sea' },
  { code: 'THLCH', name: '랏차방항', nameEn: 'Laem Chabang', country: 'TH', type: 'sea' },
];
```

### 4.2 Route Tariff Data (10개 주요 항로)

```typescript
interface RouteTariff {
  origin: string;        // port code prefix (e.g., "KR")
  destination: string;   // port code prefix
  sea: {
    basePerCBM: number;       // $/CBM
    basePerKg: number;        // $/kg (LCL)
    container20ft: number;    // $/unit
    container40ft: number;
    container40hc: number;
    bafPercent: number;       // BAF as % of base
    thc: number;              // fixed $
    docFee: number;
    transitDays: string;
    co2PerKg: number;
  };
  air: {
    basePerKg: number;
    minCharge: number;
    fscPercent: number;
    thc: number;
    docFee: number;
    transitDays: string;
    co2PerKg: number;
  };
}

// Example routes:
// KR → US-WEST: sea $45/CBM, air $5.5/kg
// KR → CN:      sea $25/CBM, air $3.0/kg
// KR → EU:      sea $55/CBM, air $6.0/kg
// KR → JP:      sea $20/CBM, air $2.8/kg
// KR → SE-ASIA: sea $30/CBM, air $3.5/kg
// ... (10 routes total)
```

### 4.3 Core Functions

```typescript
// 1. Port search (fuzzy matching)
export function searchPorts(query: string, type?: 'sea' | 'air' | 'both'): PortInfo[]

// 2. Route matching
export function getRouteMatch(originCode: string, destCode: string): RouteTariff | null

// 3. Main calculation
export function calculateQuote(params: {
  origin: PortInfo;
  destination: PortInfo;
  weightKg: number;
  cbm: number;
  incoterms: Incoterms;
  containerType?: ContainerType;
}): QuoteComparisonResult

// 4. Individual mode calculations
function calculateSeaFreight(route: RouteTariff, weightKg: number, cbm: number, container: ContainerType, incoterms: Incoterms): TariffResult
function calculateAirFreight(route: RouteTariff, weightKg: number, cbm: number, incoterms: Incoterms): TariffResult

// 5. Incoterms cost adjustment
function applyIncoterms(breakdown: TariffBreakdown, incoterms: Incoterms, basePrice: number): TariffBreakdown

// 6. Recommendation logic
function getRecommendation(sea: TariffResult | null, air: TariffResult | null): { mode: 'sea' | 'air' | null; reason: string }

// 7. Currency formatting
export function formatUSD(amount: number): string  // → "$1,234"

// 8. History management
export function saveQuoteHistory(item: QuoteHistoryItem): void
export function getQuoteHistory(): QuoteHistoryItem[]
export function clearQuoteHistory(): void
export function removeQuoteHistoryItem(id: string): void
```

### 4.4 Incoterms Cost Logic

| Incoterms | Base Freight | BAF/FSC | THC | Doc Fee | Insurance | Customs | Inland |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **EXW** | - | - | - | - | - | - | - |
| **FOB** | O | O | O (origin) | O | - | - | - |
| **CIF** | O | O | O (both) | O | O | - | - |
| **DDP** | O | O | O (both) | O | O | O | O |

- EXW: 운임 포함 안 됨 (참조용 표시만)
- FOB: 기본운임 + BAF + 출발지 THC + 서류비
- CIF: FOB + 도착지 THC + 보험료 (총운임의 0.3%)
- DDP: CIF + 관세 (총운임의 8%) + 내륙운송 ($150 고정)

---

## 5. UI Specifications

### 5.1 Page Layout (3-Step Flow)

```
┌───────────────────────────────────────────────────────────────┐
│  ← 홈으로 돌아가기                                             │
│                                                               │
│  [Calculator Icon]                                            │
│  빠른 운임 조회 (Instant Quote)                                │
│  1분 만에 예상 운임과 스케줄을 확인...                           │
│                                                               │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │  Step 1: INPUT FORM                                       │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐          │ │
│ │ │ 출발지 [autocomplete]│ │ 도착지 [autocomplete]│          │ │
│ │ └─────────────────────┘ └─────────────────────┘          │ │
│ │                                                           │ │
│ │ [Sea] [Air] [Compare Both]    Incoterms: [FOB ▼]        │ │
│ │                                                           │ │
│ │ Weight: [___] kg    CBM: [___]    Container: [20ft ▼]    │ │
│ │                                                           │ │
│ │ [========= 예상 운임 확인하기 =========]                    │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────── 최근 조회 ────────────────────┐          │
│ │ KRPUS → USLAX | $1,234 | 25-30d | 2분 전  [재조회] │        │
│ │ KRICN → CNSHA | $456   | 5-7d   | 1시간 전 [재조회] │        │
│ │ ...                                    [전체 삭제] │         │
│ └──────────────────────────────────────────────────┘          │
└───────────────────────────────────────────────────────────────┘
```

### 5.2 Step 2: Comparison View

```
┌───────────────────────────────────────────────────────────────┐
│  예상 견적이 산출되었습니다!                                     │
│                                                               │
│  ┌──────── 해상 운송 ────────┐  ┌──────── 항공 운송 ────────┐  │
│  │ [Ship Icon]               │  │ [Plane Icon]              │  │
│  │ 추천: 최저가              │  │ 추천: 최단시간             │  │
│  │                           │  │                           │  │
│  │ 총 운임: $1,234           │  │ 총 운임: $3,456           │  │
│  │ 소요시간: 25-30일         │  │ 소요시간: 3-5일           │  │
│  │ CO2: 12 kg               │  │ CO2: 75 kg               │  │
│  │                           │  │                           │  │
│  │ ─── 비용 상세 ───         │  │ ─── 비용 상세 ───         │  │
│  │ 기본운임    $800          │  │ 기본운임    $2,800        │  │
│  │ BAF/FSC    $120          │  │ FSC         $280         │  │
│  │ THC        $250          │  │ THC         $180         │  │
│  │ 서류비     $64           │  │ 서류비      $64          │  │
│  │ (보험료)   ($—)           │  │ (보험료)    ($—)          │  │
│  │                           │  │                           │  │
│  │ [정식 견적 의뢰]          │  │ [정식 견적 의뢰]          │  │
│  └───────────────────────────┘  └───────────────────────────┘  │
│                                                               │
│  [다시 조회]                    [결과 공유 링크 복사]           │
└───────────────────────────────────────────────────────────────┘
```

**Mobile (< md)**: 비교 카드 세로 스택 (1컬럼)

### 5.3 Port Autocomplete

```
┌─────────────────────────────────────────┐
│ [Globe] 부산                             │
│ ┌─────────────────────────────────────┐ │
│ │ KRPUS  부산항 (Busan)         🚢    │ │
│ │ AUBNE  브리즈번항 (Brisbane)   🚢    │ │  ← "부" 매칭
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

- 텍스트 입력 시 `searchPorts()` 호출 (한글/영문 모두 매칭)
- 결과 드롭다운: port code, 이름, 영문명, 타입 아이콘 (🚢/✈️)
- 선택 시 `PortInfo` 객체 저장
- 드롭다운 닫기: 선택, Escape, 외부 클릭
- `role="combobox"`, `aria-expanded`, `aria-activedescendant`

### 5.4 Mode Selector

```
[🚢 해상 운송]  [✈️ 항공 운송]  [⇆ 동시 비교]
```

- 3개 라디오 버튼 그룹: `sea`, `air`, `both`
- `role="radiogroup"`, 각 버튼 `role="radio"`, `aria-checked`
- `both` 선택 시 결과에서 ComparisonView 표시
- `sea` 또는 `air` 단독 선택 시 단일 결과 카드만 표시

### 5.5 Container Type Selector (해상 전용)

```
[20ft Standard]  [40ft Standard]  [40ft High Cube]
```

- `mode === 'air'`일 때 숨김
- 선택에 따라 해상 요금 변동
- 기본값: `20ft`

### 5.6 Incoterms Selector

```
┌──────────────────────────┐
│ Incoterms: [FOB    ▼]   │
│ ┌──────────────────────┐ │
│ │ EXW - Ex Works       │ │
│ │ FOB - Free On Board  │ │
│ │ CIF - Cost+Ins+Frt   │ │
│ │ DDP - Delivered Paid  │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

- `<select>` with 4 options
- 기본값: `FOB`
- 선택에 따라 비용 항목 자동 추가/제거 (4.4 참조)

### 5.7 Cost Breakdown Card

```
┌───────────────────────────────────┐
│  비용 상세 내역 (FOB 기준)         │
│ ─────────────────────────────────  │
│  기본운임 (Base Freight)    $800   │
│  유류할증료 (BAF/FSC)       $120   │
│  터미널비 (THC)             $250   │
│  서류비 (Doc Fee)           $64    │
│ ─────────────────────────────────  │
│  합계                      $1,234  │
│                                    │
│  CIF 추가 시: +보험료 $3.70        │
│  DDP 추가 시: +관세 $98.72         │
│               +내륙운송 $150       │
└───────────────────────────────────┘
```

### 5.8 Recommendation Badge

비교 모드에서 카드 상단 뱃지:

| Badge | Condition | Color |
|-------|-----------|-------|
| 최저가 | `sea.totalPrice < air.totalPrice` | `bg-green-100 text-green-700` |
| 최단시간 | Always on air (typically faster) | `bg-blue-100 text-blue-700` |
| 친환경 | `sea.co2Kg < air.co2Kg` | `bg-teal-100 text-teal-700` |

### 5.9 Quote History Section

```
┌────────────────────────────────────────────────────────┐
│  📋 최근 조회 이력                        [전체 삭제]    │
│ ──────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 부산 → LA  |  $1,234 / $3,456  |  2분 전         │  │
│  │ FOB · 20ft · 500kg · 2.5CBM          [재조회] [×] │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 인천 → 상하이  |  $456 / $890  |  1시간 전        │  │
│  │ CIF · 40ft · 1200kg · 8.0CBM         [재조회] [×] │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

- `localStorage` 키: `jways_quote_history`
- 최대 10건, LIFO (최신 먼저)
- "재조회" 클릭 → 폼 자동 채움 + 재계산
- "×" 클릭 → 개별 삭제
- "전체 삭제" → confirm 후 전체 삭제
- 상대 시간 표시 (방금, N분 전, N시간 전, N일 전)

### 5.10 QuoteModal Integration

"정식 견적 의뢰" 버튼 클릭 시:

```typescript
// QuoteModal에 전달할 프리필 데이터
const prefillData: Partial<QuoteFormData> = {
  serviceType: selectedMode === 'sea' ? 'ocean' : 'air',
  origin: formData.origin,           // port name
  destination: formData.destination, // port name
  weight: String(formData.weight),
};

// QuoteModalState 확장
interface QuoteModalState {
  isOpen: boolean;
  preSelectedService?: ServiceType;
  prefillData?: Partial<QuoteFormData>;  // NEW
}
```

- `QuoteModal`에 `prefillData` prop 추가 (optional)
- Modal 열릴 때 `prefillData`가 있으면 해당 필드 자동 채움
- 기존 `preSelectedService` 동작 유지

### 5.11 URL Share (결과 공유)

```
/instant-quote?o=KRPUS&d=USLAX&w=500&v=2.5&m=both&i=FOB&c=20ft
```

| Param | Field | Example |
|-------|-------|---------|
| `o` | origin code | `KRPUS` |
| `d` | destination code | `USLAX` |
| `w` | weight (kg) | `500` |
| `v` | volume (CBM) | `2.5` |
| `m` | mode | `sea\|air\|both` |
| `i` | incoterms | `FOB\|CIF\|DDP\|EXW` |
| `c` | container | `20ft\|40ft\|40ft-hc` |

- 페이지 로드 시 URL 파라미터 파싱 → 폼 자동 채움 → 자동 계산
- "결과 공유" 버튼 → 클립보드 복사 + 토스트 알림

---

## 6. Header & Landing Page Updates

### 6.1 Header.tsx — 네비 링크 추가

Desktop `navItems` 배열에 추가:
```typescript
const navItems: NavItem[] = [
  { label: '서비스', href: '#services' },
  { label: '빠른 견적', href: '/instant-quote' },  // NEW
  { label: '회사소개', href: '#about' },
  { label: '고객지원', href: '#contact' },
];
```

- `href`가 `/`로 시작하면 `<Link>` 사용 (이미 hash/external 분기 로직 존재)
- Mobile 메뉴에도 자동 반영

### 6.2 LandingPage.tsx — Hero CTA 연결

Hero 섹션 "무료 견적 요청하기" 근처에 추가 버튼:
```jsx
<Link
  to="/instant-quote"
  className="px-6 py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-jways-navy transition-all"
>
  빠른 운임 조회
</Link>
```

---

## 7. Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| Port autocomplete | `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-owns` |
| Mode selector | `role="radiogroup"` + `role="radio"` + `aria-checked` |
| Container selector | `role="radiogroup"` 또는 native `<select>` |
| Incoterms select | Native `<select>` with `<label>` |
| Form inputs | `<label htmlFor>`, `aria-invalid`, `aria-describedby` |
| Error messages | `role="alert"` |
| Loading state | `aria-busy="true"` on form, 스피너 `role="status"` |
| Comparison cards | `role="region"` with `aria-label` |
| History items | `role="list"` + `role="listitem"` |
| Toast | `role="status"`, `aria-live="polite"` |
| Keyboard | Tab 순서 논리적, Escape 닫기 (autocomplete, modal) |

---

## 8. Responsive Design

| Breakpoint | Layout |
|------------|--------|
| < md (mobile) | 1컬럼, 비교 카드 세로 스택, 이력 축소, 폼 세로 배치 |
| >= md (desktop) | 2컬럼 그리드, 비교 카드 나란히, 이력 하단 가로 배치 |

---

## 9. Dark Mode

모든 신규 요소에 `dark:` Tailwind 접두어 적용:

| Element | Light | Dark |
|---------|-------|------|
| Page bg | `bg-slate-50` | `dark:bg-slate-950` |
| Card bg | `bg-white` | `dark:bg-slate-900` |
| Card border | `border-slate-100` | `dark:border-slate-800` |
| Input bg | `bg-slate-50` | `dark:bg-slate-800` |
| Input border | `border-slate-200` | `dark:border-slate-700` |
| Text primary | `text-slate-900` | `dark:text-white` |
| Text secondary | `text-slate-500` | `dark:text-slate-400` |
| Badge bg | `bg-green-100` | `dark:bg-green-900/30` |
| Badge text | `text-green-700` | `dark:text-green-400` |

---

## 10. Implementation Order & Checklist

1. **IQ-1**: `lib/tariff.ts` — 타입, 포트 목록, 항로 데이터, 계산 함수, 이력 관리
2. **IQ-2 + IQ-6**: `pages/InstantQuote.tsx` — 폼 리라이트 (포트 검색, 모드 선택, 컨테이너, Incoterms, 유효성, 접근성)
3. **IQ-3**: ComparisonView — 해상/항공 비교 카드, 추천 뱃지, CostBreakdown
4. **IQ-4**: Result 연결 — QuoteModal prefill, URL 공유, 토스트
5. **IQ-5**: QuoteHistory — localStorage CRUD, 이력 UI, 재조회/삭제
6. **IQ-7**: UI Polish — Header 링크, LandingPage CTA, 다크모드, 반응형, 애니메이션

---

## 11. Shared UI Patterns

### Loading Spinner
```jsx
<div className="flex items-center justify-center py-12" role="status" aria-label="계산 중">
  <div className="w-8 h-8 border-3 border-jways-blue/30 border-t-jways-blue rounded-full animate-spin" />
</div>
```

### Toast Notification
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg"
  role="status"
  aria-live="polite"
>
  {message}
</motion.div>
```

### Error Message
```jsx
{error && (
  <p role="alert" className="text-xs text-red-500 mt-1">{error}</p>
)}
```
