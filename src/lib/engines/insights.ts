import { DailyExpense, InsightCard, InsightSeverity } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

const SEVERITY_PRIORITY: Record<InsightSeverity, number> = {
  WARNING: 3,
  INFO: 2,
  SUCCESS: 1,
};

function fmtCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Motor de cálculo determinístico dos Insights Financeiros.
 * Porta direta da lógica do InsightEngine.swift original (anomalia MoM,
 * ritmo de gastos e projeção de investimento), operando sobre os
 * lançamentos diários já salvos localmente.
 */
export function generateInsights(
  expenses: DailyExpense[],
  income: number,
  fixedExpensesTotal: number,
  annualCDIRate = 0.105,
  currentDate = new Date()
): InsightCard[] {
  const cards: InsightCard[] = [
    ...calculateMoMAnomalies(expenses, currentDate),
    ...calculateBudgetPacing(expenses, currentDate),
  ];

  const investmentCard = calculateInvestmentProjection(
    expenses,
    income,
    fixedExpensesTotal,
    annualCDIRate,
    currentDate
  );
  if (investmentCard) cards.push(investmentCard);

  return cards
    .sort((a, b) => SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity])
    .slice(0, 3);
}

// 1. Anomalia MoM (dia 1 até d vs mesmo período do mês anterior)
function calculateMoMAnomalies(expenses: DailyExpense[], currentDate: Date): InsightCard[] {
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();

  const cards: InsightCard[] = [];
  const flexibleCategories = EXPENSE_CATEGORIES.filter((c) => c.isFlexible);

  for (const category of flexibleCategories) {
    const currentPeriodSpend = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          e.category === category.id &&
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth &&
          d.getDate() <= currentDay
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const prevPeriodSpend = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          e.category === category.id &&
          d.getFullYear() === prevYear &&
          d.getMonth() === prevMonth &&
          d.getDate() <= currentDay
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);

    if (prevPeriodSpend > 0) {
      const variation = ((currentPeriodSpend - prevPeriodSpend) / prevPeriodSpend) * 100;
      if (variation >= 20) {
        const formattedVariation = `+${variation.toFixed(0)}%`;
        const formattedDiff = fmtCurrency(currentPeriodSpend - prevPeriodSpend);

        cards.push({
          id: crypto.randomUUID(),
          title: `Alerta de Anomalia: ${category.label}`,
          message: `Você gastou ${formattedVariation} a mais do dia 1 ao dia ${currentDay} em comparação ao mesmo período do mês passado (${formattedDiff} adicionais).`,
          highlightedValue: formattedVariation,
          severity: "WARNING",
          categoryName: category.label,
        });
      }
    }
  }

  return cards;
}

// 2. Ritmo de gastos & metas (budget pacing com média móvel de 7 dias)
function calculateBudgetPacing(expenses: DailyExpense[], currentDate: Date): InsightCard[] {
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalDays = daysInMonth(currentDate);
  const daysRemaining = Math.max(1, totalDays - currentDay + 1);

  const sevenDaysAgo = new Date(currentDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const cards: InsightCard[] = [];

  for (const category of EXPENSE_CATEGORIES.filter((c) => c.monthlyBudgetLimit > 0)) {
    const accumulatedSpend = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return e.category === category.id && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const remainingBudget = Math.max(0, category.monthlyBudgetLimit - accumulatedSpend);
    const safeDailyLimit = remainingBudget / daysRemaining;

    const spendLast7Days = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return e.category === category.id && d >= sevenDaysAgo && d <= currentDate;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const movingAvg7Days = spendLast7Days / 7;

    if (movingAvg7Days > safeDailyLimit && safeDailyLimit > 0) {
      const dailyCutSuggestion = movingAvg7Days - safeDailyLimit;
      const formattedCut = fmtCurrency(dailyCutSuggestion);
      const formattedLimit = fmtCurrency(safeDailyLimit);

      cards.push({
        id: crypto.randomUUID(),
        title: `Ritmo Acima da Meta: ${category.label}`,
        message: `Sua média móvel nos últimos 7 dias (R$ ${movingAvg7Days.toFixed(2)}/dia) excede seu teto seguro de ${formattedLimit}/dia. Reduza cerca de ${formattedCut}/dia para não estourar o mês.`,
        highlightedValue: `Corte -${formattedCut}/dia`,
        severity: "WARNING",
        categoryName: category.label,
      });
    }
  }

  return cards;
}

// 3. Projeção de investimento (renda fixa: M = P * (1 + i)^n)
function calculateInvestmentProjection(
  expenses: DailyExpense[],
  income: number,
  fixedExpensesTotal: number,
  annualCDIRate: number,
  currentDate: Date
): InsightCard | null {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalSpentMonth = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingMonthlyFreeBalance = income - fixedExpensesTotal - totalSpentMonth;
  if (remainingMonthlyFreeBalance <= 100) return null;

  const monthlyRate = Math.pow(1 + annualCDIRate, 1 / 12) - 1;
  const months = 12;

  const principal = remainingMonthlyFreeBalance;
  const futureValue = principal * Math.pow(1 + monthlyRate, months);
  const profit = futureValue - principal;

  return {
    id: crypto.randomUUID(),
    title: "Oportunidade de Investimento",
    message: `Se você aportar o saldo livre atual (${fmtCurrency(principal)}) em 100% do CDI hoje, renderá cerca de +${fmtCurrency(
      profit
    )} em 12 meses (totalizando ${fmtCurrency(futureValue)}).`,
    highlightedValue: `+${fmtCurrency(profit)}`,
    severity: "INFO",
  };
}
