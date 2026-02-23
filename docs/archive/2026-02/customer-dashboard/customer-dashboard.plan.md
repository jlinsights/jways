# Plan: Customer Dashboard (Full Customer Portal)

> PDCA Cycle #9 | Feature: `customer-dashboard`
> Created: 2026-02-24

## 1. Overview

기존 대시보드 스캐폴드(`/dashboard/*` 라우트, Sidebar, Topbar, DashboardHome)를 기반으로
**Full Customer Portal**을 구현한다. 로그인 → 화물관리 → 견적관리 → 서류관리 → 정산/빌링 → 설정까지
고객이 원스톱으로 관리할 수 있는 대시보드를 완성한다.

**현재 백엔드가 없으므로** 모든 데이터는 Mock Data로 구현하되,
API 호출 패턴(async/await, loading/error state)을 적용하여 향후 실제 API 연결이 용이하도록 설계한다.

## 2. Background

### 현재 상태 (이미 존재하는 것)
- React Router v7: `/dashboard/*` 라우트 정의됨
- `pages/Dashboard/index.tsx`: 대시보드 레이아웃 + 중첩 라우트
- `pages/Dashboard/DashboardHome.tsx`: 통계/차트 (Recharts)
- `pages/Dashboard/Sidebar.tsx`: 좌측 네비게이션 (NavLink)
- `pages/Dashboard/Topbar.tsx`: 상단 헤더 (목업 사용자: "홍길동")
- `pages/Dashboard/Sustainability.tsx`: ESG 페이지 (완성됨)
- Shipments, Quotes, Settings 라우트 → "준비 중" 스텁

### 없는 것 (구현 필요)
- 인증 시스템 (로그인/로그아웃)
- AuthContext (전역 사용자 상태)
- ProtectedRoute 래퍼
- Shipments 페이지 (화물 목록/상세)
- Quotes 페이지 (견적 관리)
- Documents 페이지 (서류 관리)
- Billing 페이지 (정산/인보이스)
- Settings 페이지 (프로필/알림 설정)
- API 클라이언트 레이어

## 3. Feature Items (7건)

### CD-1: 인증 시스템 (AuthContext + 로그인 페이지)
- **구현**: AuthContext(React Context API), ProtectedRoute 컴포넌트
- **로그인 페이지**: `/login` 라우트, 이메일/비밀번호 폼 (Mock 인증)
- **Mock 인증**: 하드코딩된 테스트 계정 (`test@jways.co.kr` / `password`)
- **상태 관리**: `isAuthenticated`, `user`, `login()`, `logout()`
- **세션 유지**: `localStorage`에 토큰 저장 (Mock JWT)
- **파일**: `contexts/AuthContext.tsx`, `pages/Login.tsx`, `components/ProtectedRoute.tsx`

### CD-2: Shipments 페이지 (화물 관리)
- **목록 뷰**: 테이블 형태, 상태 필터(전체/진행/완료/지연), 검색
- **상세 뷰**: 클릭 시 슬라이드 패널 또는 모달 → 추적 타임라인, 지도, 서류
- **Mock 데이터**: 기존 `MOCK_SHIPMENTS` 패턴 확장 (10~15건)
- **파일**: `pages/Dashboard/Shipments.tsx`

### CD-3: Quotes 페이지 (견적 관리)
- **목록**: 견적 요청 이력 (상태: 대기/승인/만료)
- **상세**: 견적 내역, 비교 뷰
- **새 견적 요청**: 기존 QuoteModal 로직 재활용
- **Mock 데이터**: 5~8건 견적 이력
- **파일**: `pages/Dashboard/Quotes.tsx`

### CD-4: Documents 페이지 (서류 관리)
- **서류 목록**: B/L, Invoice, Packing List, CO 등 카테고리별 분류
- **검색/필터**: 서류 유형, 선적 번호, 날짜별
- **Mock 다운로드**: 클릭 시 토스트 알림 (실제 파일 없음)
- **파일**: `pages/Dashboard/Documents.tsx`

### CD-5: Billing 페이지 (정산/인보이스)
- **인보이스 목록**: 미수금/완납 상태, 금액, 날짜
- **요약 통계**: 총 미수금, 월별 정산액, 미납 건수
- **Mock 데이터**: 6~10건 인보이스
- **파일**: `pages/Dashboard/Billing.tsx`

### CD-6: Settings 페이지 (프로필/알림 설정)
- **프로필**: 이름, 이메일, 회사명, 연락처 (편집 가능, Mock 저장)
- **알림 설정**: 이메일/SMS 알림 토글
- **테마 설정**: 다크모드 토글 (기존 Header 로직 연결)
- **파일**: `pages/Dashboard/Settings.tsx`

### CD-7: Sidebar 업데이트 + API 클라이언트 레이어
- **Sidebar**: Documents, Billing 메뉴 항목 추가
- **API 클라이언트**: `lib/api.ts` — Mock async 함수들 (딜레이 시뮬레이션)
- **타입 정의**: `types.ts`에 Dashboard 관련 타입 추가
  - `User`, `Invoice`, `Document`, `QuoteHistory`, `NotificationSetting`
- **파일**: `pages/Dashboard/Sidebar.tsx`, `lib/api.ts`, `types.ts`

## 4. Affected Files

| File | Status | Items |
|------|--------|-------|
| `contexts/AuthContext.tsx` | **NEW** | CD-1 |
| `pages/Login.tsx` | **NEW** | CD-1 |
| `components/ProtectedRoute.tsx` | **NEW** | CD-1 |
| `lib/api.ts` | **NEW** | CD-7 |
| `pages/Dashboard/Shipments.tsx` | **REWRITE** | CD-2 |
| `pages/Dashboard/Quotes.tsx` | **REWRITE** | CD-3 |
| `pages/Dashboard/Documents.tsx` | **NEW** | CD-4 |
| `pages/Dashboard/Billing.tsx` | **NEW** | CD-5 |
| `pages/Dashboard/Settings.tsx` | **REWRITE** | CD-6 |
| `pages/Dashboard/Sidebar.tsx` | **EDIT** | CD-7 |
| `pages/Dashboard/index.tsx` | **EDIT** | CD-1, CD-4, CD-5 (라우트 추가) |
| `App.tsx` | **EDIT** | CD-1 (로그인 라우트, ProtectedRoute) |
| `types.ts` | **EDIT** | CD-7 (타입 추가) |

## 5. Implementation Order

1. **CD-7** (API 레이어 + 타입) — 다른 모든 페이지의 의존성
2. **CD-1** (인증 시스템) — 대시보드 접근 제어
3. **CD-2** (Shipments) — 핵심 기능, 가장 복잡
4. **CD-3** (Quotes) — 기존 QuoteModal 재활용
5. **CD-4** (Documents) — 독립 컴포넌트
6. **CD-5** (Billing) — 독립 컴포넌트
7. **CD-6** (Settings) — 마지막 (AuthContext 필요)

## 6. Success Criteria

- 모든 7건 구현 완료
- `npm run build` 에러 없이 통과
- `/login` → 로그인 → `/dashboard` 리다이렉트 동작
- 미인증 상태에서 `/dashboard` 접근 시 `/login`으로 리다이렉트
- 모든 대시보드 페이지에서 Mock 데이터 표시
- Sidebar 네비게이션 전체 동작
- 다크모드 전체 페이지 지원
- 모바일 반응형 (Sidebar 축소/햄버거)

## 7. Technical Decisions

| 결정 | 선택 | 이유 |
|------|------|------|
| 인증 방식 | Mock Auth (Context API) | 백엔드 없음, 향후 교체 용이 |
| 상태 관리 | React Context API | 외부 라이브러리 불필요한 규모 |
| API 레이어 | Mock async functions | 실제 API 구조 모방, 향후 교체 시 함수 내부만 변경 |
| 라우팅 | 기존 React Router v7 확장 | 이미 구조 존재 |
| 차트 | Recharts (기존) | 이미 설치됨, DashboardHome에서 사용 중 |
| 테이블 | 커스텀 Tailwind 테이블 | 외부 라이브러리 추가 최소화 |

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| 페이지 수 많아 구현 시간 초과 | Medium | Mock 데이터 간결히, UI 기본 패턴 재활용 |
| 타입 정의 복잡도 | Low | 기존 types.ts 패턴 따름 |
| Sidebar 모바일 반응형 | Medium | 기존 Sidebar 반응형 로직 확인 후 확장 |
| 다크모드 누락 | Low | 모든 새 컴포넌트에 `dark:` 접두어 적용 |
| Context 리렌더링 성능 | Low | AuthContext만 전역, 나머지 로컬 state |

## 9. Out of Scope

- 실제 백엔드 API 연동 (Supabase, Firebase 등)
- 실시간 알림 (WebSocket)
- 파일 업로드/다운로드
- 결제 처리 (Stripe 등)
- 이메일 발송
- 다국어 지원 (현재 한국어 only)
