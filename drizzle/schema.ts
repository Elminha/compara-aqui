import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  index,
} from "drizzle-orm/mysql-core";

/* =============== Users (auth) =============== */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* =============== Lojas =============== */
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  logoEmoji: varchar("logoEmoji", { length: 8 }).notNull().default("🛒"),
  reclameAquiScore: decimal("reclameAquiScore", { precision: 3, scale: 1 }).notNull(), // 0-10
  proconScore: decimal("proconScore", { precision: 3, scale: 1 }).notNull(),           // 0-10
  userScore: decimal("userScore", { precision: 3, scale: 1 }).notNull(),               // 0-10
  totalReviews: int("totalReviews").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/* =============== Produtos =============== */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    brand: varchar("brand", { length: 80 }).notNull(),
    category: mysqlEnum("category", [
      "smartphones",
      "notebooks",
      "tvs",
      "eletrodomesticos",
    ]).notNull(),
    shortDescription: text("shortDescription"),
    imageEmoji: varchar("imageEmoji", { length: 8 }).notNull().default("📦"),
    referencePrice: decimal("referencePrice", { precision: 10, scale: 2 }).notNull(),
    /** Especificações já estruturadas por chave legível */
    specs: json("specs").$type<Record<string, string>>().notNull(),
    /** Meses do ano com maior probabilidade de promoção (1-12) */
    promoMonths: json("promoMonths").$type<number[]>().notNull(),
    popularity: int("popularity").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("products_category_idx").on(table.category),
    brandIdx: index("products_brand_idx").on(table.brand),
  }),
);
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/* =============== Ofertas (produto x loja) =============== */
export const offers = mysqlTable(
  "offers",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    storeId: int("storeId").notNull(),
    currentPrice: decimal("currentPrice", { precision: 10, scale: 2 }).notNull(),
    shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).notNull().default("0"),
    /** Dias úteis para entrega */
    deliveryDays: int("deliveryDays").notNull().default(7),
    warrantyMonths: int("warrantyMonths").notNull().default(12),
    /** Preço "de" exibido pela loja (para detectar desconto falso) */
    listPrice: decimal("listPrice", { precision: 10, scale: 2 }),
    url: varchar("url", { length: 500 }),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdx: index("offers_product_idx").on(table.productId),
    storeIdx: index("offers_store_idx").on(table.storeId),
  }),
);
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/* =============== Histórico de preços =============== */
export const priceHistory = mysqlTable(
  "priceHistory",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    storeId: int("storeId").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    recordedAt: timestamp("recordedAt").notNull(),
  },
  (table) => ({
    productIdx: index("priceHistory_product_idx").on(table.productId),
    productStoreIdx: index("priceHistory_product_store_idx").on(table.productId, table.storeId),
  }),
);
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/* =============== Dicionário de tradução de jargão técnico =============== */
export const specDictionary = mysqlTable("specDictionary", {
  id: int("id").autoincrement().primaryKey(),
  term: varchar("term", { length: 120 }).notNull().unique(),
  plainLanguage: text("plainLanguage").notNull(),
});
export type SpecDictionary = typeof specDictionary.$inferSelect;
export type InsertSpecDictionary = typeof specDictionary.$inferInsert;
