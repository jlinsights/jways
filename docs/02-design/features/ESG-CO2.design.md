# ESG CO2 Dashboard Enhancement Design Document

> **Summary**: ESG 탄소 배출량 대시보드 고도화 — Tariff Engine CO2 연동, 화물별 추적, 저감 시뮬레이터, ESG 스코어, 탄소 상쇄 안내
>
> **Project**: Jways Logistics
> **Version**: 1.0.0
> **Author**: Claude Code (PDCA Cycle #11)
> **Date**: 2026-02-24
> **Status**: Draft
> **Planning Doc**: [ESG-CO2.plan.md](../../01-plan/features/ESG-CO2.plan.md)

### Pipeline References

> Dynamic 레벨 SPA (Mock Backend) — Pipeline 미적용

---

## 1. Overview

### 1.1 Design Goals

1. **CO2 Engine 고도화**: `lib/tariff.ts`의 항로별 `co2PerKg` 데이터 기반 정밀 계산 엔진
2. **화물별 CO2 추적**: Mock Shipment 데이터와 연동한 개별 화물 배출량 산출 및 집계
3. **탄소 저감 시뮬레이터**: 항공→해상 전환 등 "What-if" 인터랙티브 시뮬레이션
4. **ESG 종합 스코어**: E(환경)/S(사회)/G(지배구조) 레이더 차트 시각화
5. **탄소 상쇄 안내**: 예상 비용 계산 및 인증 프로그램 소개
6. **비인증 공개 섹션**: 랜딩 페이지 ESG 커밋먼트 섹션
7. **접근성 + UI 완성**: ARIA, 키보드 네비게이션, 다크모드, 반응형

### 1.2 Design Principles

- **Data-Driven**: 기존 Tariff Engine `co2PerKg` 데이터를 CO2 계산의 단일 소스로 사용
- **Inline Sub-Components**: Sustainability.tsx 내 섹션별 인라인 컴포넌트로 파일 분리 최소화
- **Progressive Enhancement**: 기존 3카드 + 2차트 구조를 확장하되 하위 호환
- **Consistent Patterns**: 기존 프로젝트 Tailwind CDN, lucide-react, recharts, framer-motion 유지
- **Accessibility First**: 모든 차트에 ARIA 대체 텍스트, 키보드 네비게이션 지원

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ App.tsx                                                             │
│  ├── /dashboard/sustainability → <Sustainability />                 │
│  │     ├── ESG Score Section (레이더 차트, E/S/G 점수)              │
│  │     ├── Overview Cards (3장: 총배출량, 주요요인, 목표달성률)     │
│  │     ├── Trend + Mode Charts (기존 2차트 고도화)                  │
│  │     ├── Shipment CO2 Table (화물별 배출량 목록)                  │
│  │     ├── Reduction Simulator (What-if 시뮬레이터)                 │
│  │     ├── CO2 Calculator (Tariff Engine 연동)                      │
│  │     └── Carbon Offset Guide (상쇄 안내 + 비용 계산)             │
│  │                                                                   │
│  └── / → <LandingPage />                                            │
│        └── <ESGSection /> (비인증 공개 섹션, WhyUs 앞 삽입)         │
│                                                                      │
│ lib/co2.ts (NEW)                                                     │
│  ├── calculateShipmentCO2(): 화물별 CO2 계산 (Tariff Engine 연동)   │
│  ├── getRouteCO2PerKg(): 항로별 co2PerKg 조회                      │
│  ├── aggregateMonthlyCO2(): 월별 집계 생성                          │
│  ├── aggregateModeCO2(): 운송수단별 집계                            │
│  ├── simulateReduction(): 저감 시뮬레이션 계산                      │
│  ├── calculateESGScore(): ESG 종합 스코어 산출                      │
│  └── calculateOffsetCost(): 탄소 상쇄 예상 비용                     │
│                                                                      │
│ lib/tariff.ts (기존 — 읽기만, 수정 없음)                            │
│  └── ROUTE_TARIFFS[].sea.co2PerKg / air.co2PerKg 데이터 활용       │
│                                                                      │
│ lib/api.ts (EDIT)                                                    │
│  └── getShipmentCO2Data(): CO2 집계 Mock API 함수 추가              │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
MOCK_SHIPMENTS (lib/api.ts)
  │  [12건: origin, destination, mode, weight]
  │
  ▼
lib/co2.ts → calculateShipmentCO2(shipment)
  │  ├── getRouteCO2PerKg(origin, destination, mode) ← lib/tariff.ts
  │  ├── parseWeight(weightStr) → kg 숫자 변환
  │  └── return { co2Kg, co2PerKg, mode, route }
  │
  ▼
aggregateMonthlyCO2(shipments) → 월별 배출량 트렌드 데이터
aggregateModeCO2(shipments) → 운송수단별 배출량 비교 데이터
  │
  ▼
Sustainability.tsx → recharts 차트 렌더링
  │
  ├── ESG Score ← calculateESGScore(shipments)
  ├── Simulator ← simulateReduction(shipment, targetMode)
  └── Offset ← calculateOffsetCost(totalCO2)
```

### 2.3 File Dependency Graph

```
types.ts ──────────────┐
                        ▼
lib/tariff.ts ──► lib/co2.ts ──► pages/Dashboard/Sustainability.tsx
                        │
lib/api.ts ◄────────────┘         pages/Dashboard/DashboardHome.tsx
                                  components/ESGSection.tsx (NEW)
                                  pages/LandingPage.tsx
```

---

## 3. Type Definitions (`types.ts`)

### 3.1 New Types

```typescript
// ─── ESG & CO2 Types ───

export interface ShipmentCO2 {
  shipmentId: string;
  blNumber: string;
  origin: string;
  destination: string;
  mode: TransportMode;
  weightKg: number;
  co2Kg: number;
  co2PerKg: number;
  routeKey: string;        // e.g., "KR→US"
  departureDate: string;
}

export interface MonthlyCO2 {
  month: string;           // "1월", "2월", ...
  emissions: number;       // kg CO2e
  target: number;          // 목표 배출량 kg
  shipmentCount: number;
}

export interface ModeCO2 {
  name: string;            // "해상 운송", "항공 운송"
  value: number;           // kg CO2e
  shipmentCount: number;
  avgCO2PerKg: number;
}

export interface ESGScore {
  environmental: number;   // 0-100
  social: number;          // 0-100
  governance: number;      // 0-100
  overall: number;         // 가중평균 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
}

export interface ReductionScenario {
  shipmentId: string;
  currentMode: TransportMode;
  currentCO2: number;
  alternativeMode: TransportMode;
  alternativeCO2: number;
  savedCO2: number;
  savedPercent: number;
  additionalDays: number;
  costDifference: string;  // "약 -$2,000" 또는 "+$500" 등
}

export interface CarbonOffsetEstimate {
  totalCO2Kg: number;
  totalCO2Tonnes: number;
  pricePerTonne: { min: number; max: number };
  estimatedCost: { min: number; max: number };
  currency: string;
  programs: CarbonOffsetProgram[];
}

export interface CarbonOffsetProgram {
  name: string;            // "Gold Standard", "VCS"
  description: string;
  priceRange: string;      // "$15-30/tCO₂e"
  certification: string;
}
```

---

## 4. Module Design: `lib/co2.ts` (NEW)

### 4.1 Imports & Constants

```typescript
import { ROUTE_TARIFFS, getRouteMatch } from './tariff';  // 직접 import — 내부 데이터 재사용
import type { ShipmentListItem } from '../types';
// 새 타입들은 co2.ts 내부 또는 types.ts에서 import

// 탄소 상쇄 프로그램 데이터
const OFFSET_PROGRAMS: CarbonOffsetProgram[] = [
  { name: 'Gold Standard', description: '가장 엄격한 국제 탄소 크레딧 인증', priceRange: '$20-50/tCO₂e', certification: 'Gold Standard Foundation' },
  { name: 'VCS (Verra)', description: '세계 최대 자발적 탄소 크레딧 프로그램', priceRange: '$10-30/tCO₂e', certification: 'Verra' },
  { name: 'CDM (Clean Development)', description: 'UN 기후변화협약 공식 감축 메커니즘', priceRange: '$5-15/tCO₂e', certification: 'UNFCCC' },
];

// 내륙 운송 CO2 factor (도로) — Tariff Engine에 없으므로 별도 정의
const ROAD_CO2_PER_KG = 0.1;  // kg CO2e per kg cargo (평균값)
```

### 4.2 Core Functions

#### `parseWeight(weightStr: string): number`
```typescript
/**
 * "2,500 kg" → 2500, "12,000 kg" → 12000
 * MOCK_SHIPMENTS의 weight 문자열을 숫자로 변환
 */
export function parseWeight(weightStr: string): number {
  return Number(weightStr.replace(/[^0-9.]/g, '')) || 0;
}
```

#### `getRouteCO2PerKg(origin: string, destination: string, mode: TransportMode): number`
```typescript
/**
 * 항로별 co2PerKg 조회 (Tariff Engine 데이터 활용)
 *
 * @param origin - "ICN (인천)" 또는 "BUS (부산)" 형식
 * @param destination - "LAX (로스앤젤레스)" 등
 * @param mode - 'sea' | 'air'
 * @returns co2PerKg 값 (kg CO2e per kg cargo)
 *
 * 매칭 로직:
 * 1. origin/destination에서 국가 코드 추출 (도시명 → 포트코드 매핑)
 * 2. getRouteMatch()로 항로 매칭
 * 3. mode에 따라 sea.co2PerKg 또는 air.co2PerKg 반환
 * 4. 매칭 실패 시 기본값: sea=0.015, air=0.58
 */
```

**도시명 → 국가코드 매핑 테이블** (MOCK_SHIPMENTS 기준):
| 도시 패턴 | 국가코드 | 비고 |
|-----------|---------|------|
| ICN, 인천 | KR | origin |
| BUS, 부산 | KR | origin |
| LAX, 로스앤젤레스 | US | |
| SHA, 상하이 | CN | |
| NRT, 나리타 / TYO, 도쿄 | JP | |
| HKG, 홍콩 | HK → fallback SG | HK는 Tariff에 없으므로 SG로 fallback |
| SIN, 싱가포르 | SG | |
| HAM, 함부르크 | DE | |
| JFK, 뉴욕 | US | |
| RTM, 로테르담 | NL | |
| BKK, 방콕 | TH | |
| SYD, 시드니 | AU | |
| CDG, 파리 | FR → fallback DE | FR는 Tariff에 없으므로 DE로 fallback |

#### `calculateShipmentCO2(shipment: ShipmentListItem): ShipmentCO2`
```typescript
/**
 * 개별 화물의 CO2 배출량 계산
 *
 * 1. parseWeight(shipment.weight) → weightKg
 * 2. getRouteCO2PerKg(origin, destination, mode) → co2PerKg
 * 3. co2Kg = weightKg * co2PerKg
 * 4. return ShipmentCO2 객체
 */
```

#### `calculateAllShipmentsCO2(shipments: ShipmentListItem[]): ShipmentCO2[]`
```typescript
/**
 * 모든 화물의 CO2 일괄 계산
 */
```

#### `aggregateMonthlyCO2(shipmentCO2s: ShipmentCO2[]): MonthlyCO2[]`
```typescript
/**
 * 월별 CO2 집계 (차트 데이터용)
 *
 * - departureDate 기준으로 월 그룹핑
 * - 목표(target): 전월 배출량 * 0.95 (매월 5% 감축 목표)
 * - 6개월분 반환 (1월~6월)
 */
```

#### `aggregateModeCO2(shipmentCO2s: ShipmentCO2[]): ModeCO2[]`
```typescript
/**
 * 운송수단별 CO2 집계
 *
 * - 해상 운송(sea): 합계, 건수, 평균 co2PerKg
 * - 항공 운송(air): 합계, 건수, 평균 co2PerKg
 * - 집계 결과를 ModeCO2[] 형태로 반환
 */
```

#### `simulateReduction(shipmentCO2: ShipmentCO2): ReductionScenario`
```typescript
/**
 * 탄소 저감 시뮬레이션
 *
 * - 항공(air) 화물 → 해상(sea) 전환 시나리오 계산
 * - alternativeCO2 = weightKg * getRouteCO2PerKg(origin, dest, 'sea')
 * - savedCO2 = currentCO2 - alternativeCO2
 * - savedPercent = (savedCO2 / currentCO2) * 100
 * - additionalDays: Tariff Engine transitDays 차이 계산
 * - costDifference: 대략적인 비용 차이 (해상이 저렴)
 *
 * 해상(sea) 화물은 이미 최적이므로 시나리오 없음 (savedCO2 = 0)
 */
```

#### `calculateESGScore(shipmentCO2s: ShipmentCO2[]): ESGScore`
```typescript
/**
 * ESG 종합 스코어 산출 (Mock 기반)
 *
 * Environmental (40% 가중치):
 *   - 해상 운송 비율이 높을수록 높은 점수
 *   - 점수 = min(100, 해상비율 * 1.2 + 20)
 *
 * Social (30% 가중치):
 *   - Mock 기반 고정값 (안전사고율 0건 → 88점)
 *
 * Governance (30% 가중치):
 *   - Mock 기반 고정값 (규정 준수율 95% → 82점)
 *
 * Overall = E*0.4 + S*0.3 + G*0.3
 *
 * Grade 매핑:
 *   90+ → A+, 80+ → A, 70+ → B+, 60+ → B, 50+ → C, 나머지 → D
 */
```

#### `calculateOffsetCost(totalCO2Kg: number): CarbonOffsetEstimate`
```typescript
/**
 * 탄소 상쇄 예상 비용 계산
 *
 * - totalCO2Tonnes = totalCO2Kg / 1000
 * - pricePerTonne: { min: 10, max: 50 } USD
 * - estimatedCost: { min: tonnes * 10, max: tonnes * 50 }
 * - programs: OFFSET_PROGRAMS 배열 포함
 */
```

---

## 5. Component Design

### 5.1 `pages/Dashboard/Sustainability.tsx` (REWRITE)

전체 파일을 재작성한다. 기존 221줄 → 약 500-600줄 예상 (인라인 서브컴포넌트 포함).

#### 5.1.1 State & Data Loading

```typescript
const Sustainability: React.FC = () => {
  // ─── State ───
  const [shipmentCO2s, setShipmentCO2s] = useState<ShipmentCO2[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyCO2[]>([]);
  const [modeData, setModeData] = useState<ModeCO2[]>([]);
  const [esgScore, setEsgScore] = useState<ESGScore | null>(null);
  const [offsetEstimate, setOffsetEstimate] = useState<CarbonOffsetEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Calculator State (기존 유지 + 고도화) ───
  const [calcInput, setCalcInput] = useState({ origin: '', dest: '', mode: 'sea', weight: '' });
  const [calcResult, setCalcResult] = useState<{ co2Kg: number; co2PerKg: number } | null>(null);

  // ─── Simulator State ───
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [reductionResult, setReductionResult] = useState<ReductionScenario | null>(null);

  // ─── Data Loading ───
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const shipments = await getShipments();
      const co2Data = calculateAllShipmentsCO2(shipments);
      setShipmentCO2s(co2Data);
      setMonthlyData(aggregateMonthlyCO2(co2Data));
      setModeData(aggregateModeCO2(co2Data));
      setEsgScore(calculateESGScore(co2Data));
      const totalCO2 = co2Data.reduce((sum, s) => sum + s.co2Kg, 0);
      setOffsetEstimate(calculateOffsetCost(totalCO2));
      setLoading(false);
    }
    loadData();
  }, []);
};
```

#### 5.1.2 Section Layout (렌더링 순서)

```
┌─────────────────────────────────────────────────────┐
│ Header: "ESG 탄소 배출량 리포트" + PDF 버튼          │
├─────────────────────────────────────────────────────┤
│ [A] ESG Score Section (레이더 차트 + 등급)           │
│     ┌──────────┬──────────┬──────────┐              │
│     │ E: 75점  │ S: 88점  │ G: 82점  │              │
│     └──────────┴──────────┴──────────┘              │
│     Overall: 81점 (A등급)                            │
│     + 레이더 차트 (recharts RadarChart)              │
├─────────────────────────────────────────────────────┤
│ [B] Overview Cards (기존 3장 — 실제 데이터 연동)     │
│     ┌───────────┬───────────┬───────────┐           │
│     │총 배출량   │주요 요인   │목표 달성률│           │
│     │(집계값)    │(집계값)    │(계산값)   │           │
│     └───────────┴───────────┴───────────┘           │
├─────────────────────────────────────────────────────┤
│ [C] Charts (기존 2차트 — 실제 데이터 연동)           │
│     ┌─────────────────┬─────────────────┐           │
│     │ 월별 추이 Area   │ 수단별 Bar      │           │
│     └─────────────────┴─────────────────┘           │
├─────────────────────────────────────────────────────┤
│ [D] Shipment CO2 Table (화물별 배출량)               │
│     │ BL번호 │ 구간 │ 모드 │ 중량 │ CO2 │           │
│     │ JW-8839│ICN→LAX│ 해상│2,500│ 40.0│           │
│     │ ...                                │           │
├─────────────────────────────────────────────────────┤
│ [E] Reduction Simulator (저감 시뮬레이터)            │
│     화물 선택 → Before/After 비교                    │
│     ┌───────────────────────────────────┐           │
│     │ 현재: 항공 287.1 kg              │→│ 해상: 7.2 kg│
│     │ 절감: 279.9 kg (97.5%)            │           │
│     └───────────────────────────────────┘           │
├─────────────────────────────────────────────────────┤
│ [F] CO2 Calculator (기존 고도화 — Tariff Engine 연동)│
│     출발지/도착지/모드/중량 → co2PerKg 표시          │
├─────────────────────────────────────────────────────┤
│ [G] Carbon Offset Guide (탄소 상쇄 안내)             │
│     예상 비용 + 인증 프로그램 3종 소개               │
│     CTA: "탄소 상쇄 문의하기"                        │
└─────────────────────────────────────────────────────┘
```

#### 5.1.3 Section [A]: ESG Score

```
┌─────────────────────────────────────────────────────────┐
│  ESG 종합 스코어                                         │
│  ┌─────────────────────┐  ┌───────────────────────────┐ │
│  │                     │  │ Environmental    ████ 75   │ │
│  │    RadarChart       │  │ Social          █████ 88   │ │
│  │    (E/S/G)          │  │ Governance      ████░ 82   │ │
│  │                     │  ├───────────────────────────┤ │
│  │                     │  │ Overall Score   81 (A)     │ │
│  └─────────────────────┘  │ "국내 물류업체 상위 15%"    │ │
│                            └───────────────────────────┘ │
│  ⚠️ 본 ESG 스코어는 자체 산정 참고값이며,               │
│     공인 ESG 평가(CDP, EcoVadis 등)와 다를 수 있습니다.  │
└─────────────────────────────────────────────────────────┘
```

- **차트**: recharts `RadarChart` + `PolarGrid` + `PolarAngleAxis` + `Radar`
- **데이터**: `[{ subject: 'Environmental', score: 75 }, { subject: 'Social', score: 88 }, { subject: 'Governance', score: 82 }]`
- **색상**: 기존 teal 그라디언트 유지 (`#0d9488`)
- **등급 뱃지**: grade에 따른 색상 (A+/A: emerald, B+/B: blue, C: amber, D: red)
- **접근성**: `role="img"` + `aria-label="ESG 종합 스코어: Environmental 75점, Social 88점, Governance 82점, 종합 81점 A등급"`

#### 5.1.4 Section [B]: Overview Cards (고도화)

기존 3장 카드 구조 유지, 하드코딩 → 실제 집계 데이터:

| 카드 | 기존 (하드코딩) | 고도화 (계산값) |
|------|----------------|----------------|
| 총 배출량 | 23.2 tCO₂e | `shipmentCO2s.reduce(sum + co2Kg) / 1000` tCO₂e |
| 주요 요인 | 항공 60.8% | `modeData`에서 max value의 mode + 비율 |
| 목표 달성률 | 82% | `(1 - actual/target) * 100` 기반 계산 |

#### 5.1.5 Section [C]: Charts (데이터 연동)

기존 차트 구조 그대로 유지하되, Mock → 실제 집계:

- **월별 추이**: `mockMonthlyData` → `monthlyData` (from `aggregateMonthlyCO2`)
- **수단별 분석**: `mockModeData` → `modeData` (from `aggregateModeCO2`)
- **접근성 추가**: 각 차트에 `role="img"` + `aria-label` 서술형 대체 텍스트

#### 5.1.6 Section [D]: Shipment CO2 Table

```
┌──────────────────────────────────────────────────────────────┐
│  화물별 CO₂ 배출량 상세                                       │
│  ┌────────┬──────────────┬──────┬────────┬──────────┬──────┐│
│  │ BL번호  │ 구간          │ 모드 │ 중량    │ CO₂ 배출 │ 강도 ││
│  ├────────┼──────────────┼──────┼────────┼──────────┼──────┤│
│  │JW-8839 │ ICN → LAX    │ 🚢   │2,500 kg│ 40.0 kg  │ 0.016││
│  │JW-7721 │ BUS → SHA    │ 🚢   │1,200 kg│ 14.4 kg  │ 0.012││
│  │JW-9102 │ ICN → NRT    │ ✈️   │ 450 kg │ 225.0 kg │ 0.500││
│  │...     │              │      │        │          │      ││
│  └────────┴──────────────┴──────┴────────┴──────────┴──────┘│
│                                                               │
│  📊 총 12건 | 해상 8건 (평균 0.014) | 항공 4건 (평균 0.563)   │
│  ℹ️ CO₂ 배출 강도: 화물 1kg당 배출되는 CO₂ (kg CO₂e/kg)      │
│  ℹ️ 계산 기준: GLEC Framework 참조, 실측값과 다를 수 있습니다 │
└──────────────────────────────────────────────────────────────┘
```

- **테이블 구조**: `<table>` with proper `<thead>`, `<tbody>`, `scope="col"`
- **모드 아이콘**: sea → `Ship` (lucide), air → `Plane` (lucide)
- **정렬**: CO2 배출량 내림차순 (가장 많이 배출한 화물 먼저)
- **CO2 강도 컬러**: 낮음(green) / 중간(amber) / 높음(red) 기준
  - `< 0.05`: green (해상)
  - `0.05 ~ 0.3`: amber (내륙)
  - `> 0.3`: red (항공)
- **반응형**: 모바일에서 카드 형태로 전환 (`md:` breakpoint)
- **접근성**: `<caption>` 요소, `scope` 속성, `aria-sort`

#### 5.1.7 Section [E]: Reduction Simulator

```
┌─────────────────────────────────────────────────────────────┐
│  🌿 탄소 저감 시뮬레이터                                     │
│  "항공 운송을 해상으로 전환하면 얼마나 절감할 수 있을까요?"   │
│                                                               │
│  [화물 선택 드롭다운: JW-9102 (ICN→NRT, 항공) ▾ ]           │
│                                                               │
│  ┌─────────────────────┐   ┌─────────────────────┐          │
│  │ 현재 (항공 운송)     │   │ 전환 (해상 운송)     │          │
│  │                     │   │                     │          │
│  │ CO₂: 225.0 kg      │ → │ CO₂: 4.5 kg         │          │
│  │ 소요: 1일           │   │ 소요: 2-4일          │          │
│  │ 비용: $$$           │   │ 비용: $              │          │
│  └─────────────────────┘   └─────────────────────┘          │
│                                                               │
│  ┌─────────────────────────────────────────────────┐         │
│  │  절감 효과                                       │         │
│  │  🎯 CO₂ 절감: 220.5 kg (97.5%)                  │         │
│  │  📅 추가 소요: +1~3일                            │         │
│  │  💰 비용 절감: 약 -$500                           │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  💡 항공 화물 4건을 모두 해상으로 전환 시                     │
│     연간 약 1,200 kg CO₂ 절감 가능 (전체의 85%)              │
└─────────────────────────────────────────────────────────────┘
```

- **대상**: `mode === 'air'`인 화물만 시뮬레이션 대상
- **드롭다운**: 항공 화물 목록 (BL번호 + 구간)
- **비교 카드**: framer-motion `AnimatePresence`로 Before/After 전환
- **절감 효과**: 녹색 강조 배경
- **전체 요약**: 하단에 모든 항공 화물 전환 시 총 절감량
- **접근성**: 드롭다운 `aria-label`, 결과 `aria-live="polite"`

#### 5.1.8 Section [F]: CO2 Calculator (고도화)

기존 계산기 구조 유지 + Tariff Engine 연동:

| 항목 | 기존 | 고도화 |
|------|------|--------|
| 계산식 | `weight * factor` (고정) | `weight * getRouteCO2PerKg(origin, dest, mode)` |
| factor | air=2.5, sea=0.4, road=1.2 | Tariff Engine co2PerKg (항로별 차등) |
| 결과 표시 | CO2 kg만 | CO2 kg + co2PerKg 강도 + 출처 표시 |
| 출발지/도착지 | 자유 텍스트 | 자유 텍스트 (내부적으로 국가코드 매핑 시도) |

결과 영역에 추가:
- `"배출 강도: {co2PerKg} kg CO₂e/kg (GLEC Framework 참조)"`
- Tariff Engine 데이터 매칭 실패 시: `"기본 계수 적용 (실제와 차이 가능)"`

#### 5.1.9 Section [G]: Carbon Offset Guide

```
┌─────────────────────────────────────────────────────────────┐
│  🌍 탄소 상쇄 (Carbon Offset) 안내                           │
│                                                               │
│  귀사의 올해 예상 탄소 배출량: 0.85 tCO₂e                    │
│  예상 상쇄 비용: $8.50 ~ $42.50                              │
│                                                               │
│  ┌───────────────┬───────────────┬───────────────┐          │
│  │ Gold Standard │ VCS (Verra)   │ CDM           │          │
│  │               │               │               │          │
│  │ $20-50/tCO₂e │ $10-30/tCO₂e │ $5-15/tCO₂e  │          │
│  │ 가장 엄격한   │ 세계 최대     │ UN 기후변화    │          │
│  │ 국제 인증     │ 자발적 프로그램│ 협약 공식     │          │
│  │               │               │               │          │
│  │ Gold Standard │ Verra         │ UNFCCC        │          │
│  │ Foundation    │               │               │          │
│  └───────────────┴───────────────┴───────────────┘          │
│                                                               │
│  [ 탄소 상쇄 문의하기 → ]                                    │
│                                                               │
│  ℹ️ 상기 가격은 2024-2025년 시장 평균이며 실제와 다를 수 있음 │
└─────────────────────────────────────────────────────────────┘
```

- **비용 계산**: `calculateOffsetCost(totalCO2)` 결과 표시
- **프로그램 카드**: 3장 grid (md:grid-cols-3)
- **CTA 버튼**: 외부 링크 아님, 토스트 알림 ("담당자에게 문의가 전달되었습니다")
- **접근성**: 카드 `role="article"`, CTA 버튼 `aria-label`

#### 5.1.10 PDF Download Button

```typescript
// 기존 버튼 유지 — 클릭 시 토스트 알림
const handleDownloadPDF = () => {
  // toast 또는 간단한 alert 대체
  // "ESG 리포트 PDF 다운로드 기능은 준비 중입니다."
  alert('ESG 리포트 PDF 다운로드 기능은 준비 중입니다. 빠른 시일 내 제공하겠습니다.');
};
```

---

### 5.2 `components/ESGSection.tsx` (NEW)

랜딩 페이지에 삽입할 비인증 공개 ESG 소개 섹션.

```
┌─────────────────────────────────────────────────────────────┐
│  bg: gradient teal-to-emerald (light) / slate-900 (dark)    │
│                                                               │
│  ┌────────────────────────────────────────────────┐          │
│  │ 🌿 친환경 물류, 제이웨이즈의 약속                │          │
│  │                                                  │          │
│  │ 지속 가능한 미래를 위해 탄소 배출량을 줄이고      │          │
│  │ 친환경 운송 솔루션을 제공합니다.                  │          │
│  └────────────────────────────────────────────────┘          │
│                                                               │
│  ┌────────────┬────────────┬────────────┐                    │
│  │ 🚢         │ 📉         │ 🏆         │                    │
│  │ 해상 운송   │ 탄소 배출   │ ESG 등급   │                    │
│  │ 비율 68%   │ 전년 대비   │            │                    │
│  │            │ -14% 감축  │ A등급      │                    │
│  └────────────┴────────────┴────────────┘                    │
│                                                               │
│  [ 🔒 ESG 상세 리포트 보기 → /login ]                        │
│  [ 💡 무료 CO₂ 계산해보기 → /instant-quote ]                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Component Structure

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Ship, TrendingDown, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const ESGSection: React.FC = () => {
  const stats = [
    { icon: Ship, label: '해상 운송 비율', value: '68%', description: '친환경 해상 운송 적극 활용' },
    { icon: TrendingDown, label: '탄소 배출 감축', value: '-14%', description: '전년 동기 대비 감축 실적' },
    { icon: Award, label: 'ESG 등급', value: 'A', description: '자체 ESG 평가 기준 달성' },
  ];

  return (
    <section aria-labelledby="esg-section-title" className="...">
      {/* title, description, stat cards, CTAs */}
    </section>
  );
};
```

- **위치**: `LandingPage.tsx`에서 `<WhyUs />` 바로 앞에 삽입
- **스타일**: teal/emerald 그라디언트 배경 (Sustainability 페이지와 일관성)
- **통계 데이터**: 하드코딩 (비인증 공개용이므로 실시간 연동 불필요)
- **CTA 2개**:
  1. "ESG 상세 리포트 보기" → `/login` (로그인 유도)
  2. "무료 CO₂ 계산해보기" → `/instant-quote` (비인증 접근 가능)
- **접근성**: `aria-labelledby`, stat 카드에 `role="article"`

---

### 5.3 `pages/LandingPage.tsx` (EDIT)

```diff
+ import ESGSection from '../components/ESGSection';

  // WhyUs 바로 앞에 삽입
+ <ESGSection />
  <WhyUs />
```

변경 최소화: import 1줄 + JSX 1줄.

---

### 5.4 `pages/Dashboard/DashboardHome.tsx` (EDIT)

ESG 위젯 데이터를 `lib/co2.ts`에서 가져오도록 고도화:

| 항목 | 기존 (하드코딩) | 고도화 |
|------|----------------|--------|
| 배출량 | "2,450 kg CO₂e" | `calculateAllShipmentsCO2` 결과 집계 |
| 증감률 | "-12% 감소" (고정) | 실제 계산 또는 유사한 Mock 값 유지 |
| ESG 등급 | 없음 | ESG 등급 뱃지 추가 (A, B+ 등) |

```typescript
// 기존 하드코딩 → co2.ts 함수 사용
import { calculateAllShipmentsCO2 } from '../../lib/co2';
import { getShipments } from '../../lib/api';

// useEffect에서 로드
const [monthlyCO2, setMonthlyCO2] = useState<number>(2450);  // 기본값 유지 (로딩 중)

useEffect(() => {
  getShipments().then(shipments => {
    const co2s = calculateAllShipmentsCO2(shipments);
    const total = co2s.reduce((sum, s) => sum + s.co2Kg, 0);
    setMonthlyCO2(Math.round(total));
  });
}, []);
```

---

### 5.5 `lib/api.ts` (EDIT)

CO2 관련 Mock API 함수 추가:

```typescript
// ─── ESG/CO2 API ───

export async function getShipmentCO2Data(): Promise<{
  shipments: ShipmentListItem[];
  totalCO2: number;
  monthlyTrend: { month: string; value: number }[];
}> {
  await delay(400);
  const shipments = [...MOCK_SHIPMENTS];
  // 실제 계산은 lib/co2.ts에서 수행, 여기서는 데이터 전달만
  return {
    shipments,
    totalCO2: 0,  // 호출자가 lib/co2.ts로 계산
    monthlyTrend: [],
  };
}
```

> 참고: 실제 CO2 계산은 `lib/co2.ts`에서 수행. `api.ts`에는 단순 데이터 패스스루 함수만 추가하여 향후 실제 API 전환 시 인터페이스 호환성 확보.

---

### 5.6 `types.ts` (EDIT)

Section 3에서 정의한 타입들을 추가:

```typescript
// ─── ESG & CO2 Types ───
// (Section 3.1의 모든 인터페이스를 기존 types.ts 하단에 추가)
```

추가 위치: 기존 `InstantQuoteFormData` 아래.

---

## 6. Accessibility Specification

### 6.1 Chart Accessibility

모든 recharts 차트에 적용:

```typescript
// 차트 컨테이너
<div role="img" aria-label="월별 탄소 배출량 추이: 1월 4,500kg에서 6월 3,200kg으로 29% 감소">
  <ResponsiveContainer>
    <AreaChart data={monthlyData} /* ... */ />
  </ResponsiveContainer>
</div>
```

| 차트 | aria-label 패턴 |
|------|-----------------|
| 월별 추이 | "월별 탄소 배출량 추이: {최소월} {최소값}kg ~ {최대월} {최대값}kg" |
| 수단별 분석 | "운송 수단별 배출량: 해상 {값}kg, 항공 {값}kg" |
| ESG 레이더 | "ESG 점수: Environmental {값}점, Social {값}점, Governance {값}점" |

### 6.2 Keyboard Navigation

- **Tab 순서**: Header → ESG Score → Cards → Charts → Table → Simulator → Calculator → Offset → PDF
- **테이블**: `Tab` / `Shift+Tab`으로 행 이동, `Enter`로 상세 확장
- **시뮬레이터 드롭다운**: 표준 `<select>` 사용 (네이티브 키보드 지원)
- **CTA 버튼**: 모두 `<button>` 또는 `<Link>` (키보드 접근 가능)

### 6.3 Dark Mode

모든 신규 요소에 `dark:` variant 적용:

| 요소 | Light | Dark |
|------|-------|------|
| 카드 배경 | `bg-white` | `dark:bg-slate-900` |
| 카드 테두리 | `border-slate-200` | `dark:border-slate-800` |
| 텍스트 | `text-slate-900` | `dark:text-white` |
| 부제목 | `text-slate-500` | `dark:text-slate-400` |
| 그래디언트 (ESG) | `from-teal-500 to-emerald-600` | 동일 (어두운 배경에서도 눈에 띔) |
| 테이블 행 | `bg-white hover:bg-slate-50` | `dark:bg-slate-900 dark:hover:bg-slate-800` |

### 6.4 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| `< md` (mobile) | 카드 1열, 차트 풀폭, 테이블→카드 변환, 시뮬레이터 세로 배치 |
| `md ~ lg` (tablet) | 카드 2~3열, 차트 1열, 테이블 유지 |
| `> lg` (desktop) | 카드 3열, 차트 2열, 테이블 풀폭 |

---

## 7. Implementation Checklist

### Phase 1: ESG-1 (CO2 Engine)
- [ ] `types.ts`에 ESG/CO2 타입 추가
- [ ] `lib/co2.ts` 생성
  - [ ] `parseWeight()` 함수
  - [ ] `getRouteCO2PerKg()` 함수 (도시→국가코드 매핑 포함)
  - [ ] `calculateShipmentCO2()` 함수
  - [ ] `calculateAllShipmentsCO2()` 함수

### Phase 2: ESG-2 (Shipment-Level Tracking)
- [ ] `lib/co2.ts` 집계 함수
  - [ ] `aggregateMonthlyCO2()` 함수
  - [ ] `aggregateModeCO2()` 함수
- [ ] `lib/api.ts`에 `getShipmentCO2Data()` 추가
- [ ] `pages/Dashboard/Sustainability.tsx` — Shipment CO2 Table 섹션

### Phase 3: ESG-4 (ESG Score)
- [ ] `lib/co2.ts` — `calculateESGScore()` 함수
- [ ] `pages/Dashboard/Sustainability.tsx` — ESG Score Section (RadarChart)

### Phase 4: ESG-3 (Reduction Simulator)
- [ ] `lib/co2.ts` — `simulateReduction()` 함수
- [ ] `pages/Dashboard/Sustainability.tsx` — Simulator Section

### Phase 5: ESG-5 (Carbon Offset)
- [ ] `lib/co2.ts` — `calculateOffsetCost()` 함수
- [ ] `pages/Dashboard/Sustainability.tsx` — Offset Guide Section

### Phase 6: ESG-6 (Public Section)
- [ ] `components/ESGSection.tsx` 생성
- [ ] `pages/LandingPage.tsx` — ESGSection import + 삽입

### Phase 7: ESG-7 (Accessibility & Polish)
- [ ] 모든 차트에 `role="img"` + `aria-label`
- [ ] 테이블 접근성 (`caption`, `scope`, `aria-sort`)
- [ ] 키보드 네비게이션 검증
- [ ] 다크모드 전체 검증
- [ ] 반응형 모바일 검증
- [ ] PDF 버튼 → 토스트/alert
- [ ] DashboardHome ESG 위젯 고도화
- [ ] `npm run build` 에러 없이 통과

---

## 8. Dependencies

### Existing (수정 없음)
- `recharts` — AreaChart, BarChart + **RadarChart** (추가 import)
- `lucide-react` — Leaf, Ship, Plane, TrendingDown, Award, Target, Download 등
- `framer-motion` — AnimatePresence, motion
- `react-router-dom` — Link

### New Dependencies
- 없음 (모든 기능 기존 라이브러리로 구현 가능)

### recharts 추가 Import (RadarChart)
```typescript
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
```
> recharts는 이미 설치됨. RadarChart 컴포넌트는 recharts 패키지에 포함.

---

## 9. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sustainability.tsx 파일 크기 | Medium | 섹션별 인라인 컴포넌트 분리, 600줄 이내 유지 |
| CO2 데이터 정확도 오해 | Low | "참조용" 안내문, "GLEC Framework 참조" 표시 |
| RadarChart 번들 사이즈 | Low | recharts 내장 컴포넌트, 추가 설치 없음 |
| HK/FR 등 Tariff에 없는 국가 | Low | fallback 매핑 (HK→SG, FR→DE) + 기본값 |
| 모바일 차트 가독성 | Medium | 차트 높이 축소, 레이블 간소화, 가로 스크롤 |

---

## 10. Success Criteria

- [ ] `npm run build` 에러 없이 통과
- [ ] CO2 계산기가 Tariff Engine의 실제 `co2PerKg` 데이터를 사용
- [ ] 화물 12건 각각의 CO2 배출량이 테이블에 표시
- [ ] 항공 화물 선택 시 해상 전환 절감량 인터랙티브 계산
- [ ] ESG 레이더 차트에 E/S/G 점수 및 등급 표시
- [ ] 탄소 상쇄 안내 섹션 + 예상 비용 표시
- [ ] 랜딩 페이지에 ESG 소개 섹션 표시
- [ ] 모든 차트에 ARIA 대체 텍스트 적용
- [ ] 다크모드 전체 지원
- [ ] 모바일 반응형 정상 표시
