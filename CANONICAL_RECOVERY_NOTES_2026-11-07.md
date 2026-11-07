# AURUM R8 Canonical Recovery Notes — Build Accepted — 2026-11-07

## Canonical source package

- Build-accepted source ZIP: `AURUM-R8-CANONICAL-SOURCE-BUILD-ACCEPTED-2026-11-07.zip`
- ZIP SHA-256: `f62b2bd6561c4ce829fc25eac59e7addd2ded522eec8986bcd193637f893bcf5`
- Canonical manifest/tree SHA-256: `58aa48d442b46b381537e7e80a59d3a25b370b483777b69d1986c98dd1fe11df`
- Manifested files: 499
- Manifested bytes: 9,152,312
- Exact local production-build evidence is embedded as `BUILD_ACCEPTANCE_2026-11-07.txt`.

## Current validated runtime hashes

- `lib/server/autonomousRuntime.ts`
  `5fb14fe7cf1a18c67d28dda79e0cca85cda69bc651e10aeb14d0b5bc394abcc9`
- `lib/client/autonomousRuntimeStatus.ts`
  `f74bf84b42ad2ad9ec5fe410013b4b0ebe7aee3a804b696532663f80fb5a5299`
- `tests/autonomousRuntime.test.ts`
  `fb766792da7000839e8eb1ce46492426e7d74e1aac7865ce703a17023b8e0b49`
- `lib/domain/equatorV11Challenger.ts`
  `e453a0cfe0303c10cf20366e99dce38ccb53da73946f47971799bc912918af2e`
- `tests/paperEngineEndToEndAcceptance.test.ts`
  `fd44d7a9469591e803c86e152fd5c8ec5ada603141dcaac0ca559e0dd44d1629`

## Production build acceptance

Validated on the Founder's current R8 source on 2026-11-07:

- source identity: `ACCEPTED_R8_CURRENT`
- `npm run typecheck`: exit 0
- `npm run build`: exit 0
- Next.js 16.3.0 / Turbopack production compilation: successful
- static page generation: successful
- dynamic API route discovery: successful
- `git diff --check`: exit 0

The stale remote `main` build defect is therefore not present in the recovered R8 source.

## Governance-blocked runtime

The accepted runtime now projects stale Equator authority explicitly as:

`EQUATOR_GOVERNANCE_BLOCKED`

This is a non-trading operational state. It does not authorize candidate generation, broker execution, or real-money activity. Other data/provider/historian failures remain fail-closed.

## Security scan

Build-accepted clean package scan found:

- sensitive filename hits: 0
- common private-key/API-key/PAT/AWS-key/PostgreSQL credential pattern hits: 0
- no `.env` credential files included

## Governance state

- Frozen Equator V1 fresh revalidation: `REJECTED_OR_INCOMPLETE`.
- Fold 1 / 15m reliability gap: `0.217172`.
- Fold 1 / 30m reliability gap: `0.249711`.
- Equator V1.1 challenger failed those same two forward reliability gates.
- No threshold loosening or repeated holdout tuning is authorized.
- Paper engine E2E acceptance: passed.
- Real-money authority remains locked.

## Safety invariants

- `safeMode = ACTIVE`
- `riskGovernor = BLOCKED`
- `executionAuthority = false`
- `tradeAuthority = false`
- `brokerPayload = null`
- `realMoneyEnabled = false`
