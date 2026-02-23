# Plan: Incoterms Guide

> PDCA Cycle #5 | Feature: incoterms-guide
> Created: 2026-02-23

## 1. Overview

Jways 물류 마케팅 SPA의 "무역 백과사전 & 리소스" 섹션에 Incoterms 2020 가이드 위젯을 구현한다. 수출자/수입자 간 비용 및 위험 분기점을 시각적으로 표현하여 화주(shipper) 고객이 무역 조건을 쉽게 이해할 수 있도록 한다.

## 2. Problem Statement

- 물류 업계 고객의 상당수가 Incoterms 조건별 비용/위험 분기점을 정확히 이해하지 못함
- 기존 텍스트 기반 설명으로는 직관적인 이해가 어려움
- Jways 웹사이트에 교육적이면서도 마케팅 가치가 있는 인터랙티브 콘텐츠 필요

## 3. Goals

### Primary Goals
- [ ] Incoterms 2020 주요 5개 조건(EXW, FOB, CIF, DAP, DDP) 시각적 가이드 제공
- [ ] 수출자/수입자 비용 부담 구간을 직관적 매트릭스로 표현
- [ ] 각 조건별 설명과 함께 9단계 물류 프로세스 시각화

### Secondary Goals
- [ ] 다크모드 지원
- [ ] 반응형 레이아웃 (모바일/태블릿/데스크톱)
- [ ] framer-motion 애니메이션으로 부드러운 전환 효과

## 4. Target Users

| User Type | Description | Needs |
|-----------|-------------|-------|
| 초보 화주 | 처음 수출입하는 중소기업 담당자 | Incoterms 기본 이해, 시각적 설명 |
| 경험 있는 화주 | 기존 거래 경험이 있는 무역 담당자 | 조건별 비교, 빠른 참조 |
| 영업팀 | Jways 내부 직원 | 고객 상담 시 시각 자료로 활용 |

## 5. Functional Requirements

### FR-01: Incoterms 탭 선택 UI
- 5개 Incoterms 코드(EXW, FOB, CIF, DAP, DDP) 버튼 표시
- 클릭 시 해당 조건으로 전환
- 활성 탭 시각적 구분 (jways-blue 배경, 그림자 효과)

### FR-02: 조건 설명 카드
- 선택된 Incoterms의 정식 명칭 (영문 + 한국어)
- 해당 조건의 상세 설명 (한국어)
- Info 아이콘과 함께 카드 형태로 표시

### FR-03: 물류 프로세스 9단계 시각화
- 포장 → 수출통관 → 수출지 내륙운송 → 수출항 선적 → 주운송 → 적하보험 → 수입항 하역 → 수입통관 → 수입지 내륙운송
- 각 단계별 수출자(Seller)/수입자(Buyer) 부담 여부 표시
- Check/X 아이콘으로 직관적 구분

### FR-04: 비용 부담 프로그레스 바
- 수출자 부담구간: jways-blue (파란색)
- 수입자 부담구간: teal (청록색)
- 조건 변경 시 애니메이션 전환

### FR-05: DAP 조건 특수 처리
- DAP는 보험과 수입통관이 수입자 부담이지만 나머지는 수출자 부담
- dapMatrix 배열로 혼합 상태 시각화
- 프로그레스 바에 혼합 구간 표시

### FR-06: 애니메이션 전환
- AnimatePresence + motion으로 조건 변경 시 부드러운 전환
- opacity + y축 슬라이드 효과
- duration: 0.2s

### FR-07: 카드 헤더
- gradient 배경 (slate-900 → slate-800)
- INCOTERMS 2020 레이블 + FileText 아이콘
- "무역 조건 가이드" 제목 + 설명 텍스트

### FR-08: 면책 안내
- 하단에 법적 면책 문구
- 실제 거래 시 특약 가능성 안내
- 인포그래픽 법적 효력 없음 고지

## 6. Non-Functional Requirements

### NFR-01: Performance
- 컴포넌트 렌더링 < 100ms
- 탭 전환 애니메이션 < 300ms
- 불필요한 리렌더링 방지

### NFR-02: Responsive Design
- 모바일: 가로 스크롤 가능한 매트릭스 (min-width: 700px)
- 태블릿: 헤더 레이아웃 세로 배치
- 데스크톱: 헤더 가로 배치, 풀 매트릭스 표시

### NFR-03: Dark Mode
- Tailwind dark: 접두사 활용
- 배경/텍스트/보더 색상 다크모드 대응
- 프로그레스 바 및 아이콘 색상 대응

### NFR-04: Accessibility
- 키보드 접근성 (Tab, Enter로 조건 전환)
- 적절한 aria 속성 제공
- 색상 대비 충분한 텍스트 가독성

### NFR-05: Code Quality
- TypeScript strict 호환
- 컴포넌트 단일 파일 구조
- 데이터와 UI 분리 (steps, incotermsList 상수)

## 7. Technical Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS (CDN) |
| Animation | framer-motion |
| Icons | lucide-react |
| Build | Vite |

## 8. Component Architecture

```
components/
  IncotermsGuide.tsx    ← 단일 컴포넌트 (데이터 + UI)
```

### Data Structure
- `steps[]`: 9단계 물류 프로세스 정의
- `incotermsList[]`: 5개 Incoterms 조건 (code, name, desc, sellerSteps)
- `dapMatrix[]`: DAP 조건 특수 매트릭스 (boolean[9])

### State Management
- `selectedTerm`: 현재 선택된 Incoterms 코드 (기본값: 'FOB')

## 9. Integration Points

- **App.tsx**: "무역 백과사전 & 리소스" 섹션 내 ExchangeRate와 LogisticsWiki 사이에 배치
- **다크모드**: Header 컴포넌트의 테마 토글과 연동 (Tailwind class strategy)
- **디자인 시스템**: jways.blue, jways.navy 커스텀 색상 활용

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 모바일에서 9단계 매트릭스 가독성 | Medium | 가로 스크롤 + 약어(short) 사용 |
| Incoterms 2020 정보 정확성 | High | ICC 공식 자료 기반, 면책 문구 표시 |
| DAP 혼합 상태 시각화 복잡성 | Medium | dapMatrix 배열로 명확한 데이터 분리 |

## 11. Success Criteria

- [ ] 5개 Incoterms 조건 모두 정확하게 시각화
- [ ] 모바일/태블릿/데스크톱 반응형 동작
- [ ] 다크모드 완벽 지원
- [ ] 빌드 에러 없이 통과
- [ ] Gap Analysis Match Rate >= 90%
