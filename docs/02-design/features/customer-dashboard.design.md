# Customer Dashboard Design Document

> **Summary**: Full Customer Portal — 인증, 화물관리, 견적관리, 서류관리, 정산/빌링, 설정 페이지 구현
>
> **Project**: Jways Logistics
> **Version**: 1.0.0
> **Author**: Claude Code (PDCA Cycle #9)
> **Date**: 2026-02-24
> **Status**: Draft
> **Planning Doc**: [customer-dashboard.plan.md](../../01-plan/features/customer-dashboard.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | N/A |
| Phase 2 | Coding Conventions | N/A |
| Phase 3 | Mockup | N/A |
| Phase 4 | API Spec | N/A |

> Dynamic 레벨 SPA (Mock Backend) — Pipeline 미적용

---

## 1. Overview

### 1.1 Design Goals

1. **원스톱 포털**: 로그인 → 화물 → 견적 → 서류 → 정산 → 설정까지 고객이 한 곳에서 관리
2. **API-Ready Architecture**: Mock 데이터이지만 `lib/api.ts` 통해 모든 데이터 접근 → 향후 실제 API 교체 시 함수 내부만 변경
3. **비파괴적 확장**: 기존 DashboardLayout, Sidebar, Topbar, DashboardHome, Sustainability 유지
4. **일관된 디자인**: 기존 대시보드 컴포넌트(카드, 테이블, 버튼) 패턴 재활용
5. **다크모드 완전 지원**: 모든 신규 페이지에 `dark:` Tailwind 클래스 적용

### 1.2 Design Principles

- **Single Responsibility**: 각 페이지 컴포넌트는 하나의 도메인만 담당
- **Context 최소화**: AuthContext만 전역, 나머지는 로컬 state
- **Progressive Enhancement**: 기존 스텁 페이지를 점진적으로 완성
- **Consistent Patterns**: Tailwind CDN, lucide-react, framer-motion 패턴 유지

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ App.tsx                                                          │
│  ├─ <AuthProvider>                                               │
│  │   ├─ Route "/" → LandingPage                                  │
│  │   ├─ Route "/login" → Login                                   │
│  │   ├─ Route "/instant-quote" → InstantQuote                    │
│  │   └─ Route "/dashboard/*" → <ProtectedRoute>                  │
│  │       └─ DashboardLayout                                      │
│  │           ├─ Sidebar (Updated: +Documents, +Billing)          │
│  │           ├─ Topbar (Updated: AuthContext user info)           │
│  │           └─ <Routes>                                         │
│  │               ├─ "/" → DashboardHome (기존)                    │
│  │               ├─ "/shipments" → Shipments (NEW)               │
│  │               ├─ "/quotes" → Quotes (NEW)                     │
│  │               ├─ "/documents" → Documents (NEW)               │
│  │               ├─ "/billing" → Billing (NEW)                   │
│  │               ├─ "/sustainability" → Sustainability (기존)     │
│  │               └─ "/settings" → Settings (NEW)                 │
│  │                                                               │
│  └─ lib/api.ts (Mock API Layer)                                  │
│  └─ contexts/AuthContext.tsx (전역 인증 상태)                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Components  │ ──→ │  lib/api.ts  │ ──→ │  Mock Data   │
│  (useState)  │ ←── │  (async/     │ ←── │  (constants) │
│              │     │   await)     │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
        │
        ▼
┌──────────────┐
│ AuthContext   │ ← localStorage (Mock JWT)
│ (useContext)  │
└──────────────┘
```

### 2.3 File Structure

```
├── contexts/
│   └── AuthContext.tsx          [NEW] CD-1
├── components/
│   └── ProtectedRoute.tsx      [NEW] CD-1
├── lib/
│   └── api.ts                  [NEW] CD-7
├── pages/
│   ├── Login.tsx               [NEW] CD-1
│   └── Dashboard/
│       ├── index.tsx           [EDIT] 라우트 추가
│       ├── Sidebar.tsx         [EDIT] 메뉴 추가
│       ├── Topbar.tsx          [EDIT] AuthContext 연결
│       ├── DashboardHome.tsx   (기존 유지)
│       ├── Sustainability.tsx  (기존 유지)
│       ├── Shipments.tsx       [REWRITE] CD-2
│       ├── Quotes.tsx          [REWRITE] CD-3
│       ├── Documents.tsx       [NEW] CD-4
│       ├── Billing.tsx         [NEW] CD-5
│       └── Settings.tsx        [REWRITE] CD-6
├── types.ts                    [EDIT] 타입 추가
└── App.tsx                     [EDIT] AuthProvider, ProtectedRoute, Login 라우트
```

---

## 3. Type Definitions (CD-7)

### 3.1 types.ts 추가 타입

```typescript
// ─── Dashboard / Auth Types ───

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: DashboardUser | null;
  token: string | null;
}

// ─── Shipment List Types ───

export type ShipmentStatus = 'in-transit' | 'customs' | 'delivered' | 'delayed' | 'pending';

export interface ShipmentListItem {
  id: string;
  blNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  mode: TransportMode;
  departureDate: string;
  estimatedArrival: string;
  cargoType: string;
  weight: string;
  containerCount?: number;
  progress: number; // 0-100
}

// ─── Quote History Types ───

export type QuoteStatus = 'pending' | 'approved' | 'expired' | 'rejected';

export interface QuoteHistory {
  id: string;
  requestDate: string;
  serviceType: ServiceType;
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  status: QuoteStatus;
  estimatedPrice?: string;
  validUntil?: string;
  assignedManager?: string;
}

// ─── Document Types ───

export type DocumentCategory = 'bl' | 'invoice' | 'packing-list' | 'co' | 'insurance' | 'other';

export interface DashboardDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  shipmentId: string;
  shipmentBlNumber: string;
  uploadDate: string;
  fileSize: string;
  status: 'issued' | 'pending' | 'draft';
}

// ─── Billing Types ───

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'partial';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  shipmentId: string;
  blNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
}

export interface BillingSummary {
  totalOutstanding: number;
  monthlySettled: number;
  overdueCount: number;
  currency: string;
}

// ─── Settings Types ───

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  phone: string;
  position?: string;
}
```

---

## 4. API Layer Design (CD-7)

### 4.1 lib/api.ts

모든 함수는 `async`이며 `setTimeout`으로 300~800ms 딜레이를 시뮬레이션한다. 향후 실제 API로 교체 시 함수 시그니처는 유지하고 내부만 `fetch()`로 변경한다.

```typescript
// lib/api.ts — Mock API Client

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Auth ───
export async function loginAPI(email: string, password: string): Promise<{ user: DashboardUser; token: string }>
export async function logoutAPI(): Promise<void>

// ─── Shipments ───
export async function getShipments(filters?: { status?: ShipmentStatus; search?: string }): Promise<ShipmentListItem[]>
export async function getShipmentDetail(id: string): Promise<ShipmentData>

// ─── Quotes ───
export async function getQuoteHistory(filters?: { status?: QuoteStatus }): Promise<QuoteHistory[]>
export async function createQuoteRequest(data: QuoteFormData): Promise<QuoteHistory>

// ─── Documents ───
export async function getDocuments(filters?: { category?: DocumentCategory; shipmentId?: string }): Promise<DashboardDocument[]>
export async function downloadDocument(id: string): Promise<void> // Mock: 토스트 알림만

// ─── Billing ───
export async function getInvoices(filters?: { status?: InvoiceStatus }): Promise<Invoice[]>
export async function getBillingSummary(): Promise<BillingSummary>

// ─── Settings ───
export async function getUserProfile(): Promise<UserProfile>
export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile>
export async function getNotificationSettings(): Promise<NotificationSetting[]>
export async function updateNotificationSetting(id: string, data: Partial<NotificationSetting>): Promise<NotificationSetting>
```

### 4.2 Mock Data 규모

| 도메인 | Mock 건수 | 설명 |
|--------|----------|------|
| Shipments | 12건 | 다양한 status 분포 (in-transit 4, customs 2, delivered 4, delayed 1, pending 1) |
| Quotes | 6건 | pending 2, approved 2, expired 1, rejected 1 |
| Documents | 15건 | 각 shipment에 2~3개 서류 연결 |
| Invoices | 8건 | paid 3, unpaid 2, overdue 2, partial 1 |
| Notifications | 5건 | 화물 상태, 서류 발급, 정산 기한, 견적 회신, 뉴스레터 |

---

## 5. Component Specifications

### 5.1 CD-1: 인증 시스템

#### 5.1.1 contexts/AuthContext.tsx

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: DashboardUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
```

**동작**:
- `login()`: 이메일/비밀번호 검증 → Mock 유저 생성 → `localStorage.setItem('jways_token', mockToken)` → `isAuthenticated = true`
- `logout()`: `localStorage.removeItem('jways_token')` → `user = null` → navigate('/login')
- **초기화**: `useEffect`에서 `localStorage`에 토큰 있으면 자동 로그인 (Mock 유저 복원)
- **테스트 계정**: `test@jways.co.kr` / `password`

#### 5.1.2 pages/Login.tsx

**UI 구성**:
```
┌──────────────────────────────────────────────┐
│                                              │
│          ┌─────────────────────┐             │
│          │      J-Ways 로고     │             │
│          │                     │             │
│          │  [이메일 입력]       │             │
│          │  [비밀번호 입력]     │             │
│          │                     │             │
│          │  [ 로그인 버튼 ]     │             │
│          │                     │             │
│          │  테스트 계정 안내     │             │
│          └─────────────────────┘             │
│                                              │
│  배경: jways.navy 그라데이션                    │
└──────────────────────────────────────────────┘
```

**스타일**:
- 배경: `bg-gradient-to-br from-slate-900 to-indigo-950`
- 카드: `bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md`
- 로고: 기존 Sidebar 로고 패턴 재사용
- 입력: `bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3`
- 버튼: `bg-jways-blue hover:bg-blue-700 text-white rounded-xl py-3 w-full font-bold`
- 에러: `text-red-500 text-sm` (잘못된 로그인 시)
- 테스트 안내: 하단 `text-slate-400 text-xs`에 테스트 계정 정보 표시

**동작**:
- 로그인 성공 → `navigate('/dashboard')`
- 이미 로그인 → `/dashboard`로 리다이렉트
- framer-motion fadeIn 애니메이션

#### 5.1.3 components/ProtectedRoute.tsx

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**동작**:
- `isAuthenticated === false` → `<Navigate to="/login" replace />`
- `loading === true` → 로딩 스피너 표시
- `isAuthenticated === true` → `{children}` 렌더링

#### 5.1.4 App.tsx 수정사항

```tsx
// Before
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/dashboard/*" element={<DashboardLayout />} />
  <Route path="/instant-quote" element={<InstantQuote />} />
</Routes>

// After
<AuthProvider>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard/*" element={
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    } />
    <Route path="/instant-quote" element={<InstantQuote />} />
  </Routes>
</AuthProvider>
```

---

### 5.2 CD-2: Shipments 페이지

#### UI 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 내 화물 관리                              [검색 입력]        │
├─────────────────────────────────────────────────────────────┤
│ [전체(12)] [진행중(4)] [통관(2)] [완료(4)] [지연(1)]         │
├────┬──────────┬──────────┬────────┬──────────┬──────┬──────┤
│ #  │ B/L No.  │ 구간     │ 상태   │ 예정도착  │ 진행률│ 상세 │
├────┼──────────┼──────────┼────────┼──────────┼──────┼──────┤
│ 1  │ JW-8839  │ ICN→LAX  │ 🚢진행 │ 02-28    │ ██▓░ │ [>]  │
│ 2  │ JW-7721  │ BUS→SHA  │ ✅완료 │ 02-20    │ ████ │ [>]  │
│ ...│ ...      │ ...      │ ...    │ ...      │ ...  │ ...  │
└────┴──────────┴──────────┴────────┴──────────┴──────┴──────┘
```

**컴포넌트 구조**:
- **상태 필터 탭**: `all | in-transit | customs | delivered | delayed` — 탭 클릭 시 필터링
- **검색**: B/L 번호, 출발/도착지 텍스트 검색
- **테이블**: Tailwind 커스텀 테이블 (`<table>` 기반)
- **상태 배지**: 색상별 상태 표시
  - `in-transit`: `bg-blue-100 text-blue-700`
  - `customs`: `bg-amber-100 text-amber-700`
  - `delivered`: `bg-green-100 text-green-700`
  - `delayed`: `bg-red-100 text-red-700`
  - `pending`: `bg-slate-100 text-slate-700`
- **진행률 바**: `bg-jways-blue` 가로 프로그레스바
- **상세 보기**: 행 클릭 → 슬라이드 오버 패널 (AnimatePresence)

**상세 패널**:
```
┌──────────────────────────────────┐
│ [X]  JW-8839-KR 상세              │
├──────────────────────────────────┤
│ ┌────────────────────────────┐   │
│ │ 추적 타임라인 (세로)         │   │
│ │ ● 출발 — 02-15 ICN          │   │
│ │ │                           │   │
│ │ ◐ 환적 — 02-18 SHA          │   │
│ │ │                           │   │
│ │ ○ 도착 — 02-28 LAX (예정)   │   │
│ └────────────────────────────┘   │
│                                  │
│ 화물 정보: 일반화물, 2.5T, 12CBM  │
│ 관련 서류: B/L, Invoice           │
└──────────────────────────────────┘
```

**상세 패널 스타일**:
- `fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl z-50`
- framer-motion `x: '100%'` → `x: 0` 슬라이드 애니메이션
- 오버레이: `bg-black/50` 배경 클릭 시 닫기

**Hook 패턴**:
```typescript
const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState<ShipmentStatus | 'all'>('all');
const [search, setSearch] = useState('');
const [selectedId, setSelectedId] = useState<string | null>(null);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    const data = await getShipments({ status: filter === 'all' ? undefined : filter, search });
    setShipments(data);
    setLoading(false);
  };
  load();
}, [filter, search]);
```

---

### 5.3 CD-3: Quotes 페이지

#### UI 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 견적 관리                              [ + 새 견적 요청 ]    │
├─────────────────────────────────────────────────────────────┤
│ [전체(6)] [대기(2)] [승인(2)] [만료(1)] [거절(1)]            │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐           │
│ │ QT-2024-001          항공 운송    2026-02-20   │           │
│ │ ICN → LAX            일반화물      대기 🟡      │           │
│ │ 예상 금액: ₩3,500,000   유효기한: 02-27        │           │
│ └────────────────────────────────────────────────┘           │
│ ┌────────────────────────────────────────────────┐           │
│ │ QT-2024-002          해상 운송    2026-02-18   │           │
│ │ BUS → HKG            냉동화물      승인 🟢      │           │
│ │ 확정 금액: ₩8,200,000   유효기한: 03-18        │           │
│ └────────────────────────────────────────────────┘           │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

**컴포넌트 구조**:
- **카드 리스트**: 각 견적을 카드 형태로 표시 (테이블 대신 카드)
- **상태 필터**: `all | pending | approved | expired | rejected`
- **새 견적 요청**: 기존 `QuoteModal` 컴포넌트 import하여 재사용
- **상태 배지**:
  - `pending`: `bg-yellow-100 text-yellow-700` "대기"
  - `approved`: `bg-green-100 text-green-700` "승인"
  - `expired`: `bg-slate-100 text-slate-500` "만료"
  - `rejected`: `bg-red-100 text-red-700` "거절"

**카드 스타일**:
- `bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm`
- hover: `hover:border-jways-blue/30 transition-colors`

---

### 5.4 CD-4: Documents 페이지

#### UI 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 서류 관리                                 [검색 입력]        │
├─────────────────────────────────────────────────────────────┤
│ [전체] [B/L] [Invoice] [Packing List] [C/O] [보험증권]      │
├────┬──────────────┬──────────┬────────┬──────────┬──────────┤
│ #  │ 서류명        │ 유형     │ 선적번호│ 발행일   │ 다운로드 │
├────┼──────────────┼──────────┼────────┼──────────┼──────────┤
│ 1  │ BL-JW8839    │ B/L      │ JW-8839│ 02-15    │ [↓]      │
│ 2  │ INV-2024-001 │ Invoice  │ JW-8839│ 02-15    │ [↓]      │
│ ...│ ...          │ ...      │ ...    │ ...      │ ...      │
└────┴──────────────┴──────────┴────────┴──────────┴──────────┘
```

**컴포넌트 구조**:
- **카테고리 필터**: `all | bl | invoice | packing-list | co | insurance | other`
- **검색**: 서류명, 선적 번호로 검색
- **테이블**: Tailwind 커스텀 테이블
- **다운로드**: 클릭 시 토스트 알림 ("다운로드 준비 중...") — 실제 파일 없음
- **유형 아이콘**: 카테고리별 lucide-react 아이콘
  - `bl`: `FileText`
  - `invoice`: `Receipt`
  - `packing-list`: `ClipboardList`
  - `co`: `Award`
  - `insurance`: `Shield`

**토스트 알림**:
- 하단 고정 `fixed bottom-4 right-4`
- `bg-slate-900 text-white rounded-xl px-4 py-3 shadow-lg`
- framer-motion 3초 후 자동 사라짐

---

### 5.5 CD-5: Billing 페이지

#### UI 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 정산 / 인보이스                                              │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│ │ 총 미수금    │  │ 이번 달 정산│  │ 미납 건수   │             │
│ │ ₩15,400,000│  │ ₩28,700,000│  │ 2건         │             │
│ │ 3건 미수     │  │ +12% 전월비│  │ ⚠ 연체 포함 │             │
│ └────────────┘  └────────────┘  └────────────┘             │
├─────────────────────────────────────────────────────────────┤
│ [전체(8)] [미수(2)] [연체(2)] [완납(3)] [부분납(1)]           │
├────┬───────────┬──────────┬───────────┬─────────┬──────────┤
│ #  │ 인보이스 No│ 선적번호  │ 금액      │ 상태    │ 기한     │
├────┼───────────┼──────────┼───────────┼─────────┼──────────┤
│ 1  │ INV-001   │ JW-8839  │ ₩5,200,000│ 연체 🔴 │ 02-10    │
│ 2  │ INV-002   │ JW-7721  │ ₩3,100,000│ 완납 🟢 │ 02-20    │
│ ...│ ...       │ ...      │ ...       │ ...     │ ...      │
└────┴───────────┴──────────┴───────────┴─────────┴──────────┘
```

**컴포넌트 구조**:
- **요약 카드 3개**: 총 미수금, 월별 정산액, 미납 건수 — DashboardHome 스탯 카드 패턴 재사용
- **상태 필터**: `all | unpaid | overdue | paid | partial`
- **테이블**: 금액은 `Intl.NumberFormat('ko-KR')` 포맷
- **상태 배지**:
  - `paid`: `bg-green-100 text-green-700`
  - `unpaid`: `bg-yellow-100 text-yellow-700`
  - `overdue`: `bg-red-100 text-red-700`
  - `partial`: `bg-blue-100 text-blue-700`

---

### 5.6 CD-6: Settings 페이지

#### UI 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 환경 설정                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ─── 프로필 정보 ─────────────────────────────────            │
│ 이름:    [홍길동          ]                                  │
│ 이메일:  [test@jways.co.kr]                                 │
│ 회사명:  [삼성전자 (주)    ]                                  │
│ 연락처:  [010-1234-5678   ]                                 │
│                          [ 저장 ]                            │
│                                                             │
│ ─── 알림 설정 ───────────────────────────────────            │
│ 화물 상태 변경    이메일 [ON]  SMS [OFF]                      │
│ 서류 발급 알림    이메일 [ON]  SMS [ON]                       │
│ 정산 기한 알림    이메일 [ON]  SMS [OFF]                      │
│ 견적 회신 알림    이메일 [ON]  SMS [OFF]                      │
│ 뉴스레터         이메일 [OFF] SMS [OFF]                      │
│                                                             │
│ ─── 테마 설정 ───────────────────────────────────            │
│ 다크 모드        [토글 스위치]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**컴포넌트 구조**:
- **3개 섹션**: 프로필, 알림, 테마 — 각각 `bg-white dark:bg-slate-900 rounded-2xl border p-6` 카드
- **프로필 폼**: `input` 4개 + 저장 버튼
  - 저장 시 Mock 딜레이 → 성공 토스트
  - AuthContext에서 user 정보 가져와 초기값 설정
- **알림 토글**: 각 항목별 이메일/SMS 토글 스위치
  - 토글 스타일: `w-10 h-6 rounded-full` 커스텀 토글 (Tailwind)
- **다크모드**: `document.documentElement.classList.toggle('dark')` + `localStorage.theme` (기존 Header 로직 재사용)

---

### 5.7 CD-7: Sidebar + 라우트 업데이트

#### Sidebar 변경

기존 navItems 배열에 2개 항목 추가:

```typescript
const navItems = [
  { name: '대시보드 홈', path: '/dashboard', icon: LayoutDashboard },
  { name: '내 화물 관리', path: '/dashboard/shipments', icon: Package },
  { name: '견적 / 예약', path: '/dashboard/quotes', icon: FileText },
  { name: '서류 관리', path: '/dashboard/documents', icon: FolderOpen },  // NEW
  { name: '정산 / 인보이스', path: '/dashboard/billing', icon: CreditCard },  // NEW
  { name: 'ESG 탄소 리포트', path: '/dashboard/sustainability', icon: Leaf },
  { name: '환경 설정', path: '/dashboard/settings', icon: Settings },
];
```

**LogOut 버튼**: AuthContext의 `logout()` 함수 연결

#### Topbar 변경

```typescript
// Before (하드코딩)
<p>홍길동 고객님</p>
<p>삼성전자 (주)</p>

// After (AuthContext 연결)
const { user } = useAuth();
<p>{user?.name} 고객님</p>
<p>{user?.company}</p>
```

#### index.tsx 라우트 추가

```tsx
// 기존 스텁 컴포넌트 제거, 실제 컴포넌트 import
import Shipments from './Shipments';
import Quotes from './Quotes';
import Documents from './Documents';
import Billing from './Billing';
import Settings from './Settings';

<Routes>
  <Route path="/" element={<DashboardHome />} />
  <Route path="/shipments" element={<Shipments />} />
  <Route path="/quotes" element={<Quotes />} />
  <Route path="/documents" element={<Documents />} />    {/* NEW */}
  <Route path="/billing" element={<Billing />} />        {/* NEW */}
  <Route path="/sustainability" element={<Sustainability />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

---

## 6. Shared UI Patterns

### 6.1 Loading State

모든 페이지 공통 로딩 패턴:

```tsx
{loading ? (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-4 border-jways-blue/30 border-t-jways-blue rounded-full animate-spin" />
  </div>
) : (
  /* 실제 컨텐츠 */
)}
```

### 6.2 Empty State

데이터 없을 때 공통 패턴:

```tsx
<div className="text-center py-20">
  <Icon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
  <p className="text-slate-500 dark:text-slate-400">표시할 데이터가 없습니다</p>
</div>
```

### 6.3 Filter Tab Pattern

```tsx
<div className="flex gap-2 mb-6 flex-wrap">
  {filters.map(f => (
    <button
      key={f.value}
      onClick={() => setFilter(f.value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        filter === f.value
          ? 'bg-jways-blue text-white'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {f.label} ({f.count})
    </button>
  ))}
</div>
```

### 6.4 Table Pattern

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-slate-200 dark:border-slate-700">
        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Header
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
        <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">Cell</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 6.5 Status Badge Pattern

```tsx
const statusConfig: Record<string, { label: string; className: string }> = {
  'in-transit': { label: '운송중', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  // ...
};

<span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[status].className}`}>
  {statusConfig[status].label}
</span>
```

---

## 7. Implementation Order

```
CD-7 (타입 + API 레이어)
  │
  ├─→ CD-1 (인증 시스템)
  │     │
  │     ├─→ CD-2 (Shipments) ← 가장 복잡, 슬라이드 패널 포함
  │     │
  │     ├─→ CD-3 (Quotes) ← QuoteModal 재사용
  │     │
  │     ├─→ CD-4 (Documents) ← 독립
  │     │
  │     ├─→ CD-5 (Billing) ← 독립
  │     │
  │     └─→ CD-6 (Settings) ← AuthContext 의존
  │
  └─→ CD-7 후반 (Sidebar 업데이트, Topbar 업데이트, 라우트 추가)
```

**구현 순서**: CD-7 → CD-1 → CD-2 → CD-3 → CD-4 → CD-5 → CD-6 → CD-7 후반(Sidebar/Topbar/라우트)

---

## 8. Accessibility Requirements

| 항목 | 기준 | 적용 위치 |
|------|------|----------|
| 키보드 네비게이션 | Tab/Enter/Escape | 모든 인터랙티브 요소 |
| 포커스 관리 | focus-visible:ring-2 | 버튼, 입력, 링크 |
| ARIA labels | aria-label, role | 테이블, 필터, 모달 |
| 색상 대비 | WCAG AA (4.5:1) | 모든 텍스트 |
| 터치 타겟 | min 44x44px | 모바일 버튼/링크 |
| 시맨틱 HTML | section, nav, main | 페이지 구조 |
| 상태 알림 | role="alert" | 에러/성공 메시지 |

---

## 9. Responsive Design

| Breakpoint | Sidebar | 테이블 | 카드 그리드 |
|-----------|---------|--------|------------|
| `< md` (768px) | 숨김 (Topbar에 "화주 포털" 텍스트) | 가로 스크롤 | 1열 |
| `md ~ lg` | 표시 (w-64) | 전체 표시 | 2열 |
| `lg+` (1024px) | 표시 | 전체 표시 | 3~4열 |

**모바일 고려사항**:
- 테이블은 `overflow-x-auto`로 가로 스크롤 허용
- 슬라이드 패널은 모바일에서 `w-full` (풀스크린)
- 필터 탭은 `flex-wrap`으로 줄 바꿈

---

## 10. Dark Mode Specification

모든 신규 컴포넌트에 적용할 다크모드 패턴:

| 요소 | Light | Dark |
|------|-------|------|
| 페이지 배경 | (상위 `bg-slate-50`) | (상위 `dark:bg-slate-950`) |
| 카드 배경 | `bg-white` | `dark:bg-slate-900` |
| 카드 테두리 | `border-slate-200` | `dark:border-slate-800` |
| 제목 텍스트 | `text-slate-900` | `dark:text-white` |
| 본문 텍스트 | `text-slate-700` | `dark:text-slate-300` |
| 보조 텍스트 | `text-slate-500` | `dark:text-slate-400` |
| 입력 배경 | `bg-slate-50` | `dark:bg-slate-800` |
| 구분선 | `border-slate-200` | `dark:border-slate-700` |
| 호버 | `hover:bg-slate-50` | `dark:hover:bg-slate-800` |

---

## 11. Checklist

| ID | Feature | Files | 상태 |
|----|---------|-------|------|
| CD-7 | 타입 정의 + API 레이어 | `types.ts`, `lib/api.ts` | ⬜ |
| CD-1 | 인증 시스템 | `contexts/AuthContext.tsx`, `pages/Login.tsx`, `components/ProtectedRoute.tsx`, `App.tsx` | ⬜ |
| CD-2 | Shipments 페이지 | `pages/Dashboard/Shipments.tsx` | ⬜ |
| CD-3 | Quotes 페이지 | `pages/Dashboard/Quotes.tsx` | ⬜ |
| CD-4 | Documents 페이지 | `pages/Dashboard/Documents.tsx` | ⬜ |
| CD-5 | Billing 페이지 | `pages/Dashboard/Billing.tsx` | ⬜ |
| CD-6 | Settings 페이지 | `pages/Dashboard/Settings.tsx` | ⬜ |
| CD-7b | Sidebar + Topbar + 라우트 | `Sidebar.tsx`, `Topbar.tsx`, `index.tsx` | ⬜ |
