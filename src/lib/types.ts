export type InvestmentAssetType = "cdb" | "ipca" | "fiis" | "stocks";

export interface AssetInfo {
  id: InvestmentAssetType;
  label: string;
  emoji: string;
  annualRatePct: number;
}

export const INVESTMENT_ASSETS: Record<InvestmentAssetType, AssetInfo> = {
  cdb: { id: "cdb", label: "CDB 100% CDI", emoji: "🛡️", annualRatePct: 10.5 },
  ipca: { id: "ipca", label: "Tesouro IPCA+", emoji: "📈", annualRatePct: 12.2 },
  fiis: { id: "fiis", label: "Fundos Imobiliários", emoji: "🏢", annualRatePct: 11.2 },
  stocks: { id: "stocks", label: "Ações B3", emoji: "🚀", annualRatePct: 14.5 },
};

export const ASSET_ORDER: InvestmentAssetType[] = ["cdb", "ipca", "fiis", "stocks"];

export interface DailyExpense {
  id: string;
  amount: number;
  category: string;
  emoji: string;
  note?: string;
  date: string;
}

export interface FixedExpense {
  id: string;
  title: string;
  amount: number;
  dueDate: number;
}

export type InsightSeverity = "WARNING" | "INFO" | "SUCCESS";

export interface InsightCard {
  id: string;
  title: string;
  message: string;
  highlightedValue?: string;
  severity: InsightSeverity;
  categoryName?: string;
}

export interface ProjectionPoint {
  month: number;
  totalBalance: number;
  principalInvested: number;
  interestEarned: number;
}

export type FetchStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; isCache: boolean }
  | { kind: "error"; message: string };
