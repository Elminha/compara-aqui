import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getOffersByProductId,
  getPriceHistoryByProductId,
  getProductBySlug,
  listCategories,
  listPopularProducts,
  listSpecDictionary,
  searchProducts,
} from "./db";
import {
  CATEGORY_LABELS,
  compareSpecRow,
  computeRealCost,
  computeStoreScore,
  describePromoMonths,
  detectFakeDiscount,
  translateSpecValue,
} from "@shared/domain";

const categoryEnum = z.enum(["smartphones", "notebooks", "tvs", "eletrodomesticos"]);

async function buildOfferDetail(productId: number, referencePrice: number) {
  const [offersWithStore, history] = await Promise.all([
    getOffersByProductId(productId),
    getPriceHistoryByProductId(productId, 180),
  ]);

  const historyByStore = new Map<number, { price: number; recordedAt: Date }[]>();
  for (const h of history) {
    const list = historyByStore.get(h.storeId) ?? [];
    list.push({ price: Number(h.price), recordedAt: h.recordedAt });
    historyByStore.set(h.storeId, list);
  }

  const tmpTotals = offersWithStore.map((r) =>
    Number(r.offer.currentPrice) + Number(r.offer.shippingCost),
  );
  const maxTotal = Math.max(...tmpTotals, referencePrice);

  const details = offersWithStore.map((row) => {
    const { offer, store } = row;
    const storeHistory = historyByStore.get(store.id) ?? [];
    const score = computeStoreScore({
      reclameAquiScore: Number(store.reclameAquiScore),
      proconScore: Number(store.proconScore),
      userScore: Number(store.userScore),
    });
    const fake = detectFakeDiscount({
      currentPrice: Number(offer.currentPrice),
      listPrice: offer.listPrice === null ? null : Number(offer.listPrice),
      history: storeHistory,
    });
    const realCost = computeRealCost(
      {
        currentPrice: Number(offer.currentPrice),
        shippingCost: Number(offer.shippingCost),
        deliveryDays: offer.deliveryDays,
        warrantyMonths: offer.warrantyMonths,
      },
      maxTotal,
    );
    return {
      store: {
        id: store.id,
        slug: store.slug,
        name: store.name,
        logoEmoji: store.logoEmoji,
        totalReviews: store.totalReviews,
        description: store.description,
        reclameAquiScore: Number(store.reclameAquiScore),
        proconScore: Number(store.proconScore),
        userScore: Number(store.userScore),
      },
      score,
      offer: {
        id: offer.id,
        currentPrice: Number(offer.currentPrice),
        listPrice: offer.listPrice === null ? null : Number(offer.listPrice),
        shippingCost: Number(offer.shippingCost),
        deliveryDays: offer.deliveryDays,
        warrantyMonths: offer.warrantyMonths,
        url: offer.url,
      },
      fakeDiscount: fake,
      realCost,
    };
  });

  details.sort((a, b) => a.realCost.totalCost - b.realCost.totalCost);
  return { details, history };
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  catalog: router({
    featuredCategories: publicProcedure.query(async () => {
      const rows = await listCategories();
      return rows.map((r) => ({
        slug: r.category as keyof typeof CATEGORY_LABELS,
        label: CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] ?? r.category,
        count: Number(r.count),
      }));
    }),

    popularProducts: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(24).default(8) }).optional())
      .query(async ({ input }) => {
        const items = await listPopularProducts(input?.limit ?? 8);
        return items.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          category: p.category,
          imageEmoji: p.imageEmoji,
          shortDescription: p.shortDescription,
          referencePrice: Number(p.referencePrice),
          popularity: p.popularity,
        }));
      }),

    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          category: categoryEnum.optional(),
        }),
      )
      .query(async ({ input }) => {
        const rows = await searchProducts({ query: input.query, category: input.category });
        return rows.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          category: p.category,
          imageEmoji: p.imageEmoji,
          shortDescription: p.shortDescription,
          referencePrice: Number(p.referencePrice),
          popularity: p.popularity,
        }));
      }),
  }),

  product: router({
    get: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await getProductBySlug(input.slug);
        if (!product) return null;

        const { details, history } = await buildOfferDetail(product.id, Number(product.referencePrice));
        const dictionary = await listSpecDictionary();

        const specsTranslated = Object.entries(product.specs ?? {}).map(([key, value]) => ({
          key,
          value: String(value),
          plainLanguage: translateSpecValue(String(value), dictionary),
        }));

        const byDay = new Map<string, number>();
        for (const h of history) {
          const day = h.recordedAt.toISOString().slice(0, 10);
          const price = Number(h.price);
          const cur = byDay.get(day);
          if (cur === undefined || price < cur) byDay.set(day, price);
        }
        const aggregatedHistory = Array.from(byDay.entries())
          .map(([day, price]) => ({ day, price }))
          .sort((a, b) => a.day.localeCompare(b.day));

        const promoSeasons = describePromoMonths((product.promoMonths as number[]) ?? []);

        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          category: product.category,
          shortDescription: product.shortDescription,
          imageEmoji: product.imageEmoji,
          referencePrice: Number(product.referencePrice),
          specs: specsTranslated,
          offers: details,
          aggregatedHistory,
          promoSeasons,
        };
      }),

    compare: publicProcedure
      .input(z.object({ slugA: z.string(), slugB: z.string() }))
      .query(async ({ input }) => {
        const [a, b] = await Promise.all([
          getProductBySlug(input.slugA),
          getProductBySlug(input.slugB),
        ]);
        if (!a || !b) return null;

        const [detA, detB, dictionary] = await Promise.all([
          buildOfferDetail(a.id, Number(a.referencePrice)),
          buildOfferDetail(b.id, Number(b.referencePrice)),
          listSpecDictionary(),
        ]);

        const keys = Array.from(
          new Set([
            ...Object.keys((a.specs as Record<string, string>) ?? {}),
            ...Object.keys((b.specs as Record<string, string>) ?? {}),
          ]),
        );
        const specsA = (a.specs as Record<string, string>) ?? {};
        const specsB = (b.specs as Record<string, string>) ?? {};
        const rows = keys.map((k) => compareSpecRow(k, specsA[k] ?? "—", specsB[k] ?? "—", dictionary));

        const bestA = detA.details[0];
        const bestB = detB.details[0];
        const realCostWinner =
          !bestA ? "B" :
          !bestB ? "A" :
          bestA.realCost.totalCost < bestB.realCost.totalCost ? "A" :
          bestA.realCost.totalCost > bestB.realCost.totalCost ? "B" : "tie";

        return {
          productA: {
            id: a.id, slug: a.slug, name: a.name, brand: a.brand,
            imageEmoji: a.imageEmoji, category: a.category,
            referencePrice: Number(a.referencePrice),
            bestOffer: bestA,
          },
          productB: {
            id: b.id, slug: b.slug, name: b.name, brand: b.brand,
            imageEmoji: b.imageEmoji, category: b.category,
            referencePrice: Number(b.referencePrice),
            bestOffer: bestB,
          },
          specRows: rows,
          realCostWinner,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
