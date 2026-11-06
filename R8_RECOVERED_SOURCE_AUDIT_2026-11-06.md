# AURUM R8 Recovered-Source Audit — 2026-11-06

## Scope

Static audit of the Founder-uploaded recovery package whose integrity is anchored by `RECOVERY_SOURCE_INTEGRITY_2026-11-06.md`.

This report records only findings supported by recovered source and external source-contract checks. It does **not** claim the recovered build has passed typecheck, build, tests, or live runtime verification.

## Safety state

No finding in this audit changes the execution boundary:

- `tradeAuthority=false`
- `executionAuthority=false`
- `brokerPayload=null`
- `realMoneyEnabled=false`
- Safe Mode remains active.
- Real-money execution remains locked.

## 1. Equator registry rejection is an intentional integrity gate

The recovered registry requires the accepted OANDA FAST/M1 dataset manifest to have:

- provider `OANDA`
- instrument `XAU_USD`
- granularity `M1`
- `openMarketCoverage === 1`
- `unexpectedMissingCandles === 0`
- `syntheticGapFill === false`
- an approved complete walk-forward report under the frozen configuration.

The R7 `REGISTRY_MANIFEST_NOT_ACCEPTED` result is therefore consistent with current governance; bypassing the manifest check would violate the frozen evidence contract.

### Open root-cause question

The OANDA backfill advances its cursor to the end of each requested page even when a syntactically valid response omits expected time slots. The existing test suite explicitly preserves missing historical intervals instead of synthesizing them.

This behavior is safe with respect to fabrication, but it cannot distinguish:

1. a genuine OANDA historical candle absence,
2. a transient/incomplete successful response, or
3. another retrieval/persistence defect.

The October 30 R7 gaps occur during normal Friday XAU/USD trading hours, so ordinary daily-maintenance classification does not explain those specific gaps.

**Status:** direct bounded re-query against OANDA is required before assigning root cause or changing code.

## 2. Event Risk source ingestion is official-source based

The recovered implementation uses direct official sources:

- Federal Reserve Board / FOMC
- BLS
- BEA
- Census
- Treasury FiscalData

The older FRED-based Event Risk failure description is not the current architecture.

## 3. Event release-confirmation authority is incomplete

A global source search found no post-ingestion mutation/upgrade path for `releaseConfirmed`.

Current parser behavior:

- Treasury auctions can set `releaseConfirmed=true` when official result data include a non-null high yield after the scheduled auction time.
- Fed events are emitted with `releaseConfirmed=false`.
- BLS events are emitted with `releaseConfirmed=false`.
- BEA events are emitted with `releaseConfirmed=false`.
- Census events are emitted with `releaseConfirmed=false`.

During an active post-release risk window, an unconfirmed event produces `RELEASE_CONFIRMATION_MISSING` and `EVENT_RISK_UNKNOWN`. After the configured event window expires, the event is no longer active, but the `completedStabilization` / fresh-post-release-evaluation signal also cannot be earned without a confirmed release.

This is fail-closed during the active window, but the release-confirmation authority is not complete for four of the five agencies.

**Status:** incomplete; do not replace confirmation with a clock-only assumption.

## 4. Paper simulation is not vetoed by the real-money locks

The recovered paper-candidate identity deliberately requires:

- `candidate.tradeAuthority === false`
- `candidate.executionAuthority === false`
- `candidate.brokerPayload === null`

The paper lifecycle validates and advances those locked candidates. Therefore the real-money execution barrier is not, by itself, a paper-order veto in this source.

**Status:** earlier architectural concern resolved by source inspection.

## 5. Paper candidate → lifecycle → accounting → journal path is wired

Recovered source shows:

- autonomous runtime evaluates Pre-Trade on cadence;
- paper simulation advances on every autonomous tick;
- a latest paper candidate is passed to the lifecycle runtime;
- existing open positions continue to advance even when there is no new candidate;
- lifecycle observations use canonical OANDA data;
- entry/stop/target transitions generate simulation-only fills;
- paper simulation reconciles fills/positions/realized P&L;
- the workstation projection derives the visible journal from closed server-side paper positions.

This proves the code path is connected in source.

It does **not** prove a current end-to-end runtime trade succeeded after recovery.

**Status:** implemented/wired; live acceptance still required.

## 6. Executable verification is not yet proven

The isolated recovery environment does not currently have a complete dependency graph. TypeScript cannot perform meaningful verification because required packages/types are missing, and bounded dependency installation attempts timed out.

Therefore this audit does not claim:

- typecheck passed,
- Vitest passed,
- Next production build passed,
- official-source validator passed,
- local runtime passed.

Those are explicit remaining proof gates.

## Next evidence gates

1. Run complete typecheck and focused Equator/Event Risk/paper-runtime tests in the Founder Mac environment where the project dependency graph already belongs.
2. Run the official Event Risk source validator against current official endpoints.
3. Perform a bounded, read-only OANDA historical re-query around selected R7 missing M1 timestamps; print timestamps/counts only, never credentials.
4. Based on that direct evidence, classify the Equator gap root cause before changing backfill or registry logic.
5. Only then make source repairs and re-run the frozen Equator V1 acceptance.
6. Run a complete autonomous paper lifecycle acceptance and restart reconstruction.
