export function brl(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "R$ —";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDayBR(isoDay: string): string {
  const d = new Date(isoDay + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export const CATEGORY_EMOJI: Record<string, string> = {
  smartphones: "📱",
  notebooks: "💻",
  tvs: "📺",
  eletrodomesticos: "🧊",
};

export const CATEGORY_LABEL: Record<string, string> = {
  smartphones: "Smartphones",
  notebooks: "Notebooks",
  tvs: "TVs",
  eletrodomesticos: "Eletrodomésticos",
};
