import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing POLYGON_API_KEY",
      },
      { status: 500 }
    );
  }

  try {
    const ticker = encodeURIComponent("C:XAUUSD");

    const response = await fetch(
      `https://api.massive.com/v2/snapshot/locale/global/markets/forex/tickers/${ticker}?apiKey=${apiKey}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "OK" || !data.ticker) {
      return NextResponse.json(
        {
          success: false,
          provider: "Massive",
          error: data.message ?? "Gold ticker unavailable",
          data,
        },
        { status: response.status || 502 }
      );
    }

    const bid = data.ticker.lastQuote?.b ?? null;
    const ask = data.ticker.lastQuote?.a ?? null;
    const midpoint =
      typeof bid === "number" && typeof ask === "number"
        ? (bid + ask) / 2
        : data.ticker.min?.c ?? data.ticker.day?.c ?? null;

    return NextResponse.json({
      success: true,
      provider: "Massive",
      symbol: data.ticker.ticker,
      price: midpoint,
      bid,
      ask,
      day: data.ticker.day ?? null,
      previousDay: data.ticker.prevDay ?? null,
      change: data.ticker.todaysChange ?? null,
      changePercent: data.ticker.todaysChangePerc ?? null,
      updated: data.ticker.updated ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to reach Massive API",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
