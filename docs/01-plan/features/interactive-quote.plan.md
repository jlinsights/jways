# Plan: interactive-quote

> Feature: 견적 요청 인터랙티브 위자드 고도화
> Created: 2026-02-23
> Status: Plan
> Priority: High

---

## 1. Overview

### 1.1 Background
현재 QuoteModal은 단일 폼 페이지에 11개 입력 필드가 나열되어 있다. 모바일에서 스크롤이 길어지고, 사용자가 필수/선택 항목을 구분하기 어렵다. 또한 Services 컴포넌트의 "서비스 문의하기" 버튼이 QuoteModal과 연결되지 않아, 사용자가 관심 서비스를 선택한 후에도 처음부터 폼을 작성해야 한다.

### 1.2 Current State
- `components/QuoteModal.tsx`: 단일 폼 모달 (468줄), 11개 필드, CBM 실시간 계산, 유효성 검증, 시뮬레이션 제출
- `components/Hero.tsx`: "견적 요청" 버튼 → QuoteModal 열기 (서비스 종류 미전달)
- `components/Services.tsx`: "서비스 문의하기" → Footer로 스크롤 (QuoteModal 미연결)
- 폼 완료까지 평균 스크롤 3회 이상 (모바일 기준)
- 사용자 이탈 포인트: 치수 입력 → 날짜 선택 구간

### 1.3 Goal
QuoteModal을 **3단계 인터랙티브 위자드**로 재구성하여 사용자 경험을 개선하고, Services 컴포넌트와 연동하여 서비스 종류를 자동 전달한다.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 기존 견적 폼 기능 유지 (이름, 이메일, 출발지, 도착지, 화물종류, 중량, 치수, 날짜, 메시지) | Must | Done |
| FR-02 | 실시간 CBM 계산 + 운임중량 표시 | Must | Done |
| FR-03 | 폼 유효성 검증 + 에러 메시지 | Must | Done |
| FR-04 | 성공 화면 표시 | Must | Done |
| FR-05 | 3단계 위자드 폼 (Step 1: 연락처+서비스, Step 2: 화물정보, Step 3: 검토+제출) | Should | Pending |
| FR-06 | 단계별 프로그레스 인디케이터 (현재 단계, 완료 단계, 남은 단계) | Should | Pending |
| FR-07 | 단계 간 앞/뒤 이동 (Back/Next 버튼) | Should | Pending |
| FR-08 | 서비스 종류 선택 UI (Air/Ocean/Land/Warehouse 카드형) | Should | Pending |
| FR-09 | Services 컴포넌트에서 서비스 종류 전달하여 QuoteModal 열기 | Should | Pending |
| FR-10 | Step 3: 견적 요약 카드 (입력 내용 시각적 정리) | Should | Pending |
| FR-11 | 단계 전환 애니메이션 (slide/fade) | Could | Pending |
| FR-12 | Step 1→2 전환 시 서비스 종류 미선택 경고 | Could | Pending |

### 2.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | 접근성: 각 단계별 aria-label, 키보드 탐색, 스크린 리더 | Must |
| NFR-02 | 반응형: 320px ~ 1440px (모바일 우선) | Must |
| NFR-03 | 다크 모드 완전 지원 | Must |
| NFR-04 | 기존 디자인 시스템 일관성 (jways 색상, 라운드 카드) | Must |
| NFR-05 | 기존 framer-motion 애니메이션 패턴 유지 | Must |
| NFR-06 | 모바일에서 각 단계 스크롤 없이 화면에 들어오기 | Should |

---

## 3. Scope

### 3.1 In Scope
- QuoteModal을 3단계 위자드로 재구성
- 프로그레스 인디케이터 (단계 표시바)
- 서비스 종류 선택 UI (카드형 4종)
- Step 3 견적 요약 프리뷰 카드
- Services → QuoteModal 서비스 종류 자동 전달
- 단계 전환 애니메이션 (framer-motion)
- Back/Next 네비게이션 + 단계별 유효성 검증

### 3.2 Out of Scope
- 실제 견적 API 연동 (백엔드)
- 견적 이력 저장/조회
- 파일 첨부 (화물 사진 등)
- 실시간 채팅 상담 연동
- 다국어 견적 폼 (현재 한국어+영어 병기만)

---

## 4. Technical Context

### 4.1 Affected Files
| File | Change Type |
|------|-------------|
| `components/QuoteModal.tsx` | Major modify (위자드 구조로 재구성) |
| `components/Hero.tsx` | Minor modify (서비스 종류 전달 prop) |
| `components/Services.tsx` | Minor modify (QuoteModal 연결) |
| `types.ts` | Minor modify (견적 관련 타입 추가) |
| `App.tsx` | Minor modify (QuoteModal 상태 App 레벨로 lift up) |

### 4.2 Dependencies
- `react` (19.x) — 상태 관리, useEffect
- `framer-motion` (12.x) — 단계 전환 애니메이션, AnimatePresence
- `lucide-react` — 아이콘 (Plane, Ship, Truck, Warehouse, ChevronLeft, ChevronRight, Check 등)
- Tailwind CSS (CDN) — 스타일링

### 4.3 위자드 단계 설계

**Step 1: 연락처 + 서비스 선택**
```
- 이름 (Name)
- 이메일 (Email)
- 서비스 종류 선택 (카드형 4종: Air/Ocean/Land/Warehouse)
```

**Step 2: 화물 정보**
```
- 출발지 (Origin)
- 도착지 (Destination)
- 화물 종류 (Cargo Type) — 기존 select
- 예상 중량 (Weight)
- 화물 규격 (Dimensions L×W×H)
- CBM 실시간 계산 (기존 유지)
- 희망 배송일 (Target Date)
```

**Step 3: 검토 + 제출**
```
- 견적 요약 카드 (모든 입력 내용 시각적 정리)
- 추가 요청사항 (Message) — textarea
- 제출 버튼
```

### 4.4 상태 관리 변경

**현재**: QuoteModal 내부 `isQuoteModalOpen` → Hero 컴포넌트에서 관리
**변경**: App 레벨로 `quoteModal` 상태 lift up (서비스 종류 전달을 위해)

```typescript
// App.tsx
const [quoteModal, setQuoteModal] = useState<{
  isOpen: boolean;
  preSelectedService?: 'air' | 'ocean' | 'land' | 'warehouse';
}>({ isOpen: false });
```

---

## 5. Success Criteria

| Criteria | Target |
|----------|--------|
| TypeScript 빌드 통과 | `npm run build` 에러 0 |
| 접근성 | 각 단계 aria-label, 키보드 네비게이션 |
| 반응형 | 모바일/태블릿/데스크톱 정상 |
| 다크 모드 | 모든 요소 정상 전환 |
| 위자드 3단계 | Step 1→2→3 정상 전환 |
| Back/Next | 양방향 이동 + 단계별 검증 |
| Services 연동 | 서비스 선택 후 QuoteModal 열기 시 자동 선택 |
| CBM 계산 | 기존 기능 유지 |
| 애니메이션 | 단계 전환 부드럽게 |

---

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| App 레벨 상태 lift up 시 기존 동작 깨짐 | High | Hero/Services prop 인터페이스 명확히 정의 |
| 위자드 전환 시 폼 데이터 유실 | Medium | 전체 formData를 최상위에서 관리 (단계별 분리 X) |
| 모바일에서 Step 1 카드 4개 레이아웃 | Medium | 2×2 그리드 + 작은 카드 사이즈 |
| Step 3 요약 카드 긴 콘텐츠 | Low | max-height + overflow-y-auto |
| Services 컴포넌트 "서비스 문의하기" 동작 변경 | Medium | Footer 스크롤 → QuoteModal 열기로 변경 (사용자 흐름 개선) |

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | Simple structure | ✅ |

> jways 프로젝트는 단일 SPA로 `components/` 폴더 내 모든 컴포넌트가 위치. 기존 패턴 유지.

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 위자드 구현 방식 | 별도 라이브러리 / 자체 구현 | 자체 구현 | 의존성 최소화, 프로젝트 규모에 적합 |
| 상태 관리 | QuoteModal 내부 / App lift up | App lift up | Services→QuoteModal 서비스 전달 필요 |
| 서브 컴포넌트 | 별도 파일 / 인라인 | 인라인 | 프로젝트 기존 패턴 (Tracking.tsx, CBMCalculator 등) |
| 단계 전환 | 조건부 렌더링 / AnimatePresence | AnimatePresence | framer-motion 기존 사용 패턴 |

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`/pdca design interactive-quote`)
2. [ ] 코드 리뷰 및 승인
3. [ ] 구현 시작

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-23 | Initial draft |
