# Changelog

All notable changes to the jways-logistics project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## Contact

For questions or issues related to this project, refer to the PDCA documentation in `docs/` or contact the development team.

---

**Last Updated**: 2026-02-23
**Report Generator**: bkit PDCA Report Generator v1.4.7
**Location**: `/Users/jaehong/Developer/Projects/jways/docs/04-report/changelog.md`
