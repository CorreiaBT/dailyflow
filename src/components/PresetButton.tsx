interface PresetButtonProps {
  emoji: string;
  title: string;
  price: string;
  onClick: () => void;
}

export function PresetButton({ emoji, title, price, onClick }: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 px-2 py-4 text-center transition-colors hover:bg-white/10 active:scale-95"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-semibold text-white">{title}</span>
      <span className="text-[10px] text-gray-400">{price}</span>
    </button>
  );
}
