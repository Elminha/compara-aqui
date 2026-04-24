import { and, desc, eq, gte, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  stores,
  offers,
  priceHistory,
  specDictionary,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/* ======= Users (boilerplate) ======= */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/* ======= Catalog ======= */

export async function listCategories() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      category: products.category,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(products)
    .groupBy(products.category);
  return rows;
}

export async function listPopularProducts(limit = 8) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .orderBy(desc(products.popularity))
    .limit(limit);
}

export async function searchProducts(opts: { query?: string; category?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conds: Array<ReturnType<typeof eq>> = [];
  if (opts.category) conds.push(eq(products.category, opts.category as any));
  if (opts.query && opts.query.trim()) {
    const q = `%${opts.query.trim()}%`;
    conds.push(
      or(
        like(products.name, q),
        like(products.brand, q),
        like(products.shortDescription, q),
      ) as any,
    );
  }
  const where = conds.length === 1 ? conds[0] : conds.length > 1 ? and(...conds) : undefined;
  const rows = where
    ? await db.select().from(products).where(where).orderBy(desc(products.popularity)).limit(60)
    : await db.select().from(products).orderBy(desc(products.popularity)).limit(60);
  return rows;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0];
}

export async function getOffersByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      offer: offers,
      store: stores,
    })
    .from(offers)
    .innerJoin(stores, eq(stores.id, offers.storeId))
    .where(eq(offers.productId, productId));
}

export async function getPriceHistoryByProductId(productId: number, sinceDays = 180) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - sinceDays * 24 * 3600 * 1000);
  return db
    .select()
    .from(priceHistory)
    .where(and(eq(priceHistory.productId, productId), gte(priceHistory.recordedAt, since)))
    .orderBy(priceHistory.recordedAt);
}

export async function listSpecDictionary() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specDictionary);
}
