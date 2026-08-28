import { ProjectionPoint } from "@/lib/types";

/**
 * Gera a série temporal de projeção de investimento mês a mês com juros compostos.
 * i_mensal = (1 + i_anual)^(1/12) - 1
 */
export function generateProjection(
  initialCapital: number,
  monthlyContribution: number,
  annualInterestRate: number,
  totalMonths: number
): ProjectionPoint[] {
  if (totalMonths <= 0) return [];

  const annualRateDecimal = Math.max(0, annualInterestRate / 100);
  const monthlyRate = Math.pow(1 + annualRateDecimal, 1 / 12) - 1;

  const points: ProjectionPoint[] = [];
  let currentBalance = initialCapital;
  let cumulativePrincipal = initialCapital;

  points.push({
    month: 0,
    totalBalance: currentBalance,
    principalInvested: cumulativePrincipal,
    interestEarned: 0,
  });

  for (let m = 1; m <= totalMonths; m++) {
    const monthlyInterest = currentBalance * monthlyRate;
    currentBalance += monthlyInterest + monthlyContribution;
    cumulativePrincipal += monthlyContribution;
    const totalInterest = Math.max(0, currentBalance - cumulativePrincipal);

    points.push({
      month: m,
      totalBalance: currentBalance,
      principalInvested: cumulativePrincipal,
      interestEarned: totalInterest,
    });
  }

  return points;
}

/** Calcula quantos meses faltam e o rendimento estimado de juros até atingir a meta. */
export function calculateTimeAndYield(
  currentSaved: number,
  targetAmount: number,
  monthlySavings: number,
  annualRatePct: number
): { months: number; estimatedYield: number } {
  const remainingTarget = Math.max(0, targetAmount - currentSaved);
  if (remainingTarget <= 0) return { months: 0, estimatedYield: 0 };

  const actualSavings = Math.max(50, monthlySavings);
  const annualRateDecimal = annualRatePct / 100;
  const monthlyRate = Math.pow(1 + annualRateDecimal, 1 / 12) - 1;

  let months = 0;
  let balance = currentSaved;
  let totalInvested = currentSaved;

  while (balance < targetAmount && months < 360) {
    const interest = balance * monthlyRate;
    balance += interest + actualSavings;
    totalInvested += actualSavings;
    months += 1;
  }

  const estimatedYield = Math.max(0, balance - totalInvested);
  return { months, estimatedYield };
}
