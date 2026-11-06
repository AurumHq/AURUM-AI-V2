# AURUM R8 Post-Release Fresh-Decision Audit — 2026-11-06

## Question

Does the recovered source enforce the Event Risk contract that a stale pre-event entry decision may not be reused after a confirmed release/stabilization window?

## Finding

No additional source patch is required for paper-entry candidates.

The Event Risk status exposes:
- `stalePreEventDecisionsInvalidated`
- `freshPreTradeEvaluationRequired`

Those flags are not directly consumed by another module. However, the candidate lifecycle already enforces the same safety property structurally:

1. Every `PaperTradeCandidate` has a deterministic expiry exactly 5 minutes after its decision timestamp.
2. Event Risk prevents creation of a paper candidate whenever event risk is anything other than `EVENT_RISK_VALIDATED_SAFE`.
3. Official event windows begin before the scheduled release and extend after it; every configured pre/post window is longer than the 5-minute candidate lifetime.
4. The paper lifecycle expires unfilled candidates at `candidate.expiresAt`.
5. Historian restart reconstruction also reconciles expired candidates.

Therefore a pre-event entry candidate cannot remain valid until the post-release stabilization period has completed. A new post-release paper entry necessarily comes from a new Pre-Trade evaluation.

Existing filled paper positions are a different object and continue to be supervised; this audit does not classify an already-filled paper position as a stale entry candidate.

## Result

Post-release fresh-entry safety is structurally enforced. Adding a second redundant invalidation mechanism would not improve the proven safety property and is not recommended.

Real-money authority remains locked.
