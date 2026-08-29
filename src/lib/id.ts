/**
 * Gera um id único de forma segura em qualquer contexto.
 *
 * `crypto.randomUUID()` só existe em contexto seguro (HTTPS ou localhost).
 * Ao abrir o app pelo IP da rede local no celular (http://192.168.x.x:3000),
 * ele fica indefinido e qualquer lançamento quebraria a tela — por isso o
 * fallback baseado em getRandomValues e, em último caso, em Math.random.
 */
export function newId(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;

  if (c?.randomUUID) return c.randomUUID();

  if (c?.getRandomValues) {
    const bytes = c.getRandomValues(new Uint8Array(16));
    // Marca os bits de versão (4) e variante (RFC 4122).
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
