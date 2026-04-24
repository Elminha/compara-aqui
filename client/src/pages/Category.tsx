import { useRoute } from "wouter";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { CATEGORY_LABEL, CATEGORY_EMOJI } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = ["smartphones", "notebooks", "tvs", "eletrodomesticos"] as const;

export default function Category() {
  const [, params] = useRoute("/categoria/:slug");
  const slug = params?.slug;
  const valid = CATEGORIES.includes(slug as any) ? (slug as (typeof CATEGORIES)[number]) : null;

  const q = trpc.catalog.search.useQuery(valid ? { category: valid } : { category: undefined });

  if (!valid) {
    return (
      <SiteLayout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-3xl mb-2">Categoria não encontrada</h1>
          <p className="text-muted-foreground">Tente uma das categorias disponíveis no menu.</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container pt-8 md:pt-12 pb-4">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Categoria</div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent text-2xl flex items-center justify-center">
            {CATEGORY_EMOJI[valid]}
          </div>
          <h1 className="font-display text-3xl md:text-4xl">{CATEGORY_LABEL[valid]}</h1>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Todos os produtos desta categoria, com análise automática de desconto falso e ofertas de lojas confiáveis.
        </p>
      </section>

      <section className="container py-6 md:py-10">
        {q.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : q.data && q.data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {q.data.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">Nenhum produto encontrado.</div>
        )}
      </section>
    </SiteLayout>
  );
}
