# AURUM R8 Gate 3 — Equator Repair Validation — 2026-11-06

Founder-Mac validation of the first Equator backfill repair candidate.

## Integrity

The patch and pre-patch source hashes matched the expected recovery hashes.

Patch apply exit: 0.

Post-patch hashes:
- `lib/server/oandaGoldBackfill.ts`: `1c17d914b79441f0cce95c88fa2f29fa0f25299d2bd2a39354ea08ef28927b42`
- `tests/oandaGoldBackfill.test.ts`: `3940124ecc9025b5364ccb7df88f74b38aa379502a138cb8b545b89e21ae29c9`

TypeScript exit: 0.
Diff integrity exit: 0.

## Focused Equator/OANDA tests

29 tests ran:
- 26 passed
- 3 failed

The failures were confined to `tests/oandaGoldBackfill.test.ts`:
1. persistent-gap test reused the same `Response` object across logical retries, causing the response body to be exhausted and the transport wrapper to report no response;
2. idempotency fixture supplied a deliberately incomplete expected-open M1 page that is now correctly rejected by the stricter rule;
3. partial-historian-resume fixture likewise depended on an empty expected-open second page that is now correctly rejected.

No evidence from Gate 3 requires weakening the production rule that expected-open M1 gaps must not be silently checkpointed past.

## Corrective test-fixture patch

A follow-up test-only patch was created.

Patch SHA-256:
`a061bb6c7a0d67b7df43615a34915df5f71f7f2a98e7bc629b3eaff3085bbbb7`

Expected pre-patch test hash:
`3940124ecc9025b5364ccb7df88f74b38aa379502a138cb8b545b89e21ae29c9`

Expected post-patch test hash:
`cf45a85c87e9a1aa7455f00e3c42e051258c2a96756fe643307794e4238cd6b6`

The follow-up patch passed `git apply --check` against the exact Gate 3 test file.

Real-money authority remains locked.
