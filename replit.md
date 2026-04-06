# Qaudquan - Financial Dashboard

## Overview
A Next.js 14 financial dashboard app featuring market heatmaps, portfolio tracking, stock screener, signals, and charts. Migrated from Vercel to Replit.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI**: React 19, Tailwind CSS
- **Charts**: Recharts, Lightweight Charts, Three.js / React Three Fiber
- **State**: Zustand, TanStack Query
- **Language**: TypeScript
- **Package Manager**: npm

## Project Structure
- `app/` - Next.js App Router pages and API routes
  - `api/` - Server-side API routes (heatmap, movers, screener, signals, breadth, portfolio, prevclose, sectorssymbols)
  - `dashboard/`, `charts/`, `heatmap/`, `portfolio/`, `screener/`, `signals/`, `settings/` - Page routes
  - `auth/` - Auth pages
- `components/` - Shared UI components
- `lib/` - Utility functions
- `hooks/` - Custom React hooks
- `services/` - External API service wrappers
- `store/` - Zustand stores
- `workers/` - Web workers
- `config/` - App configuration

## Replit Configuration
- **Port**: 5000 (required for Replit webview)
- **Host**: 0.0.0.0 (required for Replit proxy)
- **Workflow**: "Start application" runs `npm run dev`

## Environment Variables
See `.env.example` for required variables:
- `NEXT_PUBLIC_POLYGON_API_KEY` - Polygon.io API key for market data
- `NEXT_PUBLIC_BINANCE_WS_URL` - Binance WebSocket URL
- `ALPACA_API_KEY` - Alpaca trading API key
- `ALPHA_VANTAGE_API_KEY` - Alpha Vantage API key
- `FINNHUB_API_KEY` - Finnhub API key
- `NEXT_PUBLIC_ANTHROPIC_API_KEY` - Anthropic Claude API key
- `REDIS_URL` - Redis connection URL (optional caching)

## Security
- Security headers configured in `next.config.js` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Server-side API keys kept in server-only routes (not `NEXT_PUBLIC_` prefixed)
- ESLint configured for code quality
