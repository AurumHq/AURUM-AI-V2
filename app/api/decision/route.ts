import { NextResponse } from "next/server";

type Candle = {
  o: number;
  h: number;
  l: number;
  c: number;
  t?: number;
};

type RsiResponse = {
  success: boolean;
  rsi?: number;
  previousRsi?: number;
  change?: number;
  condition?: "OVERSOLD" | "OVERBOUGHT" | "NEUTRAL";
  momentum?: "BULLISH" | "BEARISH" | "FLAT";
  signal?: "BUY_BIAS" | "SELL_BIAS" | "HOLD";
  strength?: number;
  reasons?: string[];
  error?: string;
};

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
    const [historyRes, goldRes, rsiRes] = await Promise.all([
      fetch(`${base}/api/history`, { cache: "no-store" }),
      fetch(`${base}/api/gold`, { cache: "no-store" }),
      fetch(`${base}/api/rsi`, { cache: "no-store" }),
    ]);

    const history = await historyRes.json();
    const gold = await goldRes.json();
    const rsi: RsiResponse = await rsiRes.json();

    if (!historyRes.ok || !history.success) {
      return NextResponse.json(
        { success: false, error: history.error || "Historical data unavailable." },
        { status: 502 }
      );
    }

    if (!goldRes.ok || !gold.success) {
      return NextResponse.json(
        { success: false, error: gold.error || "Live gold quote unavailable." },
        { status: 502 }
      );
    }

    if (!rsiRes.ok || !rsi.success) {
      return NextResponse.json(
        { success: false, error: rsi.error || "RSI engine unavailable." },
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
          error: "At least 220 candles are required.",
          candleCount: candles.length,
        },
        { status: 422 }
      );
    }

    const live = Number(gold.price);

    if (!Number.isFinite(live) || live <= 0) {
      return NextResponse.json(
        { success: false, error: "Live XAU/USD price is invalid." },
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
    const range = Math.max(resistance - support, 0.01);

    let bullishScore = 0;
    let bearishScore = 0;

    const reasons: string[] = [];
    const scoreBreakdown = {
      ema: { bullish: 0, bearish: 0 },
      rsi: { bullish: 0, bearish: 0 },
      location: { bullish: 0, bearish: 0 },
      structure: { bullish: 0, bearish: 0 },
    };

    // EMA block: 40 points total
    if (live > ema20) {
      bullishScore += 10;
      scoreBreakdown.ema.bullish += 10;
      reasons.push("Price is above EMA 20.");
    } else {
      bearishScore += 10;
      scoreBreakdown.ema.bearish += 10;
      reasons.push("Price is below EMA 20.");
    }

    if (ema20 > ema50) {
      bullishScore += 10;
      scoreBreakdown.ema.bullish += 10;
      reasons.push("EMA 20 is above EMA 50.");
    } else {
      bearishScore += 10;
      scoreBreakdown.ema.bearish += 10;
      reasons.push("EMA 20 is below EMA 50.");
    }

    if (ema50 > ema200) {
      bullishScore += 10;
      scoreBreakdown.ema.bullish += 10;
      reasons.push("EMA 50 is above EMA 200.");
    } else {
      bearishScore += 10;
      scoreBreakdown.ema.bearish += 10;
      reasons.push("EMA 50 is below EMA 200.");
    }

    if (live > ema200) {
      bullishScore += 10;
      scoreBreakdown.ema.bullish += 10;
      reasons.push("Price is above EMA 200.");
    } else {
      bearishScore += 10;
      scoreBreakdown.ema.bearish += 10;
      reasons.push("Price is below EMA 200.");
    }

    // RSI block: 30 points total
    if (rsi.signal === "BUY_BIAS") {
      bullishScore += 30;
      scoreBreakdown.rsi.bullish += 30;
      reasons.push("RSI confirms a bullish reversal bias.");
    } else if (rsi.signal === "SELL_BIAS") {
      bearishScore += 30;
      scoreBreakdown.rsi.bearish += 30;
      reasons.push("RSI confirms a bearish reversal bias.");
    } else {
      const rsiValue = rsi.rsi ?? 50;

      if (rsiValue > 55) {
        bullishScore += 15;
        scoreBreakdown.rsi.bullish += 15;
        reasons.push("RSI is above neutral and supports bullish momentum.");
      } else if (rsiValue < 45) {
        bearishScore += 15;
        scoreBreakdown.rsi.bearish += 15;
        reasons.push("RSI is below neutral and supports bearish momentum.");
      } else {
        bullishScore += 5;
        bearishScore += 5;
        scoreBreakdown.rsi.bullish += 5;
        scoreBreakdown.rsi.bearish += 5;
        reasons.push("RSI is neutral.");
      }
    }

    // Price-location block: 15 points total
    const positionInRange = (live - support) / range;

    if (positionInRange <= 0.35) {
      bullishScore += 15;
      scoreBreakdown.location.bullish += 15;
      reasons.push("Price is in the lower portion of the recent range.");
    } else if (positionInRange >= 0.65) {
      bearishScore += 15;
      scoreBreakdown.location.bearish += 15;
      reasons.push("Price is in the upper portion of the recent range.");
    } else {
      bullishScore += 5;
      bearishScore += 5;
      scoreBreakdown.location.bullish += 5;
      scoreBreakdown.location.bearish += 5;
      reasons.push("Price is near the middle of the recent range.");
    }

    // Simple structure block: 15 points total
    const firstHalf = recent.slice(0, 25);
    const secondHalf = recent.slice(25);

    const firstHigh = Math.max(...firstHalf.map((c) => c.h));
    const secondHigh = Math.max(...secondHalf.map((c) => c.h));
    const firstLow = Math.min(...firstHalf.map((c) => c.l));
    const secondLow = Math.min(...secondHalf.map((c) => c.l));

    if (secondHigh > firstHigh && secondLow > firstLow) {
      bullishScore += 15;
      scoreBreakdown.structure.bullish += 15;
      reasons.push("Recent structure shows higher highs and higher lows.");
    } else if (secondHigh < firstHigh && secondLow < firstLow) {
      bearishScore += 15;
      scoreBreakdown.structure.bearish += 15;
      reasons.push("Recent structure shows lower highs and lower lows.");
    } else {
      bullishScore += 5;
      bearishScore += 5;
      scoreBreakdown.structure.bullish += 5;
      scoreBreakdown.structure.bearish += 5;
      reasons.push("Recent market structure is mixed.");
    }

    const totalDirectionalScore = bullishScore + bearishScore;
    const scoreDifference = Math.abs(bullishScore - bearishScore);

    let decision: "BUY" | "SELL" | "HOLD" = "HOLD";
    let trend: "Bullish" | "Bearish" | "Mixed" = "Mixed";

    if (bullishScore >= 60 && bullishScore - bearishScore >= 20) {
      decision = "BUY";
      trend = "Bullish";
    } else if (bearishScore >= 60 && bearishScore - bullishScore >= 20) {
      decision = "SELL";
      trend = "Bearish";
    }

    const confidence =
      decision === "HOLD"
        ? Math.min(69, Math.round((scoreDifference / 100) * 100))
        : Math.min(
            99,
            Math.max(
              70,
              Math.round(
                (Math.max(bullishScore, bearishScore) / totalDirectionalScore) *
                  100
              )
            )
          );

    const stopDistance = Math.max(range * 0.25, live * 0.0015);
    const targetDistance = stopDistance * 2;

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

    return NextResponse.json({
      success: true,
      engine: "AURUM Unified Decision Engine v3",
      decision,
      trend,
      confidence,
      scores: {
        bullish: bullishScore,
        bearish: bearishScore,
        difference: scoreDifference,
        breakdown: scoreBreakdown,
      },
      price: round(live),
      entry: round(live),
      stop: stop === null ? null : round(stop),
      target: target === null ? null : round(target),
      support: round(support),
      resistance: round(resistance),
      riskReward: decision === "HOLD" ? null : 2,
      indicators: {
        ema20: round(ema20),
        ema50: round(ema50),
        ema200: round(ema200),
        rsi14: round(rsi.rsi ?? 50),
        rsiCondition: rsi.condition,
        rsiMomentum: rsi.momentum,
        rsiSignal: rsi.signal,
        rsiStrength: rsi.strength,
      },
      reasons,
      warning:
        "Analytical output only. This engine has not been backtested or validated for live trading.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown unified decision-engine error",
      },
      { status: 500 }
    );
  }
}
