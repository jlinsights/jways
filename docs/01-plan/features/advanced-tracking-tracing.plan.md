# Advanced Tracking & Tracing Planning Document

> **Summary**: 기존 화물 추적 시스템을 고도화하여 실시간 추적, 다중 화물 비교, ETA 예측, 문서 관리 기능 추가
>
> **Project**: Jways Logistics
> **Version**: 1.0.0
> **Author**: Claude Code (PDCA Cycle #7)
> **Date**: 2026-02-23
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

기존 Tracking.tsx(598줄)와 ShipmentMap.tsx(206줄)의 기본 추적 기능을 확장하여, 물류 고객이 필요로 하는 고급 추적 기능을 제공한다. 현재 Mock 데이터 기반의 단순 조회에서 벗어나 실시간 상태 업데이트, 다중 화물 비교 뷰, ETA 예측 표시, 관련 문서 조회를 포함한 통합 추적 경험을 구축한다.

### 1.2 Background

현재 구현 상태:
- **Tracking.tsx** (598줄): B/L No., Container No., Booking No. 검색, MilestoneRow 아코디언, 카테고리별 마일스톤 그룹핑(출발/운송/통관/도착), 알림 구독 버튼, 라이브 트래킹 인디케이터
- **ShipmentMap.tsx** (206줄): SVG 세계 지도, 애니메이션 경로, 마커 툴팁, 진행률 바
- **types.ts** (126줄): TrackingStep, ShipmentData, MilestoneCategory, GeoLocation 등 타입 정의
- Mock 데이터: 2건 (JW-8839-KR 항공, JW-2201-SEA 해상)

고도화 필요 사유:
1. 고객이 여러 화물을 동시에 추적/비교해야 하는 니즈
2. 도착 예정일(ETA) 정보가 부재하여 물류 계획 수립 어려움
3. B/L, Invoice, Packing List 등 관련 문서 연동 미비
4. 이벤트 히스토리의 타임라인 시각화 부족

### 1.3 Related Documents

- Tracking.tsx: `components/Tracking.tsx`
- ShipmentMap.tsx: `components/ShipmentMap.tsx`
- Type definitions: `types.ts`
- 이전 PDCA: milestone-tracking (Cycle #2, archived)

---

## 2. Scope

### 2.1 In Scope

- [ ] ETA 예측 표시 (예상 도착일 + 남은 시간 카운트다운)
- [ ] 다중 화물 비교 뷰 (최대 3건 병렬 비교)
- [ ] 이벤트 타임라인 시각화 (세로 타임라인 + 시간 간격 표시)
- [ ] 관련 문서 섹션 (B/L, Invoice, Packing List 목록)
- [ ] 지도 경로 향상 (경유지 표시, 현재 위치 애니메이션)
- [ ] 추적 상태 요약 대시보드 (진행률, 주요 상태, 지연 경고)

### 2.2 Out of Scope

- 실제 API 연동 (Mock 데이터 유지, 향후 별도 PDCA로 진행)
- 푸시 알림 백엔드 구현
- 모바일 앱 전용 UI
- 다국어(i18n) 지원 (한국어 단일)
- PDF 문서 뷰어 / 다운로드

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | ETA 예측 카드: 예상 도착일, D-day 카운트다운, 진행률 원형 차트 표시 | High | Pending |
| FR-02 | 다중 화물 비교: 최대 3건 선택, 병렬 마일스톤 타임라인 | High | Pending |
| FR-03 | 이벤트 타임라인: 세로 타임라인 UI, 시간 간격 시각화, 현재 단계 하이라이트 | High | Pending |
| FR-04 | 관련 문서 섹션: 문서 타입(B/L, Invoice, PL) 아이콘, 상태 뱃지(발행/미발행) | Medium | Pending |
| FR-05 | 지도 경유지 마커: 중간 경유 항구/공항 표시, 클릭 시 상세 정보 | Medium | Pending |
| FR-06 | 추적 대시보드 요약: 전체 진행률, 현재 단계, 지연 여부 경고 배너 | High | Pending |
| FR-07 | 운송 모드별 아이콘/색상 구분: 항공(파랑), 해상(초록), 복합(보라) | Low | Pending |
| FR-08 | 화물 상세 정보 확장 패널: 중량, 부피(CBM), 컨테이너 타입 표시 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 추적 화면 초기 렌더링 < 500ms | Chrome DevTools Performance |
| Performance | 다중 비교 뷰 전환 < 300ms (framer-motion 애니메이션 포함) | FPS 측정 |
| Accessibility | WCAG 2.1 AA 준수 (aria-label, role, keyboard navigation) | 수동 검증 + axe DevTools |
| Accessibility | 타임라인/차트 컴포넌트 스크린 리더 호환 | VoiceOver 테스트 |
| Responsiveness | 모바일(320px) ~ 데스크톱(1920px) 반응형 | 브라우저 리사이즈 테스트 |
| Bundle Size | 추가 컴포넌트로 인한 번들 증가 < 50KB | Vite build 분석 |
| Animation | 60fps 유지 (타임라인 스크롤, 지도 애니메이션) | Chrome DevTools FPS |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR(8개) 구현 완료
- [ ] NFR 성능/접근성/반응형 기준 충족
- [ ] framer-motion 애니메이션 60fps 유지
- [ ] 기존 Tracking.tsx 기능 회귀 없음
- [ ] 빌드 성공 (Vite build 에러 없음)

### 4.2 Quality Criteria

- [ ] WCAG 2.1 AA 접근성 준수
- [ ] 빌드 에러/경고 0건
- [ ] 모바일/태블릿/데스크톱 반응형 정상
- [ ] Gap Analysis match rate >= 90%

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Tracking.tsx 598줄 → 리팩토링 복잡도 | High | High | 서브 컴포넌트로 분리 (ETA, Timeline, Documents, Dashboard) |
| 다중 비교 뷰 성능 저하 | Medium | Medium | React.memo + useMemo로 불필요한 리렌더 방지 |
| SVG 지도에 경유지 추가 시 렌더링 부하 | Medium | Low | 경유지 수 최대 5개 제한 |
| framer-motion 애니메이션 충돌 | Low | Medium | AnimatePresence key 관리, layout 애니메이션 분리 |
| 기존 Mock 데이터 구조 변경으로 회귀 | High | Medium | 기존 ShipmentData 타입 확장(비파괴적 변경) |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | X |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | |

> Starter 레벨 유지. SPA 마케팅 사이트로 components/ 플랫 구조 적합.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | React 19 (Vite SPA) | React 19 | 기존 구조 유지 |
| State Management | useState / useReducer | useState | 컴포넌트 로컬 상태로 충분 |
| Styling | Tailwind CSS CDN | Tailwind CSS CDN | 기존 CDN 방식 유지 |
| Animation | framer-motion | framer-motion | 기존 사용 중, 풍부한 애니메이션 지원 |
| Icons | lucide-react | lucide-react | 기존 사용 중, 트리쉐이킹 지원 |
| Chart | SVG 직접 구현 | SVG 직접 구현 | 외부 차트 라이브러리 의존 없이 경량 유지 |

### 6.3 Clean Architecture Approach

```
Selected Level: Starter

컴포넌트 분리 계획:
┌─────────────────────────────────────────────────────┐
│ components/                                          │
│   ├── Tracking.tsx        (기존 - 메인 컨테이너)       │
│   ├── ShipmentMap.tsx     (기존 - 지도 시각화)         │
│   ├── TrackingDashboard.tsx (NEW - 요약 대시보드)      │
│   ├── ETACard.tsx          (NEW - ETA 예측 카드)      │
│   ├── EventTimeline.tsx    (NEW - 세로 타임라인)       │
│   ├── ShipmentDocuments.tsx (NEW - 관련 문서)         │
│   └── ShipmentCompare.tsx  (NEW - 다중 비교 뷰)      │
│                                                      │
│ types.ts                  (확장 - 새 인터페이스 추가)   │
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists
- [ ] `CONVENTIONS.md` exists at project root
- [ ] ESLint configuration — 없음 (Vite 기본)
- [ ] Prettier configuration — 없음
- [x] TypeScript configuration (`tsconfig.json`) — noEmit: true

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | PascalCase 컴포넌트, camelCase 변수 | 유지 | High |
| **Folder structure** | components/ 플랫 구조 | 신규 컴포넌트도 동일 위치 | High |
| **Import order** | 암묵적 | react → 외부 → 내부 → types 순서 | Medium |
| **Environment variables** | GEMINI_API_KEY | 추적 관련 추가 없음 | Low |
| **Error handling** | ErrorBoundary 사용 | 각 서브컴포넌트 에러 처리 추가 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `GEMINI_API_KEY` | Gemini AI (기존) | Client | 기존 |

> 추가 환경변수 불필요 (Mock 데이터 유지)

### 7.4 Pipeline Integration

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | N/A | — | — |
| Phase 2 (Convention) | N/A | — | — |

> Starter 레벨이므로 Pipeline 통합 불필요

---

## 8. Implementation Strategy

### 8.1 컴포넌트 구현 순서

```
Phase 1: 타입 확장 + Mock 데이터 보강
  └── types.ts에 ETA, Document, Waypoint 인터페이스 추가
  └── Mock 데이터에 ETA, documents, waypoints 필드 추가

Phase 2: 서브 컴포넌트 생성
  └── ETACard.tsx (FR-01)
  └── EventTimeline.tsx (FR-03)
  └── ShipmentDocuments.tsx (FR-04)
  └── TrackingDashboard.tsx (FR-06)

Phase 3: 기존 컴포넌트 확장
  └── ShipmentMap.tsx 경유지 마커 추가 (FR-05)
  └── Tracking.tsx 통합 + 다중 비교 로직 (FR-02)
  └── 운송 모드 아이콘/색상 정리 (FR-07)
  └── 화물 상세 패널 (FR-08)

Phase 4: 접근성 + 반응형 마무리
  └── ARIA 속성 전수 점검
  └── 키보드 네비게이션
  └── 모바일 반응형
```

### 8.2 Mock 데이터 확장 계획

```typescript
// types.ts 확장 예시
interface ETAInfo {
  estimatedArrival: string;  // ISO date
  confidence: 'high' | 'medium' | 'low';
  delayDays?: number;
  lastUpdated: string;
}

interface ShipmentDocument {
  type: 'bl' | 'invoice' | 'packing-list' | 'certificate';
  name: string;
  status: 'issued' | 'pending' | 'draft';
  date?: string;
}

interface Waypoint {
  name: string;
  code: string;
  location: GeoLocation;
  arrivalDate?: string;
  departureDate?: string;
}

// ShipmentData 확장 (비파괴적)
interface ShipmentData {
  // ... 기존 필드
  eta?: ETAInfo;
  documents?: ShipmentDocument[];
  waypoints?: Waypoint[];
  cargoDetails?: {
    weight: string;
    cbm: string;
    containerType?: string;
    packages: number;
  };
}
```

---

## 9. Next Steps

1. [ ] Write design document (`advanced-tracking-tracing.design.md`)
2. [ ] 서브 컴포넌트 UI/인터랙션 상세 설계
3. [ ] Start implementation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-23 | Initial draft | Claude Code |
