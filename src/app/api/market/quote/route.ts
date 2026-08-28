import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker")?.trim().toUpperCase();
  if (!ticker) {
    return NextResponse.json({ error: "Ticker não informado." }, { status: 400 });
  }

  const token = process.env.BRAPI_TOKEN;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`https://brapi.dev/api/v2/stocks/quote?symbols=${ticker}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Brapi respondeu com o código ${res.status}`);

    const data = await res.json();
    const quote = data.results?.[0];
    if (!quote) throw new Error("Nenhuma cotação encontrada para esse ticker.");

    return NextResponse.json({ quote });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro desconhecido ao consultar a Brapi." },
      { status: 502 }
    );
  }
}
