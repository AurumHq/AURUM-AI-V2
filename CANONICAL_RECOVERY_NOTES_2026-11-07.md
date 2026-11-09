# AURUM R8 Canonical Recovery Notes — Deployment Accepted — 2026-11-09

## Canonical source package

- Archive: `AURUM-R8-CANONICAL-SOURCE-DEPLOYMENT-ACCEPTED-2026-11-09.zip`
- ZIP SHA-256: `cb6802b4ca174512f44c10498c3106a3a47216db8e19c6cb446167341c1474a2`
- Canonical source tree SHA-256: `467a74fa2e4a20e867c9b8ee60f3ca9351f09f7522d83ec6b55123a8eb6d50d4`
- Manifested files: 504
- Manifested bytes: 9,156,391
- Secret scan hits: 0
- Sensitive credential/private-key filenames: 0

## Production build acceptance

- Source identity: `ACCEPTED_R8_CURRENT`
- TypeScript: exit 0
- Next.js production build: exit 0
- Next.js 16.3.0 / Turbopack compilation: successful
- Static pages: generated successfully
- Dynamic API routes: discovered successfully
- Diff integrity: exit 0

## Governance-blocked runtime acceptance

- `EQUATOR_GOVERNANCE_BLOCKED` runtime projection accepted
- TypeScript: exit 0
- Focused tests: 20/20 passed
- Diff integrity: exit 0

## Vercel Daemon deployment-contract acceptance

Validated on the current R8 source on 2026-11-09:

- `Dockerfile` SHA-256: `6224e82e9b7fd9450e291d0e5ad462efdd05dde0a5941895bc56e0c26f7f7558`
- `.dockerignore` SHA-256: `a559181e08915883898cb578bec33eccd2852c0b59a353ad54d7bb3c76033a28`
- `vercel.json` SHA-256: `2edcf8b341be23021ef41a62cde6a18f826181c19ca0664e8b221c1931a887f5`
- `tests/vercelDaemonDeployment.test.ts` SHA-256: `904d443942b318a957babdae35dee9c2fc591e96f3027de5ed07f7d9cb1fa846`
- TypeScript: exit 0
- Deployment/runtime contract tests: 5/5 passed
- Diff integrity: exit 0

This validates the deployment configuration contract. It does not itself prove that the Vercel project has production credentials configured or that the daemon has been deployed and observed running.

## Equator governance

- Frozen V1 remains `REJECTED_OR_INCOMPLETE` on the already-observed revalidation window.
- V1.1 challenger remains rejected on the same two Fold-1 forward reliability gates.
- No threshold loosening or repeated holdout tuning is authorized.
- Future promotion requires genuinely unseen prospective evidence under the preregistered protocol.

## Safety invariants

- `safeMode = ACTIVE`
- `riskGovernor = BLOCKED`
- `executionAuthority = false`
- `tradeAuthority = false`
- `brokerPayload = null`
- `realMoneyEnabled = false`
