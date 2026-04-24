import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductPicker } from "@/components/ProductPicker";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { brl } from "@/lib/format";
import { StoreBadge } from "@/components/StoreBadge";
import { Crown, Truck, Shield, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Compare() {
  const [location] = useLocation();
  const params = useMemo(() => new URLSearchParams(location.split("?")[1] ?? ""), [location]);
  const [slugA, setSlugA] = useState<string | null>(params.get("a"));
  const [slugB, setSlugB] = useState<string | null>(params.get("b"));

  useEffect(() => {
    const sp = new URLSearchParams();
    if (slugA) sp.set("a", slugA);
    if (slugB) sp.set("b", slugB);
    const qs = sp.toString();
    const next = `/comparar${qs ? `?${qs}` : ""}`;
    if (next !== location) window.history.replaceState(null, "", next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugA, slugB]);

  const cmp = trpc.product.compare.useQuery(
    { slugA: slugA ?? "", slugB: slugB ?? "" },
    { enabled: !!slugA && !!slugB },
  );

  return (
    <SiteLayout>
      <section className="container pt-8 md:pt-12 pb-4">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Comparador</div>
        <h1 className="font-display text-3xl md:text-4xl">Compare dois produtos lado a lado</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Selecione dois produtos para ver as diferenças em linguagem simples, o custo real com frete e a
          reputação das lojas onde cada um está mais barato.
        </p>
      </section>

      <section className="container">
        <div className="grid gap-4 md:grid-cols-2">
          <ProductPicker
            label="Produto A"
            selectedSlug={slugA}
            onSelect={setSlugA}
            onClear={() => setSlugA(null)}
          />
          <ProductPicker
            label="Produto B"
            selectedSlug={slugB}
            onSelect={setSlugB}
            onClear={() => setSlugB(null)}
          />
        </div>
      </section>

      {slugA && slugB && cmp.data && (
        <section className="container py-10 space-y-10">
          {/* Resumo de custo real */}
          <Card className="p-6 border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Comparação real do custo</div>
            <div className="font-display text-xl md:text-2xl mb-5">Quem sai mais vantajoso no bolso?</div>
            <div className="grid gap-4 md:grid-cols-2">
              {(["A", "B"] as const).map((side) => {
                const p = side === "A" ? cmp.data!.productA : cmp.data!.productB;
                const isWinner = cmp.data!.realCostWinner === side;
                return (
                  <div
                    key={side}
                    className={cn(
                      "rounded-2xl p-5 border",
                      isWinner
                        ? "border-[oklch(0.78_0.16_85_/_0.5)] bg-[oklch(0.97_0.06_85)]"
                        : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center text-3xl">
                        {p.imageEmoji}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Produto {side} · {p.brand}</div>
                        <div className="font-medium leading-tight line-clamp-2">{p.name}</div>
                      </div>
                      {isWinner && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium rounded-full bg-[oklch(0.95_0.08_85)] text-[oklch(0.34_0.08_85)] px-2 py-0.5">
                          <Crown className="w-3 h-3" /> Mais vantajoso
                        </span>
                      )}
                    </div>

                    {p.bestOffer ? (
                      <>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Melhor custo real</div>
                            <div className="font-display text-3xl text-primary">{brl(p.bestOffer.realCost.totalCost)}</div>
                            <div className="text-xs text-muted-foreground">
                              {brl(p.bestOffer.offer.currentPrice)} + {p.bestOffer.realCost.shippingLabel}
                            </div>
                          </div>
                          <StoreBadge badge={p.bestOffer.score.badge} size="sm" />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          <div className="rounded-lg bg-muted p-2 text-center">
                            <div className="text-[10px] uppercase text-muted-foreground">Loja</div>
                            <div className="font-medium truncate">{p.bestOffer.store.name}</div>
                          </div>
                          <div className="rounded-lg bg-muted p-2 text-center">
                            <Truck className="w-3 h-3 inline mr-1" />
                            {p.bestOffer.realCost.deliveryLabel}
                          </div>
                          <div className="rounded-lg bg-muted p-2 text-center">
                            <Shield className="w-3 h-3 inline mr-1" />
                            {p.bestOffer.realCost.warrantyLabel}
                          </div>
                        </div>
                        {p.bestOffer.fakeDiscount.severity !== "none" && (
                          <div className={`mt-3 inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 ${
                            p.bestOffer.fakeDiscount.severity === "fake"
                              ? "bg-[oklch(0.96_0.07_30)] text-[oklch(0.42_0.17_27)]"
                              : "bg-[oklch(0.97_0.08_85)] text-[oklch(0.34_0.08_85)]"
                          }`}>
                            <AlertTriangle className="w-3 h-3" />
                            {p.bestOffer.fakeDiscount.severity === "fake" ? "Desconto falso detectado nesta loja" : "Desconto suspeito nesta loja"}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">Sem ofertas disponíveis.</div>
                    )}
                  </div>
                );
              })}
            </div>
            {cmp.data.productA.bestOffer && cmp.data.productB.bestOffer && cmp.data.realCostWinner !== "tie" && (
              <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
                <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
                {cmp.data.realCostWinner === "A" ? (
                  <>
                    <strong>Produto A</strong> é mais vantajoso:{" "}
                    {brl(cmp.data.productA.bestOffer.realCost.totalCost)} contra{" "}
                    {brl(cmp.data.productB.bestOffer.realCost.totalCost)} do Produto B — diferença de{" "}
                    {brl(Math.abs(cmp.data.productA.bestOffer.realCost.totalCost - cmp.data.productB.bestOffer.realCost.totalCost))}.
                  </>
                ) : (
                  <>
                    <strong>Produto B</strong> é mais vantajoso:{" "}
                    {brl(cmp.data.productB.bestOffer.realCost.totalCost)} contra{" "}
                    {brl(cmp.data.productA.bestOffer.realCost.totalCost)} do Produto A — diferença de{" "}
                    {brl(Math.abs(cmp.data.productA.bestOffer.realCost.totalCost - cmp.data.productB.bestOffer.realCost.totalCost))}.
                  </>
                )}
              </div>
            )}
          </Card>

          {/* Comparação técnica */}
          <Card className="p-0 overflow-hidden border-border">
            <div className="p-6 border-b border-border">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Especificações traduzidas</div>
              <div className="font-display text-xl md:text-2xl">O que cada ficha técnica significa na prática</div>
            </div>
            <div className="divide-y divide-border">
              {cmp.data.specRows.map((row) => (
                <div key={row.key} className="grid md:grid-cols-[200px_1fr_1fr] gap-4 p-5">
                  <div className="font-medium">{row.key}</div>
                  <SpecSide value={row.valueA} plain={row.plainA} highlight={row.winner === "A"} />
                  <SpecSide value={row.valueB} plain={row.plainB} highlight={row.winner === "B"} />
                  {row.note && (
                    <div className="md:col-span-3 text-xs text-muted-foreground rounded-lg bg-muted px-3 py-2">
                      <Sparkles className="inline w-3 h-3 mr-1 text-primary" />
                      {row.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {(!slugA || !slugB) && (
        <section className="container py-10">
          <Card className="p-8 text-center border-dashed border-border bg-muted/40">
            <div className="font-display text-xl mb-2">Escolha dois produtos para comparar</div>
            <p className="text-muted-foreground text-sm">
              A comparação mostra custo real, ficha técnica traduzida e diferenças objetivas entre as opções.
            </p>
          </Card>
        </section>
      )}
    </SiteLayout>
  );
}

function SpecSide({ value, plain, highlight }: { value: string; plain: string | null; highlight: boolean }) {
  return (
    <div className={cn(
      "rounded-xl p-3",
      highlight ? "bg-[oklch(0.97_0.06_85)] border border-[oklch(0.78_0.16_85_/_0.45)]" : "bg-muted",
    )}>
      <div className="font-medium">{value}</div>
      {plain && (
        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{plain}</div>
      )}
    </div>
  );
}
