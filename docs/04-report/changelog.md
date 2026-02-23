# Changelog

All notable changes to the jways-logistics project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2026-02-24] - Advanced Tracking & Tracing Feature Complete

### Added
- ETA 예측 카드 (`components/ETACard.tsx`)
  - D-day 카운트다운 (getDDayString)
  - 신뢰도 뱃지 (high/medium/low)
  - 지연 표시기, 마지막 업데이트 시간
- 추적 대시보드 요약 (`components/TrackingDashboard.tsx`)
  - SVG 원형 진행률 차트 (stroke-dasharray)
  - 현재 단계 라벨, 운송 모드 뱃지
  - 지연 경고 배너 (role="alert")
- 이벤트 타임라인 (`components/EventTimeline.tsx`)
  - 세로 타임라인 + 카테고리 그룹 헤더
  - 시간 간격 시각화 (getTimeBetween)
  - MilestoneRow 서브컴포넌트 추출
- 관련 문서 뷰어 (`components/ShipmentDocuments.tsx`)
  - 문서 카드 그리드 (B/L, Invoice, PL, Certificate)
  - 상태 뱃지 (issued/pending/draft)
- 다중 화물 비교 (`components/ShipmentCompare.tsx`)
  - 최대 3건 병렬 비교 그리드
  - "+" 추가 버튼 + 최대 제한 적용
  - 카테고리별 진행 상태 비교
- ShipmentMap 경유지 마커 (diamond markers + tooltips)
  - 다중 세그먼트 SVG 경로
  - spring 애니메이션 경유지 표시
- 화물 상세 패널 (Tracking.tsx 인라인)
  - 중량, 부피(CBM), 컨테이너 타입, 포장 수, HS Code
- Mock 데이터 확장
  - JW-8839-KR: ETA(high), 4 documents, 1 waypoint(ANC), cargo 450kg
  - JW-2201-SEA: ETA(medium, +2d), 4 documents, 3 waypoints, cargo 8,500kg
- 탭 패널 UI (문서 / 화물상세 전환)
- WCAG 2.1 AA 접근성 전수 적용
  - role="tablist"/"tab"/"tabpanel", aria-selected
  - role="list"/"listitem", role="img", role="alert", role="region"
  - 키보드 네비게이션 (Tab, Enter, Space)

### Changed
- Tracking.tsx: 598줄 → ~570줄 (서브컴포넌트 분리로 책임 분산, 기능은 대폭 확장)
- ShipmentMap.tsx: 경유지 조건부 렌더링 추가
- types.ts: ETAInfo, ShipmentDocument, Waypoint, CargoDetails 인터페이스 추가

### Quality Metrics
- Design Match Rate: 95% → 97% (5 minor gaps resolved)
- Build Status: Passed (6.75s)
- Bundle Size: 1,603.74 kB (gzip: 409.82 kB)
- New Components: 5
- Modified Components: 3 (Tracking, ShipmentMap, types)
- Iteration Count: 0 (Check phase fixes only)
- Accessibility: WCAG 2.1 AA compliant (all ARIA attributes applied)

---

## [2026-02-23] - Logistics Wiki Feature Complete (Archived)

### Added
- 물류 용어 백과사전 위젯
- 카테고리별 용어 분류
- 검색/필터 기능

### Details
- Status: Archived to `docs/archive/2026-02/logistics-wiki/`
- PDCA Cycle: #6
- Match Rate: 100% (after 1 iteration)

---

## [2026-02-23] - Incoterms Guide Feature Complete

### Added
- Incoterms 2020 가이드 인터랙티브 위젯 (`components/IncotermsGuide.tsx`)
  - 5개 주요 조건 시각화: EXW, FOB, CIF, DAP, DDP
  - 9단계 물류 프로세스 매트릭스 (포장 → 내륙운송)
  - 비용 분담 프로그레스 바 (수출자/수입자 비율)
  - DAP 조건 특수 처리 (혼합 부담 상태)
  - 탭 기반 UI (클릭으로 조건 전환)
  - framer-motion 애니메이션 (200ms 전환)
- 다크모드 완벽 지원 (20/20 색상 매핑)
- WCAG 2.1 AA 접근성 준수 (10/10 ARIA attributes)
  - ARIA tab pattern (role="tablist", role="tab", aria-selected, aria-labelledby)
  - Step 항목 aria-label
  - Progress bar role="img" + dynamic aria-label
  - Check/X 아이콘 aria-hidden="true"
  - Keyboard arrow navigation (ArrowLeft/Right with focus management)
  - Disclaimer role="note"
- 반응형 디자인 (모바일 가로 스크롤, 태블릿/데스크톱 풀 너비)
- 법적 면책 안내 고지
- 완전한 PDCA 문서화
  - Plan: `docs/01-plan/features/incoterms-guide.plan.md`
  - Design: `docs/02-design/features/incoterms-guide.design.md`
  - Analysis: `docs/03-analysis/incoterms-guide.analysis.md`
  - Report: `docs/04-report/incoterms-guide.report.md`

### Changed
- App.tsx: IncotermsGuide 컴포넌트 추가 배치 (무역 백과사전 섹션 내, ExchangeRate ↓ IncotermsGuide ↓ LogisticsWiki)

### Fixed
- Act Iteration 1: 접근성 10개 항목 보강
  - ARIA tab pattern 추가
  - Step 항목 접근성 레이블 추가
  - Progress bar 시맨틱 요소화
  - Keyboard navigation 구현
  - Disclaimer 시맨틱 역할 추가

### Quality Metrics
- Design Match Rate: 82% → 100% (47/57 → 57/57)
- Build Status: ✅ Passed (2.17s)
- Lines of Code: 232
- Iteration Count: 1
- Accessibility Score: 10/10 ARIA items

---

## [2026-02-22] - Exchange Rate Feature Complete (Archived)

### Added
- Exchange Rate 환율 변환 위젯
- Real-time 환율 API 연동
- 주요 통화 지원 (USD, EUR, JPY, CNY)

### Details
- Status: Archived to `docs/archive/2026-02/exchange-rate/`
- PDCA Cycle: #4

---

## [2026-02-21] - Interactive Quote Feature Complete (Archived)

### Added
- 견적 요청 폼 (Interactive Quote Modal)
- 실시간 폼 검증
- 사용자 입력 피드백

### Details
- Status: Archived to `docs/archive/2026-02/interactive-quote/`
- PDCA Cycle: #3

---

## [2026-02-20] - Milestone Tracking Feature Complete (Archived)

### Added
- 배송 추적 마일스톤 시각화
- 단계별 상태 표시

### Details
- Status: Archived to `docs/archive/2026-02/milestone-tracking/`
- PDCA Cycle: #2

---

## [2026-02-19] - CBM Calculator Feature Complete (Archived)

### Added
- 체적 계산기 (CBM - Cubic Meter Calculator)
- 물류 용량 계산 도구
- 실시간 계산 및 저장 기능

### Details
- Status: Archived to `docs/archive/2026-02/CBM-Calculator/`
- PDCA Cycle: #1

---

## Project Information

- **Project**: jways-logistics
- **Type**: Single-Page React Application (SPA)
- **Build Tool**: Vite
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS (CDN)
- **Animation**: framer-motion
- **Icons**: lucide-react
- **Repository**: `/Users/jaehong/Developer/Projects/jways`

## Development Standards

- **PDCA Methodology**: Plan → Design → Do (Implement) → Check (Analyze) → Act (Improve) → Report
- **Documentation**: Markdown-based PDCA documents in `docs/` folder
- **Versioning**: Semantic Versioning (MAJOR.MINOR.PATCH)
- **Accessibility**: WCAG 2.1 AA minimum standard
- **Code Quality**: TypeScript strict mode, ESLint, Prettier
- **Performance**: < 100ms component render time, Core Web Vitals compliance

## Archived Cycles

All completed PDCA cycles are archived in `docs/archive/YYYY-MM/` with full documentation:
- `CBM-Calculator/` (Cycle #1)
- `milestone-tracking/` (Cycle #2)
- `interactive-quote/` (Cycle #3)
- `exchange-rate/` (Cycle #4)
- `incoterms-guide/` (Cycle #5)
- `logistics-wiki/` (Cycle #6)
- `advanced-tracking-tracing/` (Cycle #7)

## Contact

For questions or issues related to this project, refer to the PDCA documentation in `docs/` or contact the development team.

---

**Last Updated**: 2026-02-24
**Report Generator**: bkit PDCA Report Generator v1.4.7
**Location**: `/Users/jaehong/Developer/Projects/jways/docs/04-report/changelog.md`
