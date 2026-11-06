# AURUM R8 Labor Day XAU/USD Calendar Repair Candidate — 2026-11-06

Gate 5D provider evidence established:
- unscoped historical route: attempts 1-2 HTTP 401; attempt 3 HTTP 200
- account-scoped historical route: attempts 1-3 HTTP 200
- successful responses from both routes returned the same six native XAU/USD M1 candles
- first native candle: 2026-09-07T22:04:00.000Z
- next candles: 22:05, 22:06, 22:07, 22:08, 22:09 UTC

2026-09-07T22:04:00Z is 18:04 America/New_York. Because the AURUM manifest tests openness at candle end-time, that native candle ends at 18:05 ET.

OANDA instrument-specific XAU/USD hours are 18:05-16:59 New York time. OANDA's generic 2026 Labor Day metals schedule advertises a reopen at 18:01, but native XAU/USD history does not emit 18:01-18:03 M1 candles.

Current AURUM Labor Day override incorrectly makes candle end-times after 18:01 expected-open, causing false missing candles at starts 18:01-18:03.

Candidate patch:
- bumps OANDA calendar version 2026.3 -> 2026.4
- closes the Labor Day XAU/USD holiday interval through 18:05 ET
- makes Labor Day expected-open end-time boundary >=18:05 ET
- regression-tests 22:01/22:04 closed-end boundaries and 22:05 open-end boundary
- updates the manifest fixture to use the native 22:04Z candle

Patch SHA-256:
b72bdfffe70f344afde136066f6b2159822871128e3adf82fc64ce1a006a4026

Expected pre-patch hashes:
- lib/server/oandaMarketCalendar.ts: 6220172e864b5c39aac0ec20d7a127566bed12b95b7f951c11a4fbf8d6401e39
- tests/oandaMarketCalendar.test.ts: 1d33bdbd56f9a4ec07553f9474bc03d19e8b56c68bccea22e379d71f0d74105e

Expected post-patch hashes:
- lib/server/oandaMarketCalendar.ts: 30c2ee458751d6f8f2034ff24609694d2308a584f75a7f2bc36077b2adb8c9eb
- tests/oandaMarketCalendar.test.ts: 178cb6ef38bae8fe47da834efb5cc63d7489eadbd3aa3f724331cf4216d61d4b

No backfill, persistence, calibration, Event Risk, paper trading, or real-money authority logic is modified by this patch.
