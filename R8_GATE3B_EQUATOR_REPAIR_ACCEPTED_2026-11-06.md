# AURUM R8 Gate 3B — Equator Backfill Repair Accepted — 2026-11-06

Founder-Mac validation of the repaired OANDA M1 historical backfill.

## Integrity

- Gate 3 production source hash:
  `1c17d914b79441f0cce95c88fa2f29fa0f25299d2bd2a39354ea08ef28927b42`
- Gate 3B pre-patch test hash:
  `3940124ecc9025b5364ccb7df88f74b38aa379502a138cb8b545b89e21ae29c9`
- Gate 3B post-patch test hash:
  `cf45a85c87e9a1aa7455f00e3c42e051258c2a96756fe643307794e4238cd6b6`

## Validation

- test-fix patch apply exit: 0
- TypeScript exit: 0
- Equator/OANDA focused test files: 4 passed
- Equator/OANDA focused tests: 29 passed
- diff integrity exit: 0

Passing suites:
- `tests/oandaGoldBackfill.test.ts`
- `tests/oandaMarketCalendar.test.ts`
- `tests/equatorExpansionEvidence.test.ts`
- `tests/equatorPreTrade.test.ts`

## Accepted behavior

For OANDA XAU/USD M1 historical backfill:
- expected-open missing minutes inside a successful page trigger bounded re-query;
- native candles are merged by timestamp;
- persistent expected-open gaps fail closed before persistence/checkpoint advancement;
- expected closed-market slots do not trigger retries;
- no synthetic candle is created;
- non-M1 behavior remains unchanged.

This repair is accepted for the recovered branch. It does not, by itself, prove frozen Equator V1 revalidation succeeds on the full manifest.

Real-money authority remains locked.
