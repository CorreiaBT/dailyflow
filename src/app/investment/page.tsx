"use client";

import { useEffect, useMemo } from "react";
import { Sparkles, CheckCircle2, Wifi, ZapOff, RefreshCw, LoaderCircle } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/lib/context/AppContext";
import { useMarketData } from "@/lib/hooks/useMarketData";
import { useAdvisor, AdvisorInput } from "@/lib/hooks/useAdvisor";
import { GoalDashboard } from "@/components/GoalDashboard";
import { InsightCardView } from "@/components/InsightCardView";
import { generateInsights } from "@/lib/engines/insights";
import { categoryBreakdown, expensesInMonth, monthKey } from "@/lib/history";
import { INVESTMENT_ASSETS } from "@/lib/types";

function currency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

export default function InvestmentPage() {
  const app = useApp();
  const m = useMarketData();
  const advisor = useAdvisor();

  useEffect(() => {
    m.loadCDIRate();
    m.fetchStockQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fallbackCards = useMemo(
    () => generateInsights(app.dailyExpenses, app.monthlyIncome, app.totalFixedExpenses),
    [app.dailyExpenses, app.monthlyIncome, app.totalFixedExpenses]
  );

  const asset = INVESTMENT_ASSETS[app.selectedAsset];
  const monthCategoryTotals = useMemo(
    () =>
      categoryBreakdown(expensesInMonth(app.dailyExpenses, monthKey(new Date()))).map((c) => ({
        label: c.label,
        total: c.total,
      })),
    [app.dailyExpenses]
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

  useEffect(() => {
    advisor.fetchTips(advisorInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usingAi = advisor.status === "success" && advisor.tips !== null;
  const insightCards = usingAi ? advisor.tips! : fallbackCards;

  const chartData = m.projectionPoints.map((p) => ({
    mes: `${p.month}m`,
    "Saldo Total": Math.round(p.totalBalance),
    "Capital Aportado": Math.round(p.principalInvested),
  }));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <h1 className="text-xl font-bold text-white">Projeção de Investimento</h1>

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

      {/* Gráfico de Projeção Livre */}
      <div className="rounded-3xl bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400">PROJEÇÃO DE RENDIMENTO</p>
            <p className="text-xl font-bold text-white">{currency(m.finalProjectedValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Lucro em Juros</p>
            <p className="font-bold text-primary">+{currency(m.totalProfit)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ left: 0, right: 10 }}>
            <defs>
              <linearGradient id="marketArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d9b95c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#d9b95c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => (v >= 1000 ? `R$${Math.round(v / 1000)}k` : `R$${v}`)}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{ background: "#0d0b07", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              formatter={(value) => currency(Number(value))}
            />
            <Area type="monotone" dataKey="Saldo Total" stroke="#d9b95c" strokeWidth={3} fill="url(#marketArea)" />
            <Line
              type="monotone"
              dataKey="Capital Aportado"
              stroke="#9c7a35"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-2 flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Montante Total
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-secondary" /> Capital Investido
          </span>
        </div>
      </div>

      {/* Sliders de simulação */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white/[0.04] p-5">
        <SliderField
          label="Aporte Inicial"
          value={m.initialCapital}
          onChange={m.setInitialCapital}
          min={100}
          max={20000}
          step={100}
          accent="accent-primary"
        />
        <SliderField
          label="Aporte Mensal"
          value={m.monthlyContribution}
          onChange={m.setMonthlyContribution}
          min={0}
          max={5000}
          step={50}
          accent="accent-secondary"
        />
        <SliderField
          label="Prazo (Meses)"
          value={m.projectionMonths}
          onChange={m.setProjectionMonths}
          min={6}
          max={60}
          step={6}
          accent="accent-gray-300"
          format={(v) => `${v} meses (${Math.floor(v / 12)} anos)`}
        />
      </div>

      {/* Consulta B3 */}
      <div className="rounded-3xl bg-white/[0.04] p-5">
        <h2 className="mb-3 font-semibold text-white">Consulta B3 (Ações & FIIs)</h2>
        <div className="flex gap-2">
          <input
            value={m.searchTicker}
            onChange={(e) => m.setSearchTicker(e.target.value.toUpperCase())}
            placeholder="Ex: PETR4, VALE3, HGLG11"
            className="flex-1 rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => m.fetchStockQuote()}
            className="rounded-xl bg-primary px-4 py-2.5 font-bold text-black hover:brightness-110"
          >
            Buscar
          </button>
        </div>

        {m.quoteStatus.kind === "error" && <p className="mt-2 text-xs text-danger">{m.quoteStatus.message}</p>}

        {m.currentQuote && (
          <div className="mt-3.5 flex items-center justify-between rounded-2xl bg-white/[0.06] p-3.5">
            <div>
              <p className="text-lg font-bold text-white">{m.currentQuote.symbol}</p>
              <p className="text-xs text-gray-400">{m.currentQuote.shortName ?? m.currentQuote.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">
                {m.currentQuote.regularMarketPrice != null ? currency(m.currentQuote.regularMarketPrice) : "N/A"}
              </p>
              <p
                className={`text-xs font-bold ${
                  (m.currentQuote.regularMarketChangePercent ?? 0) >= 0 ? "text-primary" : "text-danger"
                }`}
              >
                {(m.currentQuote.regularMarketChangePercent ?? 0) >= 0 ? "+" : ""}
                {(m.currentQuote.regularMarketChangePercent ?? 0).toFixed(2)}%
              </p>
            </div>
          </div>
        )}
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
          <div className="no-scrollbar flex gap-3.5 overflow-x-auto pb-1">
            {insightCards.map((card) => (
              <div key={card.id} className="w-[290px] shrink-0">
                <InsightCardView card={card} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  accent: string;
  format?: (v: number) => string;
}

function SliderField({ label, value, onChange, min, max, step, accent, format }: SliderFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-gray-400">{label}:</span>
        <span className="font-bold text-white">{format ? format(value) : `R$ ${value.toFixed(0)}`}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-1.5 w-full cursor-pointer rounded-full bg-white/10 ${accent}`}
      />
    </div>
  );
}
