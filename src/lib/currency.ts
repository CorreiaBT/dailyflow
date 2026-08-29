/** Formata um valor no padrão monetário brasileiro: "R$2.000,00". */
export function formatCurrency(value: number): string {
  return `R$${formatNumberBRL(value)}`;
}

/** Mesmo formato numérico (milhar com ponto, decimal com vírgula), sem o prefixo "R$" — usado em planilhas/CSV. */
export function formatNumberBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Interpreta um texto digitado livremente de volta para número, aceitando
 * tanto o padrão brasileiro ("6.200,50") quanto alguém digitando com ponto
 * decimal por hábito ("150.50"). Retorna null quando não dá pra interpretar.
 *
 * A ambiguidade do ponto só existe sem vírgula no texto: um único ponto
 * seguido de 1-2 dígitos é tratado como decimal ("150.50" → 150.5); qualquer
 * outro caso (mais de um ponto, ou 3+ dígitos depois dele, como em "1.500")
 * é separador de milhar. Sem essa distinção, "150.50" vira 15050 sem aviso —
 * um erro de 100x silencioso.
 */
export function parseCurrencyInput(text: string): number | null {
  let normalized = text.trim();
  if (normalized === "") return null;

  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else {
    const dotCount = (normalized.match(/\./g) ?? []).length;
    const looksDecimal = dotCount === 1 && /\.\d{1,2}$/.test(normalized);
    if (!looksDecimal) normalized = normalized.replace(/\./g, "");
  }

  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
