import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search, ShieldCheck, LineChart, Truck, Scale, Sparkles, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_EMOJI, CATEGORY_LABEL } from "@/lib/format";

const FEATURES = [
  { icon: ShieldCheck, title: "Detector de desconto falso", desc: "Alertamos quando o \"de/por\" foi inflado antes da promoção." },
  { icon: LineChart, title: "Histórico de promoções", desc: "Veja as melhores épocas do ano para cada produto." },
  { icon: Truck, title: "Custo real", desc: "Compara preço + frete + prazo + garantia, não só o valor na vitrine." },
  { icon: Scale, title: "Comparador inteligente", desc: "Especificações lado a lado com jargão traduzido para você." },
];

export default function Home() {
  const [q, setQ] = useState("");
  const [, navigate] = useLocation();

  const popular = trpc.catalog.popularProducts.useQuery({ limit: 8 });
  const categories = trpc.catalog.featuredCategories.useQuery();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate(q.trim() ? `/buscar?q=${encodeURIComponent(q.trim())}` : "/buscar");
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="texture-hero text-white">
        <div className="container py-14 md:py-24 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs tracking-wider uppercase text-white/80">
              <Sparkles className="w-3.5 h-3.5" />
              Descontos verificados · Lojas auditadas
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
              Encontre o <em className="not-italic text-[oklch(0.88_0.14_85)]">melhor preço</em> de verdade.
            </h1>
            <p className="text-white/75 text-lg max-w-xl">
              Comparamos smartphones, notebooks, TVs e eletrodomésticos revelando desconto falso,
              custo total com frete e reputação da loja antes de você comprar.
            </p>

            <form onSubmit={submit} className="w-full max-w-xl">
              <div className="flex items-center gap-2 rounded-full bg-white/95 pl-5 pr-1.5 py-1.5 shadow-2xl">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Busque por iPhone 15 Pro, Galaxy S24, MacBook Air M3…"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-foreground"
                />
                <Button type="submit" className="rounded-full px-5">
                  Buscar ofertas
                </Button>
              </div>
              <div className="mt-3 text-xs text-white/70">
                Sugestões:{" "}
                <Link href="/produto/iphone-15-pro-256gb" className="underline underline-offset-2 hover:text-white">iPhone 15 Pro</Link>{" · "}
                <Link href="/produto/samsung-galaxy-s24-ultra-512gb" className="underline underline-offset-2 hover:text-white">Galaxy S24 Ultra</Link>{" · "}
                <Link href="/produto/macbook-air-m3-13-256gb" className="underline underline-offset-2 hover:text-white">MacBook Air M3</Link>
              </div>
            </form>
          </div>

          {/* Hero card preview */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-[oklch(0.78_0.16_85_/_0.35)] to-transparent blur-2xl" />
            <Card className="relative bg-white/95 text-foreground p-5 md:p-6 shadow-2xl border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Análise em tempo real</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full bg-[oklch(0.96_0.07_30)] text-[oklch(0.42_0.17_27)] px-2 py-0.5">
                  Desconto falso detectado
                </div>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="text-5xl">📱</div>
                <div>
                  <div className="text-xs text-muted-foreground">Apple</div>
                  <div className="font-medium">iPhone 15 Pro 256GB</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-5">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Anunciado</div>
                  <div className="font-display text-lg line-through text-muted-foreground">R$ 11.249</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Atual</div>
                  <div className="font-display text-lg">R$ 8.459</div>
                </div>
                <div className="rounded-lg bg-[oklch(0.95_0.08_85)] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-[oklch(0.34_0.08_85)]">Real</div>
                  <div className="font-display text-lg text-[oklch(0.34_0.08_85)]">6%</div>
                </div>
              </div>
              <div className="h-20 rounded-lg bg-gradient-to-tr from-[oklch(0.96_0.02_195)] to-[oklch(0.93_0.05_85)] relative overflow-hidden">
                <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,40 C20,34 40,32 60,30 C80,28 100,24 120,20 C140,42 160,22 200,18"
                        fill="none" stroke="oklch(0.38 0.08 195)" strokeWidth="2" />
                  <circle cx="140" cy="42" r="3" fill="oklch(0.65 0.2 27)" />
                </svg>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                O preço subiu artificialmente antes da "promoção". O desconto real é muito menor.
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Categorias em destaque */}
      <section className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Navegue</div>
            <h2 className="font-display text-2xl md:text-3xl">Categorias em destaque</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(categories.data ?? [
            { slug: "smartphones", label: "Smartphones", count: 5 },
            { slug: "notebooks", label: "Notebooks", count: 4 },
            { slug: "tvs", label: "TVs", count: 4 },
            { slug: "eletrodomesticos", label: "Eletrodomésticos", count: 4 },
          ]).map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`}>
              <Card className="card-elevate h-full p-5 flex flex-col gap-3 items-start bg-card border-border">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                  {CATEGORY_EMOJI[c.slug] ?? "🛒"}
                </div>
                <div>
                  <div className="font-medium">{c.label}</div>
                  <div className="text-xs text-muted-foreground">{c.count} produtos</div>
                </div>
                <div className="mt-auto text-xs text-primary inline-flex items-center gap-1">
                  Explorar <ArrowRight className="w-3 h-3" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/60 border-y border-border">
        <div className="container py-12 md:py-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">{f.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vitrine de populares */}
      <section className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Populares</div>
            <h2 className="font-display text-2xl md:text-3xl">Produtos que nossos usuários mais comparam</h2>
          </div>
          <Link href="/buscar" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            Ver tudo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {(popular.data ?? []).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* CTA comparar */}
      <section className="container pb-16">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-[oklch(0.97_0.02_195)] via-card to-[oklch(0.95_0.08_85)] p-8 md:p-12 grid gap-6 md:grid-cols-[1.2fr_1fr] items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Comparador inteligente</div>
            <h3 className="font-display text-2xl md:text-3xl mb-3">Dois produtos lado a lado, com jargão traduzido.</h3>
            <p className="text-muted-foreground max-w-lg">
              Veja diferenças reais em processador, tela, câmera, memória e custo total — em linguagem simples,
              sem você precisar entender de tecniquês.
            </p>
          </div>
          <div className="flex md:justify-end gap-3">
            <Link href="/comparar">
              <Button size="lg" className="rounded-full px-6">Abrir comparador</Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
