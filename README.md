<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Jways Logistics

Korean logistics company web application featuring a public marketing landing page and an authenticated customer dashboard. Built with React 19, TypeScript, Vite, and framer-motion.

## Features

### Landing Page (Public)
- **Hero Section** — Canvas particle animation, Google Gemini AI video generation
- **Shipment Tracking** — Real-time tracking search with interactive SVG world map
- **CBM Calculator** — Volume (CBM) and chargeable weight calculator for sea/air freight
- **Service Catalog** — Filterable service cards with category tabs and detail modals
- **Exchange Rate** — Live currency exchange rate display
- **Incoterms Guide** — Incoterms 2020 interactive reference
- **Logistics Wiki** — Searchable logistics terminology encyclopedia
- **ESG Report** — CO2 emission summary with ESG grade
- **Instant Quote** — Standalone route-based freight quote calculator

### Customer Dashboard (Authenticated)
- **Dashboard Home** — Summary stats, monthly volume chart (recharts), ESG widget
- **Shipments** — Shipment list with status filters, tracking, ETA predictions
- **Quotes** — Quote request history and management
- **Documents** — Document management (B/L, Invoice, Packing List, etc.)
- **Billing** — Invoice management and payment tracking
- **Sustainability** — Full ESG/CO2 dashboard with 7 analysis sections
- **Settings** — User profile and notification preferences

### Technical Highlights
- Dark mode with Tailwind CSS `class` strategy
- framer-motion animations throughout (parallax, spring physics, AnimatePresence)
- CO2 emission calculation engine with ESG scoring
- Route tariff database for freight cost estimation
- Mock authentication with localStorage persistence
- Responsive design (mobile-first)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Bundler | Vite 6 |
| Language | TypeScript 5.8 |
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS (CDN) |
| Animation | framer-motion 12 |
| Charts | recharts 3 |
| Icons | lucide-react |
| AI | Google Gemini AI (@google/genai) |

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Project Structure

```
├── App.tsx               # Root router (4 routes)
├── components/           # Shared UI components (20+)
├── pages/
│   ├── LandingPage.tsx   # Public marketing page
│   ├── Login.tsx         # Authentication
│   ├── InstantQuote.tsx  # Freight quote calculator
│   └── Dashboard/        # Customer dashboard (7 pages)
├── contexts/             # React contexts (Auth)
├── lib/                  # Business logic
│   ├── api.ts            # Mock API layer
│   ├── tariff.ts         # Route tariff database
│   └── co2.ts            # CO2 emission engine
├── types.ts              # Shared TypeScript interfaces
└── docs/                 # PDCA development documentation
```

---

View app in AI Studio: https://ai.studio/apps/6ba755cf-3cce-4c51-8805-a51dfafa17a7
