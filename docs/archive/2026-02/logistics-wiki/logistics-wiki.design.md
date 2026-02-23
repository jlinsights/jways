# Design: Logistics Wiki

> PDCA Cycle #6 | Feature: logistics-wiki
> Created: 2026-02-23
> Plan Reference: `docs/01-plan/features/logistics-wiki.plan.md`

---

## 1. Component Overview

**File**: `components/LogisticsWiki.tsx`
**Type**: React Functional Component (단일 파일, self-contained)
**Props**: 없음 (독립 컴포넌트)
**위치**: App.tsx "무역 백과사전 & 리소스" 섹션 내 IncotermsGuide 아래 (L76)

## 2. Data Model

### 2.1 Interfaces

```typescript
interface WikiItem {
  term: string;
  def: string;
}

interface WikiCategory {
  category: string;
  items: WikiItem[];
}
```

### 2.2 wikiData (3개 카테고리, 10개 용어)

```typescript
const wikiData: WikiCategory[] = [
  {
    category: '해상 운송 기본 용어',
    items: [
      { term: 'FCL (Full Container Load)', def: '한 화주의 화물로 컨테이너 1개를 가득 채우는 운송 방식입니다. 단독으로 컨테이너를 사용하므로 화물 혼재 과정이 없어 비교적 안전하고 신속합니다.' },
      { term: 'LCL (Less than Container Load)', def: '컨테이너 1개를 채우기 부족한 소량 화물을 여러 화주의 화물과 혼재(Consolidation)하여 함께 운송하는 방식입니다. CBM 단위로 운임을 정산합니다.' },
      { term: 'B/L (Bill of Lading, 선하증권)', def: '운송인이 화물을 인수했다는 증명서이자, 목적지에서 화물을 인도받을 수 있는 권리를 나타내는 가장 중요한 유가증권입니다. 원본 B/L 외에 Surrendered B/L 방식도 많이 쓰입니다.' },
      { term: 'CBM (Cubic Meter)', def: '가로 1m x 세로 1m x 높이 1m의 부피. 해상 LCL 화물 운임을 산정하는 척도로 사용됩니다.' },
    ]
  },
  {
    category: '통관 및 관세청 연관',
    items: [
      { term: 'HS Code (품목분류번호)', def: '국제 통일 상품 분류 체계에 따라 무역 거래 상품을 숫자 코드로 분류한 것입니다. 관세율을 결정하고 수입 요건을 확인하는 핵심 기준이 됩니다.' },
      { term: '관부가세', def: '물품 수입 시 국가에 납부하는 세금입니다. 관세(일반적으로 물품가액+운임의 약 8%)와 부가가치세(관세가 포함된 과세가격의 10%)로 구성됩니다.' },
      { term: '통관 보류 (Customs Hold)', def: '수출입 신고 건에 대해 서류 미비, 품목 검사 필요 등의 사유로 세관에서 통관(결재)을 일시 정지하는 조치입니다.' },
    ]
  },
  {
    category: '주요 부대 비용 (Surcharges)',
    items: [
      { term: 'THC (Terminal Handling Charge)', def: '터미널 화물 처리비. 컨테이너가 터미널에 입고되어 선박에 싣기까지, 또는 하역되어 게이트를 나갈 때까지 발생하는 항만 하역 및 이동 비용입니다.' },
      { term: 'BAF (Bunker Adjustment Factor)', def: '유류할증료. 선박의 주 연료인 벙커유의 가격 변동에 따른 손실을 보전하기 위해 기본 운임 외에 부과하는 할증료입니다.' },
      { term: 'Demurrage & Detention', def: 'Demurrage(체화료): 컨테이너가 지정된 항만 터미널(CY) 내에서 무료 기간(Free Time)을 초과해 머무를 때 부과.\nDetention(지체료): CY 밖으로 반출한 빈 컨테이너를 무료 기간 내에 반납하지 않을 때 부과.' },
    ]
  }
];
```

**항목 수**: 카테고리 3개, 용어 총 10개 (4 + 3 + 3)

## 3. State Management

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [expandedItems, setExpandedItems] = useState<string[]>([]);
```

- **searchTerm**: 검색어 입력값 (string, 기본값 `''`)
- **expandedItems**: 펼쳐진 항목의 term 값 배열 (string[], 기본값 `[]`)
- **파생 값**: `filteredData` — useMemo로 최적화

### 3.1 Filter Logic (useMemo)

```typescript
const filteredData = useMemo(() => {
  if (!searchTerm.trim()) return wikiData;

  const termLower = searchTerm.toLowerCase();

  return wikiData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.term.toLowerCase().includes(termLower) ||
      item.def.toLowerCase().includes(termLower)
    )
  })).filter(category => category.items.length > 0);
}, [searchTerm]);
```

### 3.2 Toggle Logic

```typescript
const toggleItem = (term: string) => {
  setExpandedItems(prev =>
    prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
  );
};
```

### 3.3 Expanded State 판정

```typescript
const isExpanded = expandedItems.includes(item.term) || searchTerm.trim().length > 0;
```

- 수동 토글 OR 검색어 입력 시 자동 펼침

## 4. UI Structure (Section-by-Section)

### 4.1 Root Container

```
<div> — 루트 컨테이너
  ├── className: "bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
  ├── 카드 형태 (rounded-3xl, shadow-xl)
  └── 다크모드 대응 (dark:bg-slate-900, dark:border-slate-800)
```

### 4.2 Header Section (gradient 배경)

```
<div> — 헤더 섹션
  ├── className: "bg-gradient-to-br from-indigo-600 to-purple-600 p-6 md:p-8 text-white relative"
  ├── 배경: indigo-600 → purple-600 gradient (대각선 br)
  │
  ├── [데코] 블러 원형 장식
  │   └── "absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
  │
  └── [콘텐츠] z-10 relative
      ├── [상단] 아이콘 + 제목 영역
      │   ├── 레이아웃: "flex items-center gap-3 mb-4"
      │   ├── 아이콘 박스: "w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-indigo-100"
      │   │   └── <BookOpen size={20} />
      │   ├── 제목: "물류 백과사전 & FAQ" (text-xl md:text-2xl, font-bold)
      │   └── 부제: "헷갈리는 무역 용어를 쉽게 검색해 보세요." (text-indigo-200, text-sm, mt-0.5)
      │
      └── [하단] 검색 입력 필드
          ├── 컨테이너: "relative mt-6 max-w-xl"
          ├── 아이콘: <Search size={18} /> — "absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"
          └── <input>
              ├── type: "text"
              ├── placeholder: "FCL, 적하보험, 관세 등 검색어 입력..."
              ├── value: {searchTerm}
              ├── onChange: (e) => setSearchTerm(e.target.value)
              └── className: "w-full bg-white/10 border border-white/20 hover:border-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder:text-indigo-200/70 rounded-2xl py-3 pl-12 pr-4 transition-all"
```

### 4.3 Content Section (스크롤 영역)

```
<div> — 콘텐츠 영역
  ├── className: "p-6 md:p-8 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950"
  │
  ├── [검색 결과 없음 상태]
  │   └── <div className="text-center py-12">
  │       └── <p className="text-slate-500 dark:text-slate-400">
  │           "{searchTerm}"에 대한 검색 결과가 없습니다.
  │
  └── [검색 결과 있음]
      └── <div className="space-y-8">
          └── (카테고리 반복)
```

### 4.4 Category Section (카테고리 헤더)

```
<div> — 카테고리 블록
  ├── key: {cIdx}
  ├── className: "space-y-4"
  │
  ├── <h4> — 카테고리 헤더
  │   ├── className: "text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2"
  │   ├── <Hash size={16} className="text-jways-blue" />
  │   └── {category.category}
  │
  └── <div className="space-y-3"> — 용어 아이템 리스트
```

### 4.5 Wiki Item (아코디언 항목)

```
<div> — 용어 아이템
  ├── key: {item.term}
  ├── className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all hover:border-jways-blue/30"
  │
  ├── <button> — 토글 버튼
  │   ├── onClick: () => toggleItem(item.term)
  │   ├── className: "w-full flex items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jways-blue/50"
  │   │
  │   ├── [용어명] <span>
  │   │   └── className: "font-bold text-slate-900 dark:text-white text-sm md:text-base pr-4"
  │   │   └── {item.term}
  │   │
  │   └── [화살표] <span>
  │       ├── className: "text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}"
  │       └── <ChevronDown size={18} />
  │
  └── <AnimatePresence>
      └── {isExpanded && (
          <motion.div>
            ├── initial: { height: 0, opacity: 0 }
            ├── animate: { height: 'auto', opacity: 1 }
            ├── exit: { height: 0, opacity: 0 }
            ├── transition: { duration: 0.2 }
            ├── className: "px-4 pb-4"
            │
            └── <div> — 정의 텍스트
                ├── className: "pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap leading-relaxed"
                └── {item.def}
          )}
```

## 5. Import Dependencies

```typescript
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, BookOpen, Hash } from 'lucide-react';
```

| Package | Used Elements |
|---------|--------------|
| react | React, useState, useMemo |
| framer-motion | motion, AnimatePresence |
| lucide-react | Search, ChevronDown, BookOpen, Hash |

## 6. Animation Specification

### 6.1 Accordion Expand/Collapse

| Property | Initial | Animate | Exit | Duration |
|----------|---------|---------|------|----------|
| height | 0 | auto | 0 | 0.2s |
| opacity | 0 | 1 | 0 | 0.2s |

### 6.2 ChevronDown Rotation

| State | Class | Value |
|-------|-------|-------|
| Collapsed | (none) | rotate(0deg) |
| Expanded | rotate-180 | rotate(180deg) |
| Transition | transition-transform duration-300 | 300ms |

## 7. Responsive Design

### 7.1 Breakpoint Strategy

| Breakpoint | Header Padding | Content Padding | Title Size | Term Size |
|-----------|:-------------:|:---------------:|:----------:|:---------:|
| Mobile (<768px) | p-6 | p-6 | text-xl | text-sm |
| Desktop (md+) | p-8 | p-8 | text-2xl | text-base |

### 7.2 Content Scroll

- **Max Height**: `max-h-[600px]`
- **Overflow**: `overflow-y-auto`
- **Scrollbar**: `custom-scrollbar` 클래스

## 8. Accessibility

### 8.1 Must Have

- [ ] 검색 입력에 `aria-label` 속성 (스크린 리더용 설명)
- [ ] 아코디언 버튼에 `aria-expanded` 속성 (펼침/접힘 상태)
- [ ] 아코디언 버튼에 `aria-controls` 속성 (제어 대상 id 참조)
- [ ] 아코디언 콘텐츠에 `id` 속성 (버튼의 aria-controls에 매핑)
- [ ] 아코디언 콘텐츠에 `role="region"` 속성

### 8.2 Should Have

- [ ] 검색 입력에 `role="searchbox"` 속성
- [ ] 검색 결과 업데이트 시 `aria-live="polite"` 알림 (결과 카운트 등)
- [ ] 카테고리 헤더에 `role="heading"` + `aria-level="4"` (이미 h4 태그지만 명시적)

### 8.3 Nice to Have

- [ ] Hash/ChevronDown 아이콘에 `aria-hidden="true"`
- [ ] Search 아이콘에 `aria-hidden="true"`

## 9. Dark Mode Color Map

| Element | Light | Dark |
|---------|-------|------|
| Root bg | bg-white | dark:bg-slate-900 |
| Root border | border-slate-100 | dark:border-slate-800 |
| Content bg | bg-slate-50 | dark:bg-slate-950 |
| Category title | text-slate-800 | dark:text-slate-200 |
| Category border | border-slate-200 | dark:border-slate-800 |
| Item bg | bg-white | dark:bg-slate-900 |
| Item border | border-slate-200 | dark:border-slate-800 |
| Term text | text-slate-900 | dark:text-white |
| Def text | text-slate-600 | dark:text-slate-400 |
| Def border | border-slate-100 | dark:border-slate-800 |
| No result text | text-slate-500 | dark:text-slate-400 |

## 10. Integration with App.tsx

```tsx
// App.tsx L8, L76
import LogisticsWiki from './components/LogisticsWiki';
// ...
<IncotermsGuide />
<LogisticsWiki />    // ← 이 위치
```

- 외부 props 없이 독립 동작
- 부모 섹션이 패딩/마진 처리 (`space-y-16`)
- 다크모드는 HTML root class로 전역 관리

## 11. Implementation Checklist

- [ ] `components/LogisticsWiki.tsx` 파일 존재
- [ ] WikiItem, WikiCategory 인터페이스 정의
- [ ] wikiData 상수 배열 정의 (3 카테고리, 10 용어)
- [ ] searchTerm 상태 관리 (기본값 '')
- [ ] expandedItems 상태 관리 (기본값 [])
- [ ] filteredData useMemo 필터링 로직
- [ ] toggleItem 함수
- [ ] Header 섹션 (gradient + 아이콘 + 제목 + 검색)
- [ ] Content 섹션 (max-h-[600px] 스크롤)
- [ ] Category 헤더 (Hash 아이콘 + 카테고리명)
- [ ] Wiki Item 아코디언 (버튼 + AnimatePresence)
- [ ] ChevronDown 회전 애니메이션
- [ ] 검색 결과 없음 상태
- [ ] Responsive 처리 (p-6/p-8, text-sm/text-base)
- [ ] Dark Mode 색상 매핑
- [ ] Accessibility 속성 부여
- [ ] App.tsx에 import 및 배치
