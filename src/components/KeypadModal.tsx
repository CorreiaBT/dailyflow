"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ExpenseCategoryDef } from "@/lib/categories";

const KEY_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [",", "0", "⌫"],
];

const MAX_INTEGER_DIGITS = 7;

/** Converte o texto digitado (padrão brasileiro, com vírgula) em número. */
function parseAmount(text: string): number {
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}

/** Exibe o valor digitado já com separador de milhar, sem afetar o que está sendo digitado. */
function formatTyped(text: string): string {
  const [integerPart, decimalPart] = text.split(",");
  const withThousands = Number(integerPart || "0").toLocaleString("pt-BR");
  return decimalPart !== undefined ? `${withThousands},${decimalPart}` : withThousands;
}

interface KeypadModalProps {
  categories: ExpenseCategoryDef[];
  initialCategoryId?: string;
  onClose: () => void;
  onConfirm: (amount: number, categoryId: string) => void;
}

export function KeypadModal({ categories, initialCategoryId, onClose, onConfirm }: KeypadModalProps) {
  const [amountString, setAmountString] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId ?? categories[0]?.id ?? "");

  const amount = parseAmount(amountString);
  const canConfirm = amount > 0 && selectedCategory !== "";

  function handleKey(key: string) {
    setAmountString((prev) => {
      if (key === "⌫") return prev.length > 1 ? prev.slice(0, -1) : "0";

      if (key === ",") return prev.includes(",") ? prev : `${prev},`;

      const [integerPart, decimalPart] = prev.split(",");
      // No máximo 2 casas decimais, e um teto de dígitos para o valor não
      // estourar visualmente o campo.
      if (decimalPart !== undefined) {
        return decimalPart.length >= 2 ? prev : prev + key;
      }
      if (prev === "0") return key;
      return integerPart.length >= MAX_INTEGER_DIGITS ? prev : prev + key;
    });
  }

  function confirm() {
    if (!canConfirm) return;
    onConfirm(amount, selectedCategory);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="animate-sheet-in w-full max-w-md rounded-t-3xl bg-surface p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-white">Novo Gasto Diário</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">
            Cancelar
          </button>
        </div>

        <div className="mb-5 rounded-2xl bg-black/40 py-6 text-center">
          <span className="text-4xl font-bold text-white">R${formatTyped(amountString)}</span>
        </div>

        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap ${
                selectedCategory === cat.id ? "bg-primary text-black" : "bg-white/10 text-white"
              }`}
            >
              <span className="emoji-tint">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {KEY_ROWS.flat().map((key, i) => (
            <button
              key={`${key}-${i}`}
              onClick={() => handleKey(key)}
              aria-label={key === "⌫" ? "Apagar último dígito" : key === "," ? "Vírgula decimal" : key}
              className={`rounded-2xl bg-white/[0.08] py-4 text-xl font-bold transition-transform active:scale-90 ${
                key === "⌫" ? "text-danger" : "text-white"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <button
          onClick={confirm}
          disabled={!canConfirm}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-black hover:brightness-110 disabled:opacity-40"
        >
          <Check size={18} strokeWidth={2.5} />
          Confirmar Gasto
        </button>
      </div>
    </div>
  );
}
