/** Formata um valor no padrão monetário brasileiro: "R$2.000,00". */
export function formatCurrency(value: number): string {
  return `R$${formatNumberBRL(value)}`;
}

/** Mesmo formato numérico (milhar com ponto, decimal com vírgula), sem o prefixo "R$" — usado em planilhas/CSV. */
export function formatNumberBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Interpreta um texto no padrão brasileiro ("6.200,00", "6200,00" ou "6200.00")
 * de volta para número. Retorna null quando o texto não é um valor válido.
 */
export function parseCurrencyInput(text: string): number | null {
  const normalized = text.trim().replace(/\./g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
