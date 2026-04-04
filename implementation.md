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

