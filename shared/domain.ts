/**
 * Regras de domínio do Compara Aqui, compartilhadas entre servidor e testes.
 * Não importa Drizzle aqui para ser facilmente testável.
 */

export const CATEGORY_LABELS = {
  smartphones: "Smartphones",
  notebooks: "Notebooks",
  tvs: "TVs",
  eletrodomesticos: "Eletrodomésticos",
} as const;

export type CategorySlug = keyof typeof CATEGORY_LABELS;

/* =============== Score das lojas =============== */

export type TrustBadge = "Confiança Ouro" | "Confiança Prata" | "Cuidado";

export interface StoreScoreInput {
  reclameAquiScore: number; // 0-10
  proconScore: number;      // 0-10
  userScore: number;        // 0-10
}

export interface StoreScoreResult {
  overall: number;          // 0-10 arredondado a 1 casa
  badge: TrustBadge;
  badgeDescription: string;
  breakdown: {
    reclameAqui: number;
    procon: number;
    users: number;
  };
}

/**
 * Combina Reclame Aqui (40%), Procon (30%) e usuários (30%).
 * Selos: Ouro >= 8.0, Prata >= 6.5, Cuidado abaixo disso.
 */
export function computeStoreScore(input: StoreScoreInput): StoreScoreResult {
  const { reclameAquiScore, proconScore, userScore } = input;
  const overall = Math.round((reclameAquiScore * 0.4 + proconScore * 0.3 + userScore * 0.3) * 10) / 10;

  let badge: TrustBadge;
  let badgeDescription: string;
  if (overall >= 8.0) {
    badge = "Confiança Ouro";
    badgeDescription = "Loja com excelente reputação combinada no Reclame Aqui, Procon e usuários.";
  } else if (overall >= 6.5) {
    badge = "Confiança Prata";
    badgeDescription = "Loja com boa reputação geral, porém com pontos de atenção em algum indicador.";
  } else {
    badge = "Cuidado";
    badgeDescription = "Loja com reputação abaixo da média. Verifique reclamações antes de comprar.";
  }

  return {
    overall,
    badge,
    badgeDescription,
    breakdown: {
      reclameAqui: reclameAquiScore,
      procon: proconScore,
      users: userScore,
    },
  };
}

/* =============== Detector de desconto falso =============== */

export interface PricePoint { price: number; recordedAt: Date | string }

export interface FakeDiscountInput {
  currentPrice: number;
  listPrice: number | null; // "preço de" exibido pela loja
  history: PricePoint[];    // histórico já restrito a essa loja+produto
}

export interface FakeDiscountResult {
  isFake: boolean;
  severity: "none" | "suspicious" | "fake";
  message: string;
  details: {
    advertisedFrom: number | null;
    advertisedTo: number;
    historicalLowLast90: number;
    historicalMedianLast90: number;
    priceBeforeSpike: number | null;
    spikeDate: string | null;
    realDiscountPercent: number; // comparado com mediana histórica
  };
}

/**
 * Avalia se a "promoção" anunciada é falsa.
 *
 * Regras:
 * - Olha os últimos 90 dias do histórico da loja para aquele produto.
 * - Calcula mediana histórica e menor preço.
 * - Se `listPrice` é >= 15% acima da mediana dos últimos 90 dias → suspeita de inflação.
 * - Se o preço atual é maior ou praticamente igual (<=3% de diferença) ao menor preço histórico
 *   dos últimos 90 dias, mas o anúncio indica "de/por" com grande desconto → falso.
 * - Retorna também o pico mais próximo (spike) antes do preço atual, usado para narrativa.
 */
export function detectFakeDiscount(input: FakeDiscountInput): FakeDiscountResult {
  const { currentPrice, listPrice } = input;

  const ninetyDaysAgo = Date.now() - 90 * 24 * 3600 * 1000;
  const recent = input.history
    .map((p) => ({ price: Number(p.price), at: new Date(p.recordedAt).getTime() }))
    .filter((p) => p.at >= ninetyDaysAgo)
    .sort((a, b) => a.at - b.at);

  if (recent.length < 3) {
    return {
      isFake: false,
      severity: "none",
      message: "Sem histórico suficiente para avaliar a veracidade do desconto.",
      details: {
        advertisedFrom: listPrice,
        advertisedTo: currentPrice,
        historicalLowLast90: currentPrice,
        historicalMedianLast90: currentPrice,
        priceBeforeSpike: null,
        spikeDate: null,
        realDiscountPercent: 0,
      },
    };
  }

  const prices = recent.map((p) => p.price).sort((a, b) => a - b);
  const low = prices[0];
  const median = prices[Math.floor(prices.length / 2)];

  // Procura por spike recente (maior preço dos últimos 30 dias)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const recent30 = recent.filter((p) => p.at >= thirtyDaysAgo && p.price > currentPrice);
  let spikeDate: string | null = null;
  let priceBeforeSpike: number | null = null;
  if (recent30.length > 0) {
    const spike = recent30.reduce((a, b) => (b.price > a.price ? b : a));
    spikeDate = new Date(spike.at).toISOString();
    // preço antes do spike: último ponto < data do spike
    const before = recent.filter((p) => p.at < spike.at).slice(-1)[0];
    priceBeforeSpike = before ? before.price : null;
  }

  const realDiscountPercent = Math.max(0, Math.round(((median - currentPrice) / median) * 1000) / 10);

  const advertisedDiscount = listPrice && listPrice > currentPrice
    ? ((listPrice - currentPrice) / listPrice) * 100
    : 0;
  const listAboveMedian = listPrice ? (listPrice - median) / median : 0;

  let severity: FakeDiscountResult["severity"] = "none";
  let message =
    "Não detectamos manipulação: o preço atual é coerente com o histórico recente.";

  if (listPrice && listAboveMedian >= 0.15 && advertisedDiscount >= 10 && currentPrice >= low * 0.97) {
    severity = "fake";
    message = `Este "de/por" parece inflado: o preço "de" está ${(listAboveMedian * 100).toFixed(0)}% acima da mediana dos últimos 90 dias, e o preço atual é praticamente igual ao menor histórico. O desconto real é de apenas ${realDiscountPercent}%.`;
  } else if (listPrice && listAboveMedian >= 0.08) {
    severity = "suspicious";
    message = `Alerta: o preço "de" anunciado está ${(listAboveMedian * 100).toFixed(0)}% acima da mediana histórica, o que pode indicar inflação prévia. O desconto real em relação à mediana é de ${realDiscountPercent}%.`;
  } else if (spikeDate && priceBeforeSpike && priceBeforeSpike < currentPrice) {
    severity = "suspicious";
    message = `Atenção: este produto estava por R$ ${priceBeforeSpike.toFixed(2)} antes de subir e depois cair para R$ ${currentPrice.toFixed(2)}. O desconto anunciado pode não ser real.`;
  }

  return {
    isFake: severity === "fake",
    severity,
    message,
    details: {
      advertisedFrom: listPrice,
      advertisedTo: currentPrice,
      historicalLowLast90: Math.round(low * 100) / 100,
      historicalMedianLast90: Math.round(median * 100) / 100,
      priceBeforeSpike,
      spikeDate,
      realDiscountPercent,
    },
  };
}

/* =============== Custo real =============== */

export interface RealCostInput {
  currentPrice: number;
  shippingCost: number;
  deliveryDays: number;
  warrantyMonths: number;
}

export interface RealCostResult {
  totalCost: number;
  shippingLabel: string;
  deliveryLabel: string;
  warrantyLabel: string;
  /** Score de valor: quanto menor o custo total e menor o prazo, melhor (0-100) */
  valueScore: number;
}

export function computeRealCost(input: RealCostInput, contextMaxPrice: number): RealCostResult {
  const total = Math.round((input.currentPrice + input.shippingCost) * 100) / 100;
  const shippingLabel = input.shippingCost === 0 ? "Frete grátis" : `Frete R$ ${input.shippingCost.toFixed(2).replace(".", ",")}`;
  const deliveryLabel = `${input.deliveryDays} dia${input.deliveryDays === 1 ? "" : "s"} úteis`;
  const warrantyLabel = `${input.warrantyMonths} mês${input.warrantyMonths === 1 ? "" : "es"} de garantia`;

  // Value score considera 70% preço, 20% prazo, 10% garantia.
  const priceRatio = contextMaxPrice > 0 ? total / contextMaxPrice : 1;
  const deliveryPenalty = Math.min(1, input.deliveryDays / 30);
  const warrantyBoost = Math.min(1, input.warrantyMonths / 24);

  const raw = (1 - priceRatio) * 70 + (1 - deliveryPenalty) * 20 + warrantyBoost * 10;
  const valueScore = Math.max(0, Math.min(100, Math.round(raw)));

  return { totalCost: total, shippingLabel, deliveryLabel, warrantyLabel, valueScore };
}

/* =============== Sazonalidade =============== */

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const MONTH_EVENTS: Record<number, string> = {
  1: "Liquidação de estoque",
  3: "Volta às aulas",
  5: "Dia das Mães",
  6: "Dia dos Namorados",
  7: "Férias escolares",
  9: "Semana do Brasil",
  10: "Pré Black Friday",
  11: "Black Friday",
  12: "Natal",
};

export function describePromoMonths(months: number[]): Array<{ month: number; name: string; event: string }> {
  return months.map((m) => ({
    month: m,
    name: MONTH_NAMES[m - 1] ?? String(m),
    event: MONTH_EVENTS[m] ?? "Oportunidade sazonal",
  }));
}

/* =============== Dicionário de tradução =============== */

/** Normaliza texto para matching no dicionário (case/acentos/ espaços). */
export function normalizeTerm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tenta encontrar a primeira tradução amigável dentro do valor da spec.
 */
export function translateSpecValue(
  value: string,
  dictionary: Array<{ term: string; plainLanguage: string }>,
): string | null {
  const normalized = normalizeTerm(value);
  for (const entry of dictionary) {
    const t = normalizeTerm(entry.term);
    if (normalized.includes(t)) return entry.plainLanguage;
  }
  return null;
}

/* =============== Comparação de spec A vs B =============== */

export interface SpecComparisonRow {
  key: string;
  valueA: string;
  valueB: string;
  plainA: string | null;
  plainB: string | null;
  winner: "A" | "B" | "tie" | "unknown";
  note?: string;
}

/** Extrai número de um string ("6,8\" AMOLED 120Hz" → 6.8; "8GB RAM" → 8) */
export function firstNumber(s: string): number | null {
  const m = s.replace(",", ".").match(/[-+]?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

/**
 * Heurística leve: quando ambos têm números, o maior vence (exceto para "Peso" e "Consumo", onde menor é melhor).
 */
export function compareSpecRow(
  key: string,
  valueA: string,
  valueB: string,
  dictionary: Array<{ term: string; plainLanguage: string }>,
): SpecComparisonRow {
  const plainA = translateSpecValue(valueA, dictionary);
  const plainB = translateSpecValue(valueB, dictionary);
  const a = firstNumber(valueA);
  const b = firstNumber(valueB);

  let winner: SpecComparisonRow["winner"] = "unknown";
  let note: string | undefined;

  const lowerIsBetter = /peso|consumo|ru[ií]do/i.test(key);
  if (a !== null && b !== null) {
    if (Math.abs(a - b) < 1e-9) winner = "tie";
    else if (lowerIsBetter) winner = a < b ? "A" : "B";
    else winner = a > b ? "A" : "B";
    if (winner !== "tie") {
      const diff = Math.abs(a - b);
      const base = Math.max(a, b) || 1;
      const pct = Math.round((diff / base) * 100);
      note = `${winner === "A" ? "Produto A" : "Produto B"} é ${pct}% ${lowerIsBetter ? "melhor (menor)" : "melhor (maior)"} neste quesito.`;
    }
  } else if (valueA && !valueB) winner = "A";
  else if (!valueA && valueB) winner = "B";

  return { key, valueA, valueB, plainA, plainB, winner, note };
}
