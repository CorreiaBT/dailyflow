"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

const KEY_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["00", "0", "⌫"],
];

interface KeypadModalProps {
  onClose: () => void;
  onConfirm: (amount: number, categoryId: string) => void;
}

export function KeypadModal({ onClose, onConfirm }: KeypadModalProps) {
  const [amountString, setAmountString] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].id);

  function handleKey(key: string) {
    if (key === "⌫") {
      setAmountString((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else {
      setAmountString((prev) => (prev === "0" ? key : prev + key));
    }
  }

  function confirm() {
    const value = Number(amountString);
    if (value > 0) {
      onConfirm(value, selectedCategory);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-[#14161c] p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-white">Novo Gasto Diário</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">
            Cancelar
          </button>
        </div>

        <div className="mb-5 rounded-2xl bg-black/40 py-6 text-center">
          <span className="text-4xl font-bold text-purple-400">R$ {amountString}</span>
        </div>

        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap ${
                selectedCategory === cat.id ? "bg-purple-600 text-white" : "bg-white/10 text-white"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {KEY_ROWS.flat().map((key, i) => (
            <button
              key={`${key}-${i}`}
              onClick={() => handleKey(key)}
              className={`rounded-2xl bg-white/[0.08] py-4 text-xl font-bold ${
                key === "⌫" ? "text-red-400" : "text-white"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <button
          onClick={confirm}
          className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-cyan-500 py-3.5 font-semibold text-white"
        >
          ⚡ Confirmar Gasto
        </button>
      </div>
    </div>
  );
}
