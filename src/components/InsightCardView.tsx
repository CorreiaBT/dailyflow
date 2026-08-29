import { AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { InsightCard, InsightSeverity } from "@/lib/types";

const SEVERITY_STYLE: Record<InsightSeverity, { color: string; bg: string; border: string; Icon: typeof AlertTriangle }> = {
  WARNING: { color: "text-danger", bg: "bg-danger/15", border: "border-danger/30", Icon: AlertTriangle },
  INFO: { color: "text-secondary", bg: "bg-secondary/15", border: "border-secondary/30", Icon: TrendingUp },
  SUCCESS: { color: "text-primary", bg: "bg-primary/15", border: "border-primary/30", Icon: CheckCircle2 },
};

export function InsightCardView({ card }: { card: InsightCard }) {
  const { color, bg, border, Icon } = SEVERITY_STYLE[card.severity];

  return (
    <div className={`flex h-full flex-col gap-3 rounded-[20px] border ${border} bg-surface p-4 shadow-lg`}>
      <div className="flex items-start gap-2">
        <div className={`rounded-full p-2 ${bg}`}>
          <Icon size={16} className={color} strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight text-white">{card.title}</p>
          {card.categoryName && (
            <p className="text-[9px] font-bold tracking-wide text-gray-400">{card.categoryName.toUpperCase()}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${bg} ${color}`}>{card.severity}</span>
      </div>

      <p className="text-[13px] leading-relaxed text-gray-400">{card.message}</p>

      {card.highlightedValue && (
        <div className={`inline-flex w-fit items-center gap-1 rounded-lg px-2.5 py-1.5 ${bg}`}>
          <span className="text-[11px] font-medium text-gray-400">Destaque:</span>
          <span className={`text-sm font-bold ${color}`}>{card.highlightedValue}</span>
        </div>
      )}
    </div>
  );
}
