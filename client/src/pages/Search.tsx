import { useLocation } from "wouter";
import { useMemo } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const [location] = useLocation();
  const params = useMemo(() => new URLSearchParams(location.split("?")[1] ?? ""), [location]);
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? undefined;

  const res = trpc.catalog.search.useQuery({
    query: query || undefined,
    category: (["smartphones","notebooks","tvs","eletrodomesticos"].includes(category ?? "") ? (category as any) : undefined),
  });

  return (
    <SiteLayout>
      <section className="container pt-8 md:pt-12 pb-4">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Busca</div>
        <h1 className="font-display text-3xl md:text-4xl">
          {query ? <>Resultados para "<span className="text-primary">{query}</span>"</> : "Todos os produtos"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {res.isLoading ? "Carregando…" : `${res.data?.length ?? 0} produto(s) encontrado(s).`}
        </p>
      </section>

      <section className="container py-6 md:py-10">
        {res.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : res.data && res.data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {res.data.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            Não encontramos produtos. Tente termos como "iPhone", "Galaxy", "notebook", "TV 4K".
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
