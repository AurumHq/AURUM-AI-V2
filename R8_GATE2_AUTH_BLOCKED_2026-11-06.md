# AURUM R8 Gate 2 — Authentication Blocked — 2026-11-06

A direct, read-only OANDA M1 history probe was executed on the Founder Mac.

## Result

Both repeated historical-candle queries returned:

- HTTP 401
- node exit code 3

Therefore the query never reached the historical-candle evidence question and no conclusion may be drawn about the October 30 M1 gaps.

## Source reconciliation

The recovered AURUM source uses the same configuration contract as the Gate 2 probe:

- `OANDA_API_TOKEN`
- `OANDA_ACCOUNT_ID`
- `OANDA_ENVIRONMENT`
- practice host: `api-fxpractice.oanda.com`
- live host: `api-fxtrade.oanda.com`
- Bearer-token authentication

Accordingly this result is classified as an authentication/host-state blocker, not a variable-name mismatch in the probe.

No credential values were printed or persisted in this report.

## Next evidence gate

Test the configured token/account pair against both OANDA practice and live account-summary endpoints, returning only HTTP status and sanitized provider error metadata. Do not print the token or account ID.

Real-money authority remains locked.
