export interface ExpenseCategoryDef {
  id: string;
  label: string;
  emoji: string;
  isFlexible: boolean;
  monthlyBudgetLimit: number;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  { id: "coffee", label: "Café / Snack", emoji: "☕", isFlexible: true, monthlyBudgetLimit: 150 },
  { id: "food", label: "Alimentação", emoji: "🍔", isFlexible: true, monthlyBudgetLimit: 600 },
  { id: "transport", label: "Transporte", emoji: "🚗", isFlexible: true, monthlyBudgetLimit: 300 },
  { id: "emergency", label: "Farmácia", emoji: "💊", isFlexible: false, monthlyBudgetLimit: 0 },
  { id: "leisure", label: "Lazer", emoji: "🎟️", isFlexible: true, monthlyBudgetLimit: 400 },
  { id: "other", label: "Outros", emoji: "🛍️", isFlexible: true, monthlyBudgetLimit: 0 },
];

export function categoryById(id: string): ExpenseCategoryDef {
  return EXPENSE_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}
