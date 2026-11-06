# AURUM R8 Gate 2B — OANDA Historical Gap Classification — 2026-11-06

Founder-Mac read-only candle-route diagnostic.

## Route behavior

Recent-candle comparison:
- account-scoped recent MBA route returned HTTP 401
- legacy/unscoped recent MBA route returned HTTP 200 with 5 XAU_USD M1 candles

Historical account-scoped route for 2026-10-30T05:30:00Z through 2026-10-30T20:59:00Z:
- query 1: HTTP 200, 929/929 candles, 0 missing, 0 incomplete
- query 2: HTTP 200, 929/929 candles, 0 missing, 0 incomplete
- repeated timestamp sets identical: true

## Supported conclusion

The October 30 expected-open M1 intervals are available from OANDA now. The R7 Equator missing-candle failure therefore cannot be classified as a permanent absence in current OANDA history.

The recovered backfill source advances its checkpoint cursor to the requested page end after any syntactically valid successful page, even if expected-open M1 slots are absent from that response. Existing tests explicitly allowed this behavior.

That creates a recoverability defect: a transient omission in an HTTP-200 response can be skipped permanently and later cause the frozen Equator registry manifest to reject the dataset.

This does not prove whether the original October 30 omission was caused by OANDA transient response behavior or another retrieval/persistence fault, but it proves the backfill did not protect against such an omission.

## Proposed repair

For M1 historical backfill only:
- validate every returned native candle strictly before persistence;
- compare each requested slot against the OANDA XAU/USD expected-open calendar;
- if expected-open slots are missing, repeat the same page query boundedly;
- merge only native candles returned by OANDA;
- if the expected-open gap persists after bounded attempts, fail closed before persistence/checkpoint advancement;
- ignore expected closed-market slots;
- never synthesize a candle.

Regression tests cover:
- recovery after an incomplete successful page;
- fail-closed behavior after repeated incomplete pages;
- no retry or synthesis during expected closed-market slots.

Real-money authority remains locked.
