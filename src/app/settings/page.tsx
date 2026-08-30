"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { categoryById } from "@/lib/categories";
import { formatCurrency, formatNumberBRL, parseCurrencyInput } from "@/lib/currency";
import { SHOW_TUTORIAL_EVENT } from "@/components/WelcomeTutorial";

export default function SettingsPage() {
  const app = useApp();
  const [incomeText, setIncomeText] = useState("");
  const [contributionText, setContributionText] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");

  useEffect(() => {
    // Sincroniza os campos de texto sempre que o valor de fundo mudar (hidratação
    // do localStorage, ou uma importação de backup) — não só na montagem, senão
    // um backup importado fica sem refletir nos campos até recarregar a página.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIncomeText(formatNumberBRL(app.monthlyIncome));
    setContributionText(formatNumberBRL(app.monthlyGoalContribution));
  }, [app.monthlyIncome, app.monthlyGoalContribution]);

  function saveIncome() {
    const value = parseCurrencyInput(incomeText);
    if (value === null) setIncomeText(formatNumberBRL(app.monthlyIncome));
    else app.setMonthlyIncome(value);
  }

  function saveContribution() {
    const value = parseCurrencyInput(contributionText);
    if (value === null) setContributionText(formatNumberBRL(app.monthlyGoalContribution));
    else app.setMonthlyGoalContribution(value);
  }

  function addFixed() {
    const amount = parseCurrencyInput(newAmount);
    if (newTitle.trim() && amount !== null && amount > 0) {
      app.addFixedExpense(newTitle.trim(), amount);
      setNewTitle("");
      setNewAmount("");
    }
  }

  function exportBackup() {
    const payload = {
      monthlyIncome: app.monthlyIncome,
      monthlyGoalContribution: app.monthlyGoalContribution,
      fixedExpenses: app.fixedExpenses,
      dailyExpenses: app.dailyExpenses,
      categories: app.categories,
      goalTitle: app.goalTitle,
      targetAmount: app.targetAmount,
      currentSaved: app.currentSaved,
      selectedAsset: app.selectedAsset,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailyflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvEscape(value: string | number): string {
    const s = String(value);
    return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportExcel() {
    const rows: string[] = [];

    rows.push("LANÇAMENTOS DIÁRIOS");
    rows.push(["Data", "Categoria", "Valor (R$)", "Observação"].map(csvEscape).join(";"));
    const sortedExpenses = [...app.dailyExpenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    for (const e of sortedExpenses) {
      const label = categoryById(app.categories, e.category).label;
      const date = new Date(e.date).toLocaleDateString("pt-BR");
      rows.push([date, label, formatNumberBRL(e.amount), e.note ?? ""].map(csvEscape).join(";"));
    }
    rows.push("");

    rows.push("GASTOS FIXOS");
    rows.push(["Nome", "Valor (R$)"].map(csvEscape).join(";"));
    for (const f of app.fixedExpenses) {
      rows.push([f.title, formatNumberBRL(f.amount)].map(csvEscape).join(";"));
    }
    rows.push("");

    rows.push("CATEGORIAS");
    rows.push(["Nome", "Limite Mensal (R$)"].map(csvEscape).join(";"));
    for (const c of app.categories) {
      rows.push([c.label, c.monthlyBudgetLimit > 0 ? formatNumberBRL(c.monthlyBudgetLimit) : ""].map(csvEscape).join(";"));
    }
    rows.push("");

    rows.push("RESUMO");
    rows.push(["Renda Mensal", formatNumberBRL(app.monthlyIncome)].map(csvEscape).join(";"));
    rows.push(["Total Gastos Fixos", formatNumberBRL(app.totalFixedExpenses)].map(csvEscape).join(";"));
    rows.push(["Meta", app.goalTitle].map(csvEscape).join(";"));
    rows.push(["Valor Alvo da Meta", formatNumberBRL(app.targetAmount)].map(csvEscape).join(";"));
    rows.push(["Já Guardado", formatNumberBRL(app.currentSaved)].map(csvEscape).join(";"));

    const bom = String.fromCharCode(0xfeff);
    const csvContent = bom + rows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailyflow-planilha-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function isValidBackup(data: unknown): boolean {
    if (typeof data !== "object" || data === null) return false;
    const d = data as Record<string, unknown>;
    return (
      Array.isArray(d.dailyExpenses) &&
      Array.isArray(d.fixedExpenses) &&
      Array.isArray(d.categories) &&
      typeof d.monthlyIncome === "number" &&
      typeof d.monthlyGoalContribution === "number"
    );
  }

  function importBackup(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!isValidBackup(data)) {
          alert("Esse arquivo não parece ser um backup válido do DailyFlow.");
          return;
        }
        if (!confirm("Isso vai substituir todos os dados atuais pelos dados desse backup. Continuar?")) return;
        app.importData(data);
        alert("Backup importado com sucesso!");
      } catch {
        alert("Não foi possível ler esse arquivo. Verifique se é um backup exportado por este app.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="animate-page-in mx-auto flex max-w-md flex-col gap-5 p-4">
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
                <span className="text-sm font-semibold text-primary">{formatCurrency(item.amount)}</span>
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
              className="min-w-0 flex-1 rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={addFixed}
              className="rounded-xl bg-primary/15 px-4 py-2.5 font-bold text-primary transition-transform hover:bg-primary/25 active:scale-95"
            >
              Adicionar
            </button>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-gray-500">Total de gastos fixos: {formatCurrency(app.totalFixedExpenses)}</p>

      <section className="rounded-3xl bg-white/5 p-5">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Backup dos Dados</h2>
        <p className="mb-3 text-xs text-gray-500">
          Seus dados ficam salvos só neste aparelho. Exporte um backup completo pra restaurar depois, ou uma planilha
          pra abrir no Excel e analisar seus gastos.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={exportBackup}
            className="rounded-xl bg-primary/15 px-4 py-2.5 text-center font-bold text-primary hover:bg-primary/25"
          >
            Exportar Backup (.json)
          </button>
          <button
            onClick={exportExcel}
            className="rounded-xl bg-secondary/15 px-4 py-2.5 text-center font-bold text-secondary hover:bg-secondary/25"
          >
            Exportar Planilha (Excel/.csv)
          </button>
          <label className="cursor-pointer rounded-xl bg-white/10 px-4 py-2.5 text-center font-bold text-white hover:bg-white/20">
            Importar Backup
            <input type="file" accept="application/json" onChange={importBackup} className="hidden" />
          </label>
        </div>
      </section>

      <button
        onClick={() => window.dispatchEvent(new Event(SHOW_TUTORIAL_EVENT))}
        className="flex items-center justify-center gap-2 rounded-3xl bg-white/5 px-5 py-3.5 text-center text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10"
      >
        <span className="emoji-tint">❓</span> Ver tutorial de boas-vindas novamente
      </button>
    </div>
  );
}
