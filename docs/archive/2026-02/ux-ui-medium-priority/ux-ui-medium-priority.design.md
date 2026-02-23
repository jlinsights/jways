# Design: UX/UI Medium Priority Improvements

> PDCA Cycle #8 | Feature: `ux-ui-medium-priority`
> Created: 2026-02-24
> Plan Reference: `docs/01-plan/features/ux-ui-medium-priority.plan.md`

## 1. Design Overview

8건의 Medium Priority 접근성/UX 개선을 위한 구체적 변경 명세.
기존 시각적 디자인을 유지하면서 WCAG 2.1 AA 준수 수준을 향상시킨다.

## 2. Detailed Specifications

---

### MP-1: Footer 에러/성공 메시지 색각이상자 접근성 강화

**File**: `components/Footer.tsx` (lines 86~106)

**현재 코드**:
```tsx
// Error (line 92)
className="absolute left-0 -bottom-6 text-xs text-red-500 font-medium ml-1 mt-1"
// Success (line 102)
className="absolute left-0 -bottom-6 text-xs text-green-500 font-medium ml-1 mt-1"
```

**변경 사항**:
1. 에러 메시지에 `role="alert"` 추가 (스크린 리더 즉시 알림)
2. 에러 텍스트 앞에 접두어 추가: 표시 텍스트를 `⚠ {error}` 형태로
3. 성공 텍스트 앞에 접두어 추가: 표시 텍스트를 `✓ 구독이 완료되었습니다!` 형태로
4. input에 `aria-describedby` 연결

**구현**:
```tsx
// Input에 추가:
aria-describedby="newsletter-feedback"

// Error message:
<motion.p
  role="alert"
  id="newsletter-feedback"
  className="absolute left-0 -bottom-7 text-xs text-red-500 font-medium ml-1 mt-1"
>
  ⚠ {error}
</motion.p>

// Success message:
<motion.p
  role="status"
  id="newsletter-feedback"
  className="absolute left-0 -bottom-7 text-xs text-green-500 font-medium ml-1 mt-1"
>
  ✓ 구독이 완료되었습니다!
</motion.p>
```

---

### MP-2: Footer 뉴스레터 구독 버튼 터치 타겟 44px 보장

**File**: `components/Footer.tsx` (line 79~84)

**현재 코드**:
```tsx
className="px-6 py-3.5 bg-jways-blue hover:bg-blue-600 text-white font-bold rounded-xl ..."
```
`py-3.5` = 14px padding top/bottom → 총 높이: 14+14+20(line-height) ≈ 48px — 데스크톱에서는 충분하지만, `flex-col` 모바일에서 font-size가 줄면 44px 미만 가능.

**변경 사항**:
```tsx
className="px-6 py-3.5 min-h-[44px] bg-jways-blue hover:bg-blue-600 text-white font-bold rounded-xl ..."
```
`min-h-[44px]` 추가로 모바일에서도 최소 터치 타겟 보장.

---

### MP-3: ShipmentMap 마커에 ARIA 라벨 + 키보드 접근성 추가

**File**: `components/ShipmentMap.tsx` (lines 82~235)

**대상 마커 4종**:
1. Origin dot (line 82~109)
2. Destination dot (line 112~139)
3. Current location beacon (line 142~195)
4. Waypoint diamonds (line 198~236)

**변경 사항 (각 마커 공통)**:
- `role="button"` 추가
- `aria-label` 추가 (위치별 설명)
- `tabIndex={0}` 추가
- `onKeyDown` 추가 (Enter/Space → 같은 동작 as onClick)

**구현 패턴**:
```tsx
// Origin marker
<motion.div
  className="absolute z-10 cursor-pointer"
  role="button"
  tabIndex={0}
  aria-label={`출발지: ${shipment.origin.city} (${shipment.origin.code})`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTooltip(activeTooltip === 'origin' ? null : 'origin');
    }
  }}
  // ... existing props
>

// Destination marker
aria-label={`도착지: ${shipment.destination.city} (${shipment.destination.code})`}

// Current location
aria-label={`현재 위치: ${shipment.current.city} — ${shipment.status || 'In Transit'}`}

// Waypoint markers (already has aria-label, need role + tabIndex + onKeyDown)
role="button"
tabIndex={0}
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setActiveTooltip(activeTooltip === `wp-${wp.code}` ? null : `wp-${wp.code}`);
  }
}}
```

---

### MP-4: Services 카드 키보드 포커스 인디케이터 추가

**File**: `components/Services.tsx` (line 263)

**현재 코드**:
```tsx
className="group relative h-[400px] overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
```
`tabIndex={0}`과 `role="button"` 있지만 `focus-visible:ring` 없음.

**변경 사항**:
```tsx
className="group relative h-[400px] overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-jways-blue focus-visible:ring-offset-2 focus-visible:outline-none"
```

---

### MP-5: QuoteModal 에러 메시지 aria-describedby 연결

**File**: `components/QuoteModal.tsx`

**대상 필드 및 ID 매핑**:
| Field | Input ID | Error ID | Error Key |
|-------|----------|----------|-----------|
| name | `quote-name` | `error-quote-name` | `errors.name` |
| email | `quote-email` | `error-quote-email` | `errors.email` |
| origin | `quote-origin` | `error-quote-origin` | `errors.origin` |
| destination | `quote-destination` | `error-quote-destination` | `errors.destination` |
| weight | `quote-weight` | `error-quote-weight` | `errors.weight` |
| dimensions | (group) | `error-quote-dimensions` | `errors.dimensions` |
| targetDate | `quote-targetDate` | `error-quote-targetDate` | `errors.targetDate` |

**변경 패턴** (각 input에 적용):
```tsx
// Input에 추가:
aria-invalid={!!errors.name}
aria-describedby={errors.name ? 'error-quote-name' : undefined}

// Error <p>에 추가:
<p id="error-quote-name" role="alert" className="text-xs text-red-500">{errors.name}</p>
```

**Dimensions 그룹 특수 처리**:
```tsx
// 그룹 div에:
aria-describedby={errors.dimensions ? 'error-quote-dimensions' : undefined}

// 각 dimension input에:
aria-invalid={!!errors.dimensions}

// Error에:
<p id="error-quote-dimensions" role="alert" ...>{errors.dimensions}</p>
```

---

### MP-6: 장식용 아이콘에 aria-hidden="true" 일괄 추가

**대상 파일 및 위치**:

**`components/Services.tsx`**:
- Line 388: `<ArrowUpRight size={16} />` → 이미 부모에 `aria-hidden="true"` 있음 ✅
- Line 586: `<ArrowUpRight size={18} aria-hidden="true" />` → 이미 있음 ✅
- Line 194: `<X size={16} />` (clear search button) → 버튼에 `aria-label` 있으므로 아이콘에 `aria-hidden="true"` 추가
- Line 402: `<Search size={32} />` (no results icon) → `aria-hidden="true"` 추가

**`components/Tracking.tsx`**:
- Line 268: `<ChevronDown size={16} />` → `aria-hidden="true"` 추가
- Line 302: `<X size={16} />` (clear button) → `aria-hidden="true"` 추가
- Line 321: `<ArrowRight size={20} />` → `aria-hidden="true"` 추가
- Line 366: `<X size={18} />` (error icon) → `aria-hidden="true"` 추가

**`components/ShipmentMap.tsx`**:
- Line 186: `<Navigation size={10} />` → `aria-hidden="true"` 추가

---

### MP-7: Tracking 섹션 시맨틱 HTML 개선

**File**: `components/Tracking.tsx` (line 236)

**현재 코드**:
```tsx
<div id="track" className="relative -mt-20 z-20 px-6">
```

**변경 사항**:
```tsx
<section id="track" aria-label="화물 추적" className="relative -mt-20 z-20 px-6">
```

`<div>` → `<section>` + `aria-label` 추가. 닫는 태그도 `</section>`으로 변경.

---

### MP-8: 모바일 Tracking 카드 텍스트/레이아웃 반응형 개선

**File**: `components/Tracking.tsx` (lines 490, 496~498, 505~506, 513~514, 523~524)

**대상**: 화물 상세 정보 카드 내 `text-[10px]` 라벨들

**현재 코드**:
```tsx
<p className="text-[10px] text-slate-400">중량</p>
<p className="text-[10px] text-slate-400">부피</p>
<p className="text-[10px] text-slate-400">컨테이너</p>
<p className="text-[10px] text-slate-400">포장 수</p>
<p className="text-[10px] text-slate-400">HS Code</p>
```

**변경 사항**:
```tsx
<p className="text-xs sm:text-[10px] text-slate-400">중량</p>
```
모바일(~640px)에서 `text-xs`(12px), sm 이상에서 `text-[10px]`(10px).

---

## 3. Implementation Checklist

| # | Item | File | Type | Complexity |
|---|------|------|------|------------|
| MP-5 | QuoteModal aria-describedby | `QuoteModal.tsx` | a11y | Medium |
| MP-6 | 장식 아이콘 aria-hidden | 3 files | a11y | Low |
| MP-1 | Footer 메시지 접근성 | `Footer.tsx` | a11y | Low |
| MP-2 | Footer 터치 타겟 | `Footer.tsx` | UX | Low |
| MP-4 | Services 포커스 인디케이터 | `Services.tsx` | a11y | Low |
| MP-3 | ShipmentMap ARIA + 키보드 | `ShipmentMap.tsx` | a11y | Medium |
| MP-7 | Tracking 시맨틱 HTML | `Tracking.tsx` | a11y | Low |
| MP-8 | Tracking 반응형 텍스트 | `Tracking.tsx` | UX | Low |

## 4. Dependencies

- 외부 패키지 추가 없음
- 기존 lucide-react 아이콘 활용 (AlertCircle 등 필요 시 이미 available)
- 기존 Tailwind 클래스만 사용

## 5. Verification Criteria

1. `npm run build` — 0 errors
2. 모든 input에 연결된 `aria-describedby` (에러 상태에서)
3. 모든 장식 아이콘에 `aria-hidden="true"`
4. ShipmentMap 마커 Tab 키 순회 가능
5. Services 카드 Tab 키 포커스 시 링 표시
6. Footer 에러/성공 메시지에 아이콘/접두어 포함
7. Tracking `<section>` 태그 사용 확인
8. 320px 뷰포트에서 카드 라벨 가독성 확인
