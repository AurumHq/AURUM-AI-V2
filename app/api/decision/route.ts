import { NextResponse } from "next/server";

type Candle = { o: number; h: number; l: number; c: number; t?: number };

function ema(values: number[], period: number): number {
  const multiplier = 2 / (period + 1);
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    result = values[i] * multiplier + result * (1 - multiplier);
  }
  return result;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const base = new URL(request.url).origin;

  try {
    const [historyRes, goldRes] = await Promise.all([
      fetch(`${base}/api/history`, { cache: "no-store" }),
      fetch(`${base}/api/gold`, { cache: "no-store" }),
    ]);

    const history = await historyRes.json();
    const gold = await goldRes.json();

    if (!historyRes.ok || !goldRes.ok || !history.success || !gold.success) {
      return NextResponse.json(
        { success: false, error: "Unable to load live or historical market data." },
        { status: 502 }
      );
    }

    const candles: Candle[] = Array.isArray(history.candles)
      ? history.candles.filter(
          (c: Candle) =>
            Number.isFinite(c?.o) &&
            Number.isFinite(c?.h) &&
            Number.isFinite(c?.l) &&
            Number.isFinite(c?.c)
        )
      : [];

    if (candles.length < 220) {
      return NextResponse.json(
        {
          success: false,
          error: "At least 220 candles are required for EMA analysis.",
          candleCount: candles.length,
        },
        { status: 422 }
      );
    }

    const closes = candles.map((c) => c.c);
    const recent = candles.slice(-50);

    const ema20 = ema(closes.slice(-120), 20);
    const ema50 = ema(closes.slice(-180), 50);
    const ema200 = ema(closes, 200);

    const support = Math.min(...recent.map((c) => c.l));
    const resistance = Math.max(...recent.map((c) => c.h));

    const live = Number(gold.price);
    if (!Number.isFinite(live) || live <= 0) {
      return NextResponse.json(
        { success: false, error: "Live XAU/USD price is unavailable." },
        { status: 422 }
      );
    }

    let bullishVotes = 0;
    let bearishVotes = 0;
    const reasons: string[] = [];

    if (live > ema20) {
      bullishVotes++;
      reasons.push("Price is above EMA 20");
    } else {
      bearishVotes++;
      reasons.push("Price is below EMA 20");
    }

    if (ema20 > ema50) {
      bullishVotes++;
      reasons.push("EMA 20 is above EMA 50");
    } else {
      bearishVotes++;
      reasons.push("EMA 20 is below EMA 50");
    }

    if (ema50 > ema200) {
      bullishVotes++;
      reasons.push("EMA 50 is above EMA 200");
    } else {
      bearishVotes++;
      reasons.push("EMA 50 is below EMA 200");
    }

    if (live > ema200) {
      bullishVotes++;
      reasons.push("Price is above EMA 200");
    } else {
      bearishVotes++;
      reasons.push("Price is below EMA 200");
    }

    const totalVotes = bullishVotes + bearishVotes;
    const strongestVotes = Math.max(bullishVotes, bearishVotes);
    const rawConfidence = totalVotes
      ? Math.round((strongestVotes / totalVotes) * 100)
      : 0;

    let decision: "BUY" | "SELL" | "HOLD" = "HOLD";
    let trend: "Bullish" | "Bearish" | "Mixed" = "Mixed";

    if (bullishVotes >= 3) {
      decision = "BUY";
      trend = "Bullish";
    } else if (bearishVotes >= 3) {
      decision = "SELL";
      trend = "Bearish";
    }

    const range = Math.max(resistance - support, 0.01);
    const stopDistance = Math.max(range * 0.25, live * 0.0015);
    const targetDistance = stopDistance * 2;

    const entry = live;
    const stop =
      decision === "BUY"
        ? live - stopDistance
        : decision === "SELL"
        ? live + stopDistance
        : null;

    const target =
      decision === "BUY"
        ? live + targetDistance
        : decision === "SELL"
        ? live - targetDistance
        : null;

    const confidence =
      decision === "HOLD" ? Math.min(rawConfidence, 69) : rawConfidence;

    return NextResponse.json({
      success: true,
      engine: "EMA Trend Engine v2",
      decision,
      trend,
      confidence,
      price: round(live),
      entry: round(entry),
      stop: stop === null ? null : round(stop),
      target: target === null ? null : round(target),
      support: round(support),
      resistance: round(resistance),
      riskReward: decision === "HOLD" ? null : 2,
      indicators: {
        ema20: round(ema20),
        ema50: round(ema50),
        ema200: round(ema200),
      },
      votes: {
        bullish: bullishVotes,
        bearish: bearishVotes,
      },
      reasons,
      warning: "Analytical output only. This engine is not yet validated for live trading.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown decision-engine error",
      },
      { status: 500 }
    );
  }
}
