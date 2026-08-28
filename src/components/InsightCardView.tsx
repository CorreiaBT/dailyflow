import { AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { InsightCard, InsightSeverity } from "@/lib/types";

const SEVERITY_STYLE: Record<InsightSeverity, { color: string; bg: string; border: string; Icon: typeof AlertTriangle }> = {
  WARNING: { color: "text-[#FC8A80]", bg: "bg-[#FC8A80]/15", border: "border-[#FC8A80]/30", Icon: AlertTriangle },
  INFO: { color: "text-[#95C68F]", bg: "bg-[#95C68F]/15", border: "border-[#95C68F]/30", Icon: TrendingUp },
  SUCCESS: { color: "text-[#31827C]", bg: "bg-[#31827C]/15", border: "border-[#31827C]/30", Icon: CheckCircle2 },
};

export function InsightCardView({ card }: { card: InsightCard }) {
  const { color, bg, border, Icon } = SEVERITY_STYLE[card.severity];

  return (
    <div className={`flex h-full flex-col gap-3 rounded-[20px] border ${border} bg-[#12141a] p-4 shadow-lg`}>
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
