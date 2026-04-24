import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { brl, CATEGORY_LABEL } from "@/lib/format";
import { TrendingUp } from "lucide-react";

interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    brand: string;
    category: string;
    imageEmoji: string;
    shortDescription: string | null;
    referencePrice: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/produto/${product.slug}`}>
      <Card className="group card-elevate h-full p-0 overflow-hidden border-border bg-card">
        <div className="relative aspect-[5/4] w-full bg-gradient-to-br from-[oklch(0.97_0.02_95)] via-card to-[oklch(0.96_0.02_195)] flex items-center justify-center overflow-hidden">
          <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform duration-300">
            {product.imageEmoji}
          </span>
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded-full">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </span>
        </div>
        <div className="p-4 space-y-2">
          <div className="text-xs text-muted-foreground font-medium">{product.brand}</div>
          <div className="font-medium leading-snug line-clamp-2 min-h-[2.5rem]">{product.name}</div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <div className="text-[11px] text-muted-foreground">a partir de</div>
              <div className="font-display text-xl text-primary">
                {brl(product.referencePrice * 0.92)}
              </div>
            </div>
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              ver histórico
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
