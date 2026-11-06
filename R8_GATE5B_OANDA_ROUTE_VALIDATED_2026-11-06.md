# AURUM R8 Gate 5B — OANDA Historical Route Repair Validated — 2026-11-06

Founder-Mac validation:

- historical route repair patch applied successfully
- TypeScript exit: 0
- oandaGoldBackfill test suite: 12/12 passed
- diff integrity: 0
- frozen Equator revalidation progressed past the prior HTTP 401

The new blocking evidence is:

- code: PROVIDER_UNAVAILABLE
- first missing expected-open M1 candle: 2026-09-07T22:01:00.000Z

This timestamp is 18:01 America/New_York on 2026-09-07 (US Labor Day), exactly at OANDA's published US metals holiday reopen boundary.

No calendar change is accepted yet. The next evidence gate is a direct read-only account-scoped OANDA M1 query around the 18:01 ET reopening boundary to identify the first native candle timestamp actually emitted by OANDA.

Real-money authority remains locked.
