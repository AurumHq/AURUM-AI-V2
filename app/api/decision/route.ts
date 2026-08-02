import { NextResponse } from "next/server";

type Candle = {
  o: number;
  h: number;
  l: number;
  c: number;
};

export async function GET(request: Request) {
  const base = new URL(request.url).origin;

  try {
    const [historyRes, goldRes] = await Promise.all([
      fetch(`${base}/api/history`, { cache: "no-store" }),
      fetch(`${base}/api/gold`, { cache: "no-store" }),
    ]);

    const history = await historyRes.json();
    const gold = await goldRes.json();

    if (!history.success || !gold.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to load market data.",
        },
        { status: 500 }
      );
    }

    const candles: Candle[] = history.candles;

    if (!candles || candles.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Not enough historical data.",
        },
        { status: 500 }
      );
    }

    const recent = candles.slice(-50);

    const closes = recent.map((c) => c.c);

    const support = Math.min(...recent.map((c) => c.l));
    const resistance = Math.max(...recent.map((c) => c.h));

    const first = closes[0];
    const last = closes[closes.length - 1];

    const trend =
      last > first
        ? "Bullish"
        : last < first
        ? "Bearish"
        : "Sideways";

    const live = gold.price;

    let decision = "HOLD";
    let confidence = 60;

    if (
      trend === "Bullish" &&
      live > support &&
      live < resistance
    ) {
      decision = "BUY";
      confidence = 85;
    }

    if (
      trend === "Bearish" &&
      live < resistance &&
      live > support
    ) {
      decision = "SELL";
      confidence = 85;
    }

    const stop =
      decision === "BUY"
        ? support
        : resistance;

    const target =
      decision === "BUY"
        ? resistance
        : support;

    return NextResponse.json({
      success: true,
      decision,
      trend,
      confidence,
      price: live,
      support,
      resistance,
      entry: live,
      stop,
      target,
      reason: `${trend} trend detected from last 50 candles.`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
