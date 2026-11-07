# AURUM R8 Historian Reconstruction Repair Candidate — 2026-11-06

Gate 5E completed the full 60-day OANDA backfill through page 18, then failed at:
`DATASET_BLOCKED / HISTORIAN_RECONSTRUCTION_FAILED`.

Source diagnosis:
- `scripts/runOandaEquatorCalibration.ts` reconstructs by calling global `loadOandaGoldCandles()`, which lists every OANDA candle in the historian and fails the whole reconstruction on any read/incompatible legacy record.
- This conflicts with the previously established bounded PostgreSQL reconstruction design.
- The existing `loadOandaGoldCandlesInWindow()` was bounded but had a single 5,000-record query cap, insufficient for a ~60,000-candle M1 window.

Repair candidate:
- make `loadOandaGoldCandlesInWindow()` query the exact requested range in bounded 4,000-slot chunks;
- retain a 5,000-row hard ceiling per chunk and fail closed if the ceiling is reached;
- validate every returned native persisted candle exactly as before;
- change offline calibration to reconstruct both feature and label candles only from the requested persisted window;
- add regression coverage proving >5,000 M1 candles reconstruct without a global historian list and that query-limit saturation fails closed.

Patch SHA-256:
`ddf66a36d2d6a773ac69ea474d871dda6991b13a033c29d7efcb5a9489e2e96a`

Expected Gate 5E pre-patch hashes:
- `lib/server/oandaGoldBackfill.ts`: `78eada7f99e7219ddd9a9d828ae1699dc7cbb70b3e882faa2f176a8a246279c4`
- `scripts/runOandaEquatorCalibration.ts`: `6d03b187e3e9b76702809cb36e0a19043208b188dea067ad09ec7d4a4605e934`

Expected post-patch hashes:
- `lib/server/oandaGoldBackfill.ts`: `57139e8366af383ac5a414c343b9ea5d2d3f31c48c2de7dd3855fae6a70f9a2b`
- `scripts/runOandaEquatorCalibration.ts`: `79418a1eacb82774a2b2059a0213509576be90ed9304a2c29e1260663a07e8f2`
- `tests/oandaGoldHistorianWindow.test.ts`: `48c9a04fa528ba9046b8620149be0a5a60d3130e35940cbabca82f5ec283ebe7`

The patch passes `git apply --check` and `git diff --check` against the exact Gate 5E source state.

Real-money authority remains locked.
