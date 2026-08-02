import { NextResponse } from "next/server";

type Candle = {
  h: number;
  l: number;
  c: number;
  t?: number;
};

function round(value: number, digits = 4) {
  return Number(value.toFixed(digits));
}

function calculateTrueRanges(candles: Candle[]) {
  const ranges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previousClose = candles[i - 1].c;

    const highLow = current.h - current.l;
    const highPrevClose = Math.abs(current.h - previousClose);
    const lowPrevClose = Math.abs(current.l - previousClose);

    ranges.push(Math.max(highLow, highPrevClose, lowPrevClose));
  }

  return ranges;
}

function wilderAtr(trueRanges: number[], period = 14) {
  if (trueRanges.length < period) {
    throw new Error(`At least ${period} true-range values are required.`);
  }

  let atr =
    trueRanges.slice(0, period).reduce((sum, value) => sum + value, 0) / period;

  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  return atr;
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
          (candle: Candle) =>
            Number.isFinite(candle?.h) &&
            Number.isFinite(candle?.l) &&
            Number.isFinite(candle?.c)
        )
      : [];

    if (candles.length < 40) {
      return NextResponse.json(
        {
          success: false,
          error: "At least 40 candles are required for ATR.",
          candleCount: candles.length,
        },
        { status: 422 }
      );
    }

    const recentCandles = candles.slice(-200);
    const trueRanges = calculateTrueRanges(recentCandles);

    const atr14 = wilderAtr(trueRanges, 14);
    const previousAtr14 = wilderAtr(trueRanges.slice(0, -1), 14);
    const atrChange = atr14 - previousAtr14;

    const latestClose = recentCandles[recentCandles.length - 1].c;
    const atrPercent = (atr14 / latestClose) * 100;

    let volatility: "LOW" | "NORMAL" | "HIGH" | "EXTREME" = "NORMAL";

    if (atrPercent < 0.15) {
      volatility = "LOW";
    } else if (atrPercent >= 0.45) {
      volatility = "EXTREME";
    } else if (atrPercent >= 0.3) {
      volatility = "HIGH";
    }

    const direction =
      Math.abs(atrChange) < 0.01
        ? "FLAT"
        : atrChange > 0
        ? "EXPANDING"
        : "CONTRACTING";

    const stopMultipliers = {
      protect: 1.0,
      balanced: 1.5,
      aggressive: 2.0,
    };

    const recommendedStops = {
      protect: round(atr14 * stopMultipliers.protect, 2),
      balanced: round(atr14 * stopMultipliers.balanced, 2),
      aggressive: round(atr14 * stopMultipliers.aggressive, 2),
    };

    const recommendedTargets = {
      protect: round(recommendedStops.protect * 1.5, 2),
      balanced: round(recommendedStops.balanced * 2, 2),
      aggressive: round(recommendedStops.aggressive * 2.5, 2),
    };

    const reasons: string[] = [
      `ATR 14 is ${round(atr14, 2)} points.`,
      `Current volatility is classified as ${volatility}.`,
      `Volatility is ${direction.toLowerCase()}.`,
    ];

    return NextResponse.json({
      success: true,
      engine: "ATR Volatility Engine v1",
      period: 14,
      atr: round(atr14, 4),
      previousAtr: round(previousAtr14, 4),
      change: round(atrChange, 4),
      atrPercent: round(atrPercent, 4),
      volatility,
      direction,
      latestClose: round(latestClose, 2),
      recommendedStops,
      recommendedTargets,
      candleCount: candles.length,
      reasons,
      warning:
        "Analytical output only. ATR measures volatility and does not predict market direction.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown ATR engine error",
      },
      { status: 500 }
    );
  }
}
