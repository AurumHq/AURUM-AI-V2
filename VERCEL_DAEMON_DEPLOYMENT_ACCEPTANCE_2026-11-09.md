# AURUM R8 Vercel Daemon Deployment Contract — Accepted 2026-11-09

Validated against the current build-accepted R8 source:

- source runtime identity matched the accepted R8 hashes
- deployment patch SHA-256: `73dd7ae92e402489ed722ca672cc153f6a20da5cbd9c2ac53a74809879fadcbb`
- patch apply: exit 0
- TypeScript: exit 0
- deployment/runtime contract tests: 5/5 passed
- diff integrity: exit 0

Deployment file hashes:

- `Dockerfile`: `6224e82e9b7fd9450e291d0e5ad462efdd05dde0a5941895bc56e0c26f7f7558`
- `.dockerignore`: `a559181e08915883898cb578bec33eccd2852c0b59a353ad54d7bb3c76033a28`
- `vercel.json`: `2edcf8b341be23021ef41a62cde6a18f826181c19ca0664e8b221c1931a887f5`
- `tests/vercelDaemonDeployment.test.ts`: `904d443942b318a957babdae35dee9c2fc591e96f3027de5ed07f7d9cb1fa846`

This is deployment-contract acceptance only. Production environment variables and a running Vercel Daemon still require explicit deployment/runtime verification.

Safety invariants remain unchanged:
- `safeMode = ACTIVE`
- `riskGovernor = BLOCKED`
- `executionAuthority = false`
- `tradeAuthority = false`
- `brokerPayload = null`
- `realMoneyEnabled = false`
