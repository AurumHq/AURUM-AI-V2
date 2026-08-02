import { NextResponse } from "next/server";

type Candle = {
  c: number;
  t?: number;
};

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function calculateRsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) {
    throw new Error(`At least ${period + 1} closes are required.`);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];

    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;
  }

  if (averageLoss === 0) {
    return 100;
  }

  if (averageGain === 0) {
    return 0;
  }

  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const base = new URL(request.url).origin;

  try {
    const historyResponse = await fetch(`${base}/api/history`, {
      cache: "no-store",
    });

    const history = await historyResponse.json();

    if (!historyResponse.ok || !history.success) {
      return NextResponse.json(
        {
          success: false,
          error: history.error || "Unable to load historical candles.",
        },
        { status: 502 }
      );
    }

    const candles: Candle[] = Array.isArray(history.candles)
      ? history.candles.filter(
          (candle: Candle) => Number.isFinite(candle?.c)
        )
      : [];

    if (candles.length < 30) {
      return NextResponse.json(
        {
          success: false,
          error: "Not enough historical candles to calculate RSI.",
          candleCount: candles.length,
        },
        { status: 422 }
      );
    }

    const closes = candles.map((candle) => candle.c);

    const rsi14 = calculateRsi(closes.slice(-100), 14);
    const previousRsi = calculateRsi(closes.slice(-101, -1), 14);
    const change = rsi14 - previousRsi;

    let condition: "OVERSOLD" | "OVERBOUGHT" | "NEUTRAL" = "NEUTRAL";

    if (rsi14 <= 30) {
      condition = "OVERSOLD";
    } else if (rsi14 >= 70) {
      condition = "OVERBOUGHT";
    }

    let momentum: "BULLISH" | "BEARISH" | "FLAT" = "FLAT";

    if (change >= 1) {
      momentum = "BULLISH";
    } else if (change <= -1) {
      momentum = "BEARISH";
    }

    let signal: "BUY_BIAS" | "SELL_BIAS" | "HOLD" = "HOLD";
    const reasons: string[] = [];

    if (condition === "OVERSOLD" && momentum === "BULLISH") {
      signal = "BUY_BIAS";
      reasons.push("RSI is oversold and beginning to rise.");
    } else if (condition === "OVERBOUGHT" && momentum === "BEARISH") {
      signal = "SELL_BIAS";
      reasons.push("RSI is overbought and beginning to fall.");
    } else if (condition === "OVERSOLD") {
      reasons.push("RSI is oversold, but upward momentum is not confirmed.");
    } else if (condition === "OVERBOUGHT") {
      reasons.push("RSI is overbought, but downward momentum is not confirmed.");
    } else {
      reasons.push("RSI is in the neutral range.");
    }

    const distanceFromNeutral = Math.abs(rsi14 - 50);
    const strength = Math.min(
      100,
      Math.round(distanceFromNeutral * 2 + Math.min(Math.abs(change) * 5, 20))
    );

    return NextResponse.json({
      success: true,
      engine: "RSI Momentum Engine v1",
      period: 14,
      rsi: round(rsi14),
      previousRsi: round(previousRsi),
      change: round(change),
      condition,
      momentum,
      signal,
      strength,
      candleCount: candles.length,
      latestClose: round(closes[closes.length - 1]),
      reasons,
      warning:
        "Analytical output only. RSI is one confirmation module and must not be used alone for live trading.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown RSI engine error",
      },
      { status: 500 }
    );
  }
}
