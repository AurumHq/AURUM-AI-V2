import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    const response = await fetch(
      `https://api.massive.com/v1/last_quote/currencies/XAU/USD?apiKey=${apiKey}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.last) {
      return NextResponse.json(
        {
          success: false,
          provider: "Massive",
          error: data.message ?? "No XAU/USD quote was returned",
          data,
        },
        { status: response.status || 502 }
      );
    }

    const bid =
      typeof data.last.bid === "number" ? data.last.bid : null;

    const ask =
      typeof data.last.ask === "number" ? data.last.ask : null;

    const price =
      bid !== null && ask !== null
        ? Number(((bid + ask) / 2).toFixed(3))
        : bid ?? ask;

    return NextResponse.json({
      success: true,
      provider: "Massive",
      symbol: "C:XAUUSD",
      price,
      bid,
      ask,
      spread:
        bid !== null && ask !== null
          ? Number((ask - bid).toFixed(3))
          : null,
      timestamp: data.last.timestamp ?? null,
      marketOpen: false,
      note: "Most recently available XAU/USD quote",
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
