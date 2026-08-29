import { AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { InsightCard, InsightSeverity } from "@/lib/types";

const SEVERITY_STYLE: Record<InsightSeverity, { color: string; bg: string; border: string; Icon: typeof AlertTriangle }> = {
  WARNING: { color: "text-danger", bg: "bg-danger/15", border: "border-danger/30", Icon: AlertTriangle },
  INFO: { color: "text-secondary", bg: "bg-secondary/15", border: "border-secondary/30", Icon: TrendingUp },
  SUCCESS: { color: "text-primary", bg: "bg-primary/15", border: "border-primary/30", Icon: CheckCircle2 },
};

export function InsightCardView({ card }: { card: InsightCard }) {
  // A severidade pode vir da IA; um valor fora do esperado quebraria a página
  // inteira na renderização, então cai no estilo neutro.
  const { color, bg, border, Icon } = SEVERITY_STYLE[card.severity] ?? SEVERITY_STYLE.INFO;

  return (
    <div className={`flex flex-col gap-2 rounded-[20px] border ${border} bg-surface p-4 shadow-lg`}>
      <div className="flex items-center gap-2">
        <div className={`rounded-full p-1.5 ${bg}`}>
          <Icon size={14} className={color} strokeWidth={2.5} />
        </div>
        <p className="text-[15px] font-bold leading-tight text-white">{card.title}</p>
      </div>
      <p className="text-[13px] leading-relaxed text-gray-400">{card.message}</p>
    </div>
  );
}
