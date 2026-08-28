"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { DailyExpense, FixedExpense, InvestmentAssetType } from "@/lib/types";
import { categoryById } from "@/lib/categories";

const STORAGE_KEY = "dailyflow_state_v1";

interface PersistedState {
  monthlyIncome: number;
  monthlyGoalContribution: number;
  fixedExpenses: FixedExpense[];
  dailyExpenses: DailyExpense[];
  goalTitle: string;
  targetAmount: number;
  currentSaved: number;
  selectedAsset: InvestmentAssetType;
}

// IDs de seed fixos (não aleatórios) para que o estado inicial seja idêntico
// entre a renderização no servidor e a hidratação no cliente.
const defaultState: PersistedState = {
  monthlyIncome: 4500,
  monthlyGoalContribution: 500,
  fixedExpenses: [
    { id: "seed-fixed-1", title: "Aluguel & Condomínio", amount: 1600, dueDate: 1 },
    { id: "seed-fixed-2", title: "Contas (Luz, Net, Água)", amount: 450, dueDate: 1 },
    { id: "seed-fixed-3", title: "Assinaturas & Cartão Fixo", amount: 350, dueDate: 1 },
  ],
  dailyExpenses: [] as DailyExpense[],
  goalTitle: "Reserva de Emergência",
  targetAmount: 50000,
  currentSaved: 5000,
  selectedAsset: "cdb",
};

interface AppContextValue extends PersistedState {
  setMonthlyIncome: (v: number) => void;
  setMonthlyGoalContribution: (v: number) => void;
  addFixedExpense: (title: string, amount: number) => void;
  removeFixedExpense: (id: string) => void;
  addDailyExpense: (amount: number, categoryId: string, note?: string) => void;
  removeDailyExpense: (id: string) => void;
  setGoal: (goal: { title: string; targetAmount: number; currentSaved: number }) => void;
  setSelectedAsset: (asset: InvestmentAssetType) => void;

  totalFixedExpenses: number;
  monthlyFreeBudget: number;
  idealDailyAllowance: number;
  todaySpentTotal: number;
  remainingTodayAllowance: number;
  todaySpentRatio: number;
}

const AppContext = createContext<AppContextValue | null>(null);

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratação única a partir do localStorage: precisa rodar após o mount
    // (client-only) para que a renderização do servidor e a primeira
    // renderização do cliente fiquem idênticas e não gerem mismatch.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const totalFixedExpenses = useMemo(
    () => state.fixedExpenses.reduce((sum, f) => sum + f.amount, 0),
    [state.fixedExpenses]
  );

  const monthlyFreeBudget = Math.max(
    0,
    state.monthlyIncome - totalFixedExpenses - state.monthlyGoalContribution
  );

  const idealDailyAllowance = monthlyFreeBudget / daysInCurrentMonth();

  const todaySpentTotal = useMemo(() => {
    const today = new Date();
    return state.dailyExpenses
      .filter((e) => isSameDay(new Date(e.date), today))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [state.dailyExpenses]);

  const remainingTodayAllowance = idealDailyAllowance - todaySpentTotal;
  const todaySpentRatio =
    idealDailyAllowance > 0 ? Math.min(1, todaySpentTotal / idealDailyAllowance) : 1;

  const value: AppContextValue = {
    ...state,
    totalFixedExpenses,
    monthlyFreeBudget,
    idealDailyAllowance,
    todaySpentTotal,
    remainingTodayAllowance,
    todaySpentRatio,

    setMonthlyIncome: (v) => setState((s) => ({ ...s, monthlyIncome: v })),
    setMonthlyGoalContribution: (v) => setState((s) => ({ ...s, monthlyGoalContribution: v })),

    addFixedExpense: (title, amount) =>
      setState((s) => ({
        ...s,
        fixedExpenses: [...s.fixedExpenses, { id: crypto.randomUUID(), title, amount, dueDate: 1 }],
      })),

    removeFixedExpense: (id) =>
      setState((s) => ({ ...s, fixedExpenses: s.fixedExpenses.filter((f) => f.id !== id) })),

    addDailyExpense: (amount, categoryId, note) =>
      setState((s) => ({
        ...s,
        dailyExpenses: [
          {
            id: crypto.randomUUID(),
            amount,
            category: categoryId,
            emoji: categoryById(categoryId).emoji,
            note,
            date: new Date().toISOString(),
          },
          ...s.dailyExpenses,
        ],
      })),

    removeDailyExpense: (id) =>
      setState((s) => ({ ...s, dailyExpenses: s.dailyExpenses.filter((e) => e.id !== id) })),

    setGoal: ({ title, targetAmount, currentSaved }) =>
      setState((s) => ({ ...s, goalTitle: title, targetAmount, currentSaved })),

    setSelectedAsset: (asset) => setState((s) => ({ ...s, selectedAsset: asset })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
