"use client";

import { useEffect } from "react";
import { Wifi, ZapOff, RefreshCw } from "lucide-react";
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
import { useMarketData } from "@/lib/hooks/useMarketData";

function currency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

export default function MarketPage() {
  const m = useMarketData();

  useEffect(() => {
    m.loadCDIRate();
    m.fetchStockQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = m.projectionPoints.map((p) => ({
    mes: `${p.month}m`,
    "Saldo Total": Math.round(p.totalBalance),
    "Capital Aportado": Math.round(p.principalInvested),
  }));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 p-4">
      {/* CDI / Selic */}
      <div className="rounded-3xl border border-white/10 bg-[#14161c] p-5">
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold ${
              m.isFromCache ? "bg-orange-400/15 text-orange-400" : "bg-green-500/15 text-green-400"
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
          <span className="text-4xl font-bold text-green-400">{m.cdiRate.toFixed(2)}%</span>
          <span className="font-semibold text-gray-400">a.a.</span>
        </div>
        <p className="text-xs text-gray-500">Atualizado em: {m.formattedLastUpdated}</p>
        {m.status.kind === "error" && <p className="mt-1 text-xs text-red-400">{m.status.message}</p>}
      </div>

      {/* Gráfico de Projeção */}
      <div className="rounded-3xl bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400">PROJEÇÃO DE RENDIMENTO</p>
            <p className="text-xl font-bold text-white">{currency(m.finalProjectedValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Lucro em Juros</p>
            <p className="font-bold text-green-400">+{currency(m.totalProfit)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ left: 0, right: 10 }}>
            <defs>
              <linearGradient id="marketArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
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
              contentStyle={{ background: "#0a0d12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              formatter={(value) => currency(Number(value))}
            />
            <Area type="monotone" dataKey="Saldo Total" stroke="#22c55e" strokeWidth={3} fill="url(#marketArea)" />
            <Line
              type="monotone"
              dataKey="Capital Aportado"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-2 flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Montante Total
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Capital Investido
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
          accent="accent-green-500"
        />
        <SliderField
          label="Aporte Mensal"
          value={m.monthlyContribution}
          onChange={m.setMonthlyContribution}
          min={0}
          max={5000}
          step={50}
          accent="accent-cyan-400"
        />
        <SliderField
          label="Prazo (Meses)"
          value={m.projectionMonths}
          onChange={m.setProjectionMonths}
          min={6}
          max={60}
          step={6}
          accent="accent-purple-500"
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
            className="flex-1 rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none"
          />
          <button
            onClick={() => m.fetchStockQuote()}
            className="rounded-xl bg-green-500 px-4 py-2.5 font-bold text-white hover:bg-green-600"
          >
            Buscar
          </button>
        </div>

        {m.quoteStatus.kind === "error" && <p className="mt-2 text-xs text-red-400">{m.quoteStatus.message}</p>}

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
                  (m.currentQuote.regularMarketChangePercent ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {(m.currentQuote.regularMarketChangePercent ?? 0) >= 0 ? "+" : ""}
                {(m.currentQuote.regularMarketChangePercent ?? 0).toFixed(2)}%
              </p>
            </div>
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
