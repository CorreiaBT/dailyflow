"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, Trash2, Receipt } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { StatBox } from "@/components/StatBox";
import { PresetButton } from "@/components/PresetButton";
import { KeypadModal } from "@/components/KeypadModal";
import { categoryById } from "@/lib/categories";

const QUICK_PRESETS = [
  { emoji: "☕", title: "Café", price: "R$ 6,00", amount: 6, category: "coffee" },
  { emoji: "🍔", title: "Lanche", price: "R$ 18,00", amount: 18, category: "food" },
  { emoji: "🚗", title: "Uber", price: "R$ 22,00", amount: 22, category: "transport" },
  { emoji: "💊", title: "Farmácia", price: "R$ 35,00", amount: 35, category: "emergency" },
  { emoji: "🎟️", title: "Lazer", price: "R$ 40,00", amount: 40, category: "leisure" },
];

function isToday(dateIso: string): boolean {
  const d = new Date(dateIso);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export default function HomePage() {
  const app = useApp();
  const [showKeypad, setShowKeypad] = useState(false);

  const todayExpenses = useMemo(
    () => app.dailyExpenses.filter((e) => isToday(e.date)),
    [app.dailyExpenses]
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400">BEM-VINDO</p>
          <h1 className="text-2xl font-bold text-white">DailyFlow</h1>
        </div>
        <Link href="/settings" className="rounded-full bg-white/5 p-2.5 text-white">
          <SettingsIcon size={18} />
        </Link>
      </div>

      {/* Saldo disponível hoje */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="mb-1 text-xs font-bold tracking-wide text-gray-400">DISPONÍVEL PARA GASTAR HOJE</p>
        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary">R$</span>
          <span className="text-4xl font-bold text-white">{app.remainingTodayAllowance.toFixed(2)}</span>
        </div>

        <div className="mb-3 h-2 w-full rounded-full bg-white/10">
          <div
            className={`h-2 rounded-full ${app.todaySpentRatio > 0.85 ? "bg-danger" : "bg-primary"}`}
            style={{ width: `${app.todaySpentRatio * 100}%` }}
          />
        </div>

        <div className="flex gap-3">
          <StatBox title="Teto Diário" value={`R$ ${app.idealDailyAllowance.toFixed(2)}`} />
          <StatBox title="Gasto Hoje" value={`R$ ${app.todaySpentTotal.toFixed(2)}`} isWarning />
          <StatBox title="Livre no Mês" value={`R$ ${app.monthlyFreeBudget.toFixed(2)}`} />
        </div>
      </div>

      {/* Lançamento Rápido */}
      <div>
        <h2 className="mb-3 font-semibold text-white">Lançamento Rápido</h2>
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

      {/* Compras de Hoje */}
      <div>
        <h2 className="mb-3 font-semibold text-white">Compras de Hoje</h2>

        {todayExpenses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 py-8 text-center">
            <Receipt size={22} className="text-gray-500" />
            <p className="text-sm text-gray-500">Nenhuma compra registrada hoje.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayExpenses.map((expense) => {
              const category = categoryById(expense.category);
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-3.5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="emoji-tint text-xl">{expense.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{expense.note || category.label}</p>
                      <p className="text-[11px] text-gray-500">
                        {new Date(expense.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">R$ {expense.amount.toFixed(2)}</span>
                    <button
                      onClick={() => app.removeDailyExpense(expense.id)}
                      className="text-gray-600 hover:text-danger"
                      aria-label="Remover"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
