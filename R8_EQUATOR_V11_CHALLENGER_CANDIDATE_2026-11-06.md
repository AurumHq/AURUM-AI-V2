# AURUM Equator V1.1 Challenger Candidate — 2026-11-06

Authorized scope:
- Frozen Equator V1 remains untouched.
- V1.1 is challenger-only and read-only.
- No threshold loosening.
- No self-promotion.
- No real-money authority.
- tradeAuthority=false and realMoneyEnabled=false.

Reason:
Fresh Frozen V1 completed infrastructure/calibration successfully but aggregate approval was REJECTED_OR_INCOMPLETE because Fold 1 failed the unchanged reliability gate in the 15m and 30m windows. Ten of twelve fold/window artifacts passed.

V1.1 challenger method:
- same fixed distance boundaries [0, 0.5, 1, 2, infinity];
- same minimum sample requirements;
- same maximum Brier score 0.25;
- same positive Brier-skill requirement;
- same minimum coverage 0.8;
- same maximum reliability gap 0.2;
- calibration-bin crossing probabilities are beta-binomial-style shrunk toward the calibration base rate;
- prior strength is selected only from a predeclared grid [0,5,10,20,40,80,160,320];
- selection uses calibration + validation only, minimizing validation maximum reliability gap then validation Brier;
- unseen forward outcomes are not used for selection;
- final approval still requires every fold/window to pass the unchanged gates.

Implementation is isolated in three new files only:
- lib/domain/equatorV11Challenger.ts
- scripts/runEquatorV11Challenger.ts
- tests/equatorV11Challenger.test.ts

No existing Frozen V1 or runtime source is changed by the candidate patch.

Patch SHA-256:
c14875643978e2ba074cd875907f04db95f0a719f47397432551ce8ec18fbc8c

New-file hashes:
- equatorV11Challenger.ts: e453a0cfe0303c10cf20366e99dce38ccb53da73946f47971799bc912918af2e
- runEquatorV11Challenger.ts: 5217a0a5fc345c080e3b257a61a2e749cf89b5c3b1f79ec655e527ba4a0da03a
- equatorV11Challenger.test.ts: 7de73de115c5c5cd41cb188b615bbbb9d9f31af088bc0b60d68e3c4b8ce4d74d

The patch passes git apply --check against the exact recovered current source state and git diff --check. TypeScript syntax transpilation diagnostics are zero for all three new files. Full semantic typecheck and Vitest execution require the Founder's intact local node_modules and are intentionally deferred to the single Mac validation gate.
