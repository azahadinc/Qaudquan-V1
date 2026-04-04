Here's the complete in-depth development breakdown for every phase.

---

## Phase 1 — Foundation & Architecture

This is the most critical phase. Every decision made here ripples through the entire application. Rushing it creates technical debt that compounds badly by Phase 8.

**Project setup**

Use Next.js 14 with the App Router as the framework. It gives you file-based routing, server components for data fetching, API routes for the backend layer, and seamless Vercel deployment. Initialize with TypeScript strictly enabled — financial applications cannot afford type ambiguity. Use `pnpm` as the package manager for speed and disk efficiency.

```
pnpm create next-app@latest quantedge --typescript --tailwind --eslint --app
```

Install the core dependency set upfront: Zustand for client state, React Query (TanStack Query) for server state and caching, Axios for HTTP, `ws` for WebSocket management, Recharts or Lightweight Charts for price charts, and `date-fns` for timestamp handling.

**Folder structure**

Establish a strict folder convention before writing any feature code:

```
/app                  → Next.js App Router pages
/components
  /ui                 → primitive components (Button, Badge, Card)
  /modules            → feature components (Watchlist, Screener, Chart)
  /layout             → Sidebar, Topbar, PageShell
/lib
  /api                → API client functions per provider
  /ws                 → WebSocket manager
  /store              → Zustand stores
  /types              → shared TypeScript interfaces
  /utils              → formatters, calculators, helpers
/hooks                → custom React hooks
/services             → server-side data services
/config               → environment, constants, API keys
```

**Design system tokens**

Define a single `tokens.ts` file that every component imports. Never hardcode colors, spacing, or typography values inline. Define the full color palette (up/down greens/reds, market type colors, semantic colors), spacing scale (4px base unit), font sizes, border radii, and z-index layers. Wire these into Tailwind's `tailwind.config.ts` as custom extensions so utility classes map directly to your tokens.

**Core TypeScript interfaces**

Define the canonical data types before writing any API code. The entire application must speak these types:

```typescript
interface Tick {
  symbol: string
  market: 'equity' | 'crypto' | 'forex' | 'commodity'
  price: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
  change: number
  changePct: number
}

interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Instrument {
  symbol: string
  name: string
  market: Market
  currency: string
  exchange: string
}
```

**Environment configuration**

Set up `.env.local` with all API keys from day one — Polygon, Binance, OANDA, Alpha Vantage, Finnhub. Create a `config/env.ts` file that validates all required variables are present at startup using Zod, throwing a clear error if any are missing rather than silently failing at runtime.

**Testing infrastructure**

Configure Vitest for unit tests and Playwright for end-to-end tests before writing any features. Establish a rule: every utility function, every store action, and every API client function must have tests. Financial calculations are not the place for guesswork.

---

## Phase 2 — Dashboard Module

The dashboard is the first thing users see and sets expectations for the entire product. It must load fast, look alive, and convey meaningful information at a glance.

**Page shell & layout engine**

Build the `PageShell` component that wraps every page: the collapsible sidebar, the top market filter bar, and the main content area. The sidebar uses a `NavigationStore` (Zustand) to track active page and collapsed state. All nav items are defined as a config array — adding a new page requires only adding one object to that array, not touching JSX.

The layout uses CSS Grid at the shell level: `grid-template-columns: auto 1fr` where `auto` is the sidebar width (200px expanded, 52px collapsed) with a CSS transition on width. This avoids layout reflows because the grid reflows automatically.

**Metric cards**

Build a reusable `MetricCard` component that accepts a label, value, sub-label, and an optional trend direction. The value and sub-label animate on change using a number-transition hook — when a new portfolio value arrives, it counts from the old value to the new one over 400ms. This gives a sense of the data being live without being jarring.

**Portfolio performance chart**

Use Lightweight Charts (TradingView's open-source library) rather than Chart.js for the portfolio line chart. It handles large datasets efficiently, supports real-time tick appending without re-rendering the entire chart, and has built-in crosshair and tooltip behavior that matches trading application conventions. The chart component subscribes to the portfolio value history from the store and appends each new data point as it arrives.

The timeframe toggle (1D / 1W / 1M / 3M / 1Y) triggers a React Query fetch for historical portfolio snapshots at the appropriate resolution. Each timeframe result is cached separately so switching between them is instant after the first load.

**Watchlist**

The watchlist is a virtualized list (using `react-virtual` for performance when watching hundreds of symbols) where each row subscribes individually to its symbol's Zustand slice. This means only the rows whose prices change re-render — not the entire list. Each row displays symbol, name, a sparkline (7-day mini chart), current price, and percentage change with color coding.

Watchlist state (which symbols are watched) is persisted to `localStorage` and synced to the user's account via a debounced API call.

**Market breadth & sector rotation**

These panels run on a 60-second polling interval rather than tick-by-tick updates — the data doesn't change fast enough to warrant real-time WebSocket subscription. The breadth calculation (advancing vs declining vs unchanged) is computed server-side to avoid sending all 500 S&P symbols to the client.

Here's the Phase 2 architecture blueprint — I'll split it into three focused diagrams so each layer gets the detail it deserves, with prose between them.Click any component to drill deeper. Now here is the state and data flow layer — how data moves from store to each component.Now the component build sequence — the exact order to build Phase 2 so nothing blocks anything else.Click any step to get the detailed implementation for that specific piece. Here is the full layer-by-layer breakdown:

---

## Layer 1 — Page shell & layout engine

The `PageShell` is the outermost wrapper rendered once and never unmounted. It uses CSS Grid at the top level: `grid-template-columns: auto 1fr` and `grid-template-rows: auto 1fr`. The sidebar occupies the left column across all rows. The topbar occupies the right column's first row. The content area fills the rest.

The `NavigationStore` (Zustand) holds three things: `activePage` (string), `isCollapsed` (boolean), and `marketFilter` (string). Every nav item reads from this store. The active page drives which content panel renders via a simple record lookup — no React Router needed for an SPA this size.

```ts
const useNavStore = create<NavState>((set) => ({
  activePage: 'dashboard',
  isCollapsed: false,
  marketFilter: 'all',
  setPage: (page) => set({ activePage: page }),
  toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  setMarketFilter: (f) => set({ marketFilter: f }),
}))
```

The sidebar width transitions with a CSS variable: `--sidebar-width: 200px` collapsing to `52px`. The grid column uses `var(--sidebar-width)` so the content area reflows automatically with no JavaScript layout calculations.

---

## Layer 2 — Sidebar & topbar

The sidebar reads its nav items from a static `navConfig` array — each item has an `id`, `label`, `icon` (SVG path), and optional `section` grouper. Rendering the sidebar is a `.map()` over this array. Adding a new page means adding one object to the config, nothing else.

The active indicator is a `border-left: 2px solid` on the active item's container — applied reactively from the nav store. The collapse toggle hides `.label` spans via CSS when `isCollapsed` is true. Icons always remain visible.

The topbar's market filter pills write to `marketFilter` in the nav store. Every data-fetching hook reads this value and adjusts its query accordingly — so switching from "All" to "Crypto" automatically narrows the watchlist, screener, and movers panels without any prop drilling.

---

## Layer 3 — Metric cards

Each `MetricCard` takes `label`, `value` (number), `formatter` (function), and `trend` (`'up' | 'down' | 'neutral'`). The `useNumberTransition` hook animates value changes:

```ts
function useNumberTransition(target: number, duration = 400) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)
  useEffect(() => {
    const start = prev.current
    const delta = target - start
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      setDisplay(start + delta * progress)
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = target
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return display
}
```

The four dashboard cards map to: portfolio total value (from `usePortfolio()`), day P&L (computed reactively as current value minus yesterday's close), win rate (fetched once daily from the server), and Sharpe ratio (fetched once daily). Only the first two update tick-by-tick. The latter two update once per day — no need to poll them frequently.

---

## Layer 4 — Performance chart

Initialize one `IChartApi` instance in a `useEffect` on mount. Pass historical OHLCV data to `series.setData()`. On subsequent ticks, call `series.update(candle)` — this only redraws the last bar, not the entire chart, making it extremely efficient even at 100ms tick rates.

Timeframe switching calls a React Query fetch for the new resolution. Each timeframe is a separate query key: `['portfolio-history', '1W']`, `['portfolio-history', '1M']`, etc. Results are cached so switching back to a previously viewed timeframe is instant. On fetch completion, `series.setData(newData)` swaps the entire dataset.

The chart's time scale is shared with the volume sub-chart below it via `chart.timeScale().subscribeVisibleLogicalRangeChange()` — scrolling or zooming the price chart automatically syncs the volume chart's viewport.

---

## Layer 5 — Watchlist

The watchlist uses `react-virtual`'s `useVirtualizer` to render only the visible rows. Even with 500 watched symbols, the DOM holds only ~15 row elements at any time.

Each `WatchlistRow` is a memoized component that calls `useTick(symbol)` internally. The `useTick` hook uses a Zustand selector that only re-renders when that specific symbol's price changes — not when any other symbol updates. This is the key performance pattern: isolated subscriptions prevent the entire list from re-rendering on every tick.

```ts
function useTick(symbol: string) {
  return useTickStore(
    useCallback((state) => state.ticks[symbol], [symbol])
  )
}
```

Each row renders a 7-point sparkline using a lightweight inline SVG polyline from the last 7 closing prices stored in the tick store's history buffer.

Watchlist membership (which symbols are tracked) is stored in `localStorage` on every change and synced to the user's server account via a debounced API call with a 1500ms delay — so rapid add/remove operations don't spam the backend.

---

## Layer 6 — Breadth, sector rotation & movers

These three panels are the simplest in Phase 2. They use React Query with `refetchInterval: 60_000` and `staleTime: 55_000`. The data is computed server-side in a Next.js API route that aggregates across all tracked symbols and returns pre-computed totals — the client does no calculation, only rendering.

Market breadth returns `{ advancing: number, declining: number, unchanged: number }`. Sector rotation returns an array of `{ sector: string, changePct: number }` sorted by change. Top movers returns the top 5 gainers and top 5 losers by absolute percentage change, filtered by the active `marketFilter`.

Each panel uses Chart.js (not Lightweight Charts) since these are static snapshots, not live-updating streams. Doughnut for breadth, horizontal bar for sectors, simple ranked list for movers. None of these need tick-level precision — 60-second staleness is acceptable.

---

## Files created in Phase 2

```
/components/layout/PageShell.tsx
/components/layout/Sidebar.tsx
/components/layout/Topbar.tsx
/components/layout/navConfig.ts
/components/modules/dashboard/MetricCard.tsx
/components/modules/dashboard/PerformanceChart.tsx
/components/modules/dashboard/Watchlist.tsx
/components/modules/dashboard/WatchlistRow.tsx
/components/modules/dashboard/MarketBreadth.tsx
/components/modules/dashboard/SectorRotation.tsx
/components/modules/dashboard/TopMovers.tsx
/hooks/useNumberTransition.ts
/hooks/useTick.ts
/hooks/usePortfolio.ts
/hooks/useMarketData.ts
/store/navStore.ts
/app/api/breadth/route.ts
/app/api/sectors/route.ts
/app/api/movers/route.ts
```

---


---

## Phase 3 — Screener Module

The screener is the most computationally intensive module. The key architectural decision is where filtering happens — client-side, server-side, or a hybrid.

**Hybrid filtering strategy**

For a universe of under 1,000 instruments, client-side filtering is viable if the data is already cached. For broader universes (full S&P 500, all crypto), server-side filtering is required. The architecture uses a hybrid: the client sends the filter configuration to a Next.js API route, which queries a pre-computed metrics store (Redis) and returns only the matching instruments. The client then does secondary sorting and display-layer filtering locally.

**Filter configuration model**

Each filter is represented as a typed object:

```typescript
interface ScreenerFilter {
  field: 'rsi' | 'volume' | 'changePct' | 'macd' | 'price' | 'marketCap'
  operator: 'gt' | 'lt' | 'between' | 'eq'
  value: number | [number, number]
}
```

The filter panel builds an array of these objects. The API route receives the array, translates it into a Redis query or SQL `WHERE` clause, and returns matching rows. This means adding a new filter type requires only adding a new case to the filter builder and the query translator — no UI rewiring.

**Pre-computed metrics**

RSI, MACD, volume averages, and moving averages are not computed on the fly per request. They are computed server-side on a schedule — every 60 seconds for liquid instruments, every 5 minutes for less liquid ones — and stored in Redis with the symbol as the key. The screener API route reads from Redis, not from live ticks, so it responds in under 50ms regardless of filter complexity.

**Results table**

Use `@tanstack/react-table` for the screener table. It handles column sorting, row selection, column visibility toggling, and virtualized rendering out of the box. Define all columns as a config array — each column specifies its accessor key, header label, cell renderer, and sort function. The percentage-change column uses a custom cell renderer that applies the green/red color and a directional arrow icon.

**Saved screeners**

Users can save a filter configuration as a named screener preset. Presets are stored per account in the database and loaded on login. The preset selector dropdown at the top of the screener panel shows all saved presets plus a "New screener" option. This is the foundation for Phase 10's full screener logic engine.

Here's Phase 3 — three focused diagrams covering the full screener architecture. First, the structural overview.Now the filter request lifecycle — exactly what happens from the moment a user changes a filter to when results appear on screen.Finally the build sequence — the exact order to assemble Phase 3 without blockers.Click any node for a deep dive on that step. Here's the full layer breakdown:

---

## Layer 1 — ScreenerStore (Zustand)

This is the single source of truth for all screener state. It holds the active filter array, current sort configuration, pagination state, and active preset name. No component touches filter state directly — everything goes through the store.

```typescript
interface ScreenerState {
  filters: ScreenerFilter[]
  sortField: string
  sortDir: 'asc' | 'desc'
  page: number
  pageSize: number
  activePreset: string | null
  setFilter: (filter: ScreenerFilter) => void
  removeFilter: (field: string) => void
  resetFilters: () => void
  setSort: (field: string, dir: 'asc' | 'desc') => void
  loadPreset: (preset: ScreenerPreset) => void
}
```

The `setFilter` action is additive — it upserts into the array by `field`. Setting the RSI filter a second time replaces the first. This means the filter bar never needs to worry about duplicates.

---

## Layer 2 — ScreenerFilterBar

Six dropdown controls, each independently wired to the store. The key design decision is that every dropdown calls `setFilter` on change with a fully typed `ScreenerFilter` object — not a raw string. The dropdown value is a display concern; what gets written to the store is always a structured filter.

```typescript
// RSI dropdown change handler
onChange={(value) => {
  if (value === 'overbought') {
    setFilter({ field: 'rsi', operator: 'gt', value: 70 })
  } else if (value === 'oversold') {
    setFilter({ field: 'rsi', operator: 'lt', value: 30 })
  } else {
    removeFilter('rsi')
  }
}}
```

Adding a new filter type (e.g. P/E ratio) only requires adding a new dropdown and a new handler. The store, hook, and table need no changes.

---

## Layer 3a — Server API route (`/api/screener`)

A Next.js API route that receives the `filters[]` array as a POST body, translates each filter into a Redis command, and returns matching symbols as JSON. The translation is a simple switch statement over `filter.field`:

```typescript
// Translate ScreenerFilter to Redis scan condition
case 'rsi':
  return `@rsi:[${min} ${max}]`
case 'volume':
  return `@volumeRatio:[${min} +inf]`
case 'signal':
  return `@signal:{${value}}`
```

The route uses Redis Stack's search capability (`FT.SEARCH`) if available, or falls back to scanning a sorted set. Response time target is under 80ms for a 500-instrument universe.

---

## Layer 3b — Redis pre-compute worker

A cron job (Vercel Cron or a background Node worker) runs every 60 seconds. It fetches the latest candles for all tracked instruments, computes RSI, MACD signal line, volume ratio (current/20-day avg), and the composite signal label (Buy/Sell/Hold), then writes results to Redis as a hash per symbol:

```typescript
await redis.hSet(`metrics:${symbol}`, {
  rsi: rsi14.toFixed(2),
  macd: macdSignal.toFixed(4),
  volumeRatio: volRatio.toFixed(2),
  sma50: sma50.toFixed(2),
  sma200: sma200.toFixed(2),
  signal: computeSignal(rsi14, macdSignal, volRatio),
  updatedAt: Date.now()
})
```

This means the screener API never computes indicators on request — it only reads pre-computed values. Screener response time is therefore I/O-bound (Redis lookup), not CPU-bound (indicator math).

---

## Layer 4 — useScreener hook

This hook is the bridge between the store and the component. It reads `filters[]` from the store, decides the routing path, fires the appropriate query, and returns a uniform result shape regardless of which path was taken.

```typescript
function useScreener() {
  const { filters, sortField, sortDir, page } = useScreenerStore()
  const isLargeUniverse = useMarketFilter() === 'all' && selectedMarkets.includes('equity')

  const serverQuery = useQuery({
    queryKey: ['screener', filters, sortField, sortDir, page],
    queryFn: () => fetch('/api/screener', {
      method: 'POST',
      body: JSON.stringify({ filters, sortField, sortDir, page })
    }).then(r => r.json()),
    enabled: isLargeUniverse,
    staleTime: 30_000
  })

  const clientResult = useMemo(() => {
    if (isLargeUniverse) return null
    return applyFilters(cachedInstruments, filters)
  }, [filters, cachedInstruments, isLargeUniverse])

  return isLargeUniverse ? serverQuery.data : clientResult
}
```

The hook also handles debouncing — filter changes are debounced 300ms before triggering a server request, preventing a flood of API calls as the user adjusts sliders.

---

## Layer 5 — ScreenerTable

Built on TanStack Table (`@tanstack/react-table`). All columns are defined in a `columnDefs` array — each column is a plain object with `accessorKey`, `header`, `cell`, and `sortingFn`. Adding a new column means adding one object to the array.

The signal column uses a custom cell renderer that maps signal values to badge components:

```typescript
{
  accessorKey: 'signal',
  header: 'Signal',
  cell: ({ getValue }) => {
    const signal = getValue<string>()
    return <SignalBadge signal={signal} />
  }
}
```

Row virtualization uses TanStack Virtual (`@tanstack/react-virtual`) with an estimated row height of 44px. Only visible rows render in the DOM — 500 results feel the same as 50. Column header clicks toggle sort direction and write back to the store.

---

## Layer 6 — Saved presets

A preset is a named snapshot of a `filters[]` array. The UI shows a dropdown in the filter bar header with all saved presets plus "New screener". Selecting a preset calls `loadPreset()` which replaces the entire `filters[]` in the store.

Three API routes handle persistence: `GET /api/presets` returns all presets for the current user, `POST /api/presets` saves a new one, and `DELETE /api/presets/[id]` removes one. Presets are stored in the user's database row as a JSON column — simple, portable, no schema migration needed to add a new filter field.

---

## Files created in Phase 3

```
/components/modules/screener/ScreenerFilterBar.tsx
/components/modules/screener/ScreenerTable.tsx
/components/modules/screener/columnDefs.ts
/components/modules/screener/SignalBadge.tsx
/components/modules/screener/PresetDropdown.tsx
/hooks/useScreener.ts
/store/screenerStore.ts
/lib/utils/applyFilters.ts
/lib/utils/computeMetrics.ts
/app/api/screener/route.ts
/app/api/presets/route.ts
/app/api/presets/[id]/route.ts
/workers/metricsPrecompute.ts
```

---

Ready to continue to Phase 4 — Charts & Technical Analysis blueprint, or shall we go deeper on any Phase 3 layer?

---

## Phase 4 — Charts & Technical Analysis

The chart module is where users spend most of their time. It needs to feel responsive, precise, and data-rich.

**Chart library: Lightweight Charts**

TradingView's Lightweight Charts handles all price rendering. Initialize one chart instance per symbol. The chart receives historical OHLCV data on mount and appends live ticks to the current open candle as they arrive via the WebSocket. The `updateData` method on the series handles this efficiently — it doesn't re-render historical bars, only updates the last bar.

**Indicator computation**

All technical indicators are computed client-side using a `technicals` utility module. Write pure functions for each indicator — they take an array of candles and return an array of values. This makes them trivially testable and reusable across the screener and signal engine.

```typescript
function rsi(candles: Candle[], period = 14): number[]
function macd(candles: Candle[], fast = 12, slow = 26, signal = 9): MACDResult[]
function bollingerBands(candles: Candle[], period = 20, stdDev = 2): BBResult[]
function sma(candles: Candle[], period: number): number[]
function ema(candles: Candle[], period: number): number[]
```

Indicators are rendered as additional series on the Lightweight Charts instance. RSI and MACD render in a separate sub-chart below the price chart (a second chart instance sharing the same time scale). Overlay indicators (SMA, EMA, Bollinger Bands) render as line series directly on the price chart.

**Multi-timeframe data**

Each timeframe (1D, 1W, 1M) requires a separate OHLCV dataset at the appropriate candle resolution. 1-minute candles for intraday, hourly for 1W, daily for 1M and beyond. These are fetched from Polygon's `/aggs` endpoint on timeframe switch and cached by React Query. The chart swaps datasets on timeframe toggle without remounting the chart instance — it calls `setData` on the series, which is dramatically faster than a full re-render.

**Drawing tools**

Implement a minimal drawing toolbar: trend lines, horizontal levels, and rectangle zones. These are stored as metadata per symbol in the user's account and restored when the symbol is loaded. Lightweight Charts supports custom `ISeriesApi` overlays for this via the `createLineSeries` API with custom pricing.

Here are the Phase 4 — Charts & Technical Analysis blueprints across three focused diagrams.Now the data flow — how OHLCV history, live ticks, and indicator computations move through Phase 4.And finally the build sequence for Phase 4 — the exact order to avoid blocked dependencies.Click any step or node across all three diagrams to drill into that specific implementation. Here is the full layer-by-layer breakdown:

---

## Layer 1 — Indicator utility library

This is built first because everything else in Phase 4 depends on it. Every indicator is a pure function — no React, no store, no side effects. They take a `Candle[]` array and return a typed result array. This makes them trivially testable with Vitest and reusable across the chart module, screener engine, and signal engine.

```ts
// /lib/indicators/sma.ts
export function sma(candles: Candle[], period: number): number[] {
  return candles.map((_, i) => {
    if (i < period - 1) return NaN
    const slice = candles.slice(i - period + 1, i + 1)
    return slice.reduce((sum, c) => sum + c.close, 0) / period
  })
}

// /lib/indicators/rsi.ts
export function rsi(candles: Candle[], period = 14): number[] {
  const changes = candles.map((c, i) =>
    i === 0 ? 0 : c.close - candles[i - 1].close
  )
  // Wilder's smoothing for gains and losses...
}

// /lib/indicators/macd.ts
export function macd(candles: Candle[], fast = 12, slow = 26, signal = 9): MACDResult[]

// /lib/indicators/bollingerBands.ts
export function bollingerBands(candles: Candle[], period = 20, stdDev = 2): BBResult[]

// /lib/indicators/atr.ts
export function atr(candles: Candle[], period = 14): number[]

// /lib/indicators/vwap.ts
export function vwap(candles: Candle[]): number[]  // resets daily

// /lib/indicators/stochRsi.ts
export function stochRsi(candles: Candle[], period = 14, kPeriod = 3, dPeriod = 3): StochResult[]
```

Every function is independently tested. A correctly computed RSI is the foundation of signal detection in Phase 6 — wrong values here cascade into wrong signals everywhere.

---

## Layer 2 — useCandleBuffer hook

This hook is the single source of truth for all candle data in the chart. It merges two streams: the historical OHLCV array from React Query, and the live tick stream from the Zustand tick store. The merge logic folds each incoming tick into the current open candle — updating its high, low, close, and volume — so the chart always shows a complete, live current bar without waiting for the candle to close.

```ts
function useCandleBuffer(symbol: string, timeframe: Timeframe): Candle[] {
  const { data: history } = useQuery({
    queryKey: ['ohlcv', symbol, timeframe],
    queryFn: () => fetchOHLCV(symbol, timeframe),
    staleTime: Infinity,  // history never goes stale mid-session
  })

  const liveTick = useTick(symbol)

  return useMemo(() => {
    if (!history) return []
    const candles = [...history]
    if (!liveTick) return candles

    const openCandle = candles[candles.length - 1]
    const updatedCandle: Candle = {
      ...openCandle,
      high: Math.max(openCandle.high, liveTick.price),
      low: Math.min(openCandle.low, liveTick.price),
      close: liveTick.price,
      volume: openCandle.volume + liveTick.volume,
    }
    return [...candles.slice(0, -1), updatedCandle]
  }, [history, liveTick])
}
```

The `useMemo` dependency on `liveTick` means the buffer recomputes only when a new tick arrives for this specific symbol — not on any other state change.

---

## Layer 3 — PriceChart component

The `PriceChart` component owns the Lightweight Charts lifecycle. It creates the chart instance in `useEffect` on mount and disposes it on unmount. This is critical — Lightweight Charts instances are not React-managed, so cleanup must be explicit.

```ts
useEffect(() => {
  const chart = createChart(containerRef.current, {
    layout: { background: { type: ColorType.Solid, color: 'transparent' } },
    grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
    crosshair: { mode: CrosshairMode.Normal },
    timeScale: { timeVisible: true, secondsVisible: false },
  })

  const candleSeries = chart.addCandlestickSeries({
    upColor: '#1a9e6e', downColor: '#d84040',
    borderUpColor: '#1a9e6e', borderDownColor: '#d84040',
    wickUpColor: '#1a9e6e', wickDownColor: '#d84040',
  })

  seriesRef.current = candleSeries
  chartRef.current = chart

  return () => chart.remove()
}, [])
```

When `candles` (from `useCandleBuffer`) changes, a separate `useEffect` calls `series.setData(candles)` for a full dataset swap (timeframe change or new symbol), or `series.update(candles[candles.length - 1])` for a live tick update. The distinction is handled by comparing the symbol and timeframe values from the previous render using `useRef`.

---

## Layer 4 — Overlay series & volume sub-chart

Overlay indicators (SMA, EMA, Bollinger Bands) are added as additional `LineSeries` on the same chart instance. Each indicator has its own series reference stored in a `useRef` map keyed by indicator name. When an indicator is toggled on, its series is created and populated. When toggled off, the series is removed.

```ts
function addOverlay(name: string, data: LineData[], color: string) {
  const series = chartRef.current.addLineSeries({ color, lineWidth: 1.5 })
  series.setData(data)
  overlaySeriesMap.current[name] = series
}

function removeOverlay(name: string) {
  const series = overlaySeriesMap.current[name]
  if (series) {
    chartRef.current.removeSeries(series)
    delete overlaySeriesMap.current[name]
  }
}
```

The volume sub-chart is a second, entirely separate `createChart()` instance in its own `<div>` below the price chart. Its time scale is synchronized using `chart.timeScale().subscribeVisibleLogicalRangeChange()` — any pan or zoom on the price chart triggers the same range update on the volume chart. This keeps them visually locked together.

---

## Layer 5 — Indicator sub-charts (MACD, RSI, Stoch RSI)

Each sub-chart is a small Lightweight Charts instance (120–150px tall) mounted in its own container below the volume chart. All three share the same time scale synchronization as the volume chart. Threshold lines (RSI 70/30, Stoch RSI 80/20) are rendered as `PriceLine` objects on the series — not as separate `LineSeries` — so they extend cleanly across the full chart width.

Each sub-chart panel is collapsible. The user can show or hide any panel from the toolbar's Indicators toggle. Collapsed panels are not unmounted — they are hidden via CSS height transition. This preserves the chart instance so it doesn't need to reinitialize when expanded.

---

## Layer 6 — Indicator sidebar

The sidebar reads from a `useIndicators(candles)` hook that runs all enabled indicators through `useMemo` and returns the latest computed value for each. This is the only place in the app where all indicators run simultaneously — the sidebar shows a snapshot of the most recent bar's indicator values.

Each indicator row shows the name, the latest numerical value (formatted to 2 decimal places), and a signal badge computed by applying a threshold rule:

```ts
function getSignal(name: string, value: number, candles: Candle[]): Signal {
  if (name === 'RSI') {
    if (value > 70) return 'Overbought'
    if (value < 30) return 'Oversold'
    return 'Neutral'
  }
  if (name === 'MACD') {
    const prev = macd(candles).at(-2)
    return value > prev ? 'Bullish' : 'Bearish'
  }
  // ...
}
```

The three tabs (Trend, Oscillators, Volatility) are pure CSS — no `display: none` toggling that would destroy tab state. Tab content is layered with `visibility` and `height: 0` so all three tabs remain mounted and their indicator values stay current.

---

## Layer 7 — Symbol selector, toolbar & drawing tools

The symbol selector uses a `<input type="text">` with a debounced search query (300ms) that hits `/api/search?q=AAPL`. Results are instrument objects from a local SQLite or Redis search index — not a live API call per keystroke. Recent symbols are stored in `localStorage` and shown immediately when the input is focused with no query.

The drawing tools layer sits on top of the price chart as a transparent `<canvas>` overlay at the same pixel dimensions. Mouse events on this canvas draw trend lines, horizontal levels, and rectangles. Completed drawings are serialized as `Drawing[]` objects and stored in `localStorage` per symbol, then restored on next load by replaying them onto the canvas.

The AI Analysis button sends the current symbol, timeframe, last 50 candles, and computed indicator values as context to the Anthropic API (Phase 13) and streams the response into a right-side analysis panel.

---

## Files created in Phase 4

```
/lib/indicators/sma.ts
/lib/indicators/ema.ts
/lib/indicators/rsi.ts
/lib/indicators/macd.ts
/lib/indicators/bollingerBands.ts
/lib/indicators/atr.ts
/lib/indicators/vwap.ts
/lib/indicators/stochRsi.ts
/lib/indicators/index.ts
/hooks/useCandleBuffer.ts
/hooks/useIndicators.ts
/hooks/useDrawingTools.ts
/components/modules/charts/PriceChart.tsx
/components/modules/charts/VolumeChart.tsx
/components/modules/charts/MACDChart.tsx
/components/modules/charts/RSIChart.tsx
/components/modules/charts/StochRSIChart.tsx
/components/modules/charts/IndicatorSidebar.tsx
/components/modules/charts/SymbolSelector.tsx
/components/modules/charts/ChartToolbar.tsx
/components/modules/charts/DrawingCanvas.tsx
/components/modules/charts/KeyStats.tsx
/app/api/ohlcv/route.ts
/app/api/search/route.ts
```

---

---

## Phase 5 — Heat Map Module

**Data model**

The heatmap works on a snapshot model rather than tick-by-tick updates. Every 10 seconds, a background worker fetches the current percentage change for all tracked symbols and pushes a batch update into the heatmap store. This prevents the heatmap from flickering as individual ticks arrive millisecond by millisecond.

**Color computation**

The color mapping is a linear interpolation between the full-red and full-green stops of the color palette, with the midpoint anchored at 0% change. The scale clips at ±5% by default but is configurable. Compute colors in a `useMemo` hook so they only recalculate when the data batch changes, not on every render.

**Cell sizing**

In a real S&P 500 heatmap, cell size is typically proportional to market cap — AAPL's cell is larger than a small-cap stock. Implement this using a treemap layout algorithm (`d3-treemap` from the D3 library). Feed it the symbol list with market cap as the value, and it computes `x, y, width, height` for each cell. Render cells as absolutely positioned `<div>` elements inside a relative container.

Now Phase 6 — the Signals module. This one has its own detection engine running server-side, so the architecture splits into two clear halves.Now the build sequences for both phases side by side.Here is the full written breakdown for both phases.

---

## Phase 5 — Heat Map Module

### Layer 5.1 — HeatmapStore

The store holds a flat array of snapshot objects — one per symbol — plus the active market and color mode selections. It never holds tick history, only the latest batch snapshot. This is a deliberate design decision: the heatmap is a spatial summary, not a live price ticker. Tick-by-tick updates would cause constant cell repaints that distract more than they inform.

```typescript
interface HeatmapSymbol {
  symbol: string
  name: string
  changePct: number
  volumeRatio: number
  rsi: number
  marketCap: number
  market: Market
}

interface HeatmapState {
  symbols: HeatmapSymbol[]
  activeMarket: 'sp500' | 'crypto' | 'forex' | 'commodities'
  colorMode: 'changePct' | 'volume' | 'rsi'
  setSymbols: (symbols: HeatmapSymbol[]) => void
  setMarket: (market: string) => void
  setColorMode: (mode: string) => void
}
```

### Layer 5.2 — Snapshot worker

A `setInterval` at 10 seconds fires a single batch request to `/api/heatmap?market=sp500`. The API route reads pre-computed metrics from Redis for all symbols in the requested universe and returns them as a flat array. The client writes the entire array into the store in one atomic update — no partial updates, no flickering individual cells.

The 10-second interval is deliberately slower than the watchlist's tick subscriptions. The heatmap is a macro view — a cell changing color every 100ms communicates nothing useful and costs attention.

### Layer 5.3 — Treemap layout (d3)

`d3-treemap` takes a hierarchy of values and computes `x0, y0, x1, y1` for each leaf. Feed it the symbol list with `marketCap` as the value and it tiles them proportionally — AAPL gets a larger cell than a small-cap stock.

```typescript
const root = d3.hierarchy({ children: symbols })
  .sum(d => d.marketCap)

d3.treemap()
  .size([containerWidth, containerHeight])
  .padding(2)
  (root)

// Each leaf now has: leaf.x0, leaf.y0, leaf.x1, leaf.y1
```

This runs inside a `useMemo` that only recalculates when the symbol list changes or the container resizes (tracked via `ResizeObserver`). Cells are rendered as absolutely positioned `<div>` elements inside a `position: relative` container using the treemap coordinates directly.

### Layer 5.4 — Color interpolation

Color is computed per symbol in a `useMemo` over the entire symbol array. The scale maps `changePct` from `[-5, 5]` to a red-to-green range:

```typescript
function changePctToColor(pct: number): string {
  const clamped = Math.max(-5, Math.min(5, pct))
  const ratio = (clamped + 5) / 10  // 0 = full red, 0.5 = neutral, 1 = full green
  const r = Math.round(216 + (26 - 216) * ratio)
  const g = Math.round(64 + (158 - 64) * ratio)
  const b = Math.round(64 + (64 - 64) * ratio)
  return `rgb(${r},${g},${b})`
}
```

When `colorMode` is `volume` or `rsi`, the same interpolation runs but maps different fields. The `colorMode` selector is the only thing that changes which field drives the color — the interpolation math stays identical. This keeps the color computation as a single, testable pure function.

### Layer 5.5 — HeatmapGrid renderer

Each cell is an absolutely positioned `<div>` styled from treemap coordinates. The cell contains the ticker symbol and percentage change label. Font size scales with cell width — a large cap gets readable text, a small cap gets a smaller font or hides the label entirely below a minimum width threshold.

```tsx
{root.leaves().map(leaf => (
  <div
    key={leaf.data.symbol}
    style={{
      position: 'absolute',
      left: leaf.x0, top: leaf.y0,
      width: leaf.x1 - leaf.x0,
      height: leaf.y1 - leaf.y0,
      background: changePctToColor(leaf.data.changePct),
      borderRadius: 4,
    }}
    title={`${leaf.data.name}: ${leaf.data.changePct.toFixed(2)}%`}
  >
    {(leaf.x1 - leaf.x0) > 40 && <span>{leaf.data.symbol}</span>}
    {(leaf.x1 - leaf.x0) > 60 && <span>{leaf.data.changePct.toFixed(1)}%</span>}
  </div>
))}
```

### Layer 5.6 — Sector chart + market switcher

The sector performance bar chart sits below the main heatmap grid. It uses Chart.js horizontal bar, where each bar represents a sector's aggregate change percentage. Colors map to the same red/green scale as the heatmap cells. The market switcher (S&P 500, Crypto, Forex, Commodities) writes to the `HeatmapStore`, which triggers the snapshot worker to re-fetch for the new universe and recalculates the treemap layout.

---

## Phase 6 — Signals Module

### Layer 6.1 — Signal rules engine

Every signal is defined as a `SignalRule` object in a flat array. The rule has three parts: a name, a type (`buy` | `sell` | `neutral`), a `condition` function that returns a boolean, and a `confidence` function that returns 0–100.

```typescript
interface SignalRule {
  name: string
  type: 'buy' | 'sell' | 'neutral'
  condition: (ind: Indicators) => boolean
  confidence: (ind: Indicators) => number
}

const rules: SignalRule[] = [
  {
    name: 'Golden Cross',
    type: 'buy',
    condition: (ind) => ind.sma50 > ind.sma200 && ind.prevSma50 <= ind.prevSma200,
    confidence: (ind) => {
      let score = 60
      if (ind.volumeRatio > 1.5) score += 15
      if (ind.rsi > 50 && ind.rsi < 70) score += 15
      if (ind.adx > 25) score += 10
      return Math.min(score, 100)
    }
  },
  {
    name: 'RSI Divergence',
    type: 'buy',
    condition: (ind) => ind.priceTrend === 'down' && ind.rsiTrend === 'up',
    confidence: (ind) => ind.rsi < 40 ? 80 : 55
  },
  // ... more rules
]
```

Adding a new signal type is one object in this array. The detection loop never changes.

### Layer 6.2 — Confidence scorer

The confidence scorer takes all fired rules for a symbol and combines them into a single composite score. Rules that agree amplify each other; conflicting rules (a buy signal and a sell signal firing simultaneously) suppress the final score:

```typescript
function compositeConfidence(firedRules: SignalRule[], ind: Indicators): number {
  const scores = firedRules.map(r => r.confidence(ind))
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const hasConflict = firedRules.some(r => r.type === 'buy') &&
                      firedRules.some(r => r.type === 'sell')
  return hasConflict ? avg * 0.6 : avg
}
```

### Layer 6.3 — Detection cron + API route

A Vercel Cron Job fires `GET /api/signals/detect` every minute. The route reads indicator values for all tracked symbols from Redis, runs every rule's `condition` function against each symbol's indicators, scores the fired rules, and upserts results to the `signals` database table.

The upsert key is `(symbol, ruleName)` — so if a Golden Cross is already active on AAPL, it gets its confidence score updated rather than creating a duplicate row. Each signal gets an `expiresAt` timestamp 24 hours in the future, and a nightly cleanup job purges expired rows.

### Layer 6.4 — useSignals hook

React Query polls `GET /api/signals` every 30 seconds. The API route returns all non-expired signals sorted by confidence descending. The hook exposes the raw array plus derived metrics:

```typescript
function useSignals() {
  const query = useQuery({
    queryKey: ['signals'],
    queryFn: () => fetch('/api/signals').then(r => r.json()),
    refetchInterval: 30_000,
    staleTime: 25_000,
  })

  const signals = query.data ?? []
  return {
    signals,
    buyCount: signals.filter(s => s.type === 'buy').length,
    sellCount: signals.filter(s => s.type === 'sell').length,
    avgConfidence: signals.length
      ? Math.round(signals.reduce((a, s) => a + s.confidence, 0) / signals.length)
      : 0,
    isLoading: query.isLoading,
  }
}
```

### Layer 6.5 — SignalFeed component

The feed renders the signals array as a vertical list. New signals that appear between polls fade in with a CSS `@keyframes` opacity transition. Each row shows the signal icon (up/down arrow in a colored badge), title, description, confidence score as both a number and a mini progress bar, and a relative timestamp.

The bookmark button writes the signal ID to a `BookmarkedSignals` store (persisted to the user's account). Bookmarked signals are highlighted in the feed and passed to the accuracy tracker.

### Layer 6.6 — Accuracy tracker

24 hours after a signal fires, a background job fetches the current price for each bookmarked signal's symbol and compares it against the price at the time the signal fired. A buy signal is marked "validated" if the price rose, "invalidated" if it fell. The 30-day accuracy metric in the KPI cards is the percentage of validated signals over the trailing 30-day window.

---

## Files created in Phases 5 & 6

```
/components/modules/heatmap/HeatmapGrid.tsx
/components/modules/heatmap/MarketSwitcher.tsx
/components/modules/heatmap/ColorModeSwitcher.tsx
/components/modules/heatmap/SectorChart.tsx
/components/modules/heatmap/ColorLegend.tsx
/store/heatmapStore.ts
/lib/utils/colorInterpolation.ts
/lib/utils/treemapLayout.ts
/app/api/heatmap/route.ts

/components/modules/signals/SignalFeed.tsx
/components/modules/signals/SignalRow.tsx
/components/modules/signals/SignalKPICards.tsx
/components/modules/signals/ConfidenceBar.tsx
/hooks/useSignals.ts
/store/signalStore.ts
/store/bookmarkStore.ts
/lib/signals/rules.ts
/lib/signals/confidenceScorer.ts
/app/api/signals/route.ts
/app/api/signals/detect/route.ts
/app/api/signals/accuracy/route.ts
```

---

Ready to continue to Phase 7 — Portfolio, or jump straight into coding any of these phases?
---

## Phase 6 — Signals Module

**Signal detection engine**

Signals are detected server-side on a Node.js worker process (or a Vercel Cron Job every minute). The worker fetches the latest indicator values from Redis for all tracked symbols, runs each signal condition, and writes any triggered signals to a `signals` table in the database with a timestamp, confidence score, and expiry.

Signal conditions are defined as pure functions:

```typescript
interface SignalRule {
  name: string
  condition: (indicators: Indicators) => boolean
  confidence: (indicators: Indicators) => number
  type: 'buy' | 'sell' | 'neutral'
}
```

This makes signal rules trivially addable without touching the detection loop — just push a new rule into the rules array.

**Confidence scoring**

Confidence is not binary. A Golden Cross on high volume with RSI trending upward scores higher than the same crossover on low volume with RSI already overbought. Each rule's confidence function takes the full indicator set and returns a 0–100 score. The final confidence displayed is a weighted composite of all conditions that fired.

**Signal feed**

The signals panel polls the `/api/signals` endpoint every 30 seconds. New signals appear at the top of the feed with a subtle fade-in animation. Signals older than 24 hours are automatically archived. Users can bookmark signals to review later, and the system tracks whether bookmarked signals' subsequent price action validated or invalidated the signal — feeding the accuracy metric displayed in the KPI cards.

---

## Phase 7 — Portfolio Module

**Position tracking**

The portfolio store tracks positions as an array of `Position` objects: symbol, quantity, average cost basis, and market. P&L is computed reactively — whenever a new tick arrives for a held symbol, the unrealised P&L recalculates instantly without any API call:

```typescript
unrealisedPnL = (currentPrice - avgCost) * quantity
unrealisedPnLPct = (currentPrice / avgCost - 1) * 100
```

Total portfolio value is the sum of all position values plus the cash balance.

**Risk metrics**

Sharpe ratio, portfolio beta, and maximum drawdown are computed on a nightly schedule server-side from historical returns data and stored in the user's account. They update once per day because they require 30-day or 90-day return histories — real-time recomputation would be both expensive and misleading.

**Allocation chart**

The donut chart and allocation bar read directly from the live position store. As prices move, allocation percentages shift in real time. A position that grows significantly starts to create concentration risk — the allocation bar visually communicates this by shifting proportions.

Three diagrams for Phase 7 — the structural overview, the P&L reactive computation flow, and the build sequence.Now the P&L reactive computation flow — exactly how a live tick triggers a cascade of derived value updates across the entire portfolio module without redundant re-renders.Now the build sequence — the exact order for Phase 7 with no blocking dependencies.Click any node to drill into that specific step. Here's the full layer breakdown:

---

## Layer 7.1 — PortfolioStore + TypeScript interfaces

This is the foundation everything else computes from. Define the canonical types first before any component code:

```typescript
interface Position {
  id: string
  symbol: string
  market: 'equity' | 'crypto' | 'forex' | 'commodity'
  quantity: number
  avgCost: number
  openedAt: number
  currency: string
}

interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  executedAt: number
  fee: number
}

interface PortfolioState {
  positions: Position[]
  tradeHistory: Trade[]
  cashBalance: number
  addPosition: (position: Omit<Position, 'id'>) => void
  updatePosition: (id: string, partial: Partial<Position>) => void
  closePosition: (id: string, price: number) => void
  addTrade: (trade: Omit<Trade, 'id'>) => void
}
```

The `closePosition` action calculates the realised P&L, removes the position from `positions[]`, and appends a trade record to `tradeHistory[]`. The store never computes derived metrics — it only holds raw position state. All derived values live in the hook.

---

## Layer 7.2 — usePortfolio hook

The most important piece of Phase 7. It reads both the `PortfolioStore` and the `TickStore`, and returns a memoised object of all derived portfolio metrics. The critical performance pattern is the Zustand selector — it only subscribes to tick updates for symbols that are currently held:

```typescript
function usePortfolio() {
  const { positions, cashBalance } = usePortfolioStore()
  const heldSymbols = useMemo(() => positions.map(p => p.symbol), [positions])

  const ticks = useTickStore(
    useCallback(
      state => Object.fromEntries(heldSymbols.map(s => [s, state.ticks[s]])),
      [heldSymbols]
    )
  )

  return useMemo(() => {
    const enriched = positions.map(pos => {
      const currentPrice = ticks[pos.symbol]?.price ?? pos.avgCost
      const marketValue = currentPrice * pos.quantity
      const unrealisedPnL = (currentPrice - pos.avgCost) * pos.quantity
      const unrealisedPct = (currentPrice / pos.avgCost - 1) * 100
      return { ...pos, currentPrice, marketValue, unrealisedPnL, unrealisedPct }
    })

    const totalMarketValue = enriched.reduce((s, p) => s + p.marketValue, 0)
    const totalValue = totalMarketValue + cashBalance
    const totalUnrealised = enriched.reduce((s, p) => s + p.unrealisedPnL, 0)
    const totalCost = positions.reduce((s, p) => s + p.avgCost * p.quantity, 0)

    const allocation = enriched.map(p => ({
      ...p,
      weight: totalValue > 0 ? (p.marketValue / totalValue) * 100 : 0
    }))

    const byMarket = ['equity','crypto','forex','commodity'].map(m => ({
      market: m,
      pct: allocation.filter(p => p.market === m).reduce((s, p) => s + p.weight, 0)
    }))

    return { positions: allocation, totalValue, totalCost, totalUnrealised, byMarket }
  }, [positions, ticks, cashBalance])
}
```

The `useMemo` dependency array means the entire computation only reruns when positions change or a held symbol's tick updates — never on unrelated market data.

---

## Layer 7.3a — P&L utility functions

Pure functions — no hooks, no side effects, fully testable:

```typescript
// All inputs are numbers. No store reads inside these functions.

export function unrealisedPnL(currentPrice: number, avgCost: number, qty: number) {
  return (currentPrice - avgCost) * qty
}

export function unrealisedPct(currentPrice: number, avgCost: number) {
  return (currentPrice / avgCost - 1) * 100
}

export function realisedPnL(trades: Trade[]): number {
  return trades
    .filter(t => t.side === 'sell')
    .reduce((sum, t) => sum + ((t.price - getAvgCost(t.symbol, trades)) * t.quantity) - t.fee, 0)
}

export function dayDelta(currentValue: number, prevCloseValue: number) {
  return { absolute: currentValue - prevCloseValue, pct: (currentValue / prevCloseValue - 1) * 100 }
}
```

Each function has a corresponding unit test. If the P&L math is wrong, you know immediately and you know exactly which function to fix.

---

## Layer 7.3b — Risk metrics API route

Sharpe ratio, portfolio beta, and maximum drawdown require 30–90 days of daily return data. Computing these in the browser on every tick would be wasteful and misleading — they're statistical measures that should only change once per day. A Vercel Cron Job fires `GET /api/portfolio/risk` at market close each trading day:

```typescript
// Sharpe ratio: (meanReturn - riskFreeRate) / stdDevReturn
function sharpeRatio(returns: number[], riskFreeRate = 0.05 / 252): number {
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length
  return (mean - riskFreeRate) / Math.sqrt(variance)
}

// Beta: cov(portfolio, benchmark) / var(benchmark)
function portfolioBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
  const cov = covariance(portfolioReturns, benchmarkReturns)
  const varBench = variance(benchmarkReturns)
  return cov / varBench
}

// Max drawdown: largest peak-to-trough decline
function maxDrawdown(values: number[]): number {
  let peak = values[0], maxDD = 0
  for (const v of values) {
    if (v > peak) peak = v
    const dd = (peak - v) / peak
    if (dd > maxDD) maxDD = dd
  }
  return maxDD
}
```

Results are stored in the user's account row and served from the database — the client never computes these, it only fetches them once per day via React Query with `staleTime: 23 * 60 * 60 * 1000`.

---

## Layer 7.4 — KPI cards

The four cards (total value, invested, unrealised P&L, beta) read from `usePortfolio()` and the risk metrics query. Total value and unrealised P&L use `useNumberTransition` from Phase 2 to animate changes. Beta is static until the daily refresh. Each card has a trend arrow that flips direction when P&L crosses zero — implemented as a CSS class toggled by the sign of the value.

---

## Layer 7.5a — HoldingsTable

Built on TanStack Table, same pattern as the Screener in Phase 3. Each row renders a `HoldingRow` component that calls `useTick(symbol)` internally — so only the row for a symbol whose price just changed re-renders. The P&L column uses a custom cell renderer that formats the value, applies green/red colour, and shows both absolute and percentage values.

Column definition for the P&L column:

```typescript
{
  accessorKey: 'unrealisedPnL',
  header: 'P&L',
  cell: ({ row }) => {
    const { unrealisedPnL, unrealisedPct } = row.original
    const isUp = unrealisedPnL >= 0
    return (
      <span style={{ color: isUp ? 'var(--c-up)' : 'var(--c-down)' }}>
        {isUp ? '+' : ''}{formatCurrency(unrealisedPnL)}
        <span style={{ fontSize: 11, marginLeft: 4 }}>
          ({isUp ? '+' : ''}{unrealisedPct.toFixed(2)}%)
        </span>
      </span>
    )
  },
  sortingFn: 'basic'
}
```

---

## Layer 7.5b — Allocation visuals

The donut chart and allocation bar both read from `usePortfolio().byMarket`. When the underlying position values shift due to price changes, the allocation percentages recompute inside `usePortfolio`'s `useMemo`, and the charts get new data via their props — React handles the re-render automatically.

The allocation bar is a flex row where each segment's `flex` value is set to the market's percentage. CSS `transition: flex 0.4s ease` makes the segments animate smoothly as weights shift across a trading day.

---

## Layer 7.6 — AI optimiser integration point

This step is a placeholder built in Phase 7 and powered up in Phase 13. The button serializes the current portfolio state — positions, weights, P&L, risk metrics — and sends it to the Anthropic API with a system prompt that instructs Claude to act as a portfolio risk advisor. The response streams into a slide-out drawer component. The context sent includes:

```typescript
const portfolioContext = {
  totalValue,
  totalUnrealised,
  sharpe: riskMetrics.sharpe,
  beta: riskMetrics.beta,
  maxDrawdown: riskMetrics.maxDrawdown,
  positions: positions.map(p => ({
    symbol: p.symbol, market: p.market,
    weight: p.weight, unrealisedPct: p.unrealisedPct
  }))
}
```

---

## Files created in Phase 7

```
/store/portfolioStore.ts
/hooks/usePortfolio.ts
/lib/portfolio/pnl.ts
/lib/portfolio/riskMetrics.ts
/lib/portfolio/allocation.ts
/components/modules/portfolio/KPICards.tsx
/components/modules/portfolio/HoldingsTable.tsx
/components/modules/portfolio/HoldingRow.tsx
/components/modules/portfolio/AllocationDonut.tsx
/components/modules/portfolio/AllocationBar.tsx
/components/modules/portfolio/AIOptimiserDrawer.tsx
/app/api/portfolio/risk/route.ts
/app/api/portfolio/positions/route.ts
/app/api/portfolio/trades/route.ts
```

---

---

## Phase 8 — Live Data Integration

This builds on what was designed in the architecture diagram. The key implementation steps in order are:

1. Build the WebSocket manager class with reconnect logic and subscription registry.
2. Build the REST poller with configurable intervals and provider-specific adapters.
3. Build the normalizer that maps each provider's response shape to the internal `Tick` type.
4. Wire both transports into the Zustand tick store, which holds the latest tick per symbol.
5. Build the React hook `useTick(symbol)` that any component uses to subscribe to a single symbol's live price — components never touch the store directly.
6. Replace all mock data in the Dashboard, Screener, Charts, Heatmap, Signals, and Portfolio modules with live `useTick` and React Query calls.
7. Add the refresh interval selector in Settings and wire it to the REST poller's interval config.
8. Add a connection status indicator in the topbar that shows WebSocket health.

Here's the full architecture blueprint for Phase 8, followed by a detailed breakdown of every layer.Click any node in the diagram to drill deeper into that component. Here's a full written breakdown of each layer:
blueprint
## Phase 8 — Live Data Integration Blueprint

---

### What Phase 8 actually does

Every phase before this ran on mock data. Phase 8 rips out all the static arrays and fake ticks and replaces them with real market feeds. When Phase 8 is complete, every price, every percentage change, every volume figure, every indicator value in the entire application is sourced from a live provider and flows through a unified data pipeline into the components built in Phases 2–7.

The guiding principle for this phase is that no component ever knows where its data comes from. Components call `useTick('AAPL')` and get a price. They don't know if that price arrived via WebSocket, REST poll, or cache. The data pipeline is completely invisible to the UI layer.

---

### Provider assignment

Each market type maps to a specific provider chosen for reliability, cost, and WebSocket support.

Equities use Polygon.io. The free tier supports 15-minute delayed data; the Starter plan at $29/month unlocks real-time WebSocket. Polygon's WebSocket endpoint is `wss://socket.polygon.io/stocks`. Subscribe to `T.*` for trades and `Q.*` for quotes on specific symbols.

Crypto uses Binance WebSocket directly, which is free with no API key for public market data. The endpoint is `wss://stream.binance.com:9443/ws`. Subscribe to `<symbol>@ticker` for 24h rolling stats or `<symbol>@trade` for individual trades. CoinGecko REST fills in metadata — market cap, names, descriptions — that Binance doesn't provide.

Forex uses OANDA's streaming API, which requires an account (free demo available). The streaming endpoint is `https://stream-fxpractice.oanda.com/v3/accounts/{id}/pricing/stream`. OANDA streams pricing via HTTP chunked transfer (not WebSocket), so the transport layer handles it differently — it's a persistent HTTP request that receives newline-delimited JSON chunks.

Commodities use Alpha Vantage REST. Alpha Vantage has no WebSocket support, so all commodity data arrives via polling. The free tier gives 25 requests/day; the premium tier at $50/month gives 75 requests/minute, which is sufficient for polling 10–15 commodity symbols every 15 seconds.

Sentiment uses Finnhub's WebSocket (`wss://ws.finnhub.io`) for real-time news headlines per symbol, supplemented by a REST poll to their `/news` endpoint for historical context.

---

### Transport layer architecture

The transport layer consists of two classes: `WebSocketManager` and `RESTPoller`. Both are instantiated once at application startup (in a `_app.tsx` effect or a Next.js layout component) and run for the lifetime of the session.

**WebSocketManager**

This class manages all persistent WebSocket connections. It maintains a registry of active subscriptions — a `Map<string, Set<string>>` where the key is the connection URL and the value is the set of symbols currently subscribed on that connection.

The critical methods are:

`connect(url, apiKey)` — opens a WebSocket connection to the given URL, handles the authentication handshake (Polygon requires sending `{"action":"auth","params":"<key>"}` immediately after connection), and begins the reconnect loop.

`subscribe(url, symbols)` — sends the subscription message for the given symbols on the appropriate connection. For Polygon this is `{"action":"subscribe","params":"T.AAPL,T.MSFT"}`. For Binance it requires opening a new stream URL or sending a `SUBSCRIBE` frame.

`reconnect(url)` — implements exponential backoff: 1s, 2s, 4s, 8s, 16s, cap at 30s. Uses a `reconnectAttempts` counter per connection that resets to 0 on successful message receipt. Every reconnect re-subscribes to all symbols in the registry for that connection — no subscriptions are lost on disconnect.

`heartbeat(url)` — sends a ping frame every 30 seconds. If no pong is received within 10 seconds, treats the connection as dead and triggers reconnect.

`onMessage(url, handler)` — registers a message handler. Internally, all messages from a given connection route through a single `onmessage` handler that normalises the payload and emits it to the registered handler.

The manager exposes connection health state — `connected | connecting | reconnecting | error` — per provider. This feeds the live status indicator in the topbar.

```typescript
class WebSocketManager {
  private connections = new Map<string, WebSocket>()
  private subscriptions = new Map<string, Set<string>>()
  private reconnectTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private attempts = new Map<string, number>()
  private handlers = new Map<string, (msg: unknown) => void>()
  private status = new Map<string, ConnectionStatus>()

  connect(provider: Provider): void
  subscribe(provider: Provider, symbols: string[]): void
  unsubscribe(provider: Provider, symbols: string[]): void
  onMessage(provider: Provider, handler: (msg: unknown) => void): void
  getStatus(provider: Provider): ConnectionStatus
  destroy(): void
}
```

**RESTPoller**

A simpler class that wraps `setInterval` per provider with configurable intervals. Each provider has a registered adapter function that knows how to call its specific REST endpoint and parse the response. The poller calls the adapter, passes the result to the normaliser, and writes to the tick store.

```typescript
class RESTPoller {
  private intervals = new Map<string, ReturnType<typeof setInterval>>()

  register(provider: Provider, adapter: () => Promise<RawTick[]>, intervalMs: number): void
  start(provider: Provider): void
  stop(provider: Provider): void
  setInterval(provider: Provider, intervalMs: number): void
  destroy(): void
}
```

The interval is pulled from the Settings store at startup and updated reactively when the user changes the refresh interval in Settings. Changing from 15s to 5s calls `setInterval` on each REST provider, which clears the old interval and starts a new one.

---

### Normaliser

Every provider returns data in a different shape. The normaliser is a set of pure adapter functions — one per provider — that convert raw payloads into the canonical `Tick` type defined in Phase 1:

```typescript
// Polygon trade event
function normalisePolygon(raw: PolygonTrade): Tick {
  return {
    symbol: raw.sym,
    market: 'equity',
    price: raw.p,
    size: raw.s,
    timestamp: raw.t,
    exchange: raw.x,
    change: 0,        // computed downstream from previous close
    changePct: 0,
  }
}

// Binance 24hr ticker
function normaliseBinance(raw: BinanceTicker): Tick {
  return {
    symbol: raw.s.replace('USDT', ''),
    market: 'crypto',
    price: parseFloat(raw.c),
    size: parseFloat(raw.q),
    timestamp: raw.E,
    exchange: 'BINANCE',
    change: parseFloat(raw.p),
    changePct: parseFloat(raw.P),
  }
}

// OANDA pricing chunk
function normaliseOANDA(raw: OANDAPricing): Tick {
  const mid = (parseFloat(raw.asks[0].price) + parseFloat(raw.bids[0].price)) / 2
  return {
    symbol: raw.instrument.replace('_', '/'),
    market: 'forex',
    price: mid,
    size: 0,
    timestamp: new Date(raw.time).getTime(),
    exchange: 'OANDA',
    change: 0,
    changePct: 0,
  }
}
```

The `change` and `changePct` fields for providers that don't include them (Polygon, OANDA) are computed by the tick store on write, by comparing the incoming price against the stored `prevClose` for that symbol. The `prevClose` is fetched once per symbol on application load from a historical endpoint.

---

### Tick store write path

When a normalised tick arrives — from either WebSocket or REST — it follows this exact sequence before reaching any component:

**Step 1 — Deduplication.** The tick store checks if the incoming `(symbol, timestamp)` pair has been seen in the last 100ms. If so, it discards the tick. This prevents double-processing when both a WebSocket and a REST poll return the same event.

**Step 2 — Change computation.** If `changePct` is zero (provider doesn't supply it), compute it from `prevClose`:
```typescript
const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0
```

**Step 3 — Candle aggregation.** The tick is folded into the current open candle for each tracked timeframe. The 1-minute candle updates its `high`, `low`, and `close`. When the minute boundary crosses, the current candle closes and a new one opens.

**Step 4 — Store write.** `ticks[symbol]` is replaced with the new tick object. Because Zustand uses reference equality, only components subscribed to this specific symbol selector re-render.

**Step 5 — History buffer.** The last 100 ticks per symbol are kept in a rolling buffer. This feeds sparklines, mini-charts, and the short-term volatility indicator.

---

### Provider startup sequence

On application load, the following happens in order:

1. Fetch the symbol universe for the active market filter from `/api/symbols`. This returns the list of symbols the user is watching plus all symbols in the user's portfolio.

2. For each symbol, fetch `prevClose` from the appropriate provider's historical endpoint. Store in the tick store's `prevClose` map. This is a one-time batch request, not a recurring poll.

3. Start WebSocket connections for Polygon (equities) and Binance (crypto). Send authentication frames. Wait for auth confirmation before sending subscription frames.

4. Subscribe to all equity symbols on Polygon, all crypto symbols on Binance.

5. Start the OANDA HTTP stream for all forex pairs in the watchlist.

6. Start the `RESTPoller` for Alpha Vantage (commodities) and any equity symbols not covered by the WebSocket subscription tier.

7. Start the Finnhub WebSocket for news sentiment on watched symbols.

8. Set the connection status in the nav store to `connected`. The topbar live indicator turns green.

---

### Symbol universe management

The set of subscribed symbols is not static. It changes when the user adds to their watchlist, opens a new instrument in the chart, or updates their portfolio. The `SymbolRegistry` service manages this:

```typescript
class SymbolRegistry {
  private subscribed = new Set<string>()

  add(symbol: string, market: Market): void {
    if (this.subscribed.has(symbol)) return
    this.subscribed.add(symbol)
    // Subscribe on the appropriate provider
    if (market === 'equity') wsManager.subscribe('polygon', [symbol])
    if (market === 'crypto') wsManager.subscribe('binance', [symbol])
    if (market === 'forex') oandaStream.addPair(symbol)
    if (market === 'commodity') restPoller.addSymbol('alphavantage', symbol)
  }

  remove(symbol: string): void {
    if (!this.subscribed.has(symbol)) return
    this.subscribed.delete(symbol)
    // Unsubscribe from provider to stop receiving unwanted data
    // ... provider-specific unsubscribe
  }
}
```

The registry is called whenever the watchlist changes, whenever a chart opens a new symbol, and whenever a position is added to the portfolio. It ensures exactly the right symbols are subscribed — no more, no less.

---

### Replacing mock data across phases

This is the mechanical work of Phase 8. Each module's mock data is removed and replaced with real store reads.

In Phase 2 (Dashboard), the static watchlist array is replaced with `useWatchlist()` which reads from the `TickStore`. Each `WatchlistRow` calls `useTick(symbol)` to get a live price. The performance chart's hardcoded data array is replaced with a React Query fetch to `GET /api/portfolio/history?range=1W`.

In Phase 3 (Screener), the static screener results array is replaced with the `useScreener()` hook built in Phase 3, which now reads from the live Redis pre-computed metrics store that is populated by Phase 8's tick pipeline.

In Phase 5 (Heatmap), the hardcoded symbol array is replaced with a live `/api/heatmap` response that reads from Redis. The snapshot worker now fires against real symbol data.

In Phase 6 (Signals), the static signals array is replaced with the live `/api/signals` response. The cron-based detection engine now runs against real indicator values computed from live ticks.

In Phase 7 (Portfolio), the hardcoded position values are replaced with live `useTick` calls per held symbol feeding into the `usePortfolio` hook.

---

### Connection status UI

The topbar live indicator built in Phase 2 now connects to real state. The `ConnectionStatusStore` tracks health per provider:

```typescript
type ProviderStatus = 'connected' | 'connecting' | 'reconnecting' | 'error' | 'degraded'

interface ConnectionStatusState {
  polygon: ProviderStatus
  binance: ProviderStatus
  oanda: ProviderStatus
  alphavantage: ProviderStatus
  finnhub: ProviderStatus
}
```

The topbar indicator is `connected` (green pulse) only when all active providers report `connected`. If any provider is `reconnecting`, the indicator turns amber. If any provider is `error`, it turns red with a tooltip listing which providers are down. Clicking the indicator opens a connection health drawer showing per-provider status, last message time, and reconnect attempt count.

---

### Rate limiting and cost controls

Polygon's WebSocket sends every trade tick — for liquid stocks this is thousands of messages per second. The tick store implements a throttle: for any given symbol, UI-triggering store writes happen at most once every 100ms. Intermediate ticks are used only for candle aggregation and are not written to the reactive store. This prevents the component tree from thrashing on high-frequency symbols.

Alpha Vantage rate limiting is enforced in the `RESTPoller` — a token bucket allows at most 5 requests per minute on the free tier (or 75 on premium), with a queue that delays excess requests rather than dropping them.

A cost guard in the Settings panel shows estimated monthly API spend based on the number of tracked symbols and selected refresh intervals, calculated using each provider's published pricing. Exceeding a configurable cost threshold triggers a warning and throttles polling intervals automatically.

---

### Error handling strategy

Every transport path has a defined failure mode and recovery behavior.

WebSocket disconnects trigger immediate reconnect with exponential backoff. The store serves stale data during reconnection — components show their last known price, not blank or zero. After 5 failed reconnect attempts, the provider is marked `error` and a user-facing alert suggests checking the API key.

REST poll failures (HTTP 4xx or 5xx) are retried with a 3-attempt limit per poll cycle. A 429 (rate limit) response triggers automatic interval doubling until the next successful response, then gradually returns to the configured interval.

Failed normalisation (unexpected response shape) logs the raw payload to the browser console in development mode and emits a telemetry event in production. The malformed payload is discarded rather than crashing the write path.

---

### Files created in Phase 8

```
/lib/data/WebSocketManager.ts
/lib/data/RESTPoller.ts
/lib/data/SymbolRegistry.ts
/lib/data/normaliser/polygon.ts
/lib/data/normaliser/binance.ts
/lib/data/normaliser/oanda.ts
/lib/data/normaliser/alphavantage.ts
/lib/data/normaliser/finnhub.ts
/lib/data/candleAggregator.ts
/lib/data/tickDeduplicator.ts
/store/connectionStatusStore.ts
/hooks/useConnectionStatus.ts
/hooks/useMarketFeed.ts
/components/layout/ConnectionStatusDrawer.tsx
/app/api/symbols/route.ts
/app/api/prevclose/route.ts
/app/api/portfolio/history/route.ts
/config/providers.ts
/workers/tickPipeline.ts
```

---
---

**Layer 1 — External data sources**

Each market type maps to a dedicated provider. For equities, Polygon.io gives REST endpoints for OHLCV history and a WebSocket feed for real-time trades and quotes. For crypto, Binance WebSocket is the most reliable free source for live price ticks and order book depth; CoinGecko covers metadata and market cap. For forex, OANDA's streaming API delivers real-time bid/ask spreads on all major pairs. For commodities, Alpha Vantage covers gold, crude oil, natural gas, and agricultural futures. NewsAPI (or Finnhub) adds a sentiment layer — scanning headlines and scoring them bullish/bearish per ticker.

---

**Layer 2 — API gateway & normalizer**

This is a thin middleware layer (a Node.js/Express service or a set of serverless functions) that handles authentication headers, rate-limit management, and response normalization. Each provider returns data in a different shape — Polygon returns `{ T, o, h, l, c, v }`, Binance returns `{ s, p, q, T }`, OANDA returns `{ bid, ask, time }`. The normalizer converts all of them into a single internal schema: `{ symbol, market, price, open, high, low, close, volume, timestamp }`. Every part of the app speaks only this internal format — the source is irrelevant upstream.

---

**Layer 3 — Transport: WebSocket stream manager & REST poller**

Two parallel transport mechanisms run simultaneously. The WebSocket manager maintains persistent connections to Polygon and Binance, handles reconnection with exponential backoff, manages subscription lists per asset, and emits tick events into the event bus. The REST poller runs on a configurable interval (5s, 15s, or 1 minute as per settings) for providers that don't support streaming — Alpha Vantage, OANDA's non-streaming endpoints, and sentiment feeds. Both transport layers push normalized data into Layer 4.

---

**Layer 4 — In-memory store (Redis / Zustand)**

The central data store holds the last known price, OHLCV aggregates per timeframe, and a rolling tick buffer per symbol. In a browser-only build this is a Zustand store with computed selectors. In a full-stack build, Redis handles this with TTL expiry so stale quotes auto-purge. This layer also performs tick deduplication — if two sources send the same trade event, only one passes through. OHLCV aggregation happens here: incoming ticks get folded into the current 1-minute, 5-minute, and daily candles in real time.

---

**Layer 5 — Compute: event bus, screener engine, alert engine**

Three consumers subscribe to the data store. The event bus distributes price ticks via a pub/sub model to whichever UI components are currently mounted. The screener engine re-runs the active filter set on every new tick — recomputing RSI, MACD deltas, and volume ratios, then re-ranking results. The alert engine checks every incoming price against user-defined thresholds and signal conditions, firing in-app notifications or webhooks when triggered.

---

**Layer 6 — UI modules**

Each UI module subscribes only to the symbols it currently displays. The dashboard and watchlist update price, change, and P&L on every tick. The screener table re-sorts its rows as rankings shift. The heatmap updates cell colors as percentage changes move. The chart module appends each new tick to the current open candle. Indicators like RSI and MACD recalculate on every candle close.

---

**Technology choices at a glance**

| Concern | Recommended tool |
|---|---|
| Equities real-time | Polygon.io WebSocket |
| Crypto real-time | Binance WebSocket |
| Forex | OANDA Streaming API |
| Commodities | Alpha Vantage REST |
| Sentiment | Finnhub / NewsAPI |
| Frontend state | Zustand |
| Backend cache | Redis (Upstash) |
| API layer | Node.js / Next.js API routes |
| Hosting | Vercel (edge functions for low latency) |

Want me to now write the actual code for the data layer — starting with the WebSocket manager and the Zustand store?

---

## Phases 9–14 — Summary roadmap

Phase 9 (Candlestick upgrade) requires replacing the Chart.js price charts with TradingView Lightweight Charts and adding OHLCV data support from Polygon's aggregates endpoint.

Phase 10 (Screener logic) requires building the server-side filter query engine backed by Redis and replacing the static dropdown filters with a drag-and-drop filter builder component.

Phase 11 (Alerts) requires a notification store, a server-side threshold checker running on a cron schedule, and integration with a push notification service (OneSignal or native Web Push API).

Phase 12 (Auth & persistence) requires adding NextAuth.js with OAuth providers (Google, GitHub), a PostgreSQL database via Supabase or PlanetScale, and migrating all localStorage state to server-persisted user accounts.

Phase 13 (AI integration) requires wiring the Anthropic API to the analysis buttons, building prompt templates that inject live market context (current price, recent candles, active indicators) into each request, and streaming the responses into a side panel.

Phase 14 (Mobile & PWA) requires auditing every component for touch targets, adding a bottom navigation bar for mobile breakpoints, generating a PWA manifest and service worker, and optimizing the chart interactions for touch-based pinch-zoom and swipe navigation.

---

