# Como rodar o Compara Aqui no seu PC

## Pré-requisitos

Instale as ferramentas abaixo antes de começar:

| Ferramenta | Versão mínima | Download |
|---|---|---|
| **Node.js** | 20 LTS | https://nodejs.org |
| **pnpm** | 9+ | `npm install -g pnpm` |
| **MySQL** | 8.0+ | https://dev.mysql.com/downloads/ ou use Docker |

> **Dica:** Se preferir não instalar o MySQL localmente, use o [PlanetScale](https://planetscale.com) ou [TiDB Cloud](https://tidbcloud.com) — ambos têm plano gratuito e fornecem uma `DATABASE_URL` pronta.

---

## 1. Clonar o repositório

```bash
git clone https://github.com/Elminha/compara-aqui.git
cd compara-aqui
```

## 2. Instalar dependências

```bash
pnpm install
```

## 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Banco de dados MySQL
# Exemplo local: mysql://root:suasenha@localhost:3306/comparaaqui
DATABASE_URL=mysql://usuario:senha@localhost:3306/comparaaqui

# Segredo para cookies de sessão (qualquer string longa e aleatória)
JWT_SECRET=mude-para-uma-string-secreta-longa

# OAuth Manus (pode deixar em branco — o login ficará desabilitado)
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=
OWNER_NAME=

# APIs internas (deixe em branco)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

## 4. Criar o banco de dados

No MySQL, crie o banco:

```sql
CREATE DATABASE comparaaqui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 5. Aplicar as migrações

```bash
pnpm drizzle-kit migrate
```

## 6. Popular o banco com os produtos

```bash
node scripts/seed.mjs
```

Isso insere smartphones, notebooks, TVs e eletrodomésticos com histórico de preços e ofertas de lojas.

## 7. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse **http://localhost:3000** no navegador.

---

## Estrutura de páginas

| URL | Descrição |
|---|---|
| `/` | Home com vitrine de produtos e categorias |
| `/categoria/smartphones` | Listagem por categoria |
| `/buscar?q=iphone` | Resultados de busca |
| `/produto/iphone-15-pro-256gb` | Detalhe com detector de desconto falso, histórico e score das lojas |
| `/comparar?a=iphone-15-pro-256gb&b=samsung-galaxy-s24-ultra-512gb` | Comparador lado a lado |

---

## Rodar os testes

```bash
pnpm test       # 16 testes Vitest
pnpm check      # verificação de tipos TypeScript
```

---

## Problemas comuns

**`pnpm: command not found`**
```bash
npm install -g pnpm
```

**Erro de conexão com o banco**
Verifique se o MySQL está rodando e se a `DATABASE_URL` no `.env` está correta.

**Porta 3000 em uso**
Altere a porta no arquivo `server/_core/index.ts` ou encerre o processo que usa a porta.
