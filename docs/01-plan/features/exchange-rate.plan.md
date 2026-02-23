# Plan: exchange-rate

> Feature: 실시간 고시 환율 위젯 컴포넌트
> Created: 2026-02-23
> Status: Plan
> Priority: Medium

---

## 1. Overview

### 1.1 Background
물류 회사 마케팅 사이트에서 고객이 수출입 관련 환율 정보를 빠르게 참조할 수 있는 위젯이 필요하다. 관세청 및 은행 고시 환율을 참고할 수 있는 환율 위젯 컴포넌트로, 주요 4개 기축 통화(USD, EUR, JPY, CNY) 대 원화(KRW) 환율의 송금 보낼 때(TTS) 및 현찰 살 때 가격을 제공한다.

### 1.2 Current State
- `components/ExchangeRate.tsx`: 183줄, Mock 데이터 기반 환율 위젯 (이미 구현 완료)
- `App.tsx:72`: "무역 백과사전 & 리소스" 섹션 내 `<ExchangeRate />` 배치
- 4개 통화 카드 (USD, EUR, JPY, CNY), TTS/현찰 살 때 가격 표시
- 전일 대비 트렌드 뱃지 (상승: 빨강, 하락: 파랑)
- 새로고침 버튼 + 5분 자동 갱신
- 참조용 Mock 데이터 면책 문구 포함

### 1.3 Goal
기존 구현된 ExchangeRate 컴포넌트를 PDCA 사이클로 검증하여 UI/UX 완성도, 접근성, 다크 모드, 반응형 디자인의 품질을 보장한다.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 4개 기축 통화 (USD, EUR, JPY, CNY) 대 KRW 환율 표시 | Must | Done |
| FR-02 | 송금 보낼 때 (TTS) 환율 표시 | Must | Done |
| FR-03 | 현찰 살 때 환율 표시 | Must | Done |
| FR-04 | 전일 대비 상승/하락 트렌드 뱃지 (상승: 빨강, 하락: 파랑) | Must | Done |
| FR-05 | 변동폭 수치 표시 | Must | Done |
| FR-06 | 새로고침 버튼 (클릭 시 Mock 데이터 재생성) | Must | Done |
| FR-07 | 로딩 상태 표시 (RefreshCw 스피너) | Must | Done |
| FR-08 | 5분 자동 갱신 (setInterval) | Should | Done |
| FR-09 | 마지막 업데이트 시간 표시 (HH:MM:SS 기준) | Should | Done |
| FR-10 | Mock 데이터 면책 문구 (참조용 안내) | Must | Done |

### 2.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | 접근성: 새로고침 버튼 aria-label, 트렌드 뱃지 스크린 리더 지원 | Must |
| NFR-02 | 반응형: 1열(모바일) → 2열(태블릿) → 4열(데스크톱) | Must |
| NFR-03 | 다크 모드 완전 지원 | Must |
| NFR-04 | 기존 디자인 시스템 일관성 (라운드 카드, jways 색상) | Must |
| NFR-05 | framer-motion 애니메이션 (카드 등장, 데이터 갱신) | Must |
| NFR-06 | 숫자 포맷: 한국어 로케일, 소수점 2자리 | Must |

---

## 3. Scope

### 3.1 In Scope
- ExchangeRate 컴포넌트 UI/UX 검증
- Mock 데이터 생성 로직 (generateMockRates)
- Rate 타입 정의 (현재 컴포넌트 내부)
- 트렌드 뱃지 UI (상승/하락/보합)
- 새로고침 상호작용 및 로딩 상태
- 다크 모드/반응형/접근성 검증
- "무역 백과사전 & 리소스" 섹션 내 배치

### 3.2 Out of Scope
- 실제 환율 API 연동 (관세청 API, 은행 API)
- 환율 변환 계산기 기능
- 환율 히스토리 차트/그래프
- 통화 추가/제거 커스터마이징
- 환율 알림/알람 기능

---

## 4. Technical Context

### 4.1 Affected Files
| File | Change Type |
|------|-------------|
| `components/ExchangeRate.tsx` | Existing (183줄) — 검증 및 필요시 개선 |
| `types.ts` | Minor — Rate 타입을 types.ts로 이동 고려 |
| `App.tsx` | None — 이미 배치 완료 (L72) |

### 4.2 Dependencies
- `react` (19.x) — useState, useEffect
- `framer-motion` (12.x) — AnimatePresence, motion.div
- `lucide-react` — RefreshCw, TrendingUp, TrendingDown, DollarSign, Euro, Banknote, Clock, ArrowRightLeft

### 4.3 Component Architecture

```
App.tsx
  └─ "무역 백과사전 & 리소스" section (L65-78)
       ├─ ExchangeRate       ← 환율 위젯
       ├─ IncotermsGuide     ← 인코텀즈 가이드
       └─ LogisticsWiki      ← 물류 백과사전
```

### 4.4 데이터 모델

```typescript
interface Rate {
  id: string;           // 통화 코드 (USD, EUR, JPY, CNY)
  currency: string;     // 표시명 (JPY는 "JPY(100)")
  name: string;         // 한국어 이름
  tts: number;          // 전신환 매도율 (송금 보낼 때)
  cashBuy: number;      // 현찰 살 때
  trend: 'up' | 'down' | 'flat';  // 전일 대비 추세
  change: number;       // 변동폭
  icon: React.ElementType;  // lucide-react 아이콘
}
```

---

## 5. Success Criteria

| Criteria | Target |
|----------|--------|
| TypeScript 빌드 통과 | `npm run build` 에러 0 |
| 접근성 | aria-label, 키보드 탐색, 스크린 리더 |
| 반응형 | 1/2/4 컬럼 그리드 정상 |
| 다크 모드 | 모든 요소 정상 전환 |
| 환율 카드 4종 | USD, EUR, JPY, CNY 정상 표시 |
| TTS/현찰 | 두 가격 모두 정상 표시 |
| 트렌드 뱃지 | 상승(빨강)/하락(파랑) 구분 |
| 새로고침 | 클릭 시 데이터 갱신 + 로딩 애니메이션 |
| 애니메이션 | 카드 등장 stagger, 데이터 전환 |

---

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mock 데이터 범위 비현실적 | Low | 실제 환율 범위 기반 베이스 값 설정 (현재 적용 중) |
| Rate 타입 컴포넌트 내부 정의 | Low | types.ts 이동 시 import 변경 필요 |
| 접근성 검증 미비 | Medium | Design 문서에서 상세 접근성 요구사항 정의 |
| 5분 자동 갱신 메모리 릭 | Low | useEffect cleanup (현재 적용 중) |

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | Simple structure | ✅ |

> jways 프로젝트는 단일 SPA, `components/` 폴더 내 모든 컴포넌트 위치. 기존 패턴 유지.

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 데이터 소스 | 실제 API / Mock | Mock | UI 검증 우선, API는 Out of Scope |
| Rate 타입 위치 | 컴포넌트 내부 / types.ts | 컴포넌트 내부 유지 | 현재 ExchangeRate에서만 사용 |
| 통화 아이콘 | lucide-react / 국기 이미지 | lucide-react | 기존 아이콘 라이브러리 일관성 |
| 레이아웃 | 테이블 / 카드 그리드 | 카드 그리드 | 모바일 반응형, 기존 디자인 패턴 |

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`/pdca design exchange-rate`)
2. [ ] Gap 분석 실행
3. [ ] 필요 시 접근성/UI 개선

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-23 | Initial draft |
