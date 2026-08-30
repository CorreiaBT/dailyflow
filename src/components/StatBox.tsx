interface StatBoxProps {
  title: string;
  value: string;
  isWarning?: boolean;
}

export function StatBox({ title, value, isWarning }: StatBoxProps) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl bg-white/5 p-3 transition-colors hover:bg-white/[0.08]">
      <p className="truncate text-[10px] font-bold uppercase tracking-wide text-gray-400">{title}</p>
      <p
        key={value}
        className={`animate-value-pulse mt-1 break-words text-sm font-bold ${isWarning ? "text-danger" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
