# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jways Logistics - a Korean logistics company's multi-page web application with a public marketing landing page and an authenticated customer dashboard. Built with React 19, Vite, and react-router-dom. Integrates Google Gemini AI for hero video generation.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build
```

No test runner, linter, or type-check scripts configured. TypeScript type checking occurs only during `vite build`.

## Architecture

**Multi-page React SPA** using Vite + react-router-dom 7. All content is in Korean.

### Routing (`App.tsx`)

```
/                → LandingPage (public marketing page)
/login           → Login (mock auth)
/instant-quote   → InstantQuote (standalone quote calculator)
/dashboard/*     → DashboardLayout (protected, nested routes)
  /dashboard/            → DashboardHome (summary + ESG widget)
  /dashboard/shipments   → Shipments (shipment list + management)
  /dashboard/quotes      → Quotes (quote history + requests)
  /dashboard/documents   → Documents (document management)
  /dashboard/billing     → Billing (invoices + payment)
  /dashboard/sustainability → Sustainability (ESG/CO2 report)
  /dashboard/settings    → Settings (profile + notifications)
```

Authentication: `AuthContext` with localStorage-based token persistence. `ProtectedRoute` guards `/dashboard/*`.

### Entry Flow
- `index.html` — Tailwind CSS via CDN `<script>`, custom theme config, ESM import maps
- `index.tsx` — mounts `<App />` inside `<ErrorBoundary>` with React 19 `createRoot`
- `App.tsx` — `<AuthProvider>` wraps `<Routes>` with 4 top-level routes

### Key Architectural Decisions

**Tailwind via CDN**: No PostCSS/Tailwind build step. Custom colors in inline config:
- `jways.navy`: `#0f172a`, `jways.blue`: `#2563eb`, `jways.accent`: `#f97316`, `jways.gray`: `#f8fafc`

**Import maps**: Dependencies loaded via ESM import maps (`esm.sh`) in `index.html`, alongside npm packages. Both paths coexist.

**Dark mode**: Tailwind `class` strategy. Toggled in `Header`, persisted to `localStorage.theme`.

**Animations**: `framer-motion` throughout — parallax, layout animations, `AnimatePresence`, spring physics. Hero includes canvas particle system.

**Mock data**: No real backend. `lib/api.ts` provides mock API functions with simulated delays. All shipment/quote/billing data is hardcoded.

**Google Gemini AI**: Hero component uses `@google/genai` for Veo video generation. Requires `GEMINI_API_KEY` in `.env.local`.

### Project Structure

```
├── App.tsx                    # Root router with AuthProvider
├── index.tsx                  # React 19 entry point
├── types.ts                   # All shared TypeScript interfaces (~400 lines)
├── components/
│   ├── ui/Section.tsx         # Reusable section wrapper
│   ├── Header.tsx             # Fixed navbar, dark mode, mobile menu
│   ├── Hero.tsx               # Canvas particles, parallax, Gemini video
│   ├── Tracking.tsx           # Shipment tracking search (landing page)
│   ├── ShipmentMap.tsx        # SVG world map with animated routes
│   ├── Services.tsx           # Filterable service cards with detail modal
│   ├── CBMCalculator.tsx      # CBM & chargeable weight calculator
│   ├── ExchangeRate.tsx       # Live exchange rate display
│   ├── IncotermsGuide.tsx     # Incoterms 2020 reference guide
│   ├── LogisticsWiki.tsx      # Logistics terminology wiki
│   ├── ESGSection.tsx         # Landing page ESG/CO2 summary section
│   ├── QuoteModal.tsx         # Quote request form modal
│   ├── WhyUs.tsx              # Stats with animated counters
│   ├── Footer.tsx             # Newsletter, contact, social links
│   ├── ScrollToTop.tsx        # Scroll-to-top FAB
│   ├── ErrorBoundary.tsx      # Class-based error boundary
│   ├── ProtectedRoute.tsx     # Auth guard for dashboard routes
│   ├── TrackingDashboard.tsx  # Advanced tracking UI (dashboard)
│   ├── ETACard.tsx            # ETA prediction card
│   ├── EventTimeline.tsx      # Shipment event timeline
│   ├── ShipmentDocuments.tsx  # Shipment-linked documents
│   └── ShipmentCompare.tsx    # Multi-shipment comparison
├── pages/
│   ├── LandingPage.tsx        # Public marketing page (all landing sections)
│   ├── Login.tsx              # Login form (mock auth)
│   ├── InstantQuote.tsx       # Standalone quote calculator
│   └── Dashboard/
│       ├── index.tsx          # DashboardLayout (Sidebar + Topbar + nested routes)
│       ├── Sidebar.tsx        # Dashboard sidebar navigation
│       ├── Topbar.tsx         # Dashboard top bar
│       ├── DashboardHome.tsx  # Summary stats + chart + ESG widget
│       ├── Shipments.tsx      # Shipment list & management
│       ├── Quotes.tsx         # Quote history & requests
│       ├── Documents.tsx      # Document management
│       ├── Billing.tsx        # Invoices & billing
│       ├── Sustainability.tsx # ESG/CO2 dashboard (7 sections, recharts)
│       └── Settings.tsx       # User profile & notifications
├── contexts/
│   └── AuthContext.tsx        # Auth state (login/logout, localStorage tokens)
├── lib/
│   ├── api.ts                 # Mock API functions (shipments, quotes, billing, auth)
│   ├── tariff.ts              # Route tariff data (distance, transit days, cost/TEU)
│   └── co2.ts                 # CO2 calculation engine (emission factors, ESG scoring)
└── docs/                      # PDCA documentation (plan, design, analysis, reports)
```

### Lib Modules

- **`lib/api.ts`**: Mock API layer — `getShipments()`, `getQuotes()`, `getDocuments()`, `getInvoices()`, `loginAPI()`, `logoutAPI()`, etc. All return hardcoded data with simulated async delays.
- **`lib/tariff.ts`**: Route tariff database — distances, transit days, cost per TEU for major shipping routes. Used by InstantQuote and CO2 calculations.
- **`lib/co2.ts`**: CO2 emission engine — `calculateShipmentCO2()`, `calculateAllShipmentsCO2()`, `calculateESGScore()`, `calculateCarbonOffset()`. Emission factors: sea (0.016 kg/km/TEU), air (0.602), rail (0.028), truck (0.062).

### Types

`types.ts` defines all shared interfaces including: `NavItem`, `ServiceItem`, `TrackingStep`, `ShipmentData`, `ShipmentListItem`, `QuoteHistory`, `QuoteFormData`, `DashboardDocument`, `Invoice`, `BillingSummary`, `UserProfile`, `NotificationSetting`, `ServiceType`, `QuoteModalState`, `DashboardUser`, `CO2EmissionResult`, `ESGScore`, `CarbonOffset`, `EmissionFactor`, and more. All data is currently mock/hardcoded.

### Path Aliases

`@/*` maps to project root (configured in both `tsconfig.json` and `vite.config.ts`).

# currentDate
Today's date is 2026-02-24.
