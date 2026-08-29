/**
 * Marca do DailyFlow: três barras ascendentes em tons de dourado, remetendo
 * ao acúmulo diário (o "flow") em vez de um glifo de texto genérico.
 */
export function Logo() {
  return (
    <div
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-end justify-center gap-[3px] rounded-2xl bg-primary/15 pb-2"
    >
      <span className="h-[10px] w-1 rounded-sm bg-[#9c7a35]" />
      <span className="h-[15px] w-1 rounded-sm bg-[#d9b95c]" />
      <span className="h-5 w-1 rounded-sm bg-[#f4e0a1]" />
    </div>
  );
}
