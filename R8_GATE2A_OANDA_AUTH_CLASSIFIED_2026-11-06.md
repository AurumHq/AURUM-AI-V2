# AURUM R8 Gate 2A — OANDA Authentication Classified — 2026-11-06

Founder-Mac read-only authentication diagnostic.

## Configuration

- OANDA token present: yes
- OANDA account ID present: yes
- configured environment: `practice`

## Results

### Practice host

`api-fxpractice.oanda.com`

- HTTP 200
- authenticated account summary returned
- currency: USD
- account state fields present

### Live host

`api-fxtrade.oanda.com`

- HTTP 401
- provider message: `Insufficient authorization to perform request.`

## Classification

The configured AURUM practice credential is valid for the practice account endpoint.

Therefore the prior Gate 2 HTTP 401 on the historical instrument-candles request cannot be attributed to:
- missing token,
- missing account ID,
- expired/invalid practice credential,
- or an environment variable pointing AURUM at live.

The next diagnostic must isolate the instrument/candles path itself using the authenticated practice host.

No credential values are recorded.

Real-money authority remains locked.
