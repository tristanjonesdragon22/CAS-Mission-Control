V631.2.66 Advanced Symbolic Algebra & Market Research Integration
- Preserves V631.2.65 and earlier files.
- Adds linear/quadratic polynomial root estimates; exact polynomial identity checks remain in V631.2.65.
- Reintroduces user's prior CAS V502 Market Research Laboratory HTML in a standalone legacy page.
- Adds integrated SMA crossover historical backtest, transaction-cost accounting, equity chart, manual portfolio holdings and P/L.
- Uses user-entered prices; does not fetch live quotes, connect brokerage accounts, or execute trades.
- Historical returns are not forecasts. Backtest uses previous bar signals and does not model taxes, dividends, full slippage, or market impact.
- Start with IPAD_OFFLINE/index.html in a compatible browser. Offline caching requires a secure browser context; file:// may restrict features.
- No native iPad app or full original Windows Python CAS conversion.
- Behavioral test: node test_v631_2_66.js (requires Node.js).
