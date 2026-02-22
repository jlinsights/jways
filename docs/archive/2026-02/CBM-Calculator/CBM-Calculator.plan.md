# Plan: CBM-Calculator

> Feature: 화물 부피(CBM) 및 운임 중량 계산기
> Created: 2026-02-22
> Status: Plan
> Priority: High

---

## 1. Overview

### 1.1 Background
물류 업계에서 CBM(Cubic Meter) 계산은 운임 산정의 핵심 요소이다. 고객이 화물의 가로/세로/높이와 중량을 입력하면 해상/항공 각각의 적용 운임 중량을 실시간으로 산출해주는 도구가 필요하다.

### 1.2 Current State
- `components/CBMCalculator.tsx` 기본 구현 완료
- `App.tsx`에 Tracking 섹션 바로 아래에 배치 (독립 section wrapper)
- 항공(1 CBM = 167 kg), 해상(1 CBM = 1,000 kg) 공식 적용
- 수량(quantity) 지원으로 다중 박스 계산 가능
- 다크 모드 지원

### 1.3 Goal
현재 기본 구현된 CBM 계산기를 물류 전문가 수준의 실용적 도구로 고도화한다.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | L/W/H(cm) + 중량(kg) + 수량 입력 | Must | Done |
| FR-02 | CBM(총 체적) 실시간 계산 | Must | Done |
| FR-03 | 항공 부피 중량 계산 (1 CBM = 167 kg) | Must | Done |
| FR-04 | 해상 운임톤(RT) 계산 (1 CBM = 1 M/T) | Must | Done |
| FR-05 | 적용 운임 중량 (실중량 vs 부피중량 중 큰 값) | Must | Done |
| FR-06 | 초기화(Reset) 기능 | Must | Done |
| FR-07 | 단위 변환 (cm/inch, kg/lbs) 토글 | Should | Pending |
| FR-08 | 다중 품목 행 추가/삭제 (여러 규격 동시 계산) | Should | Pending |
| FR-09 | 계산 결과 PDF/이미지 내보내기 | Could | Pending |
| FR-10 | framer-motion 애니메이션 적용 (결과 트랜지션) | Should | Pending |
| FR-11 | 입력값 유효성 검증 (음수 방지, 상한치) | Should | Partial |
| FR-12 | QuoteModal 연계 (계산 결과를 견적 요청에 자동 채움) | Could | Pending |

### 2.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | 접근성: 키보드 탐색, aria-label, 스크린 리더 호환 | Must |
| NFR-02 | 반응형: 모바일 320px ~ 데스크톱 1440px | Must |
| NFR-03 | 다크 모드 완전 지원 | Must |
| NFR-04 | 실시간 계산 (타이핑 즉시 반영, useEffect 기반) | Must |
| NFR-05 | 기존 디자인 시스템과 일관성 (jways 색상, 라운드 카드) | Must |

---

## 3. Scope

### 3.1 In Scope
- CBMCalculator 컴포넌트 품질 개선 (접근성, 애니메이션, 유효성 검증)
- 단위 변환 토글 추가
- 다중 품목 행 지원
- 결과 영역 애니메이션 적용
- types.ts에 CBM 관련 타입 정의 추가

### 3.2 Out of Scope
- 실제 운임 요율 조회 API 연동
- 사용자 계산 이력 저장 (localStorage/DB)
- 환율 연동 운임 추정

---

## 4. Technical Context

### 4.1 Affected Files
| File | Change Type |
|------|-------------|
| `components/CBMCalculator.tsx` | Modify (주요 변경) |
| `types.ts` | Modify (CBM 타입 추가) |
| `App.tsx` | None (이미 통합됨) |

### 4.2 Dependencies
- `react` (19.x) - 상태 관리, useEffect
- `framer-motion` (12.x) - 결과 애니메이션, 행 추가/삭제 전환
- `lucide-react` - 아이콘 (Calculator, RefreshCw, Box, Plus, Trash2)
- Tailwind CSS (CDN) - 스타일링

### 4.3 Calculation Formulas
```
CBM = (L cm * W cm * H cm) / 1,000,000 * Qty
Air Volume Weight = CBM * 167 (kg)
Air Chargeable Weight = MAX(Actual Weight, Air Volume Weight)
Sea Revenue Ton = MAX(CBM, Actual Weight / 1000)
```

---

## 5. Success Criteria

| Criteria | Target |
|----------|--------|
| TypeScript 빌드 통과 | `npm run build` 에러 0 |
| 접근성 | aria-label 완비, 키보드 네비게이션 |
| 반응형 | 모바일/태블릿/데스크톱 정상 |
| 다크 모드 | 모든 요소 정상 전환 |
| 계산 정확도 | 업계 표준 공식 일치 |
| 애니메이션 | 결과 변경 시 부드러운 전환 |

---

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 다중 품목 행 추가 시 성능 | Medium | 행 수 상한(예: 20) 설정 |
| 단위 변환 오류 가능성 | High | 변환 로직 단위 테스트 수준 검증 |
| framer-motion 번들 크기 증가 | Low | 이미 사용 중, 추가 비용 없음 |
