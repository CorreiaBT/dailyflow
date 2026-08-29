"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, Trash2, Receipt } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { StatBox } from "@/components/StatBox";
import { PresetButton } from "@/components/PresetButton";
import { KeypadModal } from "@/components/KeypadModal";
import { ManageCategoriesModal } from "@/components/ManageCategoriesModal";
import { categoryById } from "@/lib/categories";
import { formatCurrency, formatNumberBRL } from "@/lib/currency";

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
  const [keypadCategoryId, setKeypadCategoryId] = useState<string | null>(null);
  const [showManageCategories, setShowManageCategories] = useState(false);

  const todayExpenses = useMemo(
    () => app.dailyExpenses.filter((e) => isToday(e.date)),
    [app.dailyExpenses]
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-sm font-extrabold tracking-tight text-primary"
          >
            R$
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">BEM-VINDO</p>
            <h1 className="text-2xl font-bold text-white">DailyFlow</h1>
          </div>
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
          <span className="text-4xl font-bold text-white">{formatNumberBRL(app.remainingTodayAllowance)}</span>
        </div>

        <div className="mb-3 h-2 w-full rounded-full bg-white/10">
          <div
            className={`h-2 rounded-full ${app.todaySpentRatio > 0.85 ? "bg-danger" : "bg-primary"}`}
            style={{ width: `${app.todaySpentRatio * 100}%` }}
          />
        </div>

        <div className="flex gap-3">
          <StatBox title="Teto Diário" value={formatCurrency(app.idealDailyAllowance)} />
          <StatBox title="Gasto Hoje" value={formatCurrency(app.todaySpentTotal)} isWarning />
          <StatBox title="Livre no Mês" value={formatCurrency(app.monthlyFreeBudget)} />
        </div>
      </div>

      {/* Lançamento Rápido */}
      <div>
        <h2 className="mb-3 font-semibold text-white">Lançamento Rápido</h2>
        <div className="grid grid-cols-3 gap-3">
          {app.categories.map((cat) => (
            <PresetButton
              key={cat.id}
              emoji={cat.emoji}
              title={cat.label}
              onClick={() => setKeypadCategoryId(cat.id)}
            />
          ))}
          <PresetButton emoji="➕" title="Adicionar categoria" onClick={() => setShowManageCategories(true)} />
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
              const category = categoryById(app.categories, expense.category);
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
                    <span className="text-sm font-semibold text-white">{formatCurrency(expense.amount)}</span>
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

      {keypadCategoryId && (
        <KeypadModal
          categories={app.categories}
          initialCategoryId={keypadCategoryId}
          onClose={() => setKeypadCategoryId(null)}
          onConfirm={(amount, categoryId) => app.addDailyExpense(amount, categoryId)}
        />
      )}

      {showManageCategories && <ManageCategoriesModal onClose={() => setShowManageCategories(false)} />}
    </div>
  );
}
