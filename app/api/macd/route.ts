import { NextResponse } from "next/server";

type Candle = {
  c: number;
  t?: number;
};

function round(value: number, digits = 4) {
  return Number(value.toFixed(digits));
}

function emaSeries(values: number[], period: number): number[] {
  if (values.length < period) {
    throw new Error(`At least ${period} values are required.`);
  }

  const multiplier = 2 / (period + 1);
  const result: number[] = [];

  let seed = 0;
  for (let i = 0; i < period; i++) seed += values[i];
  let current = seed / period;

  for (let i = 0; i < period - 1; i++) result.push(Number.NaN);
  result.push(current);

  for (let i = period; i < values.length; i++) {
    current = values[i] * multiplier + current * (1 - multiplier);
    result.push(current);
  }

  return result;
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
      ? history.candles.filter((candle: Candle) =>
          Number.isFinite(candle?.c)
        )
      : [];

    if (candles.length < 60) {
      return NextResponse.json(
        {
          success: false,
          error: "At least 60 candles are required for MACD.",
          candleCount: candles.length,
        },
        { status: 422 }
      );
    }

    const closes = candles.map((candle) => candle.c).slice(-300);

    const ema12 = emaSeries(closes, 12);
    const ema26 = emaSeries(closes, 26);

    const macdLine = closes.map((_, index) => {
      const fast = ema12[index];
      const slow = ema26[index];
      return Number.isFinite(fast) && Number.isFinite(slow)
        ? fast - slow
        : Number.NaN;
    });

    const validMacd = macdLine.filter(Number.isFinite);

    if (validMacd.length < 12) {
      return NextResponse.json(
        {
          success: false,
          error: "Not enough MACD values to calculate the signal line.",
        },
        { status: 422 }
      );
    }

    const signalSeries = emaSeries(validMacd, 9);
    const currentMacd = validMacd[validMacd.length - 1];
    const previousMacd = validMacd[validMacd.length - 2];
    const currentSignal = signalSeries[signalSeries.length - 1];
    const previousSignal = signalSeries[signalSeries.length - 2];

    const histogram = currentMacd - currentSignal;
    const previousHistogram = previousMacd - previousSignal;
    const histogramChange = histogram - previousHistogram;

    let signal: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
    let momentum: "STRENGTHENING" | "WEAKENING" | "FLAT" = "FLAT";
    const reasons: string[] = [];

    if (currentMacd > currentSignal) {
      signal = "BULLISH";
      reasons.push("MACD is above the signal line.");
    } else if (currentMacd < currentSignal) {
      signal = "BEARISH";
      reasons.push("MACD is below the signal line.");
    }

    if (Math.abs(histogramChange) < 0.01) {
      momentum = "FLAT";
      reasons.push("Histogram momentum is nearly unchanged.");
    } else if (
      (histogram > 0 && histogramChange > 0) ||
      (histogram < 0 && histogramChange < 0)
    ) {
      momentum = "STRENGTHENING";
      reasons.push("Histogram momentum is strengthening.");
    } else {
      momentum = "WEAKENING";
      reasons.push("Histogram momentum is weakening.");
    }

    const crossover =
      previousMacd <= previousSignal && currentMacd > currentSignal
        ? "BULLISH_CROSS"
        : previousMacd >= previousSignal && currentMacd < currentSignal
        ? "BEARISH_CROSS"
        : "NONE";

    if (crossover === "BULLISH_CROSS") {
      reasons.push("A bullish MACD crossover just occurred.");
    } else if (crossover === "BEARISH_CROSS") {
      reasons.push("A bearish MACD crossover just occurred.");
    }

    const strength = Math.min(
      100,
      Math.round(Math.abs(histogram) * 20 + Math.abs(histogramChange) * 40)
    );

    return NextResponse.json({
      success: true,
      engine: "MACD Momentum Engine v1",
      settings: {
        fast: 12,
        slow: 26,
        signal: 9,
      },
      macd: round(currentMacd),
      signalLine: round(currentSignal),
      histogram: round(histogram),
      histogramChange: round(histogramChange),
      signal,
      momentum,
      crossover,
      strength,
      latestClose: round(closes[closes.length - 1], 2),
      candleCount: candles.length,
      reasons,
      warning:
        "Analytical output only. MACD is a confirmation module and must not be used alone for live trading.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown MACD engine error",
      },
      { status: 500 }
    );
  }
}
