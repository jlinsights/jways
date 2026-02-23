# exchange-rate Design Document

> **Summary**: 관세청/은행 고시 환율 참조용 위젯 (4개 기축 통화, Mock 데이터)
>
> **Project**: jways
> **Version**: 0.0.0
> **Date**: 2026-02-23
> **Status**: Draft
> **Planning Doc**: [exchange-rate.plan.md](../../01-plan/features/exchange-rate.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 4개 기축 통화(USD, EUR, JPY, CNY) 대 KRW 환율을 카드 그리드로 표시
- 송금 보낼 때(TTS)와 현찰 살 때 가격을 구분하여 제공
- 전일 대비 상승/하락 트렌드를 뱃지로 시각화
- Mock 데이터 기반 UI 시뮬레이션 (새로고침 시 랜덤 데이터 재생성)
- 기존 프로젝트 패턴과 완전 일관성 유지

### 1.2 Design Principles

- 기존 프로젝트 패턴 유지 (인라인 컴포넌트, Tailwind CDN, framer-motion)
- 모바일 우선 반응형 (1열 → 2열 → 4열)
- 다크 모드 완전 지원 (기존 dark: 접두사 패턴)
- 접근성 (aria-label, 키보드 탐색, 스크린 리더 지원)

---

## 2. Architecture

### 2.1 Component Diagram

```
App.tsx
  └─ "무역 백과사전 & 리소스" section (L65-78)
       ├─ ExchangeRate.tsx      ← 환율 위젯 (독립 컴포넌트)
       ├─ IncotermsGuide.tsx    ← 인코텀즈 가이드
       └─ LogisticsWiki.tsx     ← 물류 백과사전
```

### 2.2 Data Flow

```
컴포넌트 마운트
  → useEffect: fetchRates() 호출 + setInterval(300000ms) 등록
    → setIsLoading(true)
      → setTimeout(800ms): generateMockRates() 실행
        → setRates(mockData)
        → setLastUpdated(new Date())
        → setIsLoading(false)

새로고침 버튼 클릭
  → fetchRates() 호출
    → (동일 흐름)

언마운트
  → clearInterval(interval)
```

### 2.3 Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| react | 19.x | useState, useEffect |
| framer-motion | 12.x | AnimatePresence, motion.div (카드 등장 애니메이션) |
| lucide-react | - | RefreshCw, TrendingUp, TrendingDown, DollarSign, Euro, Banknote, Clock, ArrowRightLeft |

---

## 3. Data Model

### 3.1 Rate Interface (컴포넌트 내부 정의)

```typescript
interface Rate {
  id: string;                    // 통화 코드 ('USD', 'EUR', 'JPY', 'CNY')
  currency: string;              // 표시명 ('USD', 'EUR', 'JPY(100)', 'CNY')
  name: string;                  // 한국어 이름 ('미국 달러', '유로', '일본 엔', '중국 위안')
  tts: number;                   // 전신환 매도율 (송금 보낼 때)
  cashBuy: number;               // 현찰 살 때
  trend: 'up' | 'down' | 'flat'; // 전일 대비 추세
  change: number;                // 변동폭 (소수점 2자리)
  icon: React.ElementType;       // lucide-react 아이콘 컴포넌트
}
```

### 3.2 Mock Data Generation (generateMockRates)

```typescript
const generateMockRates = (): Rate[] => {
  const baseUSD = 1330 + Math.random() * 20;  // USD 기준 1330~1350원 범위
  return [
    { id: 'USD', currency: 'USD',      tts: baseUSD + 13.5,       cashBuy: baseUSD + 23.0,       icon: DollarSign },
    { id: 'EUR', currency: 'EUR',      tts: baseUSD*1.08 + 14.5,  cashBuy: baseUSD*1.08 + 25.0,  icon: Euro },
    { id: 'JPY', currency: 'JPY(100)', tts: baseUSD*0.67 + 8.5,   cashBuy: baseUSD*0.67 + 15.0,  icon: Banknote },
    { id: 'CNY', currency: 'CNY',      tts: baseUSD*0.14 + 2.5,   cashBuy: baseUSD*0.14 + 9.0,   icon: Banknote },
  ];
  // trend: Math.random() > 0.5 ? 'up' : 'down'
  // change: Math.random() * N (USD/EUR: 5, JPY: 3, CNY: 1)
};
```

### 3.3 Component State

```typescript
const [rates, setRates] = useState<Rate[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
```

---

## 4. UI/UX Design

### 4.1 Overall Layout

```
+-------------------------------------------------------------------+
|  [아이콘] 실시간 고시 환율                     [ 새로고침 ]        |
|           HH:MM:SS 기준                                           |
+-------------------------------------------------------------------+
|                                                                   |
|  +----------+  +----------+  +----------+  +----------+           |
|  |   USD    |  |   EUR    |  | JPY(100) |  |   CNY    |           |
|  | 미국달러 |  |   유로   |  | 일본 엔  |  | 중국위안 |           |
|  |    ▲2.31 |  |    ▼1.45 |  |    ▲0.87 |  |    ▼0.32 |           |
|  |          |  |          |  |          |  |          |           |
|  | TTS      |  | TTS      |  | TTS      |  | TTS      |           |
|  | 1,343.50 |  | 1,451.90 |  |   900.10 |  |   188.50 |           |
|  | -------- |  | -------- |  | -------- |  | -------- |           |
|  | 현찰살때 |  | 현찰살때 |  | 현찰살때 |  | 현찰살때 |           |
|  | 1,353.00 |  | 1,462.40 |  |   906.60 |  |   195.00 |           |
|  +----------+  +----------+  +----------+  +----------+           |
|                                                                   |
|  * 위 환율은 참조용 예상 (Mock) 데이터이며...                      |
+-------------------------------------------------------------------+
```

### 4.2 Header Section

```
┌─────────────────────────────────────────────────────────────────┐
│  px-6 py-5, border-b, bg-slate-50/50 dark:bg-slate-900/50      │
│  flex flex-col sm:flex-row justify-between                      │
│                                                                  │
│  ┌──────────────────────────┐     ┌──────────────────────┐      │
│  │ [w-10 h-10 rounded-xl]  │     │  새로고침 버튼        │      │
│  │ bg-teal-100              │     │  px-3 py-1.5          │      │
│  │ ArrowRightLeft(20)       │     │  rounded-lg           │      │
│  │                          │     │  border                │      │
│  │ h3: 실시간 고시 환율     │     │  RefreshCw(14)        │      │
│  │ (text-lg font-bold)      │     │  disabled:opacity-50  │      │
│  │ Clock(12) HH:MM:SS 기준 │     │  isLoading→animate-spin│      │
│  └──────────────────────────┘     └──────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

**Header Specs**:
- 아이콘 컨테이너: `w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400`
- 아이콘: `ArrowRightLeft` size={20}
- 제목: `h3`, `text-lg font-bold text-slate-900 dark:text-white`
- 시간: `Clock` size={12}, `text-xs text-slate-500 dark:text-slate-400 mt-0.5`
- 포맷: `toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })`
- 새로고침: `px-3 py-1.5 text-sm font-medium rounded-lg border`
- 로딩 중: `RefreshCw` + `animate-spin`, `disabled:opacity-50`

### 4.3 Currency Card

```
┌──────────────────────────────────────┐
│  p-4, rounded-2xl, border            │
│  bg-slate-50/50 dark:bg-slate-800/30 │
│                                       │
│  [아이콘] USD        [▲ 2.31]        │
│           미국 달러   (trend badge)   │
│                                       │
│  송금 보낼때 (TTS)                    │
│  1,343.50 KRW                        │
│  ─────────────────── (border-t)      │
│  현찰 살때                            │
│  1,353.00 KRW                        │
└──────────────────────────────────────┘
```

**Card Specs**:
- 컨테이너: `p-4 rounded-2xl border border-slate-100 dark:border-slate-800`
- 배경: `bg-slate-50/50 dark:bg-slate-800/30`
- 호버: `hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`
- 아이콘: `w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm border`
- 통화 코드: `font-bold text-slate-900 dark:text-white leading-tight`
- 통화 이름: `text-[10px] text-slate-500 dark:text-slate-400`

**Trend Badge**:
- 상승: `text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20` + `TrendingUp` size={12}
- 하락: `text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20` + `TrendingDown` size={12}
- 보합: `text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800`
- 컨테이너: `flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full`

**TTS Section**:
- 레이블: `text-[10px] font-semibold text-slate-400 uppercase tracking-wider`
- 텍스트: `"송금 보낼때 (TTS)"`
- 금액: `text-xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight`
- 단위: `text-xs text-slate-500` `"KRW"`
- 포맷: `toLocaleString('ko-KR', { minimumFractionDigits: 2 })`

**현찰 살때 Section**:
- 구분선: `pt-3 border-t border-slate-100 dark:border-slate-700/50`
- 레이블: `text-[10px] font-semibold text-slate-400 uppercase tracking-wider`
- 텍스트: `"현찰 살때"`
- 금액: `text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums tracking-tight`
- 단위: `text-[10px] text-slate-500` `"KRW"`

### 4.4 Disclaimer Footer

```
┌─────────────────────────────────────────────────────────────────┐
│  mt-6, flex items-start gap-2, text-xs                          │
│  bg-slate-50 dark:bg-slate-800/50, p-3, rounded-lg, border     │
│                                                                  │
│  * 위 환율은 참조용 예상 (Mock) 데이터이며, 실제 거래 시         │
│    거래 은행 및 관세청 고시환율과 차이가 있을 수 있습니다.       │
│    수출입 통관 시에는 관세청에서 고시하는 과세환율이 적용됩니다. │
└─────────────────────────────────────────────────────────────────┘
```

**Disclaimer Specs**:
- 컨테이너: `mt-6 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400`
- 배경: `bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800`
- 별표: `text-jways-blue font-bold`
- 줄바꿈: `<br className="hidden md:block"/>`

---

## 5. Animation Specifications

### 5.1 Card Entrance Animation

```typescript
// framer-motion AnimatePresence mode="popLayout"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, delay: idx * 0.1 }}  // stagger 0.1s per card
```

### 5.2 Refresh Button Loading

```
isLoading === true → RefreshCw className="animate-spin"
isLoading === true → button disabled={true}, opacity-50
```

---

## 6. Responsive Design

### 6.1 Grid Breakpoints

| Viewport | Columns | Class |
|----------|---------|-------|
| < 768px (모바일) | 1 | `grid-cols-1` |
| 768px~1023px (태블릿) | 2 | `md:grid-cols-2` |
| >= 1024px (데스크톱) | 4 | `lg:grid-cols-4` |

### 6.2 Header Responsive

| Viewport | Layout | Class |
|----------|--------|-------|
| < 640px (모바일) | 수직 (column) | `flex-col items-start` |
| >= 640px | 수평 (row) | `sm:flex-row sm:items-center` |

---

## 7. Dark Mode

### 7.1 Color Mapping

| Element | Light | Dark |
|---------|-------|------|
| 컨테이너 배경 | `bg-white` | `dark:bg-slate-900` |
| 컨테이너 테두리 | `border-slate-100` | `dark:border-slate-800` |
| 헤더 배경 | `bg-slate-50/50` | `dark:bg-slate-900/50` |
| 아이콘 배경 | `bg-teal-100` | `dark:bg-teal-900/30` |
| 아이콘 색상 | `text-teal-600` | `dark:text-teal-400` |
| 제목 텍스트 | `text-slate-900` | `dark:text-white` |
| 보조 텍스트 | `text-slate-500` | `dark:text-slate-400` |
| 새로고침 버튼 배경 | `bg-white` | `dark:bg-slate-800` |
| 새로고침 버튼 텍스트 | `text-slate-600` | `dark:text-slate-300` |
| 새로고침 버튼 테두리 | `border-slate-200` | `dark:border-slate-700` |
| 카드 배경 | `bg-slate-50/50` | `dark:bg-slate-800/30` |
| 카드 테두리 | `border-slate-100` | `dark:border-slate-800` |
| 카드 호버 | `hover:bg-slate-50` | `dark:hover:bg-slate-800` |
| 아이콘 원형 배경 | `bg-white` | `dark:bg-slate-700` |
| 아이콘 원형 텍스트 | `text-slate-700` | `dark:text-slate-300` |
| 아이콘 원형 테두리 | `border-slate-100` | `dark:border-slate-600` |
| TTS 금액 | `text-slate-900` | `dark:text-white` |
| 현찰 금액 | `text-slate-700` | `dark:text-slate-300` |
| 구분선 | `border-slate-100` | `dark:border-slate-700/50` |
| 상승 뱃지 | `text-red-600 bg-red-50` | `dark:text-red-400 dark:bg-red-900/20` |
| 하락 뱃지 | `text-blue-600 bg-blue-50` | `dark:text-blue-400 dark:bg-blue-900/20` |
| 면책 배경 | `bg-slate-50` | `dark:bg-slate-800/50` |
| 면책 테두리 | `border-slate-100` | `dark:border-slate-800` |

---

## 8. Accessibility

### 8.1 Required Accessibility Features

| Feature | Spec | Priority |
|---------|------|----------|
| 새로고침 버튼 | `aria-label="환율 정보 새로고침"` | Must |
| 트렌드 뱃지 | `aria-label` with 상승/하락/보합 텍스트 | Must |
| 카드 통화 | `role="group"` + `aria-label="USD 환율 정보"` | Should |
| 로딩 상태 | `aria-live="polite"` 영역 또는 로딩 알림 | Should |
| 시간 업데이트 | `aria-live="polite"` 또는 `aria-atomic="true"` | Should |
| 숫자 포맷 | `tabular-nums` (고정 폭 숫자, 시각적 정렬) | Must |

### 8.2 Keyboard Navigation

- 새로고침 버튼: Tab 포커스 가능, Enter/Space 실행
- 카드 내 상호작용 요소 없음 (읽기 전용 정보 표시)

---

## 9. File Change Specifications

### 9.1 Affected Files

| File | Lines | Change Type | Description |
|------|-------|-------------|-------------|
| `components/ExchangeRate.tsx` | 183 | Existing (검증 + 필요시 접근성 개선) | 환율 위젯 본체 |
| `App.tsx` | L72 | None | `<ExchangeRate />` 이미 배치 |
| `types.ts` | - | None | Rate 타입은 컴포넌트 내부 유지 |

### 9.2 Implementation Checklist

컴포넌트가 이미 구현되어 있으므로, Gap Analysis에서 다음 항목을 검증:

1. [x] Rate 타입 정의 (id, currency, name, tts, cashBuy, trend, change, icon)
2. [x] generateMockRates 함수 (4개 통화, 현실적 범위)
3. [x] fetchRates 함수 (loading state, setTimeout 800ms)
4. [x] useEffect (마운트 시 fetch + 5분 자동 갱신 + cleanup)
5. [x] Header section (아이콘, 제목, 시간, 새로고침 버튼)
6. [x] Currency card grid (1/2/4 컬럼 반응형)
7. [x] TTS + 현찰 살 때 가격 표시
8. [x] 트렌드 뱃지 (상승 빨강 / 하락 파랑)
9. [x] framer-motion 카드 등장 애니메이션
10. [x] 면책 문구
11. [ ] 접근성 (aria-label, aria-live 등) — Gap Analysis에서 검증
12. [x] 다크 모드
13. [x] 반응형

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| 컴포넌트 이름 | PascalCase (`ExchangeRate`) |
| 파일 이름 | PascalCase.tsx (`ExchangeRate.tsx`) |
| 상태 관리 | React useState (로컬 상태) |
| 아이콘 | lucide-react (프로젝트 기존 패턴) |
| 스타일 | Tailwind CSS CDN + dark: 접두사 |
| 애니메이션 | framer-motion (프로젝트 기존 패턴) |
| 타입 | 컴포넌트 내부 interface (단일 사용 컴포넌트) |
| Import 순서 | React → framer-motion → lucide-react |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-23 | Initial draft | Claude Code |
