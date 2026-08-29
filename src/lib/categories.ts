export interface ExpenseCategoryDef {
  id: string;
  label: string;
  emoji: string;
  isFlexible: boolean;
  monthlyBudgetLimit: number;
}

/** Conjunto inicial de categorias — usado apenas para semear o estado na primeira execução. */
export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  { id: "coffee", label: "Café / Snack", emoji: "☕", isFlexible: true, monthlyBudgetLimit: 150 },
  { id: "food", label: "Alimentação", emoji: "🍔", isFlexible: true, monthlyBudgetLimit: 600 },
  { id: "transport", label: "Transporte", emoji: "🚗", isFlexible: true, monthlyBudgetLimit: 300 },
  { id: "emergency", label: "Farmácia", emoji: "💊", isFlexible: false, monthlyBudgetLimit: 0 },
  { id: "leisure", label: "Lazer", emoji: "🎟️", isFlexible: true, monthlyBudgetLimit: 400 },
];

const FALLBACK_CATEGORY: ExpenseCategoryDef = {
  id: "other",
  label: "Outros",
  emoji: "🛍️",
  isFlexible: true,
  monthlyBudgetLimit: 0,
};

export function categoryById(categories: ExpenseCategoryDef[], id: string): ExpenseCategoryDef {
  return categories.find((c) => c.id === id) ?? FALLBACK_CATEGORY;
}
