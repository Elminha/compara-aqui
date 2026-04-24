import { describe, expect, it } from "vitest";
import {
  compareSpecRow,
  computeRealCost,
  computeStoreScore,
  describePromoMonths,
  detectFakeDiscount,
  translateSpecValue,
} from "../shared/domain";

describe("computeStoreScore", () => {
  it("atribui selo Confiança Ouro para scores altos", () => {
    const r = computeStoreScore({ reclameAquiScore: 8.5, proconScore: 8.1, userScore: 8.6 });
    expect(r.badge).toBe("Confiança Ouro");
    expect(r.overall).toBeGreaterThanOrEqual(8.0);
  });

  it("atribui selo Confiança Prata para scores medianos", () => {
    const r = computeStoreScore({ reclameAquiScore: 7.0, proconScore: 6.8, userScore: 7.2 });
    expect(r.badge).toBe("Confiança Prata");
    expect(r.overall).toBeGreaterThanOrEqual(6.5);
    expect(r.overall).toBeLessThan(8.0);
  });

  it("atribui selo Cuidado para scores baixos", () => {
    const r = computeStoreScore({ reclameAquiScore: 4.1, proconScore: 3.8, userScore: 4.3 });
    expect(r.badge).toBe("Cuidado");
    expect(r.overall).toBeLessThan(6.5);
  });

  it("usa nomes exatos dos selos pedidos pelo cliente", () => {
    const ouro = computeStoreScore({ reclameAquiScore: 9, proconScore: 9, userScore: 9 });
    const prata = computeStoreScore({ reclameAquiScore: 7, proconScore: 7, userScore: 7 });
    const cuidado = computeStoreScore({ reclameAquiScore: 3, proconScore: 3, userScore: 3 });
    expect(ouro.badge).toBe("Confiança Ouro");
    expect(prata.badge).toBe("Confiança Prata");
    expect(cuidado.badge).toBe("Cuidado");
  });
});

describe("detectFakeDiscount", () => {
  const today = Date.now();
  const day = (ago: number) => new Date(today - ago * 24 * 3600 * 1000);

  it("detecta desconto falso quando listPrice está inflado e atual é igual ao histórico", () => {
    const history = Array.from({ length: 15 }, (_, i) => ({
      price: 200 + (i % 3), // bem estável perto de 200
      recordedAt: day(5 * i + 1),
    }));
    const r = detectFakeDiscount({
      currentPrice: 199,
      listPrice: 260, // ~30% acima da mediana (200) → fake
      history,
    });
    expect(r.severity).toBe("fake");
    expect(r.isFake).toBe(true);
    expect(r.message).toMatch(/inflado/i);
    expect(r.details.realDiscountPercent).toBeLessThanOrEqual(2);
  });

  it("marca como suspeito quando listPrice está moderadamente acima", () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      price: 200,
      recordedAt: day(5 * i + 1),
    }));
    const r = detectFakeDiscount({ currentPrice: 180, listPrice: 220, history });
    expect(["suspicious", "fake"]).toContain(r.severity);
  });

  it("não marca nada quando não há indícios", () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      price: 200 + i, // subindo suavemente
      recordedAt: day(5 * i + 1),
    }));
    const r = detectFakeDiscount({ currentPrice: 180, listPrice: null, history });
    expect(r.severity).toBe("none");
    expect(r.isFake).toBe(false);
  });

  it("não acusa nada com histórico insuficiente", () => {
    const r = detectFakeDiscount({
      currentPrice: 100,
      listPrice: 200,
      history: [{ price: 100, recordedAt: day(1) }],
    });
    expect(r.severity).toBe("none");
  });
});

describe("computeRealCost", () => {
  it("soma preço e frete e produz labels legíveis", () => {
    const r = computeRealCost(
      { currentPrice: 200, shippingCost: 30, deliveryDays: 5, warrantyMonths: 12 },
      230,
    );
    expect(r.totalCost).toBe(230);
    expect(r.shippingLabel).toBe("Frete R$ 30,00");
    expect(r.deliveryLabel).toContain("5");
    expect(r.warrantyLabel).toContain("12");
  });

  it("mostra 'Frete grátis' quando shippingCost=0", () => {
    const r = computeRealCost(
      { currentPrice: 220, shippingCost: 0, deliveryDays: 4, warrantyMonths: 12 },
      240,
    );
    expect(r.shippingLabel).toBe("Frete grátis");
    expect(r.totalCost).toBe(220);
  });

  it("A com frete 30 versus B frete grátis com valor maior: B vence no custo total", () => {
    const a = computeRealCost({ currentPrice: 200, shippingCost: 30, deliveryDays: 5, warrantyMonths: 12 }, 250);
    const b = computeRealCost({ currentPrice: 220, shippingCost: 0, deliveryDays: 5, warrantyMonths: 12 }, 250);
    expect(b.totalCost).toBeLessThan(a.totalCost);
  });
});

describe("translateSpecValue + compareSpecRow", () => {
  const dict = [
    { term: "Snapdragon 8 Gen 3", plainLanguage: "Processador topo de linha..." },
    { term: "AMOLED", plainLanguage: "Tela com cores vivas e pretos profundos" },
  ];

  it("traduz jargão técnico em linguagem simples", () => {
    const tr = translateSpecValue("Tela 6,8\" AMOLED 120Hz", dict);
    expect(tr).toMatch(/cores/i);
  });

  it("compara valores numéricos e indica vencedor", () => {
    const row = compareSpecRow("Memória RAM", "12GB RAM", "8GB RAM", []);
    expect(row.winner).toBe("A");
    expect(row.note).toBeTruthy();
  });

  it("para Peso, menor é melhor", () => {
    const row = compareSpecRow("Peso", "1,24 kg", "2,5 kg", []);
    expect(row.winner).toBe("A");
  });
});

describe("describePromoMonths", () => {
  it("converte meses em eventos sazonais brasileiros", () => {
    const r = describePromoMonths([11, 5, 1]);
    expect(r.find((x) => x.month === 11)?.event).toMatch(/Black Friday/i);
    expect(r.find((x) => x.month === 5)?.name).toBe("maio");
    expect(r.find((x) => x.month === 1)?.name).toBe("janeiro");
  });
});
