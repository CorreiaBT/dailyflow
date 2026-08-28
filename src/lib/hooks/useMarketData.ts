"use client";

import { useCallback, useMemo, useState } from "react";
import { FetchStatus, ProjectionPoint, StockQuote } from "@/lib/types";
import { generateProjection } from "@/lib/engines/projection";
import {
  CDI_CACHE_KEY,
  CDI_MAX_AGE_MS,
  QUOTE_MAX_AGE_MS,
  getCached,
  isExpired,
  quoteCacheKey,
  setCached,
} from "@/lib/marketCache";

export function useMarketData() {
  const [cdiRate, setCdiRate] = useState(10.5);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [status, setStatus] = useState<FetchStatus>({ kind: "idle" });

  const [searchTicker, setSearchTicker] = useState("PETR4");
  const [currentQuote, setCurrentQuote] = useState<StockQuote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<FetchStatus>({ kind: "idle" });

  const [initialCapital, setInitialCapital] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [projectionMonths, setProjectionMonths] = useState(12);

  const projectionPoints: ProjectionPoint[] = useMemo(
    () => generateProjection(initialCapital, monthlyContribution, cdiRate, projectionMonths),
    [initialCapital, monthlyContribution, cdiRate, projectionMonths]
  );

  const loadCDIRate = useCallback(async () => {
    setStatus({ kind: "loading" });

    const cached = getCached<number>(CDI_CACHE_KEY);
    if (cached && !isExpired(cached.timestamp, CDI_MAX_AGE_MS)) {
      setCdiRate(cached.data);
      setIsFromCache(true);
      setLastUpdated(new Date(cached.timestamp));
      setStatus({ kind: "success", isCache: true });
      return;
    }

    try {
      const res = await fetch("/api/market/cdi");
      if (!res.ok) throw new Error((await res.json()).error ?? "Falha ao buscar a taxa CDI.");
      const { rate } = (await res.json()) as { rate: number };

      setCdiRate(rate);
      setIsFromCache(false);
      setLastUpdated(new Date());
      setStatus({ kind: "success", isCache: false });
      setCached(CDI_CACHE_KEY, rate);
    } catch (err) {
      const stale = getCached<number>(CDI_CACHE_KEY);
      if (stale) {
        setCdiRate(stale.data);
        setIsFromCache(true);
        setLastUpdated(new Date(stale.timestamp));
        setStatus({ kind: "success", isCache: true });
      } else {
        setCdiRate(10.5);
        setIsFromCache(true);
        setLastUpdated(new Date());
        setStatus({ kind: "error", message: err instanceof Error ? err.message : "Erro desconhecido." });
      }
    }
  }, []);

  const fetchStockQuote = useCallback(async () => {
    const ticker = searchTicker.trim().toUpperCase();
    if (!ticker) return;

    setQuoteStatus({ kind: "loading" });
    const cacheKey = quoteCacheKey(ticker);

    const cached = getCached<StockQuote>(cacheKey);
    if (cached && !isExpired(cached.timestamp, QUOTE_MAX_AGE_MS)) {
      setCurrentQuote(cached.data);
      setQuoteStatus({ kind: "success", isCache: true });
      return;
    }

    try {
      const res = await fetch(`/api/market/quote?ticker=${encodeURIComponent(ticker)}`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Falha ao buscar a cotação.");
      const { quote } = (await res.json()) as { quote: StockQuote };

      setCurrentQuote(quote);
      setQuoteStatus({ kind: "success", isCache: false });
      setCached(cacheKey, quote);
    } catch (err) {
      const stale = getCached<StockQuote>(cacheKey);
      if (stale) {
        setCurrentQuote(stale.data);
        setQuoteStatus({ kind: "success", isCache: true });
      } else {
        setQuoteStatus({ kind: "error", message: err instanceof Error ? err.message : "Erro desconhecido." });
      }
    }
  }, [searchTicker]);

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Não atualizado";

  const finalProjectedValue = projectionPoints.at(-1)?.totalBalance ?? initialCapital;
  const totalProfit = Math.max(
    0,
    finalProjectedValue - (initialCapital + monthlyContribution * projectionMonths)
  );

  return {
    cdiRate,
    isFromCache,
    lastUpdated,
    formattedLastUpdated,
    status,
    loadCDIRate,

    searchTicker,
    setSearchTicker,
    currentQuote,
    quoteStatus,
    fetchStockQuote,

    initialCapital,
    setInitialCapital,
    monthlyContribution,
    setMonthlyContribution,
    projectionMonths,
    setProjectionMonths,
    projectionPoints,
    finalProjectedValue,
    totalProfit,
  };
}
