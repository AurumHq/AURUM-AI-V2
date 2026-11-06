# AURUM R8 Event Risk Release-Confirmation Repair Candidate — 2026-11-06

Candidate patch SHA-256:
`c83116f3826b5735f1901f6f596e64a6a4dd41ec7f0e109aa6abf9fb3186a474`

Patch scope:
- new `lib/server/officialEventRiskReleaseConfirmation.ts`
- update `lib/server/officialEventRiskService.ts`
- new `tests/officialEventRiskReleaseConfirmation.test.ts`

Recovered pre-patch service SHA-256:
`ba7d8842254e467e9d2fd681a2f9399ed5be321aa456d7878032fdbd865af925`

Candidate post-patch hashes:
- `lib/server/officialEventRiskService.ts`: `a2c1b549fd500cdb112a47181bbbcfa75881dd8ca18e1795f0fef896c4888f06`
- `lib/server/officialEventRiskReleaseConfirmation.ts`: `006431f3d9bd0357b3b528cf55ab9deb6e9ac61451f74d02a34e61cc45699c1b`
- `tests/officialEventRiskReleaseConfirmation.test.ts`: `c38eb61fa3c31d2bda2f1a748ff9fa356ea61ddd71e672e5bd8dc971c6e19019`

Design:
- scheduled time alone never confirms a release;
- only events already scheduled in the past and within a bounded 36-hour evidence window are eligible for confirmation lookup;
- BLS CPI / Employment Situation / PPI use their official current news-release pages;
- BEA GDP / Personal Income and Outlays use official current-release data pages;
- Census retail sales uses the official retail-sales release page;
- FOMC decisions and FOMC minutes use deterministic official Federal Reserve monetary-policy release URLs for the exact scheduled date;
- Fed Chair speech/testimony uses deterministic official Federal Reserve speech/testimony URLs for the exact scheduled date and Chair surname;
- evidence must match agency/class/date (and BEA/Census period) before `releaseConfirmed=true`;
- unavailable or mismatched release evidence leaves the event unconfirmed;
- confirmed evidence is bundled into the immutable retrieval raw evidence and all resulting content hashes are rebuilt;
- no trade authority is added.

The patch passes whitespace/diff integrity checks in the isolated recovery copy. Executable typecheck/test/live-source validation is still pending on the Founder Mac.

Real-money authority remains locked.
