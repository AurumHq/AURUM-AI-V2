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
    const response = await fetch(
      `https://api.massive.com/v3/reference/tickers/XAUUSD?apiKey=${apiKey}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      provider: "Massive",
      data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to reach Massive API",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
