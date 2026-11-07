# AURUM R8 Gate 5G Corrected — Frozen Equator Revalidation Complete — 2026-11-06

Gate 5G corrected completed successfully at the infrastructure/calibration level:

- TypeScript: 0
- focused walk-forward tests: 14/14 passed
- diff check: 0
- calibration exit: 0
- phase: COMPLETE
- manifest coverage: 1
- unexpectedMissingCandles: 0
- dataset rows: 59,316
- dataset hash: d533d11553ee71c6bcb6a895f149d303e32fafb45cd11a28a5d954b4334947c7
- report persisted successfully using compact artifact-reference storage
- report ID: equator_walk_forward_8e678dfa28ae8d64b10df4652c035efdcc309b9b10d5d327ede19a25ffb99dc6
- logical report bytes: 47,867,731
- lineage hashes: 59,492
- folds: 3
- tradeAuthority: false

Frozen Equator V1 aggregate validation result:
REJECTED_OR_INCOMPLETE

10 of 12 fold/window artifacts passed all mandatory gates.

Only two artifacts failed, both on reliability:
- Fold 1 / 15-minute: reliabilityGap 0.217172
- Fold 1 / 30-minute: reliabilityGap 0.249711

All fold 2 and fold 3 windows passed. Fold 1 5-minute and 60-minute also passed.

No model threshold, gate, or calibration rule was loosened. The result is a genuine frozen-model validation rejection, not an infrastructure failure.

Real-money authority remains locked.
