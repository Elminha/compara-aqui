# Compara Aqui

Plataforma web de comparação e análise inteligente de ofertas de produtos, inspirada no Buscapé,
com recursos pensados para proteger o consumidor brasileiro de promoções enganosas.

> Encontre o melhor preço **de verdade** — com detector de desconto falso, score de confiança das
> lojas, histórico de promoções e comparação de custo real (preço + frete + garantia).

## Funcionalidades

| Recurso | Descrição |
|---|---|
| **Detector de desconto falso** | Analisa o histórico dos últimos 90 dias da loja e detecta quando o preço "de" foi inflado artificialmente antes da promoção. Exibe o histórico de preço junto do alerta na página do produto. |
| **Score das lojas** | Combina notas do **Reclame Aqui**, **Procon** e **usuários** em um índice único, com atribuição dos selos **Confiança Ouro**, **Confiança Prata** e **Cuidado**. |
| **Histórico de promoções** | Gráfico de variação de preço com marcadores sazonais (Black Friday, Dia das Mães, Liquidação de estoque etc.). |
| **Comparação real do custo** | Soma preço + frete + prazo + garantia para indicar qual oferta é de fato mais vantajosa. |
| **Comparador inteligente de especificações** | Coloca dois produtos lado a lado e traduz jargão técnico (Snapdragon, AMOLED, Frost Free, Inverter…) em linguagem simples. |
| **Base de dados populada** | Catálogo real com smartphones, notebooks, TVs e eletrodomésticos, com ofertas de várias lojas e histórico de preços. |

## Stack

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS 4 + shadcn/ui + Recharts + wouter
- **Backend:** Node.js + Express + tRPC 11 (superjson) + Drizzle ORM
- **Banco de dados:** MySQL/TiDB
- **Testes:** Vitest

## Estrutura

```
client/            # App React (páginas Home, Produto, Comparar, Categoria, Busca, 404)
  src/components/  # StoreBadge, PriceHistoryChart, ProductCard, SiteLayout, ProductPicker
  src/pages/       # Páginas (Home, Product, Compare, Category, Search, NotFound)
server/            # Server Express + tRPC
  db.ts            # Helpers de consulta (Drizzle)
  routers.ts       # Rotas tRPC (catalog, product, auth, system)
  domain.test.ts   # Testes das regras de domínio
shared/
  domain.ts        # Regras de domínio (score, detector de desconto falso, custo real, tradução)
drizzle/
  schema.ts        # Schema do banco
scripts/seed.mjs   # Seed do catálogo
```

## Como rodar

```bash
pnpm install
pnpm drizzle-kit migrate
node scripts/seed.mjs         # popula produtos, lojas, ofertas e histórico
pnpm dev
```

## Testes

```bash
pnpm test   # 16 testes cobrindo score de lojas, detector de desconto falso, custo real e tradução
pnpm check  # verificação de tipos
```

## Selos de confiança das lojas

| Selo | Critério |
|---|---|
| **Confiança Ouro** | Score combinado ≥ 8.0 |
| **Confiança Prata** | Score combinado entre 6.5 e 8.0 |
| **Cuidado** | Score combinado < 6.5 |

O score usa peso 40% Reclame Aqui, 30% Procon, 30% usuários.

## Licença

MIT.
