# AURUM R8 Canonical Recovery Archive — 2026-11-07

This branch is an archive landing zone only. It is intentionally excluded from automatic Vercel deployment.

Canonical clean source archive:
- filename: `AURUM-R8-CANONICAL-SOURCE-2026-11-07.zip`
- SHA-256: `33f897d99e6445044ef9ec74eec9e4279ebced30b8fa8e6463a42141c3ba6d2d`
- canonical clean source tree SHA-256 (manifest excluded): `6cf184cd4e176e11c5f95743c87241e5f12b045b44361c36c3fd25be18e15557`
- clean source files before manifest: 498
- clean source bytes before manifest: 9,148,656

The archive was reconstructed from the 2026-11-06 local recovery capture plus every accepted R8 repair through:
- OANDA missing-slot backfill repair
- Official Event Risk release confirmation
- account-scoped OANDA historical route
- XAU/USD Labor Day calendar repair
- bounded historian reconstruction
- compact walk-forward report storage
- Gate 5G async test correction
- Equator V1.1 challenger files (challenger-only; not promoted)
- paper-engine E2E acceptance test

Safety state remains:
- safeMode = ACTIVE
- riskGovernor = BLOCKED
- executionAuthority = false
- tradeAuthority = false
- brokerPayload = null
- realMoneyEnabled = false

Do not merge this branch into main until the recovered source tree is explicitly restored and validated.
