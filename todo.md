# Compara Aqui — TODO

## Fundação
- [x] Identidade visual (cores, tipografia, tokens) em `client/src/index.css`
- [x] Fontes do Google Fonts (Playfair Display + Inter) no `client/index.html`
- [x] Schema Drizzle: stores, products, offers, priceHistory, specDictionary
- [x] Migração SQL aplicada
- [x] Seed do banco com produtos reais (smartphones, notebooks, TVs, eletrodomésticos)

## Backend (tRPC)
- [x] `catalog.featuredCategories` — categorias em destaque com contagem
- [x] `catalog.popularProducts` — vitrine da home
- [x] `catalog.search` — busca por texto/categoria
- [x] `product.get` — detalhe + ofertas + histórico + score das lojas + detector de desconto falso + sazonalidade
- [x] `product.compare` — comparar 2 produtos com tradução de jargão técnico e custo real

## Frontend — Páginas
- [x] Header com logo, busca global e navegação (Produtos, Comparar, Categorias)
- [x] Home: hero + busca + categorias em destaque + vitrine de produtos populares
- [x] Produto: título, imagem, especificações, ofertas (lojas), detector de desconto falso com alerta + histórico de preço, score das lojas com selos
- [x] Comparar: seleção de 2 produtos, tabela lado a lado com jargão traduzido e comparação de custo real
- [x] Categorias: listagem por categoria
- [x] 404 amigável

## Componentes
- [x] `StoreBadge` com selos "Confiança Ouro", "Confiança Prata", "Cuidado"
- [x] `PriceHistoryChart` (recharts) com marcador de pico
- [x] Alerta de desconto falso integrado ao histórico na página de produto
- [x] Breakdown de custo real (preço + frete + prazo + garantia) em ofertas
- [x] Linha de comparação de specs com tradução amigável do jargão

## Qualidade
- [x] Responsivo (mobile-first, breakpoints md/lg)
- [x] Vitest: detector de desconto falso, custo real, score das lojas, tradução de jargão (16 testes)
- [x] `pnpm check` sem erros
- [x] `pnpm test` passando

## Entrega
- [x] Checkpoint final salvo (versão `44abd844`)
- [x] Exportação para GitHub disponível via painel Management UI → Settings → GitHub (requer conexão do conector pelo usuário)
