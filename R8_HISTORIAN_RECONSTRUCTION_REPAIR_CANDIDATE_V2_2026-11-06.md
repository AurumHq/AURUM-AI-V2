# AURUM R8 Historian Reconstruction Repair Candidate V2 — 2026-11-06

Gate 5E completed all 18 historical backfill pages through the requested end timestamp, then failed at `HISTORIAN_RECONSTRUCTION_FAILED`.

Source diagnosis:
- offline calibration globally lists all `OANDA_GOLD_CANDLE` records even though only the requested 60-day range is required;
- that global reconstruction fails closed on any unrelated historian read/incompatible legacy record;
- the existing bounded window loader used one 5,000-row query, which is insufficient for a ~60,000-candle FAST/M1 range.

V2 repair:
- reconstruct only the requested persisted window;
- page the requested range in 4,000-slot bounded chunks;
- retain the 5,000-row hard ceiling per query and fail closed on possible truncation;
- validate every returned persisted candle exactly as before;
- for FAST/M1, reuse the same reconstructed array for both feature and label candles rather than reading the same 60-day window twice;
- add regression tests proving >5,000 M1 candles reconstruct without global historian listing and query-limit saturation fails closed.

Patch SHA-256:
`2874f14f5c96ed41dd1fe3a1d6fde0f858273bbc911564270edbbe56a66b114f`

Expected Gate 5E pre-patch hashes:
- `lib/server/oandaGoldBackfill.ts`: `78eada7f99e7219ddd9a9d828ae1699dc7cbb70b3e882faa2f176a8a246279c4`
- `scripts/runOandaEquatorCalibration.ts`: `6d03b187e3e9b76702809cb36e0a19043208b188dea067ad09ec7d4a4605e934`

Expected post-patch hashes:
- `lib/server/oandaGoldBackfill.ts`: `57139e8366af383ac5a414c343b9ea5d2d3f31c48c2de7dd3855fae6a70f9a2b`
- `scripts/runOandaEquatorCalibration.ts`: `963ee5995039b7520433cc85c32820e658b31ddffc7486de1fc881de4b30c116`
- `tests/oandaGoldHistorianWindow.test.ts`: `48c9a04fa528ba9046b8620149be0a5a60d3130e35940cbabca82f5ec283ebe7`

The patch passes `git apply --check` and `git diff --check` against the exact Gate 5E source state.

No Equator model parameter, calibration threshold, OANDA evidence, database schema, or trading authority is changed.
