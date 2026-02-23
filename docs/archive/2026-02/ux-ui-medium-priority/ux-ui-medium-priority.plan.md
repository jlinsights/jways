# Plan: UX/UI Medium Priority Improvements

> PDCA Cycle #8 | Feature: `ux-ui-medium-priority`
> Created: 2026-02-24

## 1. Overview

High Priority 6건 개선 완료 후, UI/UX 분석에서 도출된 **Medium Priority 8건**을 개선한다.
접근성(WCAG 2.1 AA), 키보드 내비게이션, 시맨틱 HTML, 반응형 디자인 품질을 향상시키는 작업이다.

## 2. Background

- **이전 작업**: HP-1~HP-6 완료 (Hero CTA 축소, 언어토글 제거, 가짜 로딩 제거, 네비 수정, reduced-motion, 포커스트랩+라벨)
- **분석 출처**: ui-ux-designer Agent 분석 결과 (18건 중 6건 High 완료, 8건 Medium 대상)
- **목표**: WCAG 2.1 AA 준수 수준 향상 + 모바일 UX 개선

## 3. Improvement Items (8건)

### MP-1: Footer 에러/성공 메시지 색각이상자 접근성 강화
- **파일**: `components/Footer.tsx`
- **현상**: `text-red-500`, `text-green-500`만 사용 — 색각이상자에게 구분 불가
- **개선**: 아이콘 + 텍스트 라벨("오류:", "완료:") 추가, 배경색 대비 개선
- **WCAG**: 1.4.1 (Use of Color), 1.4.3 (Contrast)

### MP-2: Footer 뉴스레터 구독 버튼 터치 타겟 44px 보장
- **파일**: `components/Footer.tsx`
- **현상**: 모바일에서 버튼 높이가 44px 미만일 수 있음
- **개선**: `min-h-[44px]` 적용으로 WCAG 2.5.5 준수
- **WCAG**: 2.5.5 (Target Size)

### MP-3: ShipmentMap 마커에 ARIA 라벨 + 키보드 접근성 추가
- **파일**: `components/ShipmentMap.tsx`
- **현상**: 마커가 `onHoverStart`/`onClick`만 있고 `aria-label`, `role`, `tabindex` 없음
- **개선**: `role="button"`, `aria-label`, `tabIndex={0}`, `onKeyDown` 추가
- **WCAG**: 4.1.2 (Name, Role, Value), 2.1.1 (Keyboard)

### MP-4: Services 카드 키보드 포커스 인디케이터 추가
- **파일**: `components/Services.tsx`
- **현상**: 카드에 `tabIndex={0}`이 있지만 `focus-visible:ring` 스타일 없음
- **개선**: `focus-visible:ring-2 focus-visible:ring-jways-blue focus-visible:ring-offset-2` 추가
- **WCAG**: 2.4.7 (Focus Visible)

### MP-5: QuoteModal 에러 메시지 aria-describedby 연결
- **파일**: `components/QuoteModal.tsx`
- **현상**: 에러 `<p>` 태그가 입력 필드와 `aria-describedby`로 연결되지 않음
- **개선**: 에러에 `id="error-{field}"`, 입력에 `aria-describedby="error-{field}"` + `aria-invalid` 추가
- **WCAG**: 1.3.1 (Info and Relationships), 3.3.1 (Error Identification)

### MP-6: 장식용 아이콘에 aria-hidden="true" 일괄 추가
- **파일**: `components/Services.tsx`, `components/Tracking.tsx`, 기타
- **현상**: ArrowUpRight, ChevronRight 등 장식 아이콘에 `aria-hidden` 누락
- **개선**: 텍스트 라벨이 동반된 모든 장식 아이콘에 `aria-hidden="true"` 추가
- **WCAG**: 1.1.1 (Non-text Content)

### MP-7: Tracking 섹션 시맨틱 HTML 개선
- **파일**: `components/Tracking.tsx`
- **현상**: `<div id="track">` 사용 — `<section>` 이 적절
- **개선**: `<div>` → `<section>` 변경, 필터 버튼 그룹에 적절한 role 추가
- **WCAG**: 1.3.1 (Info and Relationships)

### MP-8: 모바일 Tracking 카드 텍스트/레이아웃 반응형 개선
- **파일**: `components/Tracking.tsx`
- **현상**: `text-[10px]` + `max-w-[200px]` → 320px 기기에서 가독성 저하
- **개선**: 모바일 폰트 크기 증가 (`text-xs md:text-[10px]`), 카드 max-width 반응형 조정
- **WCAG**: 1.4.4 (Resize Text)

## 4. Affected Files

| File | Items |
|------|-------|
| `components/Footer.tsx` | MP-1, MP-2 |
| `components/ShipmentMap.tsx` | MP-3 |
| `components/Services.tsx` | MP-4, MP-6 |
| `components/QuoteModal.tsx` | MP-5 |
| `components/Tracking.tsx` | MP-6, MP-7, MP-8 |

## 5. Implementation Order

1. MP-5 (QuoteModal aria-describedby) — 이전 HP-6 작업 연장
2. MP-6 (장식 아이콘 aria-hidden) — 다수 파일 일괄 처리
3. MP-1 (Footer 에러 메시지 접근성) — 독립 컴포넌트
4. MP-2 (Footer 터치 타겟) — MP-1과 같은 파일
5. MP-4 (Services 포커스 인디케이터) — 단순 CSS 추가
6. MP-3 (ShipmentMap ARIA) — 독립 컴포넌트
7. MP-7 (Tracking 시맨틱 HTML) — MP-8과 같은 파일
8. MP-8 (Tracking 반응형) — MP-7과 동시 처리

## 6. Success Criteria

- 모든 8건 구현 완료
- `npm run build` 에러 없이 통과
- WCAG 2.1 AA 관련 항목 준수
- 모바일(320px~)에서 레이아웃 깨짐 없음

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| aria-describedby 동적 렌더링 시 id 충돌 | Low | 필드별 고유 prefix 사용 (`error-quote-*`) |
| ShipmentMap 마커 tabIndex 추가 시 Tab 순서 혼란 | Medium | 논리적 순서로 tabIndex 배치, 컨텍스트 테스트 |
| Footer 메시지 레이아웃 변경 | Low | 기존 스타일 유지하면서 아이콘만 추가 |

## 8. Out of Scope

- Low Priority 4건 (별도 PDCA 사이클)
- 퍼포먼스 최적화 (bundle size, code splitting)
- 새 기능 추가
