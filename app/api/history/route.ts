import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Missing POLYGON_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const url =
      `https://api.massive.com/v2/aggs/ticker/C:XAUUSD/range/15/minute/2026-07-01/2026-08-02?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      provider: "Massive",
      candles: data.results ?? [],
      count: data.resultsCount ?? 0,
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
