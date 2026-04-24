import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot, ReferenceArea } from "recharts";
import { brl } from "@/lib/format";

interface Props {
  data: Array<{ day: string; price: number }>;
  spikeDate?: string | null;
  spikePrice?: number | null;
  currentPrice: number;
  /** Meses (1-12) em que o produto historicamente entra em promoção */
  seasonalMonths?: number[];
}

const MONTH_LABEL: Record<number, string> = {
  1: "Liquida\u00e7\u00e3o de estoque",
  3: "Volta \u00e0s aulas",
  5: "Dia das M\u00e3es",
  6: "Dia dos Namorados",
  7: "F\u00e9rias",
  9: "Semana do Brasil",
  10: "Pr\u00e9 Black Friday",
  11: "Black Friday",
  12: "Natal",
};

/** Para cada m\u00eas sazonal presente no intervalo do dataset, retorna [inicio, fim, label]. */
function buildSeasonalBands(days: string[], months: number[]) {
  if (!days.length || !months.length) return [] as Array<{ x1: string; x2: string; label: string }>;
  const set = new Set(months);
  const bands: Array<{ x1: string; x2: string; label: string }> = [];
  let cur: { month: number; start: string; end: string } | null = null;
  for (const d of days) {
    const m = Number(d.slice(5, 7));
    if (set.has(m)) {
      if (!cur || cur.month !== m) {
        if (cur) bands.push({ x1: cur.start, x2: cur.end, label: MONTH_LABEL[cur.month] ?? "Alta temporada" });
        cur = { month: m, start: d, end: d };
      } else cur.end = d;
    } else if (cur) {
      bands.push({ x1: cur.start, x2: cur.end, label: MONTH_LABEL[cur.month] ?? "Alta temporada" });
      cur = null;
    }
  }
  if (cur) bands.push({ x1: cur.start, x2: cur.end, label: MONTH_LABEL[cur.month] ?? "Alta temporada" });
  return bands;
}

export function PriceHistoryChart({ data, spikeDate, spikePrice, currentPrice, seasonalMonths = [] }: Props) {
  if (!data.length) {
    return <div className="h-48 grid place-items-center text-sm text-muted-foreground">Sem histórico disponível.</div>;
  }

  const minPrice = Math.min(...data.map((d) => d.price)) * 0.95;
  const maxPrice = Math.max(...data.map((d) => d.price), spikePrice ?? 0) * 1.05;
  const spikeDay = spikeDate ? spikeDate.slice(0, 10) : null;
  const bands = buildSeasonalBands(data.map((d) => d.day), seasonalMonths);

  return (
    <div className="w-full h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.38 0.08 195)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="oklch(0.38 0.08 195)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.008 100)" vertical={false} />
          {bands.map((b, i) => (
            <ReferenceArea
              key={i}
              x1={b.x1}
              x2={b.x2}
              y1={minPrice}
              y2={maxPrice}
              stroke="none"
              fill="oklch(0.78 0.16 85)"
              fillOpacity={0.12}
              label={{ value: b.label, position: "insideTop", fill: "oklch(0.34 0.08 85)", fontSize: 10 }}
            />
          ))}
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "oklch(0.5 0.02 220)" }}
            tickFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
            }}
            minTickGap={32}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 11, fill: "oklch(0.5 0.02 220)" }}
            tickFormatter={(v) => `R$ ${Math.round(v / 100) / 10}k`}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: "oklch(0.9 0.008 100)", fontSize: 12 }}
            labelFormatter={(label) =>
              new Date(label + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
            }
            formatter={(value: number) => [brl(value), "Menor preço do dia"]}
          />
          <Area type="monotone" dataKey="price" stroke="oklch(0.38 0.08 195)" strokeWidth={2} fill="url(#priceGrad)" />
          {spikeDay && spikePrice ? (
            <ReferenceDot x={spikeDay} y={spikePrice} r={6} fill="oklch(0.65 0.2 27)" stroke="white" strokeWidth={2} />
          ) : null}
          <ReferenceDot x={data[data.length - 1].day} y={currentPrice} r={5} fill="oklch(0.78 0.16 85)" stroke="white" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
