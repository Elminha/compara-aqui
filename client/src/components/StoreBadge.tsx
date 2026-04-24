import { Award, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeKind = "Confiança Ouro" | "Confiança Prata" | "Cuidado";

interface StoreBadgeProps {
  badge: BadgeKind;
  className?: string;
  size?: "sm" | "md";
}

const STYLES: Record<BadgeKind, { cls: string; Icon: typeof Award }> = {
  "Confiança Ouro": {
    cls: "bg-[oklch(0.95_0.08_85)] text-[oklch(0.34_0.08_85)] ring-1 ring-[oklch(0.78_0.16_85_/_0.45)]",
    Icon: Award,
  },
  "Confiança Prata": {
    cls: "bg-[oklch(0.95_0.01_220)] text-[oklch(0.32_0.04_220)] ring-1 ring-[oklch(0.7_0.02_220_/_0.4)]",
    Icon: ShieldCheck,
  },
  "Cuidado": {
    cls: "bg-[oklch(0.96_0.07_30)] text-[oklch(0.42_0.17_27)] ring-1 ring-[oklch(0.65_0.2_27_/_0.4)]",
    Icon: AlertTriangle,
  },
};

export function StoreBadge({ badge, className, size = "md" }: StoreBadgeProps) {
  const style = STYLES[badge];
  const Icon = style.Icon;
  const dim = size === "sm" ? "text-[11px] px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-wide",
        style.cls,
        dim,
        className,
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} strokeWidth={2.3} />
      {badge}
    </span>
  );
}
