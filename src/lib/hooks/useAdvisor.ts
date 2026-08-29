"use client";

import { useCallback, useState } from "react";
import { InsightCard, InsightSeverity } from "@/lib/types";
import { getCached, isExpired, setCached } from "@/lib/marketCache";
import { newId } from "@/lib/id";

const ADVISOR_CACHE_KEY = "advisor_cache_tips";
const ADVISOR_CACHE_MAX_AGE_MS = 12 * 3600 * 1000; // 12 horas

export type AdvisorStatus = "idle" | "loading" | "success" | "unavailable" | "error";

interface AdvisorGoal {
  title: string;
  targetAmount: number;
  currentSaved: number;
  assetLabel: string;
  annualRatePct: number;
}

export interface AdvisorInput {
  monthlyIncome: number;
  totalFixedExpenses: number;
  monthlyFreeBudget: number;
  monthlyGoalContribution: number;
  todaySpentTotal: number;
  idealDailyAllowance: number;
  cdiRate: number;
  goal: AdvisorGoal;
  categoryBreakdown: { label: string; total: number }[];
}

interface RawTip {
  title: string;
  message: string;
  severity: InsightSeverity;
  highlightedValue?: string;
}

function toInsightCards(tips: RawTip[]): InsightCard[] {
  return tips.map((t) => ({
    id: newId(),
    title: t.title,
    message: t.message,
    severity: t.severity,
    highlightedValue: t.highlightedValue,
  }));
}

export function useAdvisor() {
  const [tips, setTips] = useState<InsightCard[] | null>(null);
  const [status, setStatus] = useState<AdvisorStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTips = useCallback(async (input: AdvisorInput, force = false) => {
    if (!force) {
      const cached = getCached<RawTip[]>(ADVISOR_CACHE_KEY);
      if (cached && !isExpired(cached.timestamp, ADVISOR_CACHE_MAX_AGE_MS)) {
        setTips(toInsightCards(cached.data));
        setStatus("success");
        return;
      }
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (res.status === 501) {
        setStatus("unavailable");
        return;
      }

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao consultar o assistente.");

      const rawTips: RawTip[] = body.tips ?? [];
      setCached(ADVISOR_CACHE_KEY, rawTips);
      setTips(toInsightCards(rawTips));
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  }, []);

  return { tips, status, errorMessage, fetchTips };
}
