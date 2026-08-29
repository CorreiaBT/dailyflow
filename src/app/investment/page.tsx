"use client";

import { useEffect, useMemo } from "react";
import { Sparkles, CheckCircle2, Wifi, ZapOff, RefreshCw, LoaderCircle } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { useMarketData } from "@/lib/hooks/useMarketData";
import { useAdvisor, AdvisorInput } from "@/lib/hooks/useAdvisor";
import { GoalDashboard } from "@/components/GoalDashboard";
import { InsightCardView } from "@/components/InsightCardView";
import { generateInsights } from "@/lib/engines/insights";
import { categoryBreakdown, expensesInMonth, monthKey } from "@/lib/history";
import { assetById } from "@/lib/types";

function currency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

export default function InvestmentPage() {
  const app = useApp();
  const m = useMarketData();
  const advisor = useAdvisor();

  useEffect(() => {
    m.loadCDIRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fallbackCards = useMemo(
    () => generateInsights(app.dailyExpenses, app.categories, app.monthlyIncome, app.totalFixedExpenses),
    [app.dailyExpenses, app.categories, app.monthlyIncome, app.totalFixedExpenses]
  );

  const asset = assetById(app.selectedAsset);

  const now = new Date();
  const monthExpenses = useMemo(
    () => expensesInMonth(app.dailyExpenses, monthKey(now)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [app.dailyExpenses]
  );
  const totalSpentMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = totalDaysInMonth - daysElapsed;
  const avgDailyVariableSpend = daysElapsed > 0 ? totalSpentMonth / daysElapsed : 0;
  const projectedVariableSpend = totalSpentMonth + avgDailyVariableSpend * daysRemaining;
  const projectedMonthBalance = app.monthlyIncome - app.totalFixedExpenses - projectedVariableSpend;

  const savingsRate =
    app.monthlyIncome > 0
      ? (app.monthlyIncome - app.totalFixedExpenses - totalSpentMonth) / app.monthlyIncome
      : 0;

  const monthCategoryTotals = useMemo(
    () =>
      categoryBreakdown(monthExpenses, app.categories).map((c) => ({
        label: c.label,
        total: c.total,
      })),
    [monthExpenses, app.categories]
  );

  const advisorInput: AdvisorInput = {
    monthlyIncome: app.monthlyIncome,
    totalFixedExpenses: app.totalFixedExpenses,
    monthlyFreeBudget: app.monthlyFreeBudget,
    monthlyGoalContribution: app.monthlyGoalContribution,
    todaySpentTotal: app.todaySpentTotal,
    idealDailyAllowance: app.idealDailyAllowance,
    cdiRate: m.cdiRate,
    goal: {
      title: app.goalTitle,
      targetAmount: app.targetAmount,
      currentSaved: app.currentSaved,
      assetLabel: asset.label,
      annualRatePct: asset.annualRatePct,
    },
    categoryBreakdown: monthCategoryTotals,
  };

  // Só consulta o consultor depois que os dados salvos foram lidos: efeitos de
  // filhos rodam antes dos do AppProvider, então disparar no mount analisaria
  // (e cachearia por 12h) os valores iniciais em vez dos dados reais.
  useEffect(() => {
    if (!app.hydrated) return;
    advisor.fetchTips(advisorInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.hydrated]);

  const usingAi = advisor.status === "success" && advisor.tips !== null;
  const insightCards = usingAi ? advisor.tips! : fallbackCards;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <h1 className="text-xl font-bold text-white">Projeção de Investimento</h1>

      {/* Saúde Financeira do Mês */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Saúde Financeira do Mês</p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-black/30 p-3">
            <p className="text-[9px] font-bold tracking-wide text-gray-400">TAXA DE POUPANÇA</p>
            <p className={`text-lg font-bold ${savingsRate >= 0 ? "text-primary" : "text-danger"}`}>
              {(savingsRate * 100).toFixed(0)}%
            </p>
            <p className="text-[9px] text-gray-500">da renda, já reservado nesse mês</p>
          </div>
          <div className="flex-1 rounded-xl bg-black/30 p-3">
            <p className="text-[9px] font-bold tracking-wide text-gray-400">PROJEÇÃO DE FIM DE MÊS</p>
            <p className={`text-lg font-bold ${projectedMonthBalance >= 0 ? "text-primary" : "text-danger"}`}>
              {currency(projectedMonthBalance)}
            </p>
            <p className="text-[9px] text-gray-500">
              {projectedMonthBalance >= 0 ? "de sobra estimada" : "de déficit estimado"}
            </p>
          </div>
        </div>
      </div>

      <GoalDashboard />

      {/* CDI / Selic */}
      <div className="rounded-3xl border border-white/10 bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold ${
              m.isFromCache ? "bg-danger/15 text-danger" : "bg-primary/15 text-primary"
            }`}
          >
            {m.isFromCache ? <ZapOff size={13} /> : <Wifi size={13} />}
            {m.isFromCache ? "Cache Offline (24h)" : "Conectado ao BCB"}
          </span>
          <button
            onClick={() => m.loadCDIRate()}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <p className="text-sm text-gray-400">Taxa CDI / Selic de Mercado</p>
        <div className="mb-1 flex items-baseline gap-1.5">
          <span className="text-4xl font-bold text-primary">{m.cdiRate.toFixed(2)}%</span>
          <span className="font-semibold text-gray-400">a.a.</span>
        </div>
        <p className="text-xs text-gray-500">Atualizado em: {m.formattedLastUpdated}</p>
        {m.status.kind === "error" && <p className="mt-1 text-xs text-danger">{m.status.message}</p>}
      </div>

      {/* Consultor de Investimentos */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-secondary" />
            <h2 className="font-semibold text-white">Consultor de Investimentos</h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                usingAi ? "bg-secondary/15 text-secondary" : "bg-white/10 text-gray-400"
              }`}
            >
              {usingAi ? "IA" : "Regras locais"}
            </span>
            <button
              onClick={() => advisor.fetchTips(advisorInput, true)}
              disabled={advisor.status === "loading"}
              className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 disabled:opacity-40"
              aria-label="Atualizar dicas"
            >
              {advisor.status === "loading" ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
            </button>
          </div>
        </div>

        {advisor.status === "error" && (
          <p className="mb-2 text-xs text-danger">Não foi possível consultar a IA agora ({advisor.errorMessage}). Mostrando dicas locais.</p>
        )}

        {insightCards.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-4">
            <CheckCircle2 size={18} className="text-primary" />
            <p className="text-sm text-gray-400">Seus gastos estão sob controle hoje. Nenhum alerta pendente!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {insightCards.map((card) => (
              <InsightCardView key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
