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
import { categoryById, DEFAULT_EXPENSE_CATEGORIES, ExpenseCategoryDef } from "@/lib/categories";
import { newId } from "@/lib/id";

const STORAGE_KEY = "dailyflow_state_v1";

interface PersistedState {
  monthlyIncome: number;
  monthlyGoalContribution: number;
  fixedExpenses: FixedExpense[];
  dailyExpenses: DailyExpense[];
  categories: ExpenseCategoryDef[];
  goalTitle: string;
  targetAmount: number;
  currentSaved: number;
  selectedAsset: InvestmentAssetType;
}

// IDs de seed fixos (não aleatórios) para que o estado inicial seja idêntico
// entre a renderização no servidor e a hidratação no cliente.
const defaultState: PersistedState = {
  monthlyIncome: 0,
  monthlyGoalContribution: 0,
  fixedExpenses: [],
  dailyExpenses: [] as DailyExpense[],
  categories: DEFAULT_EXPENSE_CATEGORIES,
  goalTitle: "Minha Meta",
  targetAmount: 0,
  currentSaved: 0,
  selectedAsset: "cdb",
};

interface AppContextValue extends PersistedState {
  setMonthlyIncome: (v: number) => void;
  setMonthlyGoalContribution: (v: number) => void;
  addFixedExpense: (title: string, amount: number) => void;
  removeFixedExpense: (id: string) => void;
  addDailyExpense: (amount: number, categoryId: string, note?: string) => void;
  removeDailyExpense: (id: string) => void;
  addCategory: (label: string, emoji: string, monthlyBudgetLimit?: number) => void;
  removeCategory: (id: string) => void;
  setCategoryBudget: (id: string, limit: number) => void;
  setGoal: (goal: { title: string; targetAmount: number; currentSaved: number }) => void;
  setSelectedAsset: (asset: InvestmentAssetType) => void;
  importData: (data: Partial<PersistedState>) => void;

  totalFixedExpenses: number;
  monthlyFreeBudget: number;
  idealDailyAllowance: number;
  todaySpentTotal: number;
  remainingTodayAllowance: number;
  todaySpentRatio: number;

  /**
   * false até o estado salvo ser lido do localStorage. Efeitos de filhos rodam
   * antes dos do provider, então quem consome os dados para chamar uma API
   * (ex: o consultor de IA) precisa esperar isso virar true — senão analisaria
   * os valores iniciais em vez dos dados reais do usuário.
   */
  hydrated: boolean;
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
      // Faz merge com o defaultState para preencher campos novos (ex:
      // categories) que ainda não existiam num estado salvo mais antigo.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw) }));
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
    hydrated,

    setMonthlyIncome: (v) => setState((s) => ({ ...s, monthlyIncome: v })),
    setMonthlyGoalContribution: (v) => setState((s) => ({ ...s, monthlyGoalContribution: v })),

    addFixedExpense: (title, amount) =>
      setState((s) => ({
        ...s,
        fixedExpenses: [...s.fixedExpenses, { id: newId(), title, amount, dueDate: 1 }],
      })),

    removeFixedExpense: (id) =>
      setState((s) => ({ ...s, fixedExpenses: s.fixedExpenses.filter((f) => f.id !== id) })),

    addDailyExpense: (amount, categoryId, note) =>
      setState((s) => ({
        ...s,
        dailyExpenses: [
          {
            id: newId(),
            amount,
            category: categoryId,
            emoji: categoryById(s.categories, categoryId).emoji,
            note,
            date: new Date().toISOString(),
          },
          ...s.dailyExpenses,
        ],
      })),

    removeDailyExpense: (id) =>
      setState((s) => ({ ...s, dailyExpenses: s.dailyExpenses.filter((e) => e.id !== id) })),

    addCategory: (label, emoji, monthlyBudgetLimit = 0) =>
      setState((s) => ({
        ...s,
        categories: [
          ...s.categories,
          { id: newId(), label, emoji, isFlexible: true, monthlyBudgetLimit },
        ],
      })),

    removeCategory: (id) =>
      setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) })),

    setCategoryBudget: (id, limit) =>
      setState((s) => ({
        ...s,
        categories: s.categories.map((c) =>
          c.id === id ? { ...c, monthlyBudgetLimit: Math.max(0, limit) } : c
        ),
      })),

    setGoal: ({ title, targetAmount, currentSaved }) =>
      setState((s) => ({ ...s, goalTitle: title, targetAmount, currentSaved })),

    setSelectedAsset: (asset) => setState((s) => ({ ...s, selectedAsset: asset })),

    importData: (data) => setState((s) => ({ ...s, ...data })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
