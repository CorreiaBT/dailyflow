import { NextRequest, NextResponse } from "next/server";
import { formatCurrency as currency } from "@/lib/currency";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface CategorySpend {
  label: string;
  total: number;
}

interface AdvisorRequest {
  monthlyIncome: number;
  totalFixedExpenses: number;
  monthlyFreeBudget: number;
  monthlyGoalContribution: number;
  todaySpentTotal: number;
  idealDailyAllowance: number;
  cdiRate: number;
  goal: {
    title: string;
    targetAmount: number;
    currentSaved: number;
    assetLabel: string;
    annualRatePct: number;
  };
  categoryBreakdown: CategorySpend[];
}

interface AdvisorTip {
  title: string;
  message: string;
  severity: "WARNING" | "INFO" | "SUCCESS";
  highlightedValue?: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada no servidor." },
      { status: 501 }
    );
  }

  let data: AdvisorRequest;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(data) }] }],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                message: { type: "STRING" },
                severity: { type: "STRING", enum: ["WARNING", "INFO", "SUCCESS"] },
                highlightedValue: { type: "STRING" },
              },
              required: ["title", "message", "severity"],
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini respondeu ${res.status}: ${errBody.slice(0, 200)}`);
    }

    const json = await res.json();
    const parts: { text?: string }[] = json.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p) => p.text ?? "").join("").trim();
    if (!text) throw new Error("Resposta vazia da Gemini.");

    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("Formato inesperado retornado pela Gemini.");

    const tips = parsed.filter(isValidTip).map(normalizeTip).slice(0, 3);
    if (tips.length === 0) throw new Error("Nenhuma dica utilizável retornada pela Gemini.");

    return NextResponse.json({ tips });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro desconhecido ao consultar a Gemini." },
      { status: 502 }
    );
  }
}

const VALID_SEVERITIES: AdvisorTip["severity"][] = ["WARNING", "INFO", "SUCCESS"];

function isValidTip(tip: unknown): tip is Record<string, unknown> {
  if (typeof tip !== "object" || tip === null) return false;
  const t = tip as Record<string, unknown>;
  return typeof t.title === "string" && t.title.trim() !== "" && typeof t.message === "string";
}

/** Garante que a severidade caia sempre num valor conhecido pela UI. */
function normalizeTip(tip: Record<string, unknown>): AdvisorTip {
  const raw = typeof tip.severity === "string" ? tip.severity.toUpperCase() : "";
  const severity = (VALID_SEVERITIES as string[]).includes(raw)
    ? (raw as AdvisorTip["severity"])
    : "INFO";

  return {
    title: String(tip.title),
    message: String(tip.message),
    severity,
    highlightedValue: typeof tip.highlightedValue === "string" ? tip.highlightedValue : undefined,
  };
}

function buildPrompt(data: AdvisorRequest): string {
  const categoriesText =
    data.categoryBreakdown.length > 0
      ? data.categoryBreakdown
          .map((c) => `- ${c.label}: ${currency(c.total)}`)
          .join("\n")
      : "- (nenhum gasto registrado ainda neste mês)";

  return `Você é um consultor financeiro pessoal brasileiro, direto e prático, analisando os dados reais de um usuário para dar dicas de orçamento e investimento.

DADOS DO USUÁRIO (mês atual):
- Renda mensal: ${currency(data.monthlyIncome)}
- Gastos fixos mensais (aluguel, contas, assinaturas): ${currency(data.totalFixedExpenses)}
- Saldo livre mensal após fixos e reserva da meta: ${currency(data.monthlyFreeBudget)}
- Reserva mensal blindada para a meta: ${currency(data.monthlyGoalContribution)}
- Gasto hoje: ${currency(data.todaySpentTotal)} (teto diário ideal: ${currency(data.idealDailyAllowance)})
- Taxa CDI/Selic atual: ${data.cdiRate.toFixed(2)}% a.a.
- Meta de economia: "${data.goal.title}", já guardou ${currency(data.goal.currentSaved)} de ${currency(
    data.goal.targetAmount
  )}, investindo em ${data.goal.assetLabel} (${data.goal.annualRatePct.toFixed(1)}% a.a.)

GASTOS VARIÁVEIS DESTE MÊS POR CATEGORIA (não inclui os gastos fixos acima):
${categoriesText}

TAREFA: gere no máximo 3 dicas curtas, específicas e acionáveis, em português do Brasil, baseadas SOMENTE nos dados acima. Não invente números que não estão aqui. Priorize: (1) alertas sobre categorias com gasto desproporcional, (2) oportunidades concretas de investir a sobra do mês, (3) progresso da meta. Cada dica deve ter: title (curto), message (1-2 frases, tom de consultor, cite valores reais), severity (WARNING para alertas de gasto, INFO para oportunidades/dicas neutras, SUCCESS para elogios/progresso positivo), e highlightedValue opcional (um valor curto em destaque, ex: "+R$120/mês").`;
}
