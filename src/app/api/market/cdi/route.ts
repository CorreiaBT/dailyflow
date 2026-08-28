import { NextResponse } from "next/server";

interface BCBSeriesItem {
  data: string;
  valor: string;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados/ultimos/1?formato=json",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`BCB respondeu com o código ${res.status}`);

    const items: BCBSeriesItem[] = await res.json();
    const latest = items[0];
    const monthlyRatePct = latest ? parseFloat(latest.valor.replace(",", ".")) : NaN;
    if (Number.isNaN(monthlyRatePct)) {
      throw new Error("Formato de valor inválido retornado pelo BCB.");
    }

    // Converter taxa mensal (%) para equivalente anualizada.
    const annualRate = (Math.pow(1 + monthlyRatePct / 100, 12) - 1) * 100;
    const rate = annualRate > 0 ? annualRate : 10.5;

    return NextResponse.json({ rate });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro desconhecido ao consultar o BCB." },
      { status: 502 }
    );
  }
}
