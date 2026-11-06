# AURUM R8 Local Recovery Integrity Checkpoint — 2026-11-06

This file records the integrity of the Founder-uploaded local recovery package before any repair or reconciliation work.

## Recovery package

- Package: `AURUM-R8-LOCAL-RECOVERY-2026-11-06.zip`
- ZIP SHA-256: `e8eb45facd5ade2d3d17288f1ca02a20b7993f69244a042622d469963735f81d`
- Extracted files: 762
- Clean source-set files (excluding generated/public evidence, diagnostics, caches, runtime state, ZIPs, env files): 485
- Clean source-set bytes: 4,915,888
- Canonical clean source tree SHA-256: `46a4c552472ae41baf6b70650df8917070e1df3e8ada5a5930696e045b125ce8`

The canonical source-tree hash is SHA-256 over the sorted sequence:
`<file_sha256><two spaces><relative_path>\n`

## Key source hashes

- `package.json`: `c6d623f763c1b387afdaf84f0986d7033adc627d6857f8a21d602a16612d0c41`
- `package-lock.json`: `3a5690c36c9be2d2cbc91c820e664e97e3b39714faf9311a946e77f1bb7f4412`
- `README.md`: `ad5a379d57fda9c2e44af34db9fb5bdf99271418b1e654d6128fec51f4dfa90f`
- `scripts/autonomousRuntimeWorker.ts`: `92744107819c1a97c0a669fbca448bf57b91ab594fdd87c3a1e9fb21bc56e6c2`
- `scripts/simulationRuntime.mjs`: `8a998f48bf5aa4c9e4b3ce2c252dd89145e6b8a2504b2333ed01aaf91cdd9414`
- `scripts/runOandaEquatorCalibration.ts`: `6d03b187e3e9b76702809cb36e0a19043208b188dea067ad09ec7d4a4605e934`
- `lib/server/autonomousRuntime.ts`: `f4cd50f8c1e8b4e1b84223d65726ddc96d68dd7055d67ce85e8c4a7b7f21c84c`
- `lib/server/oandaGoldBackfill.ts`: `edbae5858570b3b56a08ba1658f927ee7b8607cc394eccced8cf4c9199989e4a`
- `lib/server/oandaMarketCalendar.ts`: `6220172e864b5c39aac0ec20d7a127566bed12b95b7f951c11a4fbf8d6401e39`
- `lib/server/officialEventRiskService.ts`: `ba7d8842254e467e9d2fd681a2f9399ed5be321aa456d7878032fdbd865af925`
- `lib/server/paperSimulationService.ts`: `440e60ad3c7cb3056ffb3e584a2fc2e0ebe3f3a0556cabf939c5f40cedf23530`
- `lib/server/paperTradeLifecycleService.ts`: `fcca403d10141130b4ea68803af47fa6eeba67e4b74a68804a5de966a1b25715`
- `lib/domain/equatorExpansionEvidence.ts`: `a6904d0ffaa53e84db95416fefebb4daa5f6372025525d40b1a19f5ea5f6a671`
- `lib/domain/equatorArtifactRegistry.ts`: `b34a8fdc0ec05a49c6e06745b8f0957516545d7044cdfbbe2a874d144f36b1bd`
- `lib/domain/officialEventRisk.ts`: `f5d177ed9b92468b9322de259e32bbdf883340467735b8d9c1c446520314067f`

## Secret screening

The recovery archive contains no `.env`, `.env.*`, PEM/private-key, SSH-key, or credential-named files.

Content-level screening flagged only test fixtures, including dummy PostgreSQL URLs and a test token literal. No high-confidence live credential was found in the recovered package.

## Execution verification state

Dependency installation in the isolated recovery environment did not complete before the execution timeout. Therefore this checkpoint does **not** claim that typecheck, build, or test suites passed.

The recovery package is being treated as evidence/source for reconciliation, not as a validated production release.

## Safety invariants

No real-money authority is granted by this checkpoint. Existing AURUM locks remain binding:

- `tradeAuthority=false`
- `executionAuthority=false`
- `brokerPayload=null`
- `realMoneyEnabled=false`

`main` is intentionally untouched.
