# AURUM R8 OANDA Historical Account-Scoped Route Repair Candidate — 2026-11-06

Gate 5 rerun reached the frozen specification and then failed at the first historical OANDA backfill page with HTTP 401.

Recovered source inspection confirmed the historical backfill constructs:
`/v3/instruments/XAU_USD/candles`

Current OANDA v20 documentation identifies historical candlestick data under:
`/v3/accounts/{accountID}/instruments/{instrument}/candles`

Founder-Mac live evidence already established:
- configured OANDA environment is practice;
- practice account-summary authentication succeeds;
- account-scoped historical XAU_USD M1 MBA query over the October 30 test window returned 929/929 expected candles twice;
- the frozen backfill using the unscoped historical route returns HTTP 401 at the first page.

Candidate patch SHA-256:
`e7864ed55af4704f1d4e3b083cb05e0d14af6e54fca4e58c787e8dd4bdfc58b7`

Expected pre-patch hashes:
- `lib/server/oandaGoldBackfill.ts`: `1c17d914b79441f0cce95c88fa2f29fa0f25299d2bd2a39354ea08ef28927b42`
- `tests/oandaGoldBackfill.test.ts`: `cf45a85c87e9a1aa7455f00e3c42e051258c2a96756fe643307794e4238cd6b6`

Expected post-patch hashes:
- `lib/server/oandaGoldBackfill.ts`: `78eada7f99e7219ddd9a9d828ae1699dc7cbb70b3e882faa2f176a8a246279c4`
- `tests/oandaGoldBackfill.test.ts`: `9d93a3c12e49c7dba808471d0632e307cbb8945104ec85ce1845dbd945b60def`

Patch scope:
- require `OANDA_ACCOUNT_ID` for historical backfill;
- construct the account-scoped historical candles URL;
- regression-test the account-scoped path;
- fail before network access when account ID is missing.

No Equator calibration parameter, persistence behavior, real-money authority, or trade logic is changed.

The patch passed `git apply --check` against the exact accepted recovered source.
