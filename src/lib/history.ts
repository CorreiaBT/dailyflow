import { DailyExpense } from "@/lib/types";
import { categoryById, ExpenseCategoryDef } from "@/lib/categories";

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** Chave de mês no formato "AAAA-MM", usada para agrupar e navegar entre meses. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Retorna a chave do mês `delta` meses antes/depois de `key` (delta pode ser negativo). */
export function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split("-").map(Number);
  return monthKey(new Date(year, month - 1 + delta, 1));
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

export function expensesInMonth(expenses: DailyExpense[], key: string): DailyExpense[] {
  return expenses.filter((e) => monthKey(new Date(e.date)) === key);
}

export interface MonthTotal {
  key: string;
  shortLabel: string;
  total: number;
}

/** Total gasto (variável) em cada um dos últimos `monthsBack` meses, do mais antigo ao mais recente. */
export function monthlyTotals(
  expenses: DailyExpense[],
  monthsBack: number,
  referenceDate = new Date()
): MonthTotal[] {
  const baseKey = monthKey(referenceDate);
  const result: MonthTotal[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const key = shiftMonth(baseKey, -i);
    const total = expensesInMonth(expenses, key).reduce((sum, e) => sum + e.amount, 0);
    result.push({ key, shortLabel: formatMonthLabel(key).slice(0, 3), total });
  }
  return result;
}

export interface CategoryTotal {
  categoryId: string;
  label: string;
  emoji: string;
  total: number;
  ratio: number;
}

/**
 * Agrupa os gastos (já filtrados por mês) por categoria e ordena do maior para o menor.
 * Gastos fixos não entram aqui pois vivem numa lista separada (FixedExpense).
 */
export function categoryBreakdown(
  expenses: DailyExpense[],
  categories: ExpenseCategoryDef[]
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }

  const monthTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  return Array.from(totals.entries())
    .map(([categoryId, total]) => {
      const category = categoryById(categories, categoryId);
      return {
        categoryId,
        label: category.label,
        emoji: category.emoji,
        total,
        ratio: monthTotal > 0 ? total / monthTotal : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}
