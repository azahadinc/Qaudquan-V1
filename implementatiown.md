Here's a structured development task breakdown based on what to be built:

---

**QuantEdge — Development Task Steps**

---

**Phase 1 — Foundation & Architecture** ✅ Complete

The application shell has been built with a responsive sidebar navigation, top market filter bar, live status indicator, and a global search input. The routing system between all 6 pages is wired up with active state management, and the overall design system (typography, color tokens, spacing, component patterns) is established.

---

**Phase 2 — Dashboard Module** ✅ Complete

Four summary metric cards display portfolio value, day P&L, win rate, and Sharpe ratio. The portfolio performance line chart renders with a 7-day view and timeframe toggle (1D / 1W / 1M / 3M / 1Y). The watchlist shows 6 assets across all market types with mini progress bars and live change indicators. Market breadth (doughnut), sector rotation (bar chart), and top movers panel are all rendered.

---

**Phase 3 — Screener Module** ✅ Complete

A full data table screener covers Equities, Crypto, Forex, and Commodities in a single view. Filters for market type, market cap, RSI range, volume spike, trend (MA crossovers), and signal type are in place as UI controls. Ten columns render per row including ticker, price, change, volume, market cap, RSI, MACD, and signal badge. The "Build Custom Filter" button connects to AI analysis via `sendPrompt`.

---

**Phase 4 — Charts & Technical Analysis Module** ✅ Complete

A 30-day price line chart and volume bar chart are rendered for AAPL as the default instrument. Three indicator panels — Trend, Oscillators, and Volatility — cover SMA 50/200, EMA 20, MACD, ADX, VWAP, RSI, Stochastic RSI, Williams %R, CCI, MFI, Bollinger Bands, ATR, IV Rank, and Beta. Key stats (52W High/Low, P/E, avg volume) sit below. The "AI Analysis" button triggers a deep technical read via Claude.

---

**Phase 5 — Heat Map Module** ✅ Complete

An 18-cell S&P 500 heatmap renders with dynamic color scaling from red (−5%) to green (+5%) based on daily change. A horizontal legend explains the color scale. A sector performance horizontal bar chart and an 8-cell crypto heatmap (BTC, ETH, SOL, BNB, etc.) are rendered alongside.

---

**Phase 6 — Signals Module** ✅ Complete

Four KPI cards show active buy signals, sell signals, average confidence, and 30-day signal accuracy. A live signal feed lists 6 active signals with type (Golden Cross, Breakout, RSI Divergence, Death Cross, Support Break), confidence percentage, and timestamp. A signal distribution doughnut and breakdown by signal type complete the panel.

---

**Phase 7 — Portfolio Module** ✅ Complete

Four portfolio metrics cover total value, cost basis, unrealised P&L, and portfolio beta. An allocation breakdown bar and donut chart split exposure across Equities (52%), Crypto (28%), Forex (10%), Commodities (7%), and Cash (3%). A holdings table shows quantity, average cost, current price, P&L, and portfolio weight per asset.

---

**Phase 8 — Live Data Integration** 🔲 Next

Connect real market data APIs: Polygon.io or Alpha Vantage for equities, CoinGecko or Binance WebSocket for crypto, OANDA or Frankfurter for forex, and a commodities feed. Replace all static mock data with live polling on a configurable refresh interval (5s / 15s / 1min as per settings).
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

**Phase 9 — Charting Engine Upgrade** 🔲 Next

Swap the Chart.js price chart for TradingView Lightweight Charts or Apache ECharts to support true candlestick OHLCV rendering, drawing tools, multi-timeframe switching, and overlay indicators (Bollinger Bands plotted on price, MACD histogram below).

---

**Phase 10 — Screener Logic Engine** 🔲 Next

Build a real filter engine behind the screener dropdowns — server-side or client-side — so that RSI, volume, MA crossover, and signal filters actually query and rank live instruments. Add a "Save Filter" feature so users can store custom screener presets.

---

**Phase 11 — Alerts & Notifications** 🔲 Next

Allow users to set price alerts, RSI threshold triggers, and signal notifications per ticker. Deliver via in-app notification panel, email, or push notification depending on platform.

---

**Phase 12 — Authentication & User Data** 🔲 Next

Add user login, persistent portfolio tracking, watchlist customisation saved per account, and settings persistence. Connect to a backend (Node/Supabase/Firebase) for trade history logging and P&L calculation.

---

**Phase 13 — AI Integration Layer** 🔲 Next

Wire all "AI Analysis" and "Optimize" buttons to the Anthropic API — enabling natural language chart pattern recognition, screener filter generation from plain English, portfolio rebalancing suggestions, and signal explanation. This turns QuantEdge from a data viewer into an intelligent quant assistant.

---

**Phase 14 — Mobile Optimisation & PWA** 🔲 Next

Fully responsive layout for tablet and mobile, collapsible sidebar, touch-friendly chart interactions, and PWA manifest so the app can be installed on mobile devices as a native-like experience.


---

Want me to start on any specific next phase — particularly Phase 8 (live data) or Phase 13 (AI integration)?
