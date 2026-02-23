# Plan: ESG CO2 Dashboard Enhancement (ESG 탄소 배출량 대시보드 고도화)

> PDCA Cycle #11 | Feature: `ESG-CO2`
> Created: 2026-02-24

## 1. Overview

기존 `/dashboard/sustainability` 페이지와 ESG 관련 기능들을 고도화한다.
현재 Sustainability 페이지는 하드코딩된 Mock 데이터와 기본 차트(recharts)만 있고,
CO2 계산기는 단순 고정 계수(weight × factor)를 사용한다.

**핵심 목표**:
1. **실제 Tariff Engine CO2 데이터 연동** — `lib/tariff.ts`의 `co2PerKg` 항로별 데이터 활용
2. **화물별 CO2 상세 분석** — 운송 이력 기반 배출량 추적 (Mock Shipment 데이터 활용)
3. **탄소 저감 시뮬레이터** — "해상 전환 시 얼마나 절감?" 인터랙티브 시뮬레이션
4. **ESG 점수 대시보드** — 종합 ESG 스코어 시각화 (E/S/G 각 영역)
5. **탄소 상쇄(Offset) 안내** — 탄소 크레딧 구매 안내 섹션
6. **비인증 공개 페이지** — 랜딩 페이지에서 접근 가능한 ESG 소개 섹션
7. **접근성 및 다크모드 완성** — 기존 페이지의 접근성 보강

## 2. Background

### 현재 상태 (이미 존재하는 것)

- `pages/Dashboard/Sustainability.tsx` (221줄): 기본 ESG 리포트 페이지
  - 개요 카드 3장 (총배출량 23.2tCO₂e, 가장 큰 요인, 목표 달성률 82%)
  - 월별 추이 AreaChart (mockMonthlyData 6개월)
  - 운송수단별 BarChart (mockModeData 3종)
  - 간편 CO2 계산기 (출발지/도착지/모드/중량 → weight × factor)
  - "리포트 다운로드 (PDF)" 버튼 (미구현)
- `pages/Dashboard/DashboardHome.tsx`: ESG 위젯 (월간 배출량 2,450 kg, 전월 대비 -12%)
- `pages/Dashboard/Sidebar.tsx`: "ESG 탄소 리포트" 메뉴 항목 (Leaf 아이콘)
- `lib/tariff.ts`: 10개 항로에 `co2PerKg` 데이터 (해상 0.010~0.018, 항공 0.50~0.65)
- `types.ts`: `TariffResult.co2Kg` 필드 존재
- `pages/InstantQuote.tsx`: 견적 결과에 CO₂ 배출량 표시 + "친환경" 뱃지
- `components/WhyUs.tsx`: "탄소 배출 최소화 친환경 운송" 텍스트

### 없는 것 (구현 필요)

- Tariff Engine의 실제 co2PerKg 데이터와 CO2 계산기 연동
- 화물별(Shipment) CO2 상세 내역 (각 화물이 얼마나 배출했는지)
- 탄소 저감 시뮬레이터 (해상↔항공 전환 시 절감 비교)
- 분기별/연간 배출 트렌드 분석 (현재 6개월 하드코딩)
- ESG 종합 스코어 (Environmental + Social + Governance)
- 탄소 상쇄(Offset) 안내 및 예상 비용 계산
- 비인증 공개 ESG 섹션 (랜딩 페이지)
- PDF 리포트 다운로드 (현재 버튼만 있고 미구현)
- 접근성 (ARIA, 키보드 네비게이션, 차트 대체 텍스트)

## 3. Feature Items (7건)

### ESG-1: CO2 Engine Enhancement (CO2 계산 엔진 고도화)
- **구현**: `lib/co2.ts` — Tariff Engine `co2PerKg` 데이터 기반 정밀 계산
- **주요 기능**: 항로별 CO2 계산, 거리 기반 보정, 운송수단별 비교, 누적 집계
- **연동**: `lib/tariff.ts` 포트/항로 데이터 재사용
- **파일**: `lib/co2.ts` (NEW)

### ESG-2: Shipment-Level CO2 Tracking (화물별 배출량 추적)
- **구현**: 기존 Mock Shipment 데이터에 CO2 필드 추가
- **시각화**: 화물 목록에 CO2 배지, 상세 내역에 배출량 표시
- **집계**: 월별/분기별 자동 집계 로직
- **파일**: `pages/Dashboard/Sustainability.tsx`, `lib/co2.ts`

### ESG-3: Carbon Reduction Simulator (탄소 저감 시뮬레이터)
- **구현**: 인터랙티브 "What-if" 시뮬레이션 위젯
- **시나리오**: 항공→해상 전환, 통합 운송, 최적 경로 추천
- **시각화**: Before/After 비교 차트, 절감량 애니메이션
- **파일**: `pages/Dashboard/Sustainability.tsx`

### ESG-4: ESG Score Dashboard (ESG 종합 스코어)
- **구현**: E(환경), S(사회), G(지배구조) 각 영역 점수 시각화
- **디자인**: 게이지 차트 또는 레이더 차트, 점수 트렌드
- **계산**: Mock 기반 점수 (환경=CO2 저감률, 사회=안전사고율, 지배구조=규정준수율)
- **파일**: `pages/Dashboard/Sustainability.tsx`

### ESG-5: Carbon Offset Guide (탄소 상쇄 안내)
- **구현**: 탄소 크레딧 안내 섹션
- **기능**: 예상 상쇄 비용 계산 ($10~50/tCO₂e), 인증 프로그램 소개 (Gold Standard, VCS)
- **CTA**: "탄소 상쇄 문의하기" → 외부 링크 또는 모달
- **파일**: `pages/Dashboard/Sustainability.tsx`

### ESG-6: Public ESG Section (비인증 ESG 소개)
- **구현**: 랜딩 페이지에 ESG 커밋먼트 섹션 추가
- **내용**: 환경 비전, 탄소 저감 실적(하드코딩), CO2 계산기 CTA
- **CTA**: 로그인 유도 → 상세 ESG 리포트
- **파일**: `components/ESGSection.tsx` (NEW), `pages/LandingPage.tsx`

### ESG-7: Accessibility & Polish (접근성 + UI 완성)
- **접근성**: 차트 대체 텍스트, ARIA 속성, 키보드 네비게이션
- **PDF Mock**: 리포트 다운로드 버튼 → 토스트 알림 (실제 PDF 미생성)
- **다크모드**: 모든 신규 요소 다크모드 대응
- **반응형**: 모바일 최적화 (차트 축소, 카드 스택)
- **파일**: 모든 수정 파일

## 4. Affected Files

| File | Status | Items |
|------|--------|-------|
| `lib/co2.ts` | **NEW** | ESG-1, ESG-2 |
| `pages/Dashboard/Sustainability.tsx` | **REWRITE** | ESG-2, ESG-3, ESG-4, ESG-5, ESG-7 |
| `pages/Dashboard/DashboardHome.tsx` | **EDIT** | ESG-2 (위젯 고도화) |
| `components/ESGSection.tsx` | **NEW** | ESG-6 |
| `pages/LandingPage.tsx` | **EDIT** | ESG-6 (섹션 추가) |
| `types.ts` | **EDIT** | ESG-1 (타입 추가) |
| `lib/api.ts` | **EDIT** | ESG-2 (Mock API 함수 추가) |

## 5. Implementation Order

1. **ESG-1** (CO2 Engine) — 모든 계산의 기반, Tariff Engine 연동
2. **ESG-2** (Shipment-Level Tracking) — 화물별 데이터 + 집계
3. **ESG-4** (ESG Score) — 대시보드 핵심 시각화
4. **ESG-3** (Reduction Simulator) — 인터랙티브 시뮬레이션
5. **ESG-5** (Offset Guide) — 보조 정보 섹션
6. **ESG-6** (Public Section) — 랜딩 페이지 섹션
7. **ESG-7** (Accessibility & Polish) — 마무리

## 6. Success Criteria

- `npm run build` 에러 없이 통과
- CO2 계산기가 Tariff Engine의 실제 co2PerKg 데이터를 사용
- 화물 목록에 각 화물의 예상 CO2 배출량 표시
- 탄소 저감 시뮬레이터에서 운송 수단 전환 시 절감량 인터랙티브 계산
- ESG 종합 스코어 (E/S/G) 시각화 표시
- 탄소 상쇄 안내 섹션 + 예상 비용 계산
- 랜딩 페이지에 ESG 소개 섹션 표시
- 모든 차트에 ARIA 대체 텍스트 적용
- 다크모드 전체 지원
- 모바일 반응형 정상 표시

## 7. Technical Decisions

| 결정 | 선택 | 이유 |
|------|------|------|
| CO2 엔진 | `lib/co2.ts` (Tariff 연동) | 기존 co2PerKg 데이터 활용, 일관성 |
| 차트 라이브러리 | recharts (기존 유지) | 이미 Sustainability에서 사용 중 |
| ESG 스코어 | Mock 계산식 | 백엔드 없음, 향후 API 교체 용이 |
| 탄소 상쇄 가격 | $10~50/tCO₂e 범위 | 2024-2025년 시장 평균 참조 |
| 공개 섹션 | `/` 랜딩 내 섹션 | 비인증 접근, SEO 효과 |
| PDF 다운로드 | Mock 토스트 | 실제 PDF 생성 라이브러리 불필요 |

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| CO2 데이터 정확도 | Low | "참조용" 안내문 표시, 국제 표준(GLEC) 언급 |
| Sustainability.tsx 파일 크기 | Medium | 시뮬레이터, ESG 스코어를 인라인 서브컴포넌트로 정의 |
| recharts 번들 사이즈 | Low | 이미 사용 중, 추가 차트 타입만 import |
| ESG 스코어 산정 근거 | Low | Mock 데이터 명시, "실제 ESG 평가와 다를 수 있음" 안내 |

## 9. Out of Scope

- 실제 GLEC Framework / SBTi 기반 정밀 산정
- 실시간 운송 데이터 기반 자동 CO2 집계
- 실제 PDF 리포트 생성 (jsPDF 등)
- 탄소 크레딧 실제 구매/결제
- 제3자 ESG 인증 연동 (CDP, EcoVadis 등)
- 다국어 지원
