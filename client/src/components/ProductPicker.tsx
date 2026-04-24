import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/format";

interface Props {
  label: string;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onClear: () => void;
}

export function ProductPicker({ label, selectedSlug, onSelect, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const res = trpc.catalog.search.useQuery(
    { query: query || undefined },
    { enabled: open },
  );

  const selected = trpc.product.get.useQuery(
    { slug: selectedSlug ?? "" },
    { enabled: !!selectedSlug },
  );

  if (selectedSlug && selected.data) {
    const p = selected.data;
    return (
      <div className="rounded-2xl border border-border bg-card p-4 h-full flex flex-col">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
        <div className="flex items-start gap-3 flex-1">
          <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center text-3xl shrink-0">
            {p.imageEmoji}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{p.brand}</div>
            <div className="font-medium leading-tight line-clamp-2">{p.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{CATEGORY_LABEL[p.category] ?? p.category}</div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={onClear}>
          Trocar produto
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 h-full">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
      <div className="flex items-center rounded-full border border-border bg-card pl-4 pr-1 py-1">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar produto…"
          className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
        />
      </div>
      {open && (
        <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-border bg-card divide-y divide-border">
          {(res.data ?? []).slice(0, 12).map((p) => (
            <button
              type="button"
              key={p.slug}
              onClick={() => { onSelect(p.slug); setOpen(false); setQuery(""); }}
              className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-muted"
            >
              <span className="text-xl">{p.imageEmoji}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{p.brand} · {CATEGORY_LABEL[p.category] ?? p.category}</div>
              </div>
            </button>
          ))}
          {res.data && res.data.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground">Nenhum produto encontrado.</div>
          )}
        </div>
      )}
    </div>
  );
}
