import { useRoute, Link } from "wouter";
import { SiteLayout } from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";
import { brl, CATEGORY_LABEL } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StoreBadge } from "@/components/StoreBadge";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, TrendingUp, CalendarClock, Truck, Shield, Sparkles, Info, Trophy, ArrowRight } from "lucide-react";

export default function Product() {
  const [, params] = useRoute("/produto/:slug");
  const slug = params?.slug ?? "";
  const q = trpc.product.get.useQuery({ slug }, { enabled: !!slug });

  if (q.isLoading) {
    return (
      <SiteLayout>
        <div className="container py-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </SiteLayout>
    );
  }
  if (!q.data) {
    return (
      <SiteLayout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-3xl mb-2">Produto não encontrado</h1>
          <Link href="/"><Button>Voltar à home</Button></Link>
        </div>
      </SiteLayout>
    );
  }

  const product = q.data;
  const best = product.offers[0];
  const fake = best?.fakeDiscount;
  const spikeDate = fake?.details.spikeDate ?? null;
  const spikePrice = fake?.details.priceBeforeSpike ? null : null; // will use recorded spike price from data via alert

  // Para o gráfico usamos o histórico agregado + marcador do spike (se houver)
  const spikePoint = spikeDate
    ? { date: spikeDate.slice(0, 10), price: Number(fake?.details.historicalLowLast90 ?? 0) }
    : null;

  // Recarregar preço de pico real: buscamos no array o maior preço próximo ao spikeDate
  let spikeMarker: { day: string; price: number } | null = null;
  if (spikeDate) {
    const day = spikeDate.slice(0, 10);
    const p = product.aggregatedHistory.find((h) => h.day === day);
    if (p) spikeMarker = p;
    else {
      // pega o maior preço dos últimos 30 dias como referência visual
      const last30 = product.aggregatedHistory.slice(-30);
      if (last30.length) {
        const topPt = last30.reduce((a, b) => (b.price > a.price ? b : a));
        spikeMarker = topPt;
      }
    }
  }

  return (
    <SiteLayout>
      <div className="container pt-8 md:pt-10">
        <div className="text-xs text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">Início</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/categoria/${product.category}`} className="hover:text-foreground">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </Link>
        </div>
      </div>

      {/* Header do produto */}
      <section className="container pt-2 pb-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <Card className="p-0 overflow-hidden border-border">
          <div className="aspect-[5/3] w-full flex items-center justify-center bg-gradient-to-br from-[oklch(0.98_0.02_195)] via-card to-[oklch(0.96_0.06_85)]">
            <span className="text-8xl md:text-9xl">{product.imageEmoji}</span>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</div>
          <h1 className="font-display text-3xl md:text-4xl leading-tight">{product.name}</h1>
          {product.shortDescription && (
            <p className="text-muted-foreground">{product.shortDescription}</p>
          )}

          {best ? (
            <Card className="p-5 border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Melhor custo real</div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full bg-accent text-accent-foreground px-2 py-0.5">
                  <Trophy className="w-3 h-3" /> Recomendado
                </span>
              </div>
              <div className="flex items-end gap-4 flex-wrap">
                <div>
                  <div className="text-xs text-muted-foreground">na {best.store.name}</div>
                  <div className="font-display text-3xl md:text-4xl text-primary">{brl(best.realCost.totalCost)}</div>
                  <div className="text-xs text-muted-foreground">
                    {brl(best.offer.currentPrice)} + {best.realCost.shippingLabel}
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Truck className="w-3.5 h-3.5" /> {best.realCost.deliveryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Shield className="w-3.5 h-3.5" /> {best.realCost.warrantyLabel}
                  </span>
                </div>
                <div className="ml-auto">
                  <StoreBadge badge={best.score.badge} />
                </div>
              </div>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link href={`/comparar?a=${product.slug}`}>
              <Button variant="outline" className="rounded-full">
                Comparar com outro produto <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs principais */}
      <section className="container pb-12">
        <Tabs defaultValue="ofertas">
          <TabsList className="bg-muted">
            <TabsTrigger value="ofertas">Ofertas & custo real</TabsTrigger>
            <TabsTrigger value="historico">Histórico & desconto falso</TabsTrigger>
            <TabsTrigger value="specs">Especificações</TabsTrigger>
            <TabsTrigger value="sazonal">Melhores épocas</TabsTrigger>
          </TabsList>

          {/* OFERTAS */}
          <TabsContent value="ofertas" className="mt-6">
            <div className="grid gap-4">
              {product.offers.map((row, i) => (
                <Card key={row.offer.id} className="p-5 border-border">
                  <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                        {row.store.logoEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{row.store.name}</span>
                          <StoreBadge badge={row.score.badge} size="sm" />
                          {i === 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-accent text-accent-foreground rounded-full px-2 py-0.5">
                              <Sparkles className="w-3 h-3" /> Melhor custo real
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Score {row.score.overall.toFixed(1)} · RA {row.store.reclameAquiScore.toFixed(1)} · Procon {row.store.proconScore.toFixed(1)} · Usuários {row.store.userScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{row.score.badgeDescription}</div>
                        {row.fakeDiscount.severity !== "none" && (
                          <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 ${
                            row.fakeDiscount.severity === "fake"
                              ? "bg-[oklch(0.96_0.07_30)] text-[oklch(0.42_0.17_27)]"
                              : "bg-[oklch(0.97_0.08_85)] text-[oklch(0.34_0.08_85)]"
                          }`}>
                            <AlertTriangle className="w-3 h-3" />
                            {row.fakeDiscount.severity === "fake" ? "Desconto falso detectado" : "Desconto suspeito"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Produto</div>
                      <div className="font-display text-xl">{brl(row.offer.currentPrice)}</div>
                      {row.offer.listPrice ? (
                        <div className="text-[11px] text-muted-foreground line-through">{brl(row.offer.listPrice)}</div>
                      ) : null}
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Total com frete</div>
                      <div className="font-display text-xl text-primary">{brl(row.realCost.totalCost)}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {row.realCost.shippingLabel} · {row.realCost.deliveryLabel} · {row.realCost.warrantyLabel}
                      </div>
                    </div>

                    <div className="md:text-right">
                      <Button className="rounded-full" onClick={() => window.alert("Redirecionamento à loja é ilustrativo nesta demonstração.")}>
                        Ver oferta
                      </Button>
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        Valor de custo: {row.realCost.valueScore}/100
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* HISTORICO + DETECTOR */}
          <TabsContent value="historico" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <Card className="p-5 border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Histórico de preços</div>
                    <div className="font-display text-lg">Últimos 180 dias · menor preço diário</div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <PriceHistoryChart
                  data={product.aggregatedHistory}
                  spikeDate={spikeMarker?.day ?? null}
                  spikePrice={spikeMarker?.price ?? null}
                  currentPrice={best ? best.offer.currentPrice : product.referencePrice}
                  seasonalMonths={product.promoSeasons.map((s) => s.month)}
                />
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-muted p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Menor (90 dias)</div>
                    <div className="font-display">{fake ? brl(fake.details.historicalLowLast90) : "—"}</div>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mediana (90 dias)</div>
                    <div className="font-display">{fake ? brl(fake.details.historicalMedianLast90) : "—"}</div>
                  </div>
                  <div className="rounded-lg bg-accent p-3">
                    <div className="text-[10px] uppercase tracking-wider text-accent-foreground">Desconto real</div>
                    <div className="font-display text-accent-foreground">
                      {fake ? `${fake.details.realDiscountPercent}%` : "—"}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    fake?.severity === "fake"
                      ? "bg-[oklch(0.95_0.09_30)] text-[oklch(0.42_0.17_27)]"
                      : fake?.severity === "suspicious"
                        ? "bg-[oklch(0.95_0.08_85)] text-[oklch(0.34_0.08_85)]"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {fake?.severity === "none" ? <Info className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Detector de desconto falso</div>
                    <div className="font-display text-lg">
                      {fake?.severity === "fake"
                        ? "Desconto falso detectado"
                        : fake?.severity === "suspicious"
                          ? "Desconto suspeito"
                          : "Desconto coerente"}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{fake?.message ?? "—"}</p>
                {fake?.details.priceBeforeSpike && fake.details.spikeDate ? (
                  <div className="mt-4 rounded-lg border border-border p-3 text-xs text-muted-foreground">
                    <CalendarClock className="inline w-3.5 h-3.5 mr-1" />
                    Por volta de {new Date(fake.details.spikeDate).toLocaleDateString("pt-BR")}, o produto estava por{" "}
                    <strong>{brl(fake.details.priceBeforeSpike)}</strong> antes de oscilar e chegar ao preço atual.
                  </div>
                ) : null}
                {fake?.details.advertisedFrom ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Anunciado "de"</div>
                      <div className="font-display">{brl(fake.details.advertisedFrom)}</div>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Anunciado "por"</div>
                      <div className="font-display">{brl(fake.details.advertisedTo)}</div>
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>
          </TabsContent>

          {/* SPECS */}
          <TabsContent value="specs" className="mt-6">
            <Card className="border-border">
              <Accordion type="single" collapsible className="px-2 md:px-4">
                {product.specs.map((s) => (
                  <AccordionItem key={s.key} value={s.key} className="border-b border-border last:border-0">
                    <AccordionTrigger className="text-left">
                      <div className="flex flex-wrap items-center justify-between gap-2 w-full pr-4">
                        <span className="font-medium">{s.key}</span>
                        <span className="text-sm text-muted-foreground">{s.value}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-muted-foreground">
                        {s.plainLanguage ?? "Especificação técnica do fabricante."}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </TabsContent>

          {/* SAZONAL */}
          <TabsContent value="sazonal" className="mt-6">
            <Card className="p-5 border-border">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Melhores épocas para comprar</div>
              <div className="font-display text-lg mb-4">Este produto costuma cair de preço em:</div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {product.promoSeasons.map((s) => (
                  <div key={s.month} className="rounded-xl border border-border p-4 bg-gradient-to-br from-[oklch(0.98_0.02_195)] to-card">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.event}</div>
                    <div className="font-display text-xl capitalize">{s.name}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Baseado no histórico de preços e em eventos sazonais típicos do varejo brasileiro.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}
