# AURUM R8 Canonical Recovery Notes — 2026-11-07

## Canonical source package

- Full clean source ZIP: `AURUM-R8-CANONICAL-SOURCE-2026-11-07.zip`
- ZIP SHA-256: `33f897d99e6445044ef9ec74eec9e4279ebced30b8fa8e6463a42141c3ba6d2d`
- Canonical clean source tree SHA-256 (manifest excluded): `6cf184cd4e176e11c5f95743c87241e5f12b045b44361c36c3fd25be18e15557`
- Clean source file count before manifest: 498
- Clean source bytes before manifest: 9,148,656

## Current validated source hashes

- `lib/server/oandaGoldBackfill.ts`
  `57139e8366af383ac5a414c343b9ea5d2d3f31c48c2de7dd3855fae6a70f9a2b`
- `tests/oandaGoldBackfill.test.ts`
  `9d93a3c12e49c7dba808471d0632e307cbb8945104ec85ce1845dbd945b60def`
- `lib/server/oandaMarketCalendar.ts`
  `30c2ee458751d6f8f2034ff24609694d2308a584f75a7f2bc36077b2adb8c9eb`
- `tests/oandaMarketCalendar.test.ts`
  `178cb6ef38bae8fe47da834efb5cc63d7489eadbd3aa3f724331cf4216d61d4b`
- `scripts/runOandaEquatorCalibration.ts`
  `191053acbf3fd4d5a3fa1655a79fb617d9dba2fbfc22fe9bed0629c8b8226816`
- `lib/domain/equatorExpansionEvidence.ts`
  `5c1e1a5559ef84f1c2790abdc5cca8e9fbca62a27f47589b900745f1f3f73fc5`
- `lib/server/equatorPreTradeService.ts`
  `e11e41760474875d2778187c151f72993751a23a7b4336335f9d3b6b96effd68`
- `tests/equatorExpansionEvidence.test.ts`
  `479ae2c317f573acab9d319ca57e86f50349160118d579cdec0a004cab55b674`
- `lib/domain/equatorV11Challenger.ts`
  `e453a0cfe0303c10cf20366e99dce38ccb53da73946f47971799bc912918af2e`
- `scripts/runEquatorV11Challenger.ts`
  `5217a0a5fc345c080e3b257a61a2e749cf89b5c3b1f79ec655e527ba4a0da03a`
- `tests/equatorV11Challenger.test.ts`
  `7de73de115c5c5cd41cb188b615bbbb9d9f31af088bc0b60d68e3c4b8ce4d74d`
- `tests/paperEngineEndToEndAcceptance.test.ts`
  `fd44d7a9469591e803c86e152fd5c8ec5ada603141dcaac0ca559e0dd44d1629`

## Security scan

Clean package scan found:
- no environment credential files;
- no private-key files;
- no OpenAI key patterns;
- no GitHub PAT patterns;
- no AWS key patterns;
- no PostgreSQL credential URLs;
- no OANDA token assignment patterns.

## Governance state

- Frozen Equator V1 fresh revalidation: `REJECTED_OR_INCOMPLETE`.
- 10/12 fold/window artifacts passed.
- Fold 1 / 15m reliability gap: `0.217172`.
- Fold 1 / 30m reliability gap: `0.249711`.
- Equator V1.1 challenger also failed those same two forward reliability gates.
- No threshold loosening or holdout retuning is authorized.
- Paper engine E2E acceptance passed.
- Real-money authority remains locked.
