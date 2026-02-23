# PDCA Cycle #11 Completion Report — ESG-CO2

> **Feature**: ESG CO2 Dashboard Enhancement (ESG 탄소 배출량 대시보드 고도화)
> **Cycle**: #11
> **Date**: 2026-02-24
> **Match Rate**: 93%
> **Status**: Completed

---

## 1. Executive Summary

PDCA Cycle #11에서 Jways Logistics 대시보드의 ESG 탄소 배출량 기능을 전면 고도화했다. 기존 하드코딩 Mock 데이터 기반의 단순 리포트 페이지를 Tariff Engine 실데이터 연동, 화물별 CO2 추적, 저감 시뮬레이터, ESG 종합 스코어, 탄소 상쇄 안내까지 포함하는 종합 ESG 대시보드로 확장했다.

### Key Achievements

| 항목 | Before | After |
|------|--------|-------|
| CO2 계산 | 고정 계수 (weight x factor) | Tariff Engine co2PerKg 항로별 실데이터 |
| 데이터 소스 | 하드코딩 Mock (mockMonthlyData) | getShipments() → calculateAllShipmentsCO2() 실시간 집계 |
| 화물별 추적 | 없음 | 12건 화물 개별 CO2 배출량 테이블 |
| ESG 스코어 | 없음 | E/S/G 레이더 차트 + 등급 (A+~D) |
| 저감 시뮬레이터 | 없음 | 항공→해상 전환 What-if 시뮬레이션 |
| 탄소 상쇄 | 없음 | 3개 프로그램 안내 + 비용 계산 |
| 공개 섹션 | 없음 | 랜딩 페이지 ESG 커밋먼트 섹션 |
| 접근성 | 미적용 | 전 차트 ARIA, 키보드 네비게이션, 다크모드 |

---

## 2. PDCA Phase Summary

### Plan (계획)

- **문서**: `docs/01-plan/features/ESG-CO2.plan.md`
- **범위**: 7개 Feature Item 정의 (ESG-1 ~ ESG-7)
- **영향 파일**: 6개 (NEW 2, REWRITE 1, EDIT 3)
- **기술 결정**: recharts 유지, Mock ESG 계산식, Tariff Engine 연동
- **Out of Scope**: GLEC/SBTi 정밀 산정, 실제 PDF, 탄소 크레딧 결제

### Design (설계)

- **문서**: `docs/02-design/features/ESG-CO2.design.md`
- **타입 정의**: 7개 신규 인터페이스 (ShipmentCO2, MonthlyCO2, ModeCO2, ESGScore, ReductionScenario, CarbonOffsetProgram, CarbonOffsetEstimate)
- **모듈 설계**: `lib/co2.ts` — 8개 함수 (parseWeight, getRouteCO2PerKg, calculateShipmentCO2, calculateAllShipmentsCO2, aggregateMonthlyCO2, aggregateModeCO2, calculateESGScore, simulateReduction, calculateOffsetCost)
- **컴포넌트 설계**: Sustainability.tsx 7개 섹션 (ESG Score, Overview Cards, Charts, Shipment Table, Simulator, Calculator, Offset Guide) + ESGSection.tsx
- **접근성 설계**: ARIA role="img", aria-label, aria-live, caption, scope

### Do (구현)

- **구현 범위**: Plan의 7개 Feature Item 전체 완료

| Feature Item | 파일 | 코드량 |
|-------------|------|--------|
| ESG-1: CO2 Engine | `lib/co2.ts` (NEW), `types.ts` | ~280줄 |
| ESG-2: Shipment Tracking | `Sustainability.tsx` [D] 섹션 | ~75줄 |
| ESG-3: Reduction Simulator | `Sustainability.tsx` [E] 섹션 | ~90줄 |
| ESG-4: ESG Score | `Sustainability.tsx` [A] 섹션 | ~60줄 |
| ESG-5: Carbon Offset | `Sustainability.tsx` [G] 섹션 | ~40줄 |
| ESG-6: Public Section | `ESGSection.tsx` (NEW), `LandingPage.tsx` | ~90줄 |
| ESG-7: Accessibility | 전체 파일 | 분산 |

- **빌드 결과**: `npm run build` 성공 (10.02s, 0 errors)

### Check (검증)

- **문서**: `docs/03-analysis/ESG-CO2.analysis.md`
- **Match Rate**: **93%**
- **전체 항목**: 58건 검증 → 54건 일치, 4건 minor gap
- **성공 기준**: 10/10 충족

---

## 3. Implementation Details

### 3.1 New Files

#### `lib/co2.ts` (~283줄)

Tariff Engine 연동 CO2 계산 엔진.

```
Architecture:
CITY_COUNTRY_MAP → extractCountryCode() → buildPortCode()
                                              ↓
getRouteMatch() ← lib/tariff.ts         getRouteCO2PerKg()
                                              ↓
                                    calculateShipmentCO2()
                                              ↓
                              ┌──── aggregateMonthlyCO2()
                              ├──── aggregateModeCO2()
                              ├──── calculateESGScore()
                              ├──── simulateReduction()
                              └──── calculateOffsetCost()
```

핵심 알고리즘:
- **CO2 계산**: `co2Kg = weightKg * co2PerKg` (항로별 Tariff Engine 데이터)
- **ESG 스코어**: E=min(100, seaRatio*120+20), S=88(고정), G=82(고정), Overall=E*0.4+S*0.3+G*0.3
- **시뮬레이터**: air→sea CO2 절감량 = currentCO2 - (weightKg * seaCO2PerKg)
- **오프셋**: totalCO2Tonnes * $10~50 범위

#### `components/ESGSection.tsx` (~87줄)

랜딩 페이지 공개 ESG 소개 섹션 (framer-motion 애니메이션).

### 3.2 Modified Files

| File | 변경 내용 | 코드량 변화 |
|------|----------|------------|
| `types.ts` | 7개 ESG/CO2 인터페이스 추가 | +65줄 (332→397) |
| `Sustainability.tsx` | 전체 재작성: 7개 섹션, 실데이터 연동 | 221→583줄 |
| `DashboardHome.tsx` | ESG 위젯 실데이터 연동 + ESG 등급 뱃지 | +15줄 |
| `LandingPage.tsx` | ESGSection import + 삽입 | +2줄 |

### 3.3 Key Technical Decisions

| 결정 | 근거 |
|------|------|
| `getShipmentCO2Data()` api.ts 미추가 | 컴포넌트에서 getShipments() + co2.ts 직접 호출이 더 간결. 불필요한 추상화 회피 (YAGNI) |
| `additionalDays` string 타입 | transit day 범위 문자열 "+25-30 (항공 3-5)" 표현에 필수. 설계 대비 기능적 개선 |
| `ROAD_CO2_PER_KG` 미구현 | MOCK_SHIPMENTS에 도로 운송 없음. 불필요한 상수 회피 |
| 도시→국가 fallback (HK→SG, FR→DE) | Tariff Engine에 없는 국가의 가장 유사한 항로 매칭 |

---

## 4. Gap Analysis Summary

### Match Rate: 93% (54/58 items)

| Gap | 심각도 | 설명 | 처리 |
|-----|--------|------|------|
| `additionalDays` 타입 | Minor | number → string 변경 | 의도적 개선으로 수용 |
| `aria-sort` 미적용 | Minor | 테이블 정적 정렬 — 속성 선택적 | 향후 정렬 기능 추가 시 적용 |
| `AnimatePresence` 미적용 | Minor | 시뮬레이터 전환 애니메이션 부재 | 기능 완전, 폴리시 항목 |
| Calculator fallback 메시지 | Minor | 기본 계수 사용 시 안내 미표시 | 계산 정상, UX 안내문 부재 |

**Critical Gap: 0건**

---

## 5. Success Criteria Verification

| # | 기준 | 결과 |
|---|------|------|
| 1 | `npm run build` 에러 없이 통과 | Pass |
| 2 | CO2 계산기가 Tariff Engine co2PerKg 사용 | Pass |
| 3 | 화물 12건 개별 CO2 배출량 테이블 표시 | Pass |
| 4 | 항공 화물 해상 전환 시 절감량 인터랙티브 계산 | Pass |
| 5 | ESG 레이더 차트 E/S/G 점수 및 등급 표시 | Pass |
| 6 | 탄소 상쇄 안내 + 예상 비용 표시 | Pass |
| 7 | 랜딩 페이지 ESG 소개 섹션 표시 | Pass |
| 8 | 모든 차트 ARIA 대체 텍스트 적용 | Pass |
| 9 | 다크모드 전체 지원 | Pass |
| 10 | 모바일 반응형 정상 표시 | Pass |

**10/10 Pass**

---

## 6. Artifacts

### Documents
| Document | Path |
|----------|------|
| Plan | `docs/01-plan/features/ESG-CO2.plan.md` |
| Design | `docs/02-design/features/ESG-CO2.design.md` |
| Analysis | `docs/03-analysis/ESG-CO2.analysis.md` |
| Report | `docs/04-report/features/ESG-CO2.report.md` |

### Source Files
| File | Type | Lines |
|------|------|-------|
| `lib/co2.ts` | NEW | 283 |
| `components/ESGSection.tsx` | NEW | 87 |
| `types.ts` | EDIT | 397 (+65) |
| `pages/Dashboard/Sustainability.tsx` | REWRITE | 583 (+362) |
| `pages/Dashboard/DashboardHome.tsx` | EDIT | 123 (+15) |
| `pages/LandingPage.tsx` | EDIT | 105 (+2) |

### Dependencies
- 신규 패키지 추가: 없음
- recharts 추가 import: RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar

---

## 7. Lessons Learned

### What Went Well
1. **Tariff Engine 재사용**: 기존 항로 데이터의 co2PerKg 필드를 활용하여 새 모듈(lib/co2.ts)에서 일관된 CO2 계산 가능
2. **인라인 서브컴포넌트**: Sustainability.tsx를 7개 섹션으로 분리하되 단일 파일 유지 — 파일 분산 없이 관리 가능
3. **Zero New Dependencies**: recharts RadarChart 등 기존 패키지 내 미사용 컴포넌트 활용으로 번들 사이즈 증가 최소화
4. **높은 일치율(93%)**: 설계 문서 충실도가 높아 구현 시 큰 변경 없이 진행

### What Could Be Improved
1. **api.ts 래퍼 함수 설계**: 설계에서 `getShipmentCO2Data()`를 명시했으나 구현 시 불필요 판단. 설계 단계에서 YAGNI 원칙 적용 강화 필요
2. **타입 유연성 사전 검토**: `additionalDays`의 number→string 전환은 구현 중 발견. 설계 시 데이터 형태를 더 구체적으로 검토해야
3. **AnimatePresence 일관성**: 프로젝트 다른 곳에서 사용 중인 framer-motion 패턴을 시뮬레이터에도 적용했어야

### Technical Insights
- **City→Country Mapping**: MOCK_SHIPMENTS의 도시명을 Tariff Engine의 국가 코드로 변환하는 매핑 테이블 필요 — 향후 실제 데이터 연동 시 port code DB 필요
- **ESG 스코어 공식**: E 영역만 실데이터(해상 비율) 연동, S/G는 Mock 고정값 — 향후 실제 ESG 평가 지표 연동 여지 확보
- **Tariff Engine fallback**: HK→SG, FR→DE 등 미등록 국가 fallback은 임시 해결책. 항로 DB 확장 시 자동 해결

---

## 8. Next Steps (Out of Scope → Future)

| 항목 | 우선순위 | 비고 |
|------|----------|------|
| GLEC Framework 기반 정밀 CO2 산정 | Medium | 국제 표준 준수 시 필요 |
| 실제 PDF 리포트 생성 (jsPDF) | Low | 현재 alert 대체 |
| 실시간 운송 데이터 CO2 자동 집계 | Medium | 백엔드 API 연동 필요 |
| 제3자 ESG 인증 연동 (CDP, EcoVadis) | Low | 기업 인증 시 필요 |
| 탄소 크레딧 결제 연동 | Low | 비즈니스 결정 필요 |
| `aria-sort` + AnimatePresence 폴리시 | Low | 4건 minor gap 해소 |

---

## 9. PDCA Cycle Timeline

```
Plan    ████░░░░░░░░  2026-02-24 12:00
Design  ░░██████░░░░  2026-02-24 13:00
Do      ░░░░████████  2026-02-24 14:00
Check   ░░░░░░░░████  2026-02-24 15:00
Report  ░░░░░░░░░░██  2026-02-24 15:30

[Plan] ✅ → [Design] ✅ → [Do] ✅ → [Check] ✅ (93%) → [Report] ✅
```

**Total Cycle Time**: ~3.5 hours
**Iterations**: 0 (93% ≥ 90% threshold on first check)
