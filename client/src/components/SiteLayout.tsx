import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Search, Menu, X, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function NavLinks({ onClick, pathname }: { onClick?: () => void; pathname: string }) {
  const items = [
    { href: "/categoria/smartphones", label: "Smartphones" },
    { href: "/categoria/notebooks", label: "Notebooks" },
    { href: "/categoria/tvs", label: "TVs" },
    { href: "/categoria/eletrodomesticos", label: "Eletrodomésticos" },
    { href: "/comparar", label: "Comparar" },
  ];
  return (
    <>
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={onClick}
            className={cn(
              "text-sm font-medium transition-colors",
              active ? "text-primary" : "text-foreground/75 hover:text-foreground",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [q, setQ] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    if (location.startsWith("/buscar")) {
      const sp = new URLSearchParams(location.split("?")[1] ?? "");
      setQ(sp.get("q") ?? "");
    }
  }, [location]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/buscar?q=${encodeURIComponent(term)}` : "/buscar");
    setOpenMenu(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
        <div className="container flex items-center gap-4 md:gap-8 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpenMenu(false)}>
            <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Scale className="w-5 h-5" strokeWidth={2.4} />
            </span>
            <div className="leading-tight">
              <div className="font-display text-xl md:text-2xl tracking-tight">Compara Aqui</div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
                Ofertas inteligentes
              </div>
            </div>
          </Link>

          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full items-center rounded-full border border-border bg-card pl-4 pr-1 py-1 shadow-sm focus-within:ring-2 focus-within:ring-ring">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar iPhone, Galaxy, notebook gamer…"
                className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
              />
              <Button type="submit" size="sm" className="rounded-full px-4">
                Buscar
              </Button>
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-6">
            <NavLinks pathname={location} />
          </nav>

          <button
            type="button"
            className="lg:hidden ml-auto p-2 rounded-md hover:bg-muted"
            onClick={() => setOpenMenu((v) => !v)}
            aria-label="Abrir menu"
          >
            {openMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {openMenu && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="container py-4 flex flex-col gap-4">
              <form onSubmit={submitSearch} className="flex items-center rounded-full border border-border bg-card pl-4 pr-1 py-1">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar produtos…"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
                />
                <Button type="submit" size="sm" className="rounded-full px-4">
                  Buscar
                </Button>
              </form>
              <div className="grid gap-3">
                <NavLinks pathname={location} onClick={() => setOpenMenu(false)} />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border mt-16">
        <div className="container py-10 grid gap-8 md:grid-cols-4 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Scale className="w-4 h-4" />
              </span>
              <span className="font-display text-lg">Compara Aqui</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Plataforma independente de comparação de preços com detector de desconto falso,
              histórico de promoções e score de confiança das lojas baseado em Reclame Aqui,
              Procon e usuários.
            </p>
          </div>
          <div>
            <div className="font-medium mb-3">Navegar</div>
            <ul className="grid gap-2 text-muted-foreground">
              <li><Link href="/categoria/smartphones" className="hover:text-foreground">Smartphones</Link></li>
              <li><Link href="/categoria/notebooks" className="hover:text-foreground">Notebooks</Link></li>
              <li><Link href="/categoria/tvs" className="hover:text-foreground">TVs</Link></li>
              <li><Link href="/categoria/eletrodomesticos" className="hover:text-foreground">Eletrodomésticos</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-3">Institucional</div>
            <ul className="grid gap-2 text-muted-foreground">
              <li>Metodologia dos selos</li>
              <li>Como detectamos desconto falso</li>
              <li>Fontes de avaliação</li>
            </ul>
          </div>
        </div>
        <div className="container py-4 border-t border-border text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Compara Aqui. Os dados exibidos são demonstrativos.</span>
          <span>Feito com <span aria-label="coração">❤</span> no Brasil</span>
        </div>
      </footer>
    </div>
  );
}
