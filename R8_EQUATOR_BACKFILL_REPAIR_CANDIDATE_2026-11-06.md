# AURUM R8 Equator Backfill Repair Candidate — 2026-11-06

Candidate patch SHA-256:
`4307683923d7933c7d26725ed707e83e45c84fc33f5e8c591e79410618dea00d`

Applies only to the exact recovered source files:

- `lib/server/oandaGoldBackfill.ts` original SHA-256:
  `edbae5858570b3b56a08ba1658f927ee7b8607cc394eccced8cf4c9199989e4a`
- `tests/oandaGoldBackfill.test.ts` original SHA-256:
  `54fe6bff6018ec317a516448acc9b12d70458c04e6a2a05414531f990a9efcc4`

Post-patch expected SHA-256:

- `lib/server/oandaGoldBackfill.ts`:
  `1c17d914b79441f0cce95c88fa2f29fa0f25299d2bd2a39354ea08ef28927b42`
- `tests/oandaGoldBackfill.test.ts`:
  `3940124ecc9025b5364ccb7df88f74b38aa379502a138cb8b545b89e21ae29c9`

The patch passed `git apply --check` against a pristine copy of the recovered source.

Behavioral change:
- M1 pages are checked against the OANDA XAU/USD expected-open calendar.
- Missing expected-open M1 slots trigger up to two logical re-queries of the same page.
- Native candles from retries are merged by timestamp.
- Persistent expected-open gaps fail closed before persistence/checkpoint advancement.
- Expected closed-market slots do not trigger retries.
- No candle is synthesized.
- Non-M1 behavior is unchanged.

Validation status:
- Static patch application verified in the isolated recovery copy.
- Typecheck/test validation of the modified source still requires the Founder Mac environment.

Real-money authority remains locked.
