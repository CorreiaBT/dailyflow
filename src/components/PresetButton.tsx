interface PresetButtonProps {
  emoji: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
}

export function PresetButton({ emoji, title, subtitle, onClick }: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 px-2 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95"
    >
      <span className="emoji-tint text-2xl">{emoji}</span>
      <span className="text-xs font-semibold text-white">{title}</span>
      {subtitle && <span className="text-[10px] text-gray-400">{subtitle}</span>}
    </button>
  );
}
