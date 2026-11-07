# AURUM Equator Prospective Evidence Protocol — preregistered 2026-11-07

This protocol is fixed before the future observation window begins.

## Observation period

Primary prospective window:
- Start: `2026-11-08T23:05:00.000Z` — Sunday 18:05 America/New_York
- End: `2026-11-27T21:59:00.000Z` — Friday 16:59 America/New_York

Interim checkpoints:
- Week 1: informational only; no tuning or promotion.
- Week 2: informational only; no tuning or promotion.
- Final 3-week checkpoint: eligible for governance review under the unchanged mandatory gates.

## Data authority

- Native OANDA XAU/USD M1 only.
- No synthetic candles.
- No fabricated open-market slots.
- Manifest must show open-market coverage = 1.
- Manifest must show unexpectedMissingCandles = 0 before scoring.

## Unchanged mandatory gates

- Minimum outcomes per crossing window: 100.
- Minimum samples per reliability bin: 20.
- Maximum Brier score: 0.25.
- Brier skill versus reference must be strictly positive.
- Minimum coverage: 0.8.
- Maximum reliability gap: 0.20.
- Crossing windows: 5, 15, 30, 60 minutes.
- Walk-forward / temporal splits only; no random splits.
- Challenger selection may not access unseen forward outcomes.

## Anti-overfitting rule

The already-observed 2026-09-06 through 2026-11-05 holdout may not be repeatedly optimized against until it turns green. V1.1's failure remains a failure.

If a future challenger is developed from earlier evidence, it must still face genuinely unseen future evidence under this protocol before promotion.

## Safety

- safeMode = ACTIVE
- riskGovernor = BLOCKED
- executionAuthority = false
- tradeAuthority = false
- brokerPayload = null
- realMoneyEnabled = false
