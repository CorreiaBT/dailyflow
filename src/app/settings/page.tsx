"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

export default function SettingsPage() {
  const app = useApp();
  const [incomeText, setIncomeText] = useState("");
  const [contributionText, setContributionText] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");

  useEffect(() => {
    // Sincroniza os campos de texto com o valor hidratado do localStorage
    // (que só fica disponível após o primeiro render no cliente).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIncomeText(app.monthlyIncome.toFixed(2));
    setContributionText(app.monthlyGoalContribution.toFixed(2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveIncome() {
    const value = Number(incomeText);
    if (!Number.isNaN(value)) app.setMonthlyIncome(value);
  }

  function saveContribution() {
    const value = Number(contributionText);
    if (!Number.isNaN(value)) app.setMonthlyGoalContribution(value);
  }

  function addFixed() {
    const amount = Number(newAmount);
    if (newTitle.trim() && amount > 0) {
      app.addFixedExpense(newTitle.trim(), amount);
      setNewTitle("");
      setNewAmount("");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 p-4">
      <h1 className="text-xl font-bold text-white">Configurações</h1>

      <section className="rounded-3xl bg-white/5 p-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Sua Renda Mensal Total</h2>
        <div className="flex items-center gap-2 rounded-xl bg-black/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/50">
          <span className="font-bold text-primary">R$</span>
          <input
            value={incomeText}
            onChange={(e) => setIncomeText(e.target.value)}
            onBlur={saveIncome}
            inputMode="decimal"
            className="w-full bg-transparent text-white outline-none"
            placeholder="Ex: 5000"
          />
        </div>
      </section>

      <section className="rounded-3xl bg-white/5 p-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
          Reserva Mensal Blindada p/ Meta
        </h2>
        <div className="flex items-center gap-2 rounded-xl bg-black/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-secondary/50">
          <span className="font-bold text-secondary">R$</span>
          <input
            value={contributionText}
            onChange={(e) => setContributionText(e.target.value)}
            onBlur={saveContribution}
            inputMode="decimal"
            className="w-full bg-transparent text-white outline-none"
            placeholder="Ex: 500"
          />
        </div>
      </section>

      <section className="rounded-3xl bg-white/5 p-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
          Gastos Fixos (Aluguel, Luz, Net, etc.)
        </h2>

        <div className="mb-4 flex flex-col gap-2">
          {app.fixedExpenses.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2.5">
              <span className="text-sm text-white">{item.title}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary">R$ {item.amount.toFixed(2)}</span>
                <button
                  onClick={() => app.removeFixedExpense(item.id)}
                  className="text-gray-500 hover:text-danger"
                  aria-label="Remover"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {app.fixedExpenses.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum gasto fixo cadastrado ainda.</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nome (ex: Internet)"
            className="rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2">
            <input
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              inputMode="decimal"
              placeholder="Valor R$"
              className="flex-1 rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={addFixed}
              className="rounded-xl bg-primary/15 px-4 py-2.5 font-bold text-primary hover:bg-primary/25"
            >
              Adicionar
            </button>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-gray-500">Total de gastos fixos: R$ {app.totalFixedExpenses.toFixed(2)}</p>
    </div>
  );
}
