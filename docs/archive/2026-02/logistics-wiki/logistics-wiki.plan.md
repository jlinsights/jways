# Plan: Logistics Wiki

> PDCA Cycle #6 | Feature: logistics-wiki
> Created: 2026-02-23

## 1. Overview

Jways 물류 마케팅 SPA의 "무역 백과사전 & 리소스" 섹션에 물류 용어 사전(Wiki) 위젯을 구현한다. 해상 운송, 통관/관세, 부대비용 등 카테고리별 핵심 용어를 검색 가능한 아코디언 형태로 제공하여 화주 고객의 무역 용어 이해를 돕는다.

## 2. Problem Statement

- 물류 업계 용어는 영문 약어(FCL, LCL, THC 등)가 많아 초보 화주에게 진입 장벽이 됨
- 기존 검색 엔진으로는 맥락에 맞는 간결한 용어 설명을 찾기 어려움
- Jways 웹사이트에 고객이 반복적으로 참조할 수 있는 용어 사전 필요

## 3. Goals

### Primary Goals
- [ ] 3개 카테고리(해상 운송, 통관/관세, 부대비용)의 핵심 용어 제공
- [ ] 실시간 검색 기능 (용어명 + 설명 텍스트 내 검색)
- [ ] 아코디언(접기/펼치기) 형태로 용어 정의 표시

### Secondary Goals
- [ ] 다크모드 지원
- [ ] 반응형 레이아웃 (모바일/데스크톱)
- [ ] framer-motion 애니메이션으로 부드러운 펼침/접힘 효과
- [ ] 접근성(a11y) 확보

## 4. Target Users

| User Type | Description | Needs |
|-----------|-------------|-------|
| 초보 화주 | 처음 수출입하는 중소기업 담당자 | 용어 의미 파악, 빠른 검색 |
| 경험 있는 화주 | 기존 거래 경험이 있는 무역 담당자 | 특정 용어 빠른 참조 |
| 영업팀 | Jways 내부 직원 | 고객 상담 시 용어 설명 자료 |

## 5. Functional Requirements

### FR-01: 카테고리별 용어 표시
- 3개 카테고리: "해상 운송 기본 용어", "통관 및 관세청 연관", "주요 부대 비용 (Surcharges)"
- 각 카테고리에 3~4개 용어 (총 10개)
- Hash 아이콘 + 카테고리명 헤더, 밑줄 구분

### FR-02: 실시간 검색
- 상단 검색 입력 필드
- 검색어가 term 또는 def에 포함되면 필터링
- 검색 결과 없을 시 안내 메시지 표시
- 검색 중일 때 모든 항목 자동 펼침

### FR-03: 아코디언 토글
- 각 용어를 클릭하면 정의 펼침/접힘
- ChevronDown 아이콘 회전 애니메이션 (180도)
- AnimatePresence로 부드러운 height/opacity 전환

### FR-04: 헤더 섹션
- gradient 배경 (indigo-600 → purple-600)
- BookOpen 아이콘 + "물류 백과사전 & FAQ" 제목
- 설명 텍스트 + 검색 입력 필드

### FR-05: 콘텐츠 스크롤
- 최대 높이 600px, 초과 시 스크롤
- custom-scrollbar 스타일 적용

### FR-06: 검색 결과 없음 상태
- 검색어를 포함한 안내 메시지
- 중앙 정렬, 패딩 처리

## 6. Non-Functional Requirements

### NFR-01: Performance
- 검색 필터링은 useMemo로 최적화
- 불필요한 리렌더링 방지

### NFR-02: Responsive Design
- 모바일: p-6 패딩, 텍스트 축소 (text-sm)
- 데스크톱: p-8 패딩, 텍스트 확대 (text-base)

### NFR-03: Dark Mode
- Tailwind dark: 접두사 활용
- 배경/텍스트/보더 색상 다크모드 대응

### NFR-04: Accessibility
- 아코디언 버튼에 적절한 ARIA 속성
- 키보드 접근성 (focus-visible 스타일)
- 검색 입력에 label/aria 속성

### NFR-05: Code Quality
- TypeScript strict 호환
- 인터페이스 정의 (WikiItem, WikiCategory)
- 데이터와 UI 분리 (wikiData 상수)

## 7. Technical Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS (CDN) |
| Animation | framer-motion |
| Icons | lucide-react |
| Build | Vite |

## 8. Component Architecture

```
components/
  LogisticsWiki.tsx    ← 단일 컴포넌트 (데이터 + UI)
```

### Data Structure
- `WikiItem`: `{ term: string, def: string }`
- `WikiCategory`: `{ category: string, items: WikiItem[] }`
- `wikiData`: WikiCategory[] (3개 카테고리, 10개 용어)

### State Management
- `searchTerm`: 검색어 (string, 기본값 '')
- `expandedItems`: 펼쳐진 항목 목록 (string[], 기본값 [])
- 파생 값: `filteredData` (useMemo, searchTerm 기반 필터링)

## 9. Integration Points

- **App.tsx L76**: "무역 백과사전 & 리소스" 섹션 내 IncotermsGuide 다음에 배치
- **다크모드**: Header 컴포넌트의 테마 토글과 연동 (Tailwind class strategy)
- **디자인**: indigo/purple gradient 헤더 (다른 위젯과 시각적 차별화)

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 용어 10개로 콘텐츠 부족 | Low | 추후 카테고리/용어 확장 가능한 구조 |
| 모바일에서 긴 설명 가독성 | Medium | whitespace-pre-wrap + leading-relaxed |
| 검색 성능 (대량 데이터 시) | Low | useMemo 최적화, 현재 10개로 충분 |

## 11. Success Criteria

- [ ] 3개 카테고리, 10개 용어 정확하게 표시
- [ ] 검색 기능 정상 동작 (실시간 필터링)
- [ ] 아코디언 토글 애니메이션 정상
- [ ] 다크모드 완벽 지원
- [ ] 모바일/데스크톱 반응형 동작
- [ ] 빌드 에러 없이 통과
- [ ] Gap Analysis Match Rate >= 90%
