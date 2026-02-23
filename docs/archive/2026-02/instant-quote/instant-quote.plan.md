# Plan: Instant Quote Enhancement (빠른 운임 조회 고도화)

> PDCA Cycle #10 | Feature: `instant-quote`
> Created: 2026-02-24

## 1. Overview

기존 `/instant-quote` 페이지와 `QuoteModal` 컴포넌트를 고도화한다.
현재 InstantQuote 페이지는 기본 폼 + Mock 계산만 있고, QuoteModal은 3단계 위자드로 잘 구현되어 있다.
두 컴포넌트 간 연결이 끊어져 있고, UX 개선 여지가 크다.

**핵심 목표**:
1. InstantQuote 페이지를 **풀 기능 견적 도구**로 업그레이드
2. 견적 결과에서 **정식 견적 요청**(QuoteModal)으로 자연스럽게 연결
3. **운임 비교 기능** (해상 vs 항공 동시 비교)
4. **견적 이력 저장** (localStorage 기반)
5. **고급 Tariff Engine** (구간별 차등 요금, Incoterms 반영)
6. 접근성 및 반응형 완성도 향상

## 2. Background

### 현재 상태 (이미 존재하는 것)
- `pages/InstantQuote.tsx`: 2단계 폼 (입력 → 결과), Mock 요금 계산
  - 출발지/도착지, 중량/CBM, 운송 수단(해상/항공) 입력
  - Mock Tariff: `basePrice + (weight * multiplier) + (cbm * multiplier)`
  - 결과: 예상 운임($), 소요 시간, 탄소 배출량
  - "정식 견적 의뢰" 버튼 있으나 미연결
- `components/QuoteModal.tsx`: 3단계 위자드 (연락처 → 화물정보 → 검토)
  - 서비스 타입 4종 (항공/해상/육상/물류창고)
  - CBM 자동 계산, 운임중량/운임톤 표시
  - 폼 유효성 검증, 접근성(ARIA), Escape 키, 포커스 트랩
  - `LandingPage.tsx`와 `Quotes.tsx` 페이지에서 사용 중
- `types.ts`: `ServiceType`, `QuoteFormData`, `QuoteModalState` 정의됨
- `App.tsx`: `/instant-quote` 라우트 존재 (비인증 접근 가능)

### 없는 것 (구현 필요)
- 해상/항공 동시 비교 뷰
- 구간별 차등 요금 테이블 (주요 항로별)
- "정식 견적 의뢰" → QuoteModal 연결
- 견적 결과 공유/저장 기능
- 견적 이력 (최근 조회 기록)
- Incoterms 선택에 따른 비용 항목 분리
- 컨테이너 타입 선택 (20ft/40ft/40ft HC)
- 폼 유효성 검증 (현재 없음)
- 접근성 개선 (label, aria 속성 등)
- SEO/공유 메타 태그

## 3. Feature Items (7건)

### IQ-1: Advanced Tariff Engine (고급 요금 산출 엔진)
- **구현**: `lib/tariff.ts` — 구간별 차등 요금 데이터 + 계산 로직
- **주요 항로**: 부산↔LA, 부산↔상하이, 인천↔프랑크푸르트 등 10개
- **요금 구성**: 기본운임(Base) + 유류할증(BAF/FSC) + 터미널비(THC) + 서류비(Doc Fee)
- **Incoterms 반영**: FOB, CIF, DDP 등 선택 시 비용 항목 자동 조정
- **컨테이너 타입**: 20ft, 40ft, 40ft HC (해상 전용)
- **파일**: `lib/tariff.ts`

### IQ-2: Enhanced Quote Form (견적 폼 고도화)
- **컨테이너 타입 선택**: 해상 선택 시 컨테이너 옵션 표시
- **Incoterms 선택기**: FOB/CIF/DDP/EXW 드롭다운
- **자동완성 포트 검색**: 주요 항구/공항 검색 (Mock 데이터)
- **폼 유효성 검증**: 필수 필드 검사, 에러 메시지
- **파일**: `pages/InstantQuote.tsx`

### IQ-3: Side-by-Side Comparison (해상/항공 비교 뷰)
- **동시 비교**: 해상과 항공 견적을 나란히 표시
- **비교 항목**: 운임, 소요시간, 탄소배출, 비용 상세 내역
- **추천 뱃지**: 비용/시간/환경 기준 추천 표시
- **파일**: `pages/InstantQuote.tsx`

### IQ-4: Quote Result Enhancement (결과 페이지 고도화)
- **비용 상세 내역**: Breakdown 카드 (기본운임, BAF, THC, Doc Fee)
- **"정식 견적 의뢰" 연결**: QuoteModal 열기 + 폼 데이터 프리필
- **결과 공유**: URL 파라미터 기반 견적 공유 (쿼리스트링)
- **PDF 미리보기**: Mock PDF 다운로드 버튼 (토스트만)
- **파일**: `pages/InstantQuote.tsx`

### IQ-5: Quote History (견적 이력 관리)
- **localStorage 저장**: 최근 조회 10건 자동 저장
- **이력 목록**: 사이드 패널 또는 하단 섹션에 최근 조회 표시
- **재조회**: 이력 클릭 시 폼 자동 채움 + 재계산
- **삭제**: 개별/전체 삭제
- **파일**: `pages/InstantQuote.tsx`, `lib/tariff.ts`

### IQ-6: Accessibility & Validation (접근성 + 유효성)
- **ARIA 라벨**: 모든 input에 `label`, `aria-invalid`, `aria-describedby`
- **키보드 네비게이션**: Tab 순서, 운송 수단 라디오 그룹
- **에러 메시지**: `role="alert"`, 실시간 유효성 검사
- **로딩 상태**: `aria-busy`, 스피너 대체 텍스트
- **파일**: `pages/InstantQuote.tsx`

### IQ-7: UI Polish & Responsive (UI 정리 + 반응형)
- **모바일 최적화**: 비교 뷰 세로 스택, 이력 카드 축소
- **다크모드 완성**: 모든 신규 요소에 `dark:` 클래스
- **애니메이션**: framer-motion 트랜지션 개선
- **랜딩 페이지 연결**: Hero CTA → `/instant-quote` 링크 추가
- **Header 네비게이션**: `/instant-quote` 링크 추가
- **파일**: `pages/InstantQuote.tsx`, `components/Header.tsx`, `pages/LandingPage.tsx`

## 4. Affected Files

| File | Status | Items |
|------|--------|-------|
| `lib/tariff.ts` | **NEW** | IQ-1 |
| `pages/InstantQuote.tsx` | **REWRITE** | IQ-2, IQ-3, IQ-4, IQ-5, IQ-6, IQ-7 |
| `types.ts` | **EDIT** | IQ-1 (타입 추가) |
| `components/Header.tsx` | **EDIT** | IQ-7 (네비 링크) |
| `pages/LandingPage.tsx` | **EDIT** | IQ-7 (CTA 연결) |

## 5. Implementation Order

1. **IQ-1** (Tariff Engine) — 모든 계산의 기반
2. **IQ-2** (Enhanced Form) — 새 폼 구조 + 유효성
3. **IQ-6** (Accessibility) — IQ-2와 동시 적용
4. **IQ-3** (Comparison View) — 결과 영역의 핵심
5. **IQ-4** (Result Enhancement) — 상세 내역 + QuoteModal 연결
6. **IQ-5** (Quote History) — 보조 기능
7. **IQ-7** (UI Polish) — 마무리 + 연결

## 6. Success Criteria

- `npm run build` 에러 없이 통과
- Tariff Engine이 10개 주요 항로에 대해 차등 요금 산출
- 해상/항공 비교 뷰가 나란히 표시
- "정식 견적 의뢰" 클릭 시 QuoteModal 열림 + 데이터 프리필
- 견적 이력 localStorage에 저장/불러오기/삭제 동작
- 모든 input에 label + aria 속성 적용
- 모바일에서 세로 스택 레이아웃 정상 표시
- 다크모드 전체 지원

## 7. Technical Decisions

| 결정 | 선택 | 이유 |
|------|------|------|
| 요금 엔진 | `lib/tariff.ts` (Mock) | 백엔드 없음, 향후 API 교체 용이 |
| 포트 검색 | 하드코딩된 주요 포트 목록 | 외부 API 불필요 |
| 견적 이력 | localStorage | 인증 불요, 브라우저 로컬 저장 |
| 비교 뷰 | CSS Grid 2컬럼 | 간단하고 반응형 처리 용이 |
| Incoterms | 4종 (FOB, CIF, DDP, EXW) | 가장 빈번한 조건 |
| 컨테이너 | 3종 (20ft, 40ft, 40ft HC) | 업계 표준 |

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tariff 데이터 정확도 | Low | Mock 데이터 명시, 참조용 안내문 |
| InstantQuote 파일 크기 | Medium | 컴포넌트 분리 고려 (비교뷰, 이력 섹션) |
| QuoteModal 프리필 연동 | Low | 기존 `preSelectedService` 패턴 확장 |
| 포트 자동완성 UX | Low | 단순 필터링 목록 (복잡한 autocomplete 불필요) |

## 9. Out of Scope

- 실제 운임 API 연동 (Freightos, Xeneta 등)
- 결제/예약 기능
- 실시간 환율 적용 (고정 USD)
- 다국어 지원
- 서버사이드 견적 저장
