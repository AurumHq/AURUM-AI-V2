# AURUM R8 Gate 5 — Equator Revalidation Infrastructure Block — 2026-11-06

Founder-Mac frozen FAST/M1 revalidation.

## Source integrity

Verified before execution:
- branch: `recovery/r8-local-mac-2026-11-06`
- repaired OANDA backfill hash matched
- Event Risk service hash matched
- official release-confirmation source hash matched

## Calibration result

The frozen Equator calibration command started with the intended window:

- horizon: FAST
- granularity: M1
- start: `2026-09-06T06:59:00.000Z`
- end: `2026-11-05T06:59:00.000Z`
- maximum observations: 100000
- maximum pages: 20

It was blocked before schema initialization:

- phase: `BLOCKED`
- code: `CONNECTION_FAILED`
- issue: `The configured PostgreSQL connection timed out before schema initialization.`
- calibration exit: 2

Therefore Gate 5 did **not** exercise the repaired OANDA backfill, dataset manifest, calibration dataset, walk-forward report, or frozen registry acceptance.

## Post-block verification

- TypeScript exit: 0
- focused Equator/OANDA suites: 4 passed
- focused tests: 29 passed
- diff integrity: 0

## Source diagnosis

`connectServerPersistence()` currently configures the PostgreSQL pool with:

- `connectionTimeoutMillis: 4000`
- `statement_timeout: 8000`
- `query_timeout: 10000`

A four-second connect timeout can classify a slow/cold database wake-up as `CONNECTION_FAILED`.

No timeout change is accepted from this observation alone. A read-only diagnostic with a longer bounded connect window is required to distinguish cold-start latency from DNS, TCP/TLS, authentication, or endpoint availability failure.

Real-money authority remains locked.
