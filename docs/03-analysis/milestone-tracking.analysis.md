# Gap Analysis: milestone-tracking

> **Date**: 2026-02-22
> **Design**: docs/02-design/features/milestone-tracking.design.md
> **Match Rate**: 94%
> **Items**: 47 total (40 PASS, 4 acceptable deviations, 1 review deviation, 1 PARTIAL, 0 FAIL)

---

## 1. Summary

milestone-tracking iterate 후 재검증 완료. 이전 분석(v0.1)에서 지적된 3개 항목(#7 categoryOrder, #42 ETA badge hover, #43 Mode badge fade-in)이 모두 수정 반영되었습니다. 47개 항목 중 40개 완전 일치(PASS), 4개 허용 가능한 편차, 1개 검토 필요 편차, 1개 부분 구현, 0개 미구현. Match Rate **94%**로 90% 기준을 충족합니다.

---

## 2. Detailed Analysis

| # | Section | Design Requirement | Status | Notes |
|---|---------|-------------------|--------|-------|
| 1 | 3.1 | `MilestoneCategory` type | PASS | types.ts:33 |
| 2 | 3.1 | `TransportMode` type | PASS | types.ts:34 |
| 3 | 3.1 | `TrackingStep` 12 fields | PASS | types.ts:36-49 |
| 4 | 3.1 | `MilestoneCategoryGroup` (category, label, icon, steps) | PARTIAL | `icon` field missing from interface (runtime resolve via CATEGORY_CONFIG) |
| 5 | 3.1 | `ShipmentData` extensions (mode, totalProgress, categories) | PASS | types.ts:64-75 |
| 6 | 3.2 | `CATEGORY_CONFIG` 4 categories | PASS | Tracking.tsx:13-48 |
| 7 | 3.3 | `createMockShipment` categoryOrder | PASS | v0.2 fix: `['departure','transit','customs','arrival']` matches design |
| 8 | 3.3 | Factory icon property | DEVIATION (OK) | Icon resolved at render via CATEGORY_CONFIG |
| 9 | 4.1 | Air JW-8839-KR 8 steps | PASS | Correct steps/categories/statuses |
| 10 | 4.2 | Sea JW-2201-SEA 9 steps | PASS | Correct steps/categories/statuses |
| 11 | 4.1 | Air mock: ETAs, details, vessels, ports | PASS | All fields match |
| 12 | 4.2 | Sea mock: coordinates (PUS/RTM/SIN) | PASS | Coordinates match |
| 13 | 4 | `MOCK_SHIPMENTS: Map<string, ShipmentData>` | PASS | Map-based storage |
| 14 | 5.2 | ProgressHeader inline | PASS | Lines 431-475 |
| 15 | 5.2 | MilestoneGroup inline | PASS | Lines 482-518 |
| 16 | 5.2 | MilestoneRow inline | PASS | Lines 139-249 |
| 17 | 5.3 | Expand/collapse on click | PASS | expandedIds Set |
| 18 | 6.1 | ProgressHeader elements (badge, bar, text, ETA, count) | PASS | All 5 present |
| 19 | 6.1 | Progress bar style | PASS | Matches design |
| 20 | 6.2 | MilestoneGroup elements | PASS | Icon, label, count, separator |
| 21 | 6.3 | MilestoneRow current step color | DEVIATION | Blue instead of amber (jways brand consistency) |
| 22 | 6.3 | ETA badge styling | PASS | Matches with Timer icon |
| 23 | 6.3 | Relative time display | PASS | getRelativeTime for completed |
| 24 | 6.3 | ChevronDown expand trigger | PASS | With rotation animation |
| 25 | 6.3 | Expand panel styling | DEVIATION (OK) | `mt-2` vs `mt-1`, natural indent |
| 26 | 6.4 | `getRelativeTime()` helper | PASS | Exact match |
| 27 | 6.5 | Map-based search logic | PASS | MOCK_SHIPMENTS.get() |
| 28 | 7.1 | ShipmentMap mode icon (Ship/Plane/Truck) | PASS | Ternary matching |
| 29 | 7.1 | ShipmentMap imports | PASS | Ship, Plane added |
| 30 | 7.1 | ShipmentMapProps | PASS | shipment: ShipmentData |
| 31 | 8.1 | Keyboard nav (Enter/Space) | PASS | onKeyDown handler |
| 32 | 8.1 | ProgressHeader aria-label | PASS | "전체 운송 진행률" |
| 33 | 8.2 | Progress role="progressbar" | PASS | aria-valuenow/min/max |
| 34 | 8.2 | Mode badge aria-label | PASS | 항공/해상 운송 |
| 35 | 8.2 | MilestoneGroup role="group" | PASS | aria-label present |
| 36 | 8.2 | Expand panel role="region" | PASS | aria-label present |
| 37 | 8.3 | aria-live="polite" | PASS | Timeline Panel root |
| 38 | 9.1 | Existing animations preserved | PASS | All intact |
| 39 | 9.2 | ProgressHeader bar animation | PASS | duration 1, easeOut |
| 40 | 9.2 | MilestoneGroup entrance animation | DEVIATION (OK) | +0.2 base delay offset |
| 41 | 9.2 | MilestoneRow expand animation | PASS | AnimatePresence + height |
| 42 | 9.2 | ETA badge `whileHover={{ scale: 1.05 }}` | PASS | v0.2 fix: motion.span with whileHover at Tracking.tsx:216 |
| 43 | 9.2 | Mode badge fade-in animation | PASS | v0.2 fix: motion.span with initial/animate opacity at Tracking.tsx:439 |
| 44 | 10.2 | Legacy fallback for categories | PASS | Fallback array present |
| 45 | 11.1 | File structure (3 files) | PASS | types.ts, Tracking.tsx, ShipmentMap.tsx |
| 46 | 11.3 | Anchor import | DEVIATION (OK) | Not used in any code |
| 47 | 11 | expandedIds: Set<string> | PASS | State management |

---

## 3. Score

| Status | Count |
|--------|:-----:|
| PASS | 40 |
| DEVIATION (acceptable) | 4 |
| DEVIATION (needs review) | 1 |
| PARTIAL | 1 |
| FAIL | 0 |
| **Match Rate** | **94%** |

---

## 4. Remaining Items (non-blocking)

| # | Status | Description | Recommendation |
|---|--------|-------------|----------------|
| #4 | PARTIAL | `MilestoneCategoryGroup` interface missing `icon` field | Design 문서 업데이트 (icon은 CATEGORY_CONFIG에서 runtime resolve) |
| #21 | DEVIATION | Current step color blue vs design amber | 의도적 편차 (jways brand blue 일관성) |

---

## 5. Iterate Summary (v0.1 -> v0.2)

| Fix | Item | Before | After | Evidence |
|-----|------|--------|-------|----------|
| #7 | categoryOrder | DEVIATION | PASS | Tracking.tsx:81 `['departure','transit','customs','arrival']` |
| #42 | ETA badge hover | FAIL | PASS | Tracking.tsx:215-216 `motion.span whileHover={{ scale: 1.05 }}` |
| #43 | Mode badge fade | FAIL | PASS | Tracking.tsx:439-442 `motion.span initial/animate opacity` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-22 | Initial gap analysis (87%, 37 PASS / 4 OK / 2 review / 1 PARTIAL / 2 FAIL) |
| 0.2 | 2026-02-22 | Iterate 후 재검증 (94%, 40 PASS / 4 OK / 1 review / 1 PARTIAL / 0 FAIL) |
