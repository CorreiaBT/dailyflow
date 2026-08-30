"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { formatNumberBRL, parseCurrencyInput } from "@/lib/currency";

const EMOJI_SUGGESTIONS = ["🛒", "🐾", "🎮", "📚", "💇", "🏋️", "🚌", "🎁", "🏠", "👕", "🍺", "📱"];

export function ManageCategoriesModal({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("🛒");
  const [budget, setBudget] = useState("");

  function handleAdd() {
    if (label.trim() && emoji.trim()) {
      app.addCategory(label.trim(), emoji.trim(), parseCurrencyInput(budget) ?? 0);
      setLabel("");
      setBudget("");
    }
  }

  function handleRemove(id: string, categoryLabel: string) {
    // Gastos já lançados nessa categoria não somem, mas passam a aparecer como
    // "Outros" no histórico — melhor avisar antes de excluir.
    const used = app.dailyExpenses.filter((e) => e.category === id).length;
    if (used > 0) {
      const plural = used === 1 ? "1 gasto lançado" : `${used} gastos lançados`;
      const ok = confirm(
        `A categoria "${categoryLabel}" tem ${plural}. Se excluir, esses lançamentos continuam no histórico, mas passam a aparecer como "Outros". Excluir mesmo assim?`
      );
      if (!ok) return;
    }
    app.removeCategory(id);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="animate-sheet-in w-full max-w-md rounded-t-3xl bg-surface p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-white">Gerenciar Categorias</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">
            Fechar
          </button>
        </div>

        <div className="no-scrollbar mb-2 flex max-h-56 flex-col gap-2 overflow-y-auto">
          {app.categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="emoji-tint text-lg">{cat.emoji}</span>
                <span className="text-sm text-white">{cat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1.5">
                  <span className="text-[10px] text-gray-500">R$</span>
                  <input
                    key={`${cat.id}-${cat.monthlyBudgetLimit}`}
                    defaultValue={cat.monthlyBudgetLimit > 0 ? formatNumberBRL(cat.monthlyBudgetLimit) : ""}
                    onBlur={(e) => app.setCategoryBudget(cat.id, parseCurrencyInput(e.target.value) ?? 0)}
                    inputMode="decimal"
                    placeholder="sem limite"
                    className="w-20 bg-transparent text-right text-xs text-white outline-none placeholder:text-gray-600"
                  />
                </div>
                <button
                  onClick={() => handleRemove(cat.id, cat.label)}
                  className="text-gray-600 hover:text-danger"
                  aria-label={`Excluir categoria ${cat.label}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {app.categories.length === 0 && (
            <p className="text-sm text-gray-500">Nenhuma categoria cadastrada ainda.</p>
          )}
        </div>
        <p className="mb-5 text-[11px] text-gray-500">
          Defina um limite mensal opcional por categoria pra receber alertas quando o ritmo de gasto passar do seguro.
        </p>

        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Nova categoria</p>
        <div className="mb-3 flex gap-2">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-16 rounded-xl bg-black/40 text-center text-lg text-white outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nome (ex: Pet)"
            className="min-w-0 flex-1 rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          inputMode="decimal"
          placeholder="Limite mensal R$ (opcional)"
          className="mb-3 w-full rounded-xl bg-black/40 px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-primary/50"
        />

        <div className="mb-5 flex flex-wrap gap-2">
          {EMOJI_SUGGESTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`emoji-tint rounded-lg px-2 py-1 text-lg ${emoji === e ? "bg-primary/20" : "bg-white/5"}`}
            >
              {e}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={!label.trim() || !emoji.trim()}
          className="w-full rounded-2xl bg-primary py-3.5 font-semibold text-black hover:brightness-110 disabled:opacity-40"
        >
          Adicionar Categoria
        </button>
      </div>
    </div>
  );
}
