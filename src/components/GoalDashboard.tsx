"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
import { ASSET_ORDER, INVESTMENT_ASSETS, InvestmentAssetType } from "@/lib/types";
import { calculateTimeAndYield, generateProjection } from "@/lib/engines/projection";

function currency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

export function GoalDashboard() {
  const app = useApp();
  const [showEditGoal, setShowEditGoal] = useState(false);

  const progressRatio = app.targetAmount > 0 ? Math.min(1, app.currentSaved / app.targetAmount) : 0;
  const asset = INVESTMENT_ASSETS[app.selectedAsset];

  const monthlyFreeSavings = app.monthlyFreeBudget - app.todaySpentTotal;
  const result = useMemo(
    () => calculateTimeAndYield(app.currentSaved, app.targetAmount, monthlyFreeSavings, asset.annualRatePct),
    [app.currentSaved, app.targetAmount, monthlyFreeSavings, asset.annualRatePct]
  );

  const chartData = useMemo(
    () =>
      generateProjection(app.currentSaved, app.monthlyGoalContribution, asset.annualRatePct, 12).map((p) => ({
        mes: `M${p.month}`,
        Saldo: Math.round(p.totalBalance),
        Aportado: Math.round(p.principalInvested),
      })),
    [app.currentSaved, app.monthlyGoalContribution, asset.annualRatePct]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Card da Meta */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <span className="emoji-tint">🎯</span> Meta & Investimentos
          </h2>
          <button
            onClick={() => setShowEditGoal(true)}
            className="text-xs font-bold text-secondary hover:brightness-110"
          >
            Configurar
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="emoji-tint rounded-2xl bg-white/5 p-2.5 text-3xl">🎯</span>
          <div>
            <p className="font-bold text-white">{app.goalTitle}</p>
            <p>
              <span className="text-lg font-bold text-secondary">{currency(app.currentSaved)}</span>{" "}
              <span className="text-xs text-gray-400">de {currency(app.targetAmount)}</span>
            </p>
          </div>
        </div>

        <div className="mb-4 h-2 w-full rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-secondary" style={{ width: `${progressRatio * 100}%` }} />
        </div>

        <p className="mb-2 text-[10px] font-bold tracking-wide text-gray-400">SELECIONE O TIPO DE INVESTIMENTO</p>
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          {ASSET_ORDER.map((assetId: InvestmentAssetType) => {
            const info = INVESTMENT_ASSETS[assetId];
            const selected = app.selectedAsset === assetId;
            return (
              <button
                key={assetId}
                onClick={() => app.setSelectedAsset(assetId)}
                className={`rounded-2xl border p-2.5 text-left ${
                  selected ? "border-secondary bg-secondary/15" : "border-white/10 bg-white/5"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="emoji-tint">{info.emoji}</span>
                  {selected && <CheckCircle2 size={14} className="text-secondary" />}
                </div>
                <p className="text-xs font-bold text-white">{info.label}</p>
                <p className="text-[11px] font-bold text-primary">{info.annualRatePct.toFixed(1)}% a.a.</p>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-black/30 p-2.5">
            <p className="text-[9px] font-bold tracking-wide text-gray-400">TEMPO PARA A META</p>
            <p className="font-bold text-white">{result.months} meses</p>
            <p className="text-[9px] text-gray-400">Com a sobra do mês</p>
          </div>
          <div className="flex-1 rounded-xl bg-black/30 p-2.5">
            <p className="text-[9px] font-bold tracking-wide text-gray-400">RENDIMENTO DE JUROS</p>
            <p className="font-bold text-primary">+{currency(result.estimatedYield)}</p>
            <p className="text-[9px] text-gray-400">Juros do Ativo</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Acúmulo */}
      <div className="rounded-3xl border border-white/10 bg-surface p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
          <span className="emoji-tint">📈</span> Curva de Acúmulo & Juros (12 Meses)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ left: -20, right: 10 }}>
            <defs>
              <linearGradient id="goalArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d9b95c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#d9b95c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `R$${Math.round(v / 1000)}k`}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: "#0d0b07", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              formatter={(value) => currency(Number(value))}
            />
            <Area type="monotone" dataKey="Saldo" stroke="#d9b95c" strokeWidth={3} fill="url(#goalArea)" />
            <Line type="monotone" dataKey="Aportado" stroke="#9c7a35" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showEditGoal && <EditGoalSheet onClose={() => setShowEditGoal(false)} />}
    </div>
  );
}

function EditGoalSheet({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [title, setTitle] = useState(app.goalTitle);
  const [target, setTarget] = useState(String(app.targetAmount));
  const [current, setCurrent] = useState(String(app.currentSaved));

  function save() {
    app.setGoal({
      title,
      targetAmount: Number(target) || app.targetAmount,
      currentSaved: Number(current) || app.currentSaved,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-surface p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-white">Meta de Economia</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">
            Cancelar
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-secondary/50"
              placeholder="Ex: Reserva de Emergência"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Valor Alvo (R$)</label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Já Guardado (R$)</label>
            <input
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
        </div>

        <button
          onClick={save}
          className="mt-5 w-full rounded-2xl bg-secondary py-3.5 font-semibold text-black hover:brightness-110"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
