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
  condition?: "OVERSOLD" | "OVERBOUGHT" | "NEUTRAL";
  momentum?: "BULLISH" | "BEARISH" | "FLAT";
  signal?: "BUY_BIAS" | "SELL_BIAS" | "HOLD";
  strength?: number;
  error?: string;
};

type MacdResponse = {
  success: boolean;
  macd?: number;
  signalLine?: number;
  histogram?: number;
  histogramChange?: number;
  signal?: "BULLISH" | "BEARISH" | "NEUTRAL";
  momentum?: "STRENGTHENING" | "WEAKENING" | "FLAT";
  crossover?: "BULLISH_CROSS" | "BEARISH_CROSS" | "NONE";
  strength?: number;
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
    const [historyRes, goldRes, rsiRes, macdRes] = await Promise.all([
      fetch(`${base}/api/history`, { cache: "no-store" }),
      fetch(`${base}/api/gold`, { cache: "no-store" }),
      fetch(`${base}/api/rsi`, { cache: "no-store" }),
      fetch(`${base}/api/macd`, { cache: "no-store" }),
    ]);

    const history = await historyRes.json();
    const gold = await goldRes.json();
    const rsi: RsiResponse = await rsiRes.json();
    const macd: MacdResponse = await macdRes.json();

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

    if (!macdRes.ok || !macd.success) {
      return NextResponse.json(
        { success: false, error: macd.error || "MACD engine unavailable." },
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

    const breakdown = {
      ema: { bullish: 0, bearish: 0, max: 35 },
      rsi: { bullish: 0, bearish: 0, max: 20 },
      macd: { bullish: 0, bearish: 0, max: 20 },
      location: { bullish: 0, bearish: 0, max: 10 },
      structure: { bullish: 0, bearish: 0, max: 15 },
    };

    // EMA: 35 points
    if (live > ema20) {
      bullishScore += 10;
      breakdown.ema.bullish += 10;
      reasons.push("Price is above EMA 20.");
    } else {
      bearishScore += 10;
      breakdown.ema.bearish += 10;
      reasons.push("Price is below EMA 20.");
    }

    if (ema20 > ema50) {
      bullishScore += 10;
      breakdown.ema.bullish += 10;
      reasons.push("EMA 20 is above EMA 50.");
    } else {
      bearishScore += 10;
      breakdown.ema.bearish += 10;
      reasons.push("EMA 20 is below EMA 50.");
    }

    if (ema50 > ema200) {
      bullishScore += 10;
      breakdown.ema.bullish += 10;
      reasons.push("EMA 50 is above EMA 200.");
    } else {
      bearishScore += 10;
      breakdown.ema.bearish += 10;
      reasons.push("EMA 50 is below EMA 200.");
    }

    if (live > ema200) {
      bullishScore += 5;
      breakdown.ema.bullish += 5;
      reasons.push("Price is above EMA 200.");
    } else {
      bearishScore += 5;
      breakdown.ema.bearish += 5;
      reasons.push("Price is below EMA 200.");
    }

    // RSI: 20 points
    const rsiValue = rsi.rsi ?? 50;

    if (rsi.signal === "BUY_BIAS") {
      bullishScore += 20;
      breakdown.rsi.bullish += 20;
      reasons.push("RSI confirms a bullish reversal bias.");
    } else if (rsi.signal === "SELL_BIAS") {
      bearishScore += 20;
      breakdown.rsi.bearish += 20;
      reasons.push("RSI confirms a bearish reversal bias.");
    } else if (rsiValue >= 55) {
      bullishScore += 12;
      breakdown.rsi.bullish += 12;
      reasons.push("RSI is above neutral and supports bullish momentum.");
    } else if (rsiValue <= 45) {
      bearishScore += 12;
      breakdown.rsi.bearish += 12;
      reasons.push("RSI is below neutral and supports bearish momentum.");
    } else {
      bullishScore += 4;
      bearishScore += 4;
      breakdown.rsi.bullish += 4;
      breakdown.rsi.bearish += 4;
      reasons.push("RSI is neutral.");
    }

    // MACD: 20 points
    if (macd.signal === "BULLISH") {
      let points = 12;
      if (macd.momentum === "STRENGTHENING") points += 4;
      if (macd.crossover === "BULLISH_CROSS") points += 4;

      bullishScore += points;
      breakdown.macd.bullish += points;
      reasons.push(
        `MACD is bullish${
          macd.momentum === "STRENGTHENING" ? " with strengthening momentum" : ""
        }.`
      );
    } else if (macd.signal === "BEARISH") {
      let points = 12;
      if (macd.momentum === "STRENGTHENING") points += 4;
      if (macd.crossover === "BEARISH_CROSS") points += 4;

      bearishScore += points;
      breakdown.macd.bearish += points;
      reasons.push(
        `MACD is bearish${
          macd.momentum === "STRENGTHENING" ? " with strengthening momentum" : ""
        }.`
      );
    } else {
      bullishScore += 3;
      bearishScore += 3;
      breakdown.macd.bullish += 3;
      breakdown.macd.bearish += 3;
      reasons.push("MACD is neutral.");
    }

    // Price location: 10 points
    const positionInRange = (live - support) / range;

    if (positionInRange <= 0.35) {
      bullishScore += 10;
      breakdown.location.bullish += 10;
      reasons.push("Price is in the lower portion of the recent range.");
    } else if (positionInRange >= 0.65) {
      bearishScore += 10;
      breakdown.location.bearish += 10;
      reasons.push("Price is in the upper portion of the recent range.");
    } else {
      bullishScore += 3;
      bearishScore += 3;
      breakdown.location.bullish += 3;
      breakdown.location.bearish += 3;
      reasons.push("Price is near the middle of the recent range.");
    }

    // Structure: 15 points
    const firstHalf = recent.slice(0, 25);
    const secondHalf = recent.slice(25);

    const firstHigh = Math.max(...firstHalf.map((c) => c.h));
    const secondHigh = Math.max(...secondHalf.map((c) => c.h));
    const firstLow = Math.min(...firstHalf.map((c) => c.l));
    const secondLow = Math.min(...secondHalf.map((c) => c.l));

    let structure: "BULLISH" | "BEARISH" | "MIXED" = "MIXED";

    if (secondHigh > firstHigh && secondLow > firstLow) {
      structure = "BULLISH";
      bullishScore += 15;
      breakdown.structure.bullish += 15;
      reasons.push("Recent structure shows higher highs and higher lows.");
    } else if (secondHigh < firstHigh && secondLow < firstLow) {
      structure = "BEARISH";
      bearishScore += 15;
      breakdown.structure.bearish += 15;
      reasons.push("Recent structure shows lower highs and lower lows.");
    } else {
      bullishScore += 4;
      bearishScore += 4;
      breakdown.structure.bullish += 4;
      breakdown.structure.bearish += 4;
      reasons.push("Recent market structure is mixed.");
    }

    const dominantScore = Math.max(bullishScore, bearishScore);
    const weakerScore = Math.min(bullishScore, bearishScore);
    const difference = Math.abs(bullishScore - bearishScore);

    let decision: "BUY" | "SELL" | "HOLD" = "HOLD";
    let trend: "Bullish" | "Bearish" | "Mixed" = "Mixed";

    if (bullishScore >= 65 && difference >= 18) {
      decision = "BUY";
      trend = "Bullish";
    } else if (bearishScore >= 65 && difference >= 18) {
      decision = "SELL";
      trend = "Bearish";
    }

    const confidence =
      decision === "HOLD"
        ? Math.min(69, difference)
        : Math.min(
            99,
            Math.max(
              70,
              Math.round((dominantScore / Math.max(1, dominantScore + weakerScore)) * 100)
            )
          );

    const grade =
      decision === "HOLD"
        ? "SKIP"
        : confidence >= 92
        ? "A+"
        : confidence >= 85
        ? "A"
        : confidence >= 78
        ? "B"
        : "C";

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
      engine: "AURUM Decision Engine v4",
      decision,
      trend,
      confidence,
      grade,
      structure,
      scores: {
        bullish: bullishScore,
        bearish: bearishScore,
        difference,
        breakdown,
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
        rsi14: round(rsiValue),
        rsiCondition: rsi.condition,
        rsiMomentum: rsi.momentum,
        rsiSignal: rsi.signal,
        macd: round(macd.macd ?? 0, 4),
        macdSignalLine: round(macd.signalLine ?? 0, 4),
        macdHistogram: round(macd.histogram ?? 0, 4),
        macdSignal: macd.signal,
        macdMomentum: macd.momentum,
        macdCrossover: macd.crossover,
        macdStrength: macd.strength,
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
            : "Unknown AURUM decision-engine error",
      },
      { status: 500 }
    );
  }
}
