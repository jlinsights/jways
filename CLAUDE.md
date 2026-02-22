# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jways Logistics - a Korean logistics company's marketing website (single-page application). Built as a Google AI Studio app with Gemini AI integration for video generation.

## Commands

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build
```

No test runner, linter, or type-check scripts are configured. TypeScript is used but `noEmit: true` — type checking only happens during build via Vite.

## Architecture

**Single-page React SPA** using Vite (no routing, no SSR). All content is in Korean with English labels.

### Entry Flow
- `index.html` — loads Tailwind CSS via CDN `<script>`, defines custom theme (colors, fonts, animations), and sets up import maps for ESM dependencies
- `index.tsx` — mounts `<App />` inside `<ErrorBoundary>` with React 19 `createRoot`
- `App.tsx` — composes the page as a linear section layout: Header → Hero → Tracking → Services → CTA → WhyUs → Footer + ScrollToTop

### Key Architectural Decisions

**Tailwind via CDN**: Tailwind is loaded via `<script src="https://cdn.tailwindcss.com">` in `index.html` with inline `tailwind.config`. There is no PostCSS/Tailwind build step. Custom colors are defined in the config:
- `jways.navy`: `#0f172a`
- `jways.blue`: `#2563eb`
- `jways.accent`: `#f97316`
- `jways.gray`: `#f8fafc`

**Import maps in index.html**: Dependencies are also loaded via ESM import maps (`esm.sh`) in `index.html`, alongside normal npm packages. Both paths coexist.

**Dark mode**: Uses Tailwind `class` strategy. Theme state lives in `Header` component, toggled via `document.documentElement.classList` and persisted to `localStorage.theme`.

**Animations**: Heavily uses `framer-motion` throughout — parallax scrolling, layout animations, `AnimatePresence` for enter/exit, spring physics for hover effects. The Hero section includes a canvas-based particle system with mouse interactivity.

**Google Gemini AI**: The Hero component integrates `@google/genai` to generate background videos using the Veo model. Requires `GEMINI_API_KEY` in `.env.local`. The API key is injected via Vite's `define` as `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

### Component Structure

```
components/
├── ui/
│   └── Section.tsx          # Reusable section wrapper (dark/light/image bg variants, forwardRef)
├── Header.tsx               # Fixed navbar, dark mode toggle, mobile menu (AnimatePresence)
├── Hero.tsx                 # Main hero with canvas particles, parallax, Gemini video gen, QuoteModal trigger
├── QuoteModal.tsx           # Quote request form modal with validation
├── Tracking.tsx             # Shipment tracking search with mock data (JW-8839-KR)
├── ShipmentMap.tsx          # SVG-based world map with animated route, tooltips
├── Services.tsx             # Filterable service cards with category tabs and detail modal
├── WhyUs.tsx                # Stats with animated counters (spring-based number animation)
├── Footer.tsx               # Newsletter subscription, contact info, social links
├── ScrollToTop.tsx          # Scroll-to-top FAB button
└── ErrorBoundary.tsx        # Class-based error boundary
```

### Types

`types.ts` defines shared interfaces: `NavItem`, `ServiceItem`, `StatItem`, `FeatureItem`, `TrackingStep`, `GeoLocation`, `ShipmentData`. All tracking data is currently mock/hardcoded.

### Path Aliases

`@/*` maps to project root (configured in both `tsconfig.json` and `vite.config.ts`).
