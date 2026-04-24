import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { SearchX, Home as HomeIcon, Scale } from "lucide-react";

export default function NotFound() {
  return (
    <SiteLayout>
      <section className="container py-20 md:py-28 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-accent-foreground mb-6">
          <SearchX className="w-8 h-8" />
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Erro 404</div>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          O endereço que você digitou não existe ou o produto que você procurava pode ter saído do ar.
          Que tal voltar para a home e buscar novamente?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button size="lg" className="rounded-full">
              <HomeIcon className="w-4 h-4 mr-2" /> Voltar à home
            </Button>
          </Link>
          <Link href="/comparar">
            <Button size="lg" variant="outline" className="rounded-full">
              <Scale className="w-4 h-4 mr-2" /> Abrir comparador
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
