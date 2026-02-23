# Design: Incoterms Guide

> PDCA Cycle #5 | Feature: incoterms-guide
> Created: 2026-02-23
> Plan Reference: `docs/01-plan/features/incoterms-guide.plan.md`

---

## 1. Component Overview

**File**: `components/IncotermsGuide.tsx`
**Type**: React Functional Component (단일 파일, self-contained)
**Props**: 없음 (독립 컴포넌트)
**위치**: App.tsx "무역 백과사전 & 리소스" 섹션 내 ExchangeRate 아래, LogisticsWiki 위

## 2. Data Model

### 2.1 Steps (물류 프로세스 9단계)

```typescript
// 상수 배열, 컴포넌트 외부 정의
const steps = [
  { id: 'packaging', name: '수출지 포장', short: '포장' },
  { id: 'export_customs', name: '수출 통관', short: '수출통관' },
  { id: 'origin_inland', name: '수출지 내륙운송', short: '내륙운송' },
  { id: 'origin_port', name: '수출항 하역/선적', short: '수출항선적' },
  { id: 'main_carriage', name: '주 운송 (해상/항공)', short: '주운송' },
  { id: 'insurance', name: '적하 보험', short: '적하보험' },
  { id: 'dest_port', name: '수입항 하역', short: '수입항하역' },
  { id: 'import_customs', name: '수입 통관 및 관세', short: '수입통관' },
  { id: 'dest_inland', name: '수입지 내륙운송', short: '내륙운송' },
];
```

**항목 수**: 9개
**각 항목 필드**: `id` (고유 키), `name` (정식 명칭), `short` (모바일 약어)

### 2.2 IncotermsList (5개 Incoterms 조건)

```typescript
const incotermsList = [
  { code: 'EXW', name: 'Ex Works (공장인도조건)', desc: '...', sellerSteps: 1 },
  { code: 'FOB', name: 'Free On Board (본선적재인도조건)', desc: '...', sellerSteps: 4 },
  { code: 'CIF', name: 'Cost, Insurance and Freight (운임보험료포함조건)', desc: '...', sellerSteps: 6 },
  { code: 'DAP', name: 'Delivered At Place (도착장소인도조건)', desc: '...', sellerSteps: 7 },
  { code: 'DDP', name: 'Delivered Duty Paid (관세지급인도조건)', desc: '...', sellerSteps: 9 },
];
```

**각 항목 필드**:
- `code`: Incoterms 약칭 (3글자 대문자)
- `name`: 영문 정식 명칭 + 한국어 괄호 표기
- `desc`: 한국어 상세 설명 (매도인/매수인 책임 범위)
- `sellerSteps`: 수출자 부담 단계 수 (1~9, steps 배열 기준 인덱스)

### 2.3 DAP 특수 매트릭스

```typescript
const dapMatrix = [true, true, true, true, true, false, true, false, true];
```

**목적**: DAP 조건의 혼합 부담 상태 표현
- `true`: 수출자(Seller) 부담
- `false`: 수입자(Buyer) 부담 (index 5: 적하보험, index 7: 수입통관)

## 3. State Management

```typescript
const [selectedTerm, setSelectedTerm] = useState(incotermsList[1].code); // 기본값: 'FOB'
```

- **단일 상태**: `selectedTerm` (string)
- **파생 값**: `currentTermInfo = incotermsList.find(t => t.code === selectedTerm)`
- **외부 상태 의존**: 없음 (완전 독립)

## 4. UI Structure (Section-by-Section)

### 4.1 Root Container

```
<div> — 루트 컨테이너
  ├── className: "bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
  ├── 카드 형태 (rounded-3xl, shadow-xl)
  ├── 다크모드 대응 (dark:bg-slate-900, dark:border-slate-800)
  └── flex-col 레이아웃 (헤더 + 콘텐츠 수직 배치)
```

### 4.2 Header Section (gradient 배경)

```
<div> — 헤더 섹션
  ├── className: "bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white relative overflow-hidden"
  ├── 배경: slate-900 → slate-800 gradient
  │
  ├── [데코] 블러 원형 장식
  │   └── "absolute top-0 right-0 w-64 h-64 bg-jways-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
  │
  └── [콘텐츠] z-10 relative
      ├── 레이아웃: "flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      │
      ├── [좌측] 타이틀 영역
      │   ├── 아이콘 배지: w-8 h-8 rounded-full, bg-jways-blue/20, FileText 아이콘 (size=16)
      │   ├── 레이블: "INCOTERMS 2020" (text-sm, font-semibold, tracking-wider, text-blue-200)
      │   ├── 제목: "무역 조건 가이드" (text-2xl md:text-3xl, font-bold)
      │   └── 설명: "수출자와 수입자 간의..." (text-slate-400, max-w-xl, text-sm md:text-base)
      │
      └── [우측] Incoterms 탭 버튼 그룹
          ├── 컨테이너: "flex flex-wrap gap-2 md:justify-end"
          └── 각 버튼 (5개: EXW, FOB, CIF, DAP, DDP)
              ├── onClick: setSelectedTerm(term.code)
              ├── 활성 스타일: "bg-jways-blue border-jways-blue text-white shadow-lg shadow-blue-500/30 -translate-y-0.5"
              ├── 비활성 스타일: "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
              └── 공통: "px-4 py-2 rounded-xl text-sm font-bold transition-all border"
```

### 4.3 Content Section (AnimatePresence)

```
<div> — 콘텐츠 영역
  ├── className: "p-6 md:p-8 flex-1 bg-slate-50 dark:bg-slate-950"
  │
  └── <AnimatePresence mode="wait">
      └── <motion.div key={code}>
          ├── initial: { opacity: 0, y: 10 }
          ├── animate: { opacity: 1, y: 0 }
          ├── exit: { opacity: 0, y: -10 }
          ├── transition: { duration: 0.2 }
          └── className: "space-y-8"
```

### 4.4 Description Card (조건 설명)

```
<div> — 설명 카드
  ├── className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm"
  │
  └── <div> flex items-start gap-4
      ├── [아이콘] Info (size=24)
      │   └── w-12 h-12 rounded-full, bg-jways-blue/10 dark:bg-jways-blue/20, border border-jways-blue/20
      │
      └── [텍스트]
          ├── <h4> — "{code} ({name})"
          │   ├── code: text-lg md:text-xl, font-bold, text-slate-900 dark:text-white
          │   └── name: text-base, font-medium, text-slate-500 (괄호 내 표시)
          │
          └── <p> — desc (상세 설명)
              └── text-slate-600 dark:text-slate-400, text-sm md:text-base, leading-relaxed
```

### 4.5 Matrix Visualization (비용 분담 시각화)

#### 4.5.1 Scrollable Container

```
<div> — 스크롤 컨테이너
  ├── className: "overflow-x-auto pb-6 custom-scrollbar -mx-6 px-6 md:mx-0 md:px-0"
  └── 내부 최소 너비: min-w-[700px]
```

#### 4.5.2 Label Row (Seller/Buyer 레이블)

```
<div> — 레이블 행
  ├── className: "flex items-center justify-between mb-2 px-4"
  ├── 좌측: "수출자 (Seller) 부담구간" — text-sm font-bold text-jways-blue
  └── 우측: "수입자 (Buyer) 부담구간" — text-sm font-bold text-teal-600 dark:text-teal-400
```

#### 4.5.3 Progress Bar

```
<div> — 프로그레스 바 트랙
  ├── className: "relative h-6 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden mb-6 mx-4"
  │
  ├── [Seller 구간] absolute left-0
  │   ├── bg-jways-blue, transition-all duration-700 ease-in-out, z-10
  │   ├── width: DAP ? '100%' : `${(sellerSteps / 9) * 100}%`
  │   └── [데코] 대각선 스트라이프 패턴 (opacity-20, repeating-linear-gradient 45deg)
  │
  ├── [Buyer 구간] absolute right-0
  │   ├── bg-teal-500 dark:bg-teal-600, transition-all duration-700 ease-in-out
  │   └── width: DAP ? '100%' : `${((9 - sellerSteps) / 9) * 100}%`
  │
  └── [DAP 특수] 조건부 렌더링 (currentTermInfo.code === 'DAP')
      ├── 수입통관 구간: absolute right-0, w-[22.2%], bg-teal-500, z-20
      └── 적하보험 구간: absolute right-[44.4%], w-[11.1%], bg-teal-500, z-20
```

**프로그레스 바 너비 계산**:
| Incoterm | sellerSteps | Seller Width | Buyer Width |
|----------|:-----------:|:------------:|:-----------:|
| EXW | 1 | 11.1% | 88.9% |
| FOB | 4 | 44.4% | 55.6% |
| CIF | 6 | 66.7% | 33.3% |
| DAP | 7 | 100% (혼합) | 100% (혼합) |
| DDP | 9 | 100% | 0% |

#### 4.5.4 Steps Grid (9단계 그리드)

```
<div> — 스텝 그리드
  ├── className: "grid grid-cols-9 gap-2"
  │
  └── 각 step (9개)
      ├── 판정 로직:
      │   ├── DAP: dapMatrix[idx] 사용
      │   └── 그 외: idx < sellerSteps
      │
      ├── [아이콘 원형]
      │   ├── 크기: w-8 h-8 rounded-full
      │   ├── Seller: bg-jways-blue text-white ring-4 ring-blue-100 dark:ring-blue-900/30
      │   ├── Buyer: bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 ring-4 ring-teal-50 dark:ring-teal-900/20
      │   ├── Seller 아이콘: <Check size={14} strokeWidth={3} />
      │   └── Buyer 아이콘: <X size={14} strokeWidth={3} />
      │   └── transition-colors duration-500
      │
      ├── [구분선] idx < 8 일 때
      │   └── <ChevronRight> absolute -right-4 top-1, text-slate-300 dark:text-slate-700, size=12
      │
      └── [레이블]
          └── <p> step.short — text-[10px] md:text-xs, font-bold, text-slate-800 dark:text-slate-200, whitespace-pre-wrap
```

### 4.6 Disclaimer (면책 안내)

```
<div> — 면책 안내
  ├── className: "bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400"
  └── <ul> list-disc list-inside space-y-1
      ├── "실제 거래 시 당사자 간의 합의나 특약에 따라 위험 및 비용의 분기점이 변경될 수 있습니다."
      └── "본 표는 가장 대표적인 기준을 보여주는 인포그래픽이며 법적 효력을 갖지 않습니다."
```

## 5. Import Dependencies

```typescript
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, FileText, ChevronRight, Check, X } from 'lucide-react';
```

| Package | Used Elements |
|---------|--------------|
| react | React, useState |
| framer-motion | motion, AnimatePresence |
| lucide-react | Info, FileText, ChevronRight, Check, X |

## 6. Animation Specification

### 6.1 Content Transition (탭 전환)

| Property | Initial | Animate | Exit | Duration |
|----------|---------|---------|------|----------|
| opacity | 0 | 1 | 0 | 0.2s |
| y | 10 | 0 | -10 | 0.2s |

- **Mode**: `AnimatePresence mode="wait"` (이전 애니메이션 완료 후 다음 시작)
- **Key**: `currentTermInfo.code` (조건 변경 시 리마운트)

### 6.2 Progress Bar Transition

| Property | Value |
|----------|-------|
| transition | all 700ms ease-in-out |

### 6.3 Step Icon Transition

| Property | Value |
|----------|-------|
| transition | colors 500ms |

## 7. Responsive Design

### 7.1 Breakpoint Strategy

| Breakpoint | Header Layout | Matrix | Padding |
|-----------|---------------|--------|---------|
| Mobile (<768px) | flex-col, items-start | overflow-x-auto (min-w-[700px]) | p-6 |
| Desktop (md+) | flex-row, items-end | 풀 너비 표시 | p-8 |

### 7.2 Mobile Adaptations

- **헤더**: 세로 배치 (제목 위, 탭 아래)
- **매트릭스**: 가로 스크롤 (`overflow-x-auto`, `-mx-6 px-6`)
- **스텝 레이블**: `text-[10px]` 축소, `short` 필드 사용
- **설명 카드**: `p-5` 축소 패딩

## 8. Accessibility

### 8.1 Must Have

- [ ] Incoterms 탭 버튼에 `role="tab"` 속성
- [ ] 탭 그룹 컨테이너에 `role="tablist"` 속성
- [ ] 활성 탭에 `aria-selected="true"` 속성
- [ ] 콘텐츠 영역에 `role="tabpanel"` 속성
- [ ] 탭패널에 `aria-labelledby` 연결 (활성 탭 버튼 id 참조)

### 8.2 Should Have

- [ ] Steps 그리드 각 항목에 `aria-label` (수출자/수입자 부담 여부 포함)
- [ ] 프로그레스 바에 `role="img"` + `aria-label` (현재 비용 분담 비율 설명)
- [ ] Check/X 아이콘에 `aria-hidden="true"` (시각적 보조, 텍스트로 대체)

### 8.3 Nice to Have

- [ ] 키보드 화살표 (← →) 로 탭 간 이동
- [ ] 면책 안내에 `role="note"` 속성

## 9. Dark Mode Color Map

| Element | Light | Dark |
|---------|-------|------|
| Root bg | bg-white | dark:bg-slate-900 |
| Root border | border-slate-100 | dark:border-slate-800 |
| Content bg | bg-slate-50 | dark:bg-slate-950 |
| Card bg | bg-white | dark:bg-slate-900 |
| Card border | border-slate-200 | dark:border-slate-800 |
| Title text | text-slate-900 | dark:text-white |
| Body text | text-slate-600 | dark:text-slate-400 |
| Step label | text-slate-800 | dark:text-slate-200 |
| Buyer label | text-teal-600 | dark:text-teal-400 |
| Buyer icon bg | bg-teal-100 | dark:bg-teal-900/40 |
| Buyer ring | ring-teal-50 | dark:ring-teal-900/20 |
| Seller ring | ring-blue-100 | dark:ring-blue-900/30 |
| Progress track | bg-slate-200 | dark:bg-slate-800 |
| Buyer bar | bg-teal-500 | dark:bg-teal-600 |
| Chevron | text-slate-300 | dark:text-slate-700 |
| Disclaimer bg | bg-slate-100 | dark:bg-slate-800/50 |
| Disclaimer text | text-slate-500 | dark:text-slate-400 |
| Info icon bg | bg-jways-blue/10 | dark:bg-jways-blue/20 |

## 10. Integration with App.tsx

```tsx
// App.tsx L74 - "무역 백과사전 & 리소스" 섹션 내부
<ExchangeRate />
<IncotermsGuide />    // ← 이 위치
<LogisticsWiki />
```

- 외부 props 없이 독립 동작
- 부모 섹션이 패딩/마진 처리 (`space-y-16`)
- 다크모드는 HTML root class로 전역 관리

## 11. Implementation Checklist

- [ ] `components/IncotermsGuide.tsx` 파일 생성
- [ ] steps 상수 배열 정의 (9단계)
- [ ] incotermsList 상수 배열 정의 (5개 조건)
- [ ] dapMatrix 상수 배열 정의
- [ ] selectedTerm 상태 관리 (기본값 FOB)
- [ ] Header 섹션 (gradient + 타이틀 + 탭 버튼)
- [ ] Description Card (Info 아이콘 + 조건 설명)
- [ ] Progress Bar (Seller/Buyer 비율 시각화)
- [ ] DAP 특수 처리 (혼합 구간)
- [ ] Steps Grid (9칸 그리드 + Check/X 아이콘)
- [ ] AnimatePresence 전환 애니메이션
- [ ] Disclaimer 면책 안내
- [ ] Responsive 처리 (모바일 가로 스크롤)
- [ ] Dark Mode 색상 매핑
- [ ] Accessibility 속성 부여
- [ ] App.tsx에 import 및 배치
