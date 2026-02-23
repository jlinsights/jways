# Plan: milestone-tracking

> Feature: 화물 운송 마일스톤 트래킹 고도화
> Created: 2026-02-22
> Status: Plan
> Priority: High

---

## 1. Overview

### 1.1 Background
물류 운송에서 고객은 화물이 현재 어떤 단계에 있는지, 다음 단계까지 얼마나 걸리는지 실시간으로 파악하고 싶어한다. 현재 Tracking 컴포넌트는 기본적인 검색 + 타임라인 + 지도 기능을 갖추고 있으나, 마일스톤 데이터가 하드코딩되어 있고 세부 정보가 부족하다.

### 1.2 Current State
- `components/Tracking.tsx`: 검색 UI + 타임라인 + 에러 처리 구현 완료
- `components/ShipmentMap.tsx`: SVG 기반 지도 + 경로 애니메이션 + 툴팁 완료
- `types.ts`: `TrackingStep`, `GeoLocation`, `ShipmentData` 타입 정의 완료
- Mock 데이터(`MOCK_SHIPMENT`): 5단계 고정, 단일 운송장(JW-8839-KR)만 지원
- 다크 모드, framer-motion 애니메이션 적용됨

### 1.3 Goal
기존 Tracking 시스템을 물류 업계 표준 마일스톤 체계로 고도화하여, 고객이 화물 상태를 직관적으로 파악할 수 있도록 한다.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 검색 UI + 결과 표시 | Must | Done |
| FR-02 | SVG 지도 + 경로 애니메이션 | Must | Done |
| FR-03 | 타임라인 step 표시 (completed/current/pending) | Must | Done |
| FR-04 | 에러/로딩 상태 처리 | Must | Done |
| FR-05 | 마일스톤 카테고리 분류 (출발/운송/통관/도착) | Should | Pending |
| FR-06 | 각 마일스톤별 예상 소요 시간(ETA) 표시 | Should | Pending |
| FR-07 | 전체 진행률 퍼센트 + 프로그레스 바 고도화 | Should | Pending |
| FR-08 | 마일스톤 상세 정보 펼침/접기 (expandable) | Should | Pending |
| FR-09 | 다중 운송장 Mock 데이터 (해상/항공 시나리오) | Should | Pending |
| FR-10 | 운송 모드별 마일스톤 템플릿 (Air vs Sea) | Could | Pending |
| FR-11 | 마일스톤 경과 시간 표시 (N일 전, N시간 전) | Could | Pending |

### 2.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | 접근성: aria-label, 키보드 탐색, 스크린 리더 | Must |
| NFR-02 | 반응형: 320px ~ 1440px | Must |
| NFR-03 | 다크 모드 완전 지원 | Must |
| NFR-04 | 기존 디자인 시스템 일관성 (jways 색상, 라운드 카드) | Must |
| NFR-05 | 타임라인 애니메이션 유지 (framer-motion) | Must |

---

## 3. Scope

### 3.1 In Scope
- TrackingStep 타입 확장 (카테고리, ETA, 상세 정보)
- 마일스톤 카테고리 기반 시각적 그룹핑
- 마일스톤별 ETA 및 경과 시간 표시
- 상세 정보 expand/collapse
- 다중 Mock 시나리오 (해상/항공)
- 전체 진행률 프로그레스 바 고도화

### 3.2 Out of Scope
- 실제 운송사 API 연동 (추적 API)
- 푸시 알림/이메일 알림 시스템
- 사용자 인증 및 배송 이력 저장
- 실시간 WebSocket 연동

---

## 4. Technical Context

### 4.1 Affected Files
| File | Change Type |
|------|-------------|
| `types.ts` | Modify (TrackingStep 확장, 신규 타입 추가) |
| `components/Tracking.tsx` | Modify (마일스톤 그룹핑, ETA, 상세 펼침) |
| `components/ShipmentMap.tsx` | Minor (다중 시나리오 대응) |

### 4.2 Dependencies
- `react` (19.x) — 상태 관리, useEffect
- `framer-motion` (12.x) — 타임라인 애니메이션, expand/collapse
- `lucide-react` — 아이콘 (기존 + Anchor, Plane, FileCheck 등)
- Tailwind CSS (CDN) — 스타일링

### 4.3 Milestone Categories (물류 업계 표준)

**항공 운송 (Air Freight)**:
```
1. 화물 접수 (Pickup)
2. 출발지 터미널 처리 (Origin Terminal)
3. 수출 통관 (Export Customs)
4. 항공기 탑재/출발 (Flight Departure)
5. 경유지 처리 (Transit Hub) — optional
6. 도착지 입항 (Arrival)
7. 수입 통관 (Import Customs)
8. 배송 출발 (Out for Delivery)
9. 배송 완료 (Delivered)
```

**해상 운송 (Sea Freight)**:
```
1. 화물 접수 (Pickup)
2. CFS/CY 입고 (Container Loading)
3. 수출 통관 (Export Customs)
4. 선적/출항 (Vessel Departure)
5. 환적 (Transshipment) — optional
6. 도착항 입항 (Port Arrival)
7. 수입 통관 (Import Customs)
8. 내륙 운송 (Inland Transport)
9. 배송 완료 (Delivered)
```

---

## 5. Success Criteria

| Criteria | Target |
|----------|--------|
| TypeScript 빌드 통과 | `npm run build` 에러 0 |
| 접근성 | aria-label 완비, 키보드 네비게이션 |
| 반응형 | 모바일/태블릿/데스크톱 정상 |
| 다크 모드 | 모든 요소 정상 전환 |
| 마일스톤 카테고리 | Air/Sea 시나리오별 정상 표시 |
| ETA 표시 | 각 마일스톤 예상 시간 표시 |
| 애니메이션 | 기존 수준 유지 + expand/collapse 부드럽게 |

---

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 타임라인 UI 복잡도 증가 | Medium | 카테고리 그룹핑으로 시각적 정리 |
| Mock 데이터 다양화 시 하드코딩 증가 | Medium | 팩토리 함수로 시나리오 생성 |
| ShipmentMap 좌표 관리 복잡화 | Low | 기존 구조 유지, 좌표만 시나리오별 변경 |
| 마일스톤 expand 시 모바일 스크롤 이슈 | Medium | max-height + overflow-y-auto 유지 |
