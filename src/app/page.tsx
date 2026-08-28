"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { StatBox } from "@/components/StatBox";
import { PresetButton } from "@/components/PresetButton";
import { InsightCardView } from "@/components/InsightCardView";
import { KeypadModal } from "@/components/KeypadModal";
import { GoalDashboard } from "@/components/GoalDashboard";
import { generateInsights } from "@/lib/engines/insights";

const QUICK_PRESETS = [
  { emoji: "☕", title: "Café", price: "R$ 6,00", amount: 6, category: "coffee" },
  { emoji: "🍔", title: "Lanche", price: "R$ 18,00", amount: 18, category: "food" },
  { emoji: "🚗", title: "Uber", price: "R$ 22,00", amount: 22, category: "transport" },
  { emoji: "💊", title: "Farmácia", price: "R$ 35,00", amount: 35, category: "emergency" },
  { emoji: "🎟️", title: "Lazer", price: "R$ 40,00", amount: 40, category: "leisure" },
];

export default function HomePage() {
  const app = useApp();
  const [showKeypad, setShowKeypad] = useState(false);

  const insightCards = useMemo(
    () => generateInsights(app.dailyExpenses, app.monthlyIncome, app.totalFixedExpenses),
    [app.dailyExpenses, app.monthlyIncome, app.totalFixedExpenses]
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400">BEM-VINDO</p>
          <h1 className="text-2xl font-bold text-white">DailyFlow</h1>
        </div>
        <Link href="/settings" className="rounded-full bg-white/10 p-2.5 text-white">
          <SettingsIcon size={18} />
        </Link>
      </div>

      {/* Hero: Disponível Hoje */}
      <div className="rounded-[28px] border border-green-500/30 bg-gradient-to-br from-green-500/15 to-[#141a16] p-5">
        <span className="mb-3 inline-block rounded-xl bg-green-500/20 px-2.5 py-1 text-xs font-bold text-green-400">
          HOJE
        </span>

        <p className="text-sm text-gray-400">Disponível para gastar hoje</p>
        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-xl font-bold text-green-400">R$</span>
          <span className="text-4xl font-bold text-white">{app.remainingTodayAllowance.toFixed(2)}</span>
        </div>

        <div className="mb-3 h-2.5 w-full rounded-full bg-white/10">
          <div
            className={`h-2.5 rounded-full ${app.todaySpentRatio > 0.85 ? "bg-orange-400" : "bg-green-500"}`}
            style={{ width: `${app.todaySpentRatio * 100}%` }}
          />
        </div>

        <div className="flex gap-3">
          <StatBox title="Teto Diário" value={`R$ ${app.idealDailyAllowance.toFixed(2)}`} />
          <StatBox title="Gasto Hoje" value={`R$ ${app.todaySpentTotal.toFixed(2)}`} isWarning />
          <StatBox title="Livre no Mês" value={`R$ ${app.monthlyFreeBudget.toFixed(2)}`} />
        </div>
      </div>

      <GoalDashboard />

      {/* Feed de Insights */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" />
          <h2 className="font-semibold text-white">Feed de Insights Diários</h2>
        </div>

        {insightCards.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-4">
            <CheckCircle2 size={18} className="text-green-400" />
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

      {/* Lançamento Rápido */}
      <div>
        <h2 className="mb-3 font-semibold text-white">Lançamento Rápido (1-Toque)</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_PRESETS.map((preset) => (
            <PresetButton
              key={preset.title}
              emoji={preset.emoji}
              title={preset.title}
              price={preset.price}
              onClick={() => app.addDailyExpense(preset.amount, preset.category)}
            />
          ))}
          <PresetButton emoji="🔢" title="Teclado" price="Qualquer R$" onClick={() => setShowKeypad(true)} />
        </div>
      </div>

      {showKeypad && (
        <KeypadModal
          onClose={() => setShowKeypad(false)}
          onConfirm={(amount, categoryId) => app.addDailyExpense(amount, categoryId)}
        />
      )}
    </div>
  );
}
