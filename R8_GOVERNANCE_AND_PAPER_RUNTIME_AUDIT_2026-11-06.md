# AURUM R8 Governance Reconciliation and Paper Runtime Audit — 2026-11-06

## Equator governance conclusion

Fresh frozen Equator V1 revalidation completed successfully at the infrastructure level but returned aggregateApproval = REJECTED_OR_INCOMPLETE.

The registry contract requires:
- the frozen configuration hash;
- manifest open-market coverage = 1;
- unexpectedMissingCandles = 0;
- report aggregateApproval = APPROVED_ALL_FOLDS;
- every ordered fold to contain all four crossing windows with no failures;
- every artifact to be APPROVED and independently pass the frozen reliability/sample/coverage/Brier/skill gates.

Therefore the fresh Gate 5G report cannot be promoted into a live Equator registry.

The previously approved registry is also not an indefinite fallback. The frozen staleness policy is:
- VALID through 30 days,
- AGING from >30 through 60 days,
- STALE after >60 days.

The prior approved evidence ended in late August 2026, so by 2026-11-06 it is beyond the allowed live-inference age. The source correctly returns ARTIFACT_STALE rather than silently continuing.

No partial-fold or cherry-picked promotion is permitted by the current registry contract.

## Autonomous paper runtime source audit

The canonical autonomous controller:
- ticks every 15 seconds;
- independently advances market observation, Event Risk, Pre-Trade, and Paper Simulation;
- evaluates Pre-Trade every 60 seconds;
- continues Paper Simulation every tick even when no new candidate is produced;
- advances existing open paper positions by candidate ID;
- persists material simulation events;
- preserves safe-mode / risk-governor / execution locks.

Paper lifecycle source and tests cover:
- LONG and SHORT executable-side entries;
- deterministic TP/stop paths;
- +3R multi-target completion;
- expiry without fill;
- temporal firewall and idempotency;
- stale/closed observations;
- ambiguous intrabar fail-closed handling;
- gap stops;
- OANDA-only lifecycle authority;
- MFE/MAE/duration;
- restart reconstruction;
- repair of partial terminal persistence;
- immutable collision rejection;
- historian failure fail-closed behavior.

Historical November 5 runtime evidence independently showed:
- autonomousLoopStatus RUNNING;
- 15-second cadence;
- live OANDA quote timestamps advancing;
- historian write timestamps advancing;
- candidateEvaluationCount increasing;
- lastLifecycleTickAt advancing;
- lastCandidateState ARTIFACT_STALE;
- all real-money locks false/locked as required.

Conclusion:
The autonomous/paper lifecycle machinery is not the present gating defect. The current hard blocker for new paper candidates is Equator governance: stale prior approved evidence plus rejected fresh frozen revalidation.

No additional Mac terminal action is justified merely to rediscover this blocker.
