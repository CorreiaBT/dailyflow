"use client";

import { useCallback, useState } from "react";
import { FetchStatus } from "@/lib/types";
import { CDI_CACHE_KEY, CDI_MAX_AGE_MS, getCached, isExpired, setCached } from "@/lib/marketCache";

export function useMarketData() {
  const [cdiRate, setCdiRate] = useState(10.5);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [status, setStatus] = useState<FetchStatus>({ kind: "idle" });

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

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Não atualizado";

  return {
    cdiRate,
    isFromCache,
    lastUpdated,
    formattedLastUpdated,
    status,
    loadCDIRate,
  };
}
