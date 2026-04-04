# Qaudquan-V1

# Development Guide

## Project Overview

Qaudquan is a comprehensive financial trading and market analysis platform built with Next.js 14, TypeScript, and real-time data streaming.

## Architecture

### Folder Structure

```
/app                  → Next.js App Router pages
/components           
  /ui                → primitive components (Button, Badge, Card)
  /modules           → feature components (Watchlist, Screener, Chart)
  /layout            → Sidebar, Topbar, PageShell
/lib
  /api               → API client functions per provider
  /ws                → WebSocket manager
  /store             → Zustand stores
  /types             → shared TypeScript interfaces
  /utils             → formatters, calculators, helpers
  /indicators        → technical indicator calculations
  /test              → testing utilities
/hooks               → custom React hooks
/services            → server-side data services
/config              → environment, constants, API keys
/e2e                 → Playwright end-to-end tests
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand for client state
- **Server State**: TanStack React Query
- **WebSocket**: ws library with reconnection logic
- **Charts**: Lightweight Charts (TradingView)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Package Manager**: pnpm

## Design System

All design tokens are centralized in `config/tokens.ts`:

- **Colors**: Up/down market colors, semantic colors, surfaces
- **Spacing**: 4px base unit scale
- **Typography**: Font families, sizes with line heights
- **Border Radius**: Standard radius scale
- **Z-Index**: Layering system
- **Shadows**: Elevation shadows
- **Transitions**: Standard animation durations

## Core Data Types

All data flows through canonical TypeScript interfaces defined in `lib/types/index.ts`:

- `Tick`: Live quote data with OHLCV
- `Candle`: Historical OHLCV data
- `Instrument`: Security metadata
- `Position`: Portfolio position with P&L
- `Signal`: Trading signal with confidence score
- `Indicators`: Technical indicator results

## Development Workflow

### Running the Development Server

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check
```

### Building for Production

```bash
pnpm build
pnpm start
```

## Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Fill in required API keys
3. At startup, `config/env.ts` validates all variables using Zod

Missing required variables will throw an error immediately.

## State Management

### Zustand Stores

- `useNavStore`: Navigation state (active page, collapse, market filter)
- `useTickStore`: Live market quotes for all symbols

### React Query

Server state is managed through React Query hooks:
- `useQuery` for fetching historical data
- Cache strategies per data type (stale time, gc time)

## Component Structure

### UI Components (`/components/ui`)

Reusable primitive components:
- Button
- Badge
- Card
- Modal
- etc.

Never hardcode colors or spacing—always import from `config/tokens`.

### Feature Components (`/components/modules`)

Complex feature components that compose UI components:
- Dashboard
- Screener
- Charts
- Watchlist
- Portfolio

### Layout Components (`/components/layout`)

Page-level wrappers:
- PageShell: Main grid layout
- Sidebar: Navigation
- Topbar: Market filter pills

## Performance Patterns

### Selective Subscriptions

Components use symbol-specific selectors to avoid unnecessary re-renders:

```typescript
// ✅ Only re-renders when THIS symbol's tick changes
const tick = useTickStore((state) => state.ticks['AAPL']);

// ❌ Would trigger re-render on ANY tick update
const allTicks = useTickStore((state) => state.ticks);
```

### Virtualization

Long lists use `react-virtual`:

```typescript
// Renders only visible rows even with 500+ items
const { getVirtualItems } = useVirtualizer({
  count: symbols.length,
  size: 35,
});
```

### Memoization

Expensive computations are memoized:

```typescript
const candles = useMemo(() => {
  // Merge historical + live tick
}, [history, liveTick]);
```

## Testing Strategy

### Unit Tests

- Utility functions: formatters, calculations, indicators
- Store actions: state mutations
- Component logic: hooks, hooks composition

Test file location: `{FEATURE}.test.ts` next to source file

### E2E Tests

- Full user flows
- Cross-component integration
- API integration

Test files in `/e2e` directory

## Phases Overview

1. **Phase 1**: ✅ Foundation & Architecture
2. **Phase 2**: ✅ Dashboard Module
3. **Phase 3**: ✅ Screener Module
4. **Phase 4**: ✅ Charts & Technical Analysis
5. **Phase 5**: ✅ Heat Map Module
6. **Phase 6**: ✅ Signals Module
7. **Phase 7**: ✅ Portfolio Module
8. **Phase 8**: Live Data Integration (next)
9. **Phases 9-14**: Advanced Features

## Next Steps

Phase 8 will connect real market data APIs and replace mock data with live streams:
- Equities via Polygon.io / Alpha Vantage
- Crypto via Binance WebSocket / CoinGecko
- Forex via OANDA / Frankfurter
- Commodities via a market feed
- Add REST polling, WebSocket management, and normalized internal data schemas

See `implementation.md` for detailed specifications.
