# interactive-quote Design Document

> **Summary**: QuoteModal을 3단계 인터랙티브 위자드로 재구성하고 Services 컴포넌트와 연동
>
> **Project**: jways
> **Version**: 1.0.0
> **Date**: 2026-02-23
> **Status**: Draft
> **Planning Doc**: [interactive-quote.plan.md](../../01-plan/features/interactive-quote.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 기존 단일 폼(468줄)을 3단계 위자드로 분할하여 모바일 UX 개선
- Services 컴포넌트에서 서비스 종류를 QuoteModal로 자동 전달
- 기존 CBM 실시간 계산, 유효성 검증, 성공 화면 기능 100% 유지
- framer-motion AnimatePresence 기반 단계 전환 애니메이션

### 1.2 Design Principles

- 기존 프로젝트 패턴 유지 (인라인 서브 컴포넌트, Tailwind CDN, framer-motion)
- 모바일 우선 반응형 (320px~1440px)
- 다크 모드 완전 지원 (기존 dark: 접두사 패턴)
- 접근성 (aria-label, 키보드 탐색, role 속성)

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│  App.tsx                                                 │
│  ┌─ quoteModal state ──────────────────────────────────┐ │
│  │ { isOpen, preSelectedService? }                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                    │                                     │
│     ┌──────────────┼──────────────────┐                  │
│     ▼              ▼                  ▼                  │
│  Hero.tsx     Services.tsx      QuoteModal.tsx            │
│  (버튼→open)  (서비스→open)     (위자드 3단계)           │
│                                  ├─ StepIndicator        │
│                                  ├─ Step1Contact         │
│                                  ├─ Step2Cargo           │
│                                  └─ Step3Review          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
사용자 클릭 (Hero/Services/CTA)
  → App.setQuoteModal({ isOpen: true, preSelectedService? })
    → QuoteModal 열림 (preSelectedService로 Step1 서비스 자동 선택)
      → Step 1: 연락처 + 서비스 선택 → Next
        → Step 2: 화물 정보 + CBM 계산 → Next
          → Step 3: 요약 검토 + 메시지 → Submit
            → 시뮬레이션 제출 → 성공 화면
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| QuoteModal | App (quoteModal state) | isOpen, preSelectedService, onClose |
| Hero | App (openQuoteModal) | 견적 요청 버튼 클릭 시 모달 열기 |
| Services | App (openQuoteModal) | 서비스 문의하기 버튼 시 서비스 종류와 함께 모달 열기 |
| CTA section | App (openQuoteModal) | 무료 견적 요청하기 버튼 |

---

## 3. Data Model

### 3.1 타입 정의 (types.ts에 추가)

```typescript
// ─── Quote Wizard Types ───

export type ServiceType = 'air' | 'ocean' | 'land' | 'warehouse';

export interface QuoteFormData {
  // Step 1: 연락처 + 서비스
  name: string;
  email: string;
  serviceType: ServiceType | '';

  // Step 2: 화물 정보
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  targetDate: string;

  // Step 3: 메시지
  message: string;
}

export interface QuoteModalState {
  isOpen: boolean;
  preSelectedService?: ServiceType;
}
```

### 3.2 서비스 카드 데이터 (QuoteModal 내부 상수)

```typescript
const serviceOptions: { id: ServiceType; label: string; labelEn: string; icon: LucideIcon }[] = [
  { id: 'air', label: '항공 운송', labelEn: 'Air Freight', icon: Plane },
  { id: 'ocean', label: '해상 운송', labelEn: 'Ocean Freight', icon: Ship },
  { id: 'land', label: '육상 운송', labelEn: 'Land Transport', icon: Truck },
  { id: 'warehouse', label: '물류 창고', labelEn: 'Warehouse', icon: Warehouse },
];
```

---

## 4. UI/UX Design

### 4.1 위자드 전체 레이아웃

```
┌──────────────────────────────────────────────┐
│  Header (bg-jways-navy)                       │
│  ┌──────┐  견적 요청 (Request a Quote)       │
│  │ icon │  빠르고 정확한 운임 견적을 받아보세요. │ [X]
│  └──────┘                                     │
├──────────────────────────────────────────────┤
│  Step Indicator                                │
│  ● ─── ○ ─── ○                                │
│  연락처  화물정보  검토                         │
├──────────────────────────────────────────────┤
│                                                │
│  [Step Content Area]                           │
│  (AnimatePresence mode="wait" 전환)           │
│                                                │
├──────────────────────────────────────────────┤
│  Navigation Footer                             │
│  [← 이전]              [다음 →] or [제출]     │
└──────────────────────────────────────────────┘
```

### 4.2 Step Indicator 설계

```
┌──────────────────────────────────────────────────┐
│                                                    │
│   (1)──────────(2)──────────(3)                   │
│   ●            ○            ○                     │
│  연락처       화물정보      검토                   │
│  Contact     Cargo Info    Review                 │
│                                                    │
│  상태별:                                           │
│  ● 완료: bg-jways-blue text-white + check 아이콘  │
│  ● 현재: bg-jways-blue text-white + 숫자          │
│  ○ 대기: bg-slate-200 text-slate-400 + 숫자      │
│  ── 완료선: bg-jways-blue                         │
│  ── 대기선: bg-slate-200                          │
│                                                    │
└──────────────────────────────────────────────────┘
```

**StepIndicator 컴포넌트 스펙**:

| Prop | Type | Description |
|------|------|-------------|
| currentStep | 1 \| 2 \| 3 | 현재 활성 단계 |
| steps | { label: string; labelEn: string }[] | 단계 정보 배열 |

**구현 상세**:
- 원형 아이콘: `w-8 h-8 rounded-full` (모바일), `w-10 h-10` (데스크톱)
- 연결선: `h-0.5 flex-1` (단계 원 사이)
- 완료 단계: Check 아이콘 (lucide-react), 파란 배경
- 현재 단계: 숫자, 파란 배경 + `ring-4 ring-jways-blue/20`
- 대기 단계: 숫자, 회색 배경
- 다크 모드: `dark:bg-slate-700` 대기, `dark:ring-blue-500/20` 현재

### 4.3 Step 1: 연락처 + 서비스 선택

```
┌──────────────────────────────────────────────┐
│                                                │
│  이름 (Name)               이메일 (Email)      │
│  ┌──────────────┐         ┌──────────────────┐ │
│  │ 홍길동       │         │ example@co.com   │ │
│  └──────────────┘         └──────────────────┘ │
│                                                │
│  서비스 종류 (Service Type)                    │
│  ┌──────────┐  ┌──────────┐                    │
│  │  ✈️       │  │  🚢       │                    │
│  │ 항공 운송 │  │ 해상 운송 │                    │
│  │Air Freight│  │Ocean Frt │                    │
│  └──────────┘  └──────────┘                    │
│  ┌──────────┐  ┌──────────┐                    │
│  │  🚛       │  │  🏭       │                    │
│  │ 육상 운송 │  │ 물류 창고 │                    │
│  │Land Trans │  │Warehouse │                    │
│  └──────────┘  └──────────┘                    │
│                                                │
└──────────────────────────────────────────────┘
```

**서비스 카드 스펙**:
- 레이아웃: `grid grid-cols-2 gap-3`
- 카드 크기: `p-4 rounded-xl border-2 cursor-pointer`
- 미선택: `border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800`
- 선택됨: `border-jways-blue bg-jways-blue/5 dark:bg-jways-blue/10 ring-2 ring-jways-blue/20`
- 아이콘: `w-8 h-8 text-slate-400` (미선택) / `text-jways-blue` (선택)
- 호버: `hover:border-jways-blue/50 hover:bg-slate-50`
- 전환: `transition-all duration-200`
- 선택 시: 오른쪽 상단 작은 `Check` 아이콘 표시

**Step 1 유효성 검증**:
- name: 필수, trim 후 빈 문자열 체크
- email: 필수, 이메일 정규식 `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- serviceType: 선택 권장 (미선택 시 경고 토스트, 진행은 허용)

### 4.4 Step 2: 화물 정보

```
┌──────────────────────────────────────────────┐
│                                                │
│  출발지 (Origin)          도착지 (Destination)  │
│  ┌──────────────┐         ┌──────────────────┐ │
│  │ City, Country│         │ City, Country    │ │
│  └──────────────┘         └──────────────────┘ │
│                                                │
│  화물 종류 (Cargo Type)    예상 중량 (Weight)   │
│  ┌──────────────┐         ┌────────────┐[kg]  │
│  │ 일반 화물 ▾  │         │ 0          │      │
│  └──────────────┘         └────────────┘      │
│                                                │
│  화물 규격 (Dimensions - cm)                   │
│  ┌────────┐ ┌────────┐ ┌────────┐             │
│  │가로 (L)│ │세로 (W)│ │높이 (H)│             │
│  └────────┘ └────────┘ └────────┘             │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📦 예상 부피: 1.234 CBM                  │ │
│  │     항공 운임중량: 205.9 kg  해상: 1.234 RT│ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  희망 배송일 (Target Date)                     │
│  ┌──────────────────────────────────────────┐ │
│  │ 2026-03-15                                │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└──────────────────────────────────────────────┘
```

**CBM 프리뷰**: 기존 QuoteModal의 CBM 계산 로직 100% 재사용
- `AnimatePresence mode="popLayout"` 으로 나타남/사라짐
- 배경: `bg-gradient-to-br from-jways-blue/10 to-indigo-500/10`
- 기존 코드 L366~L410 의 UI 그대로 이동

**Step 2 유효성 검증**:
- origin: 필수
- destination: 필수
- weight: 필수, 양수
- length, width, height: 필수, 양수
- targetDate: 필수, 과거 날짜 불가

### 4.5 Step 3: 검토 + 제출

```
┌──────────────────────────────────────────────┐
│                                                │
│  견적 요약 (Quote Summary)                     │
│  ┌──────────────────────────────────────────┐ │
│  │ 📋 연락처 정보                 [Step 1 편집] │
│  │  이름: 홍길동                              │ │
│  │  이메일: example@company.com              │ │
│  │  서비스: ✈️ 항공 운송                       │ │
│  ├──────────────────────────────────────────┤ │
│  │ 📦 화물 정보                   [Step 2 편집] │
│  │  구간: Seoul → Los Angeles                │ │
│  │  화물: 일반 화물 / 500 kg                 │ │
│  │  규격: 120 × 80 × 100 cm                 │ │
│  │  CBM: 0.960 / 운임중량: 500.0 kg          │ │
│  │  배송일: 2026-03-15                       │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  추가 요청사항 (Message)                       │
│  ┌──────────────────────────────────────────┐ │
│  │ textarea (4줄)                            │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└──────────────────────────────────────────────┘
```

**요약 카드 스펙**:
- 컨테이너: `bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden`
- 섹션 헤더: `px-5 py-3 bg-slate-100 dark:bg-slate-800 flex justify-between items-center`
- 편집 버튼: `text-jways-blue text-sm font-medium hover:underline cursor-pointer` → 해당 Step으로 이동
- 내용 행: `px-5 py-2 text-sm text-slate-600 dark:text-slate-300`
- 서비스 표시: 아이콘 + 한글명
- CBM 강조: `font-bold text-jways-blue`
- max-height: `max-h-[40vh] overflow-y-auto` (긴 내용 대비)

**Step 3 유효성**: 없음 (이전 단계에서 이미 검증 완료, message는 선택)

### 4.6 성공 화면

기존 QuoteModal의 성공 화면 (L211~L231) 그대로 유지:
- CheckCircle2 아이콘 + 완료 메시지 + 확인 버튼
- `AnimatePresence mode="wait"` 전환

### 4.7 Navigation Footer

```
┌──────────────────────────────────────────────┐
│  Step 1:  [비어있음]          [다음 →]        │
│  Step 2:  [← 이전]           [다음 →]        │
│  Step 3:  [← 이전]           [견적 요청 보내기]│
└──────────────────────────────────────────────┘
```

**버튼 스펙**:
- 이전(Back): `px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium flex items-center gap-2`
  - 아이콘: `ChevronLeft size={18}`
- 다음(Next): `px-6 py-3 bg-jways-blue text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 flex items-center gap-2`
  - 아이콘: `ChevronRight size={18}`
  - disabled 시: `opacity-50 cursor-not-allowed`
- 제출(Submit): 기존 제출 버튼 스타일 (`w-auto px-8 py-3`로 변경)
  - 아이콘: `Send size={18}`
  - 로딩: 기존 spinner + "처리중..." 유지
- 컨테이너: `p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center`

---

## 5. 상태 관리 설계

### 5.1 App.tsx 상태 lift up

```typescript
// App.tsx 추가 상태
const [quoteModal, setQuoteModal] = useState<QuoteModalState>({ isOpen: false });

const openQuoteModal = (preSelectedService?: ServiceType) => {
  setQuoteModal({ isOpen: true, preSelectedService });
};

const closeQuoteModal = () => {
  setQuoteModal({ isOpen: false });
};
```

**Props 전달**:
```typescript
<Hero onOpenQuote={() => openQuoteModal()} />
<Services onOpenQuote={(service: ServiceType) => openQuoteModal(service)} />
<QuoteModal
  isOpen={quoteModal.isOpen}
  onClose={closeQuoteModal}
  preSelectedService={quoteModal.preSelectedService}
/>
```

### 5.2 QuoteModal 내부 상태

```typescript
// 위자드 상태
const [currentStep, setCurrentStep] = useState(1);
const [direction, setDirection] = useState(0); // -1: back, 1: forward (애니메이션 방향)

// 폼 데이터 (전체를 한 곳에서 관리, 단계별 분리 X)
const [formData, setFormData] = useState<QuoteFormData>({
  name: '', email: '', serviceType: '',
  origin: '', destination: '', cargoType: cargoTypes[0],
  weight: '', length: '', width: '', height: '',
  targetDate: '', message: ''
});

// 기존 상태 유지
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [calculatedCBM, setCalculatedCBM] = useState<number | null>(null);
```

### 5.3 preSelectedService 처리

```typescript
useEffect(() => {
  if (isOpen && preSelectedService) {
    setFormData(prev => ({ ...prev, serviceType: preSelectedService }));
  }
}, [isOpen, preSelectedService]);
```

### 5.4 단계별 유효성 검증 함수

```typescript
const validateStep = (step: number): boolean => {
  const newErrors: Record<string, string> = {};

  if (step === 1) {
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }
    // serviceType: 미선택 시 경고만 (진행 허용)
  }

  if (step === 2) {
    if (!formData.origin.trim()) newErrors.origin = '출발지를 입력해주세요.';
    if (!formData.destination.trim()) newErrors.destination = '도착지를 입력해주세요.';
    if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = '유효한 중량을 입력해주세요 (kg).';
    if (!formData.length || Number(formData.length) <= 0) newErrors.dimensions = '유효한 치수를 입력해주세요.';
    if (!formData.width || Number(formData.width) <= 0) newErrors.dimensions = '유효한 치수를 입력해주세요.';
    if (!formData.height || Number(formData.height) <= 0) newErrors.dimensions = '유효한 치수를 입력해주세요.';
    if (!formData.targetDate) {
      newErrors.targetDate = '희망 배송일을 선택해주세요.';
    } else {
      const selectedDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.targetDate = '과거 날짜는 선택할 수 없습니다.';
    }
  }

  // Step 3: 유효성 검증 없음 (message는 선택)

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 5.5 네비게이션 함수

```typescript
const handleNext = () => {
  if (validateStep(currentStep)) {
    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, 3));
  }
};

const handleBack = () => {
  setDirection(-1);
  setCurrentStep(prev => Math.max(prev - 1, 1));
  setErrors({}); // 에러 초기화
};

const goToStep = (step: number) => {
  // Step 3 요약 카드의 "편집" 버튼용
  setDirection(step < currentStep ? -1 : 1);
  setCurrentStep(step);
  setErrors({});
};
```

---

## 6. 애니메이션 설계

### 6.1 단계 전환 애니메이션

```typescript
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
  }),
};

// 사용:
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {currentStep === 1 && <Step1Content />}
    {currentStep === 2 && <Step2Content />}
    {currentStep === 3 && <Step3Content />}
  </motion.div>
</AnimatePresence>
```

### 6.2 서비스 카드 선택 애니메이션

```typescript
// 서비스 카드 whileTap
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  animate={selected ? { borderColor: '#2563eb' } : {}}
>
```

### 6.3 모달 진입/퇴장 (기존 유지)

```typescript
// 백드롭: opacity 0→1
// 모달: opacity 0→1, scale 0.95→1, y 20→0
// 기존 QuoteModal L167~L187 패턴 유지
```

### 6.4 Step Indicator 프로그레스 바 애니메이션

```typescript
// 연결선 채우기
<motion.div
  className="h-0.5 bg-jways-blue"
  initial={{ width: '0%' }}
  animate={{ width: step <= currentStep ? '100%' : '0%' }}
  transition={{ duration: 0.4, ease: 'easeInOut' }}
/>
```

---

## 7. 파일 변경 명세

### 7.1 types.ts (Minor modify)

**추가 항목** (파일 끝에):
```typescript
// ─── Quote Wizard Types ───
export type ServiceType = 'air' | 'ocean' | 'land' | 'warehouse';
export interface QuoteFormData { ... }
export interface QuoteModalState { ... }
```

### 7.2 App.tsx (Minor modify)

**변경 사항**:
1. `import { useState } from 'react'` 추가
2. `import QuoteModal from './components/QuoteModal'` 추가
3. `import { ServiceType, QuoteModalState } from './types'` 추가
4. `quoteModal` 상태 + `openQuoteModal` / `closeQuoteModal` 함수 추가
5. `<Hero>`, `<Services>` 에 `onOpenQuote` prop 전달
6. CTA 섹션 버튼에 `onClick={() => openQuoteModal()}` 추가
7. `<QuoteModal>` 을 `</main>` 뒤(Footer 앞)에 배치
8. Hero.tsx에서 QuoteModal import/렌더링 제거 (App으로 이동)

### 7.3 Hero.tsx (Minor modify)

**변경 사항**:
1. `QuoteModal` import 제거
2. `isQuoteModalOpen` 상태 제거
3. Props에 `onOpenQuote: () => void` 추가
4. 견적 요청 버튼: `setIsQuoteModalOpen(true)` → `onOpenQuote()`
5. `<QuoteModal ... />` 렌더링 제거

### 7.4 Services.tsx (Minor modify)

**변경 사항**:
1. Props에 `onOpenQuote: (service: ServiceType) => void` 추가
2. `handleInquiryClick` 변경:
   ```typescript
   const handleInquiryClick = () => {
     if (selectedService) {
       onOpenQuote(selectedService.id as ServiceType);
     }
     setSelectedService(null);
   };
   ```
3. Footer 스크롤 로직 제거

### 7.5 QuoteModal.tsx (Major rewrite)

**구조 변경**:

```typescript
// Props 변경
interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: ServiceType;
}

// 내부 인라인 컴포넌트 (함수형, 같은 파일 내)
// - StepIndicator: 프로그레스 바
// - Step1Contact: 이름, 이메일, 서비스 카드
// - Step2Cargo: 출발지, 도착지, 화물종류, 중량, 치수, CBM, 날짜
// - Step3Review: 요약 카드 + 메시지
// - NavigationFooter: Back/Next/Submit 버튼

// 기존 유지 항목:
// - cargoTypes 상수
// - CBM 계산 로직 (handleInputChange 내부)
// - CBM 프리뷰 UI
// - 성공 화면 UI
// - 백드롭/모달 진입 애니메이션
// - body scroll lock
// - 에러 스타일 (border-red-500, text-xs text-red-500)
```

---

## 8. 접근성 설계

### 8.1 ARIA 속성

| 요소 | 속성 | 값 |
|------|------|-----|
| 모달 컨테이너 | role="dialog", aria-modal="true" | 기존 유지 |
| Step Indicator | role="tablist", aria-label="견적 요청 단계" | 신규 |
| 각 Step 원 | role="tab", aria-selected | 현재 단계 여부 |
| Step 콘텐츠 | role="tabpanel", aria-labelledby | 해당 tab과 연결 |
| 서비스 카드 | role="radio", aria-checked | 선택 여부 |
| 서비스 카드 그룹 | role="radiogroup", aria-label="서비스 종류 선택" | 신규 |
| Back 버튼 | aria-label="이전 단계로 이동" | 신규 |
| Next 버튼 | aria-label="다음 단계로 이동" | 신규 |
| 닫기 버튼 | aria-label="Close modal" | 기존 유지 |

### 8.2 키보드 네비게이션

- `Escape`: 모달 닫기 (기존 body scroll lock 해제 포함)
- `Tab`: 포커스 순서 (Step Indicator → 입력 필드 → 네비게이션 버튼)
- `Enter`/`Space`: 서비스 카드 선택, 버튼 클릭
- Step Indicator: 완료된 단계는 클릭/Enter로 해당 단계 이동 가능

---

## 9. 반응형 설계

### 9.1 브레이크포인트

| 화면 | 폭 | 레이아웃 변경 |
|------|-----|-------------|
| Mobile | 320px~767px | 서비스 카드 2x2, 입력 필드 1열, 요약 카드 1열 |
| Tablet | 768px~1023px | 서비스 카드 2x2, 입력 필드 2열, 요약 카드 1열 |
| Desktop | 1024px~1440px | 서비스 카드 2x2, 입력 필드 2열, 모달 max-w-2xl |

### 9.2 모바일 최적화

- 모달 높이: `max-h-[90vh]` (기존 유지)
- Step 콘텐츠: 스크롤 영역 `overflow-y-auto`
- Navigation Footer: `sticky bottom-0` (항상 화면 하단 고정) — `shrink-0`으로 축소 방지
- 서비스 카드: `p-3` (모바일) / `p-4` (태블릿 이상)
- Step 1: 이름+이메일 1열 (모바일) / 2열 (md:)
- Step 2: 기존 반응형 패턴 유지 (grid-cols-1 md:grid-cols-2)

---

## 10. 다크 모드 설계

기존 패턴 따름 (Tailwind `dark:` 접두사):

| 요소 | Light | Dark |
|------|-------|------|
| 모달 배경 | bg-white | dark:bg-slate-900 |
| 입력 필드 배경 | bg-slate-50 | dark:bg-slate-800 |
| 입력 필드 테두리 | border-slate-200 | dark:border-slate-700 |
| 텍스트 (주) | text-slate-900 | dark:text-white |
| 텍스트 (부) | text-slate-600 | dark:text-slate-300 |
| 라벨 | text-slate-700 | dark:text-slate-300 |
| 서비스 카드 (미선택) | bg-slate-50 border-slate-200 | dark:bg-slate-800 dark:border-slate-700 |
| 서비스 카드 (선택) | bg-jways-blue/5 border-jways-blue | dark:bg-jways-blue/10 |
| 요약 카드 | bg-slate-50 | dark:bg-slate-800/50 |
| Navigation border | border-slate-200 | dark:border-slate-700 |

---

## 11. Implementation Guide

### 11.1 Implementation Order

1. [ ] **types.ts**: `ServiceType`, `QuoteFormData`, `QuoteModalState` 타입 추가
2. [ ] **App.tsx**: `quoteModal` 상태 lift up + `openQuoteModal`/`closeQuoteModal` + Props 전달 + CTA onClick + QuoteModal 렌더 위치 이동
3. [ ] **Hero.tsx**: QuoteModal import/상태/렌더 제거, `onOpenQuote` prop 수신
4. [ ] **Services.tsx**: `onOpenQuote` prop 수신, `handleInquiryClick` 변경
5. [ ] **QuoteModal.tsx**: 위자드 구조 재구성 (StepIndicator + 3 Step + NavigationFooter + 애니메이션)
6. [ ] 빌드 검증: `npm run build`
7. [ ] 수동 테스트: 3단계 전환, Back/Next, 서비스 자동 선택, CBM 계산, 다크 모드, 반응형

### 11.2 구현 주의사항

- QuoteModal 재구성 시 기존 `formData`, `handleInputChange`, CBM 계산 로직을 최대한 재사용
- `cargoTypes` 상수는 그대로 유지
- 성공 화면 UI는 기존 코드 그대로 사용 (Step 전환과 별도로 isSuccess 상태로 관리)
- 모달 열릴 때 `currentStep = 1`로 리셋, `formData` 초기화
- preSelectedService가 있으면 formData.serviceType에 반영

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-23 | Initial draft |
