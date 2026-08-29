"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, Receipt } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { categoryBreakdown, expensesInMonth, formatMonthLabel, monthKey, shiftMonth } from "@/lib/history";

export default function HistoryPage() {
  const app = useApp();
  const currentMonthKey = useMemo(() => monthKey(new Date()), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  const monthExpenses = useMemo(
    () => expensesInMonth(app.dailyExpenses, selectedMonth),
    [app.dailyExpenses, selectedMonth]
  );

  const breakdown = useMemo(() => categoryBreakdown(monthExpenses), [monthExpenses]);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const isCurrentMonth = selectedMonth === currentMonthKey;

  const sortedExpenses = useMemo(
    () => [...monthExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [monthExpenses]
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <h1 className="text-xl font-bold text-white">Histórico</h1>

      {/* Navegação de mês */}
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-3">
        <button
          onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
          className="rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-white">{formatMonthLabel(selectedMonth)}</span>
        <button
          onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
          disabled={isCurrentMonth}
          className="rounded-full p-2 text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Resumo do mês */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-bold tracking-wide text-gray-400">TOTAL GASTO NO MÊS</p>
        <div className="mb-1 flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary">R$</span>
          <span className="text-4xl font-bold text-white">{monthTotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500">
          {monthExpenses.length} {monthExpenses.length === 1 ? "compra" : "compras"} · não inclui gastos fixos
        </p>
      </div>

      {/* Ranking por categoria */}
      <div>
        <h2 className="mb-3 font-semibold text-white">Gastos por Categoria</h2>

        {breakdown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 py-8 text-center">
            <Receipt size={22} className="text-gray-500" />
            <p className="text-sm text-gray-500">Nenhum gasto registrado nesse mês.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5">
            {breakdown.map((cat, i) => (
              <div key={cat.categoryId}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="emoji-tint text-base">{cat.emoji}</span>
                    <span className="text-sm font-medium text-white">{cat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-gray-500">{(cat.ratio * 100).toFixed(0)}%</span>
                    <span className="text-sm font-semibold text-white">R$ {cat.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10">
                  <div
                    className={`h-1.5 rounded-full ${i === 0 ? "bg-primary" : "bg-secondary"}`}
                    style={{ width: `${Math.max(cat.ratio * 100, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lançamentos do mês */}
      {sortedExpenses.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold text-white">Lançamentos do Mês</h2>
          <div className="flex flex-col gap-2">
            {sortedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-2xl bg-white/5 px-3.5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="emoji-tint text-xl">{expense.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {expense.note || breakdown.find((c) => c.categoryId === expense.category)?.label}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {new Date(expense.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
