# Rodando o Compara Aqui no Windows com VS Code

Guia passo a passo do zero até o site funcionando em `http://localhost:3000`.

---

## ETAPA 1 — Instalar o Node.js

1. Acesse https://nodejs.org
2. Clique no botão **"LTS"** (versão recomendada)
3. Baixe e execute o instalador `.msi`
4. Clique em **Next** em todas as telas e finalize a instalação
5. **Reinicie o VS Code** após instalar

**Verificar se funcionou:** abra o terminal do VS Code (`Ctrl + '`) e digite:
```
node --version
```
Deve aparecer algo como `v20.x.x`.

---

## ETAPA 2 — Instalar o pnpm

No terminal do VS Code, rode:
```
npm install -g pnpm
```

**Verificar:**
```
pnpm --version
```
Deve aparecer algo como `9.x.x`.

> **Erro de permissão no Windows?** Abra o VS Code como Administrador (clique com botão direito no ícone → "Executar como administrador") e tente novamente.

---

## ETAPA 3 — Criar o banco de dados gratuito na nuvem

O projeto precisa de um banco MySQL. A forma mais fácil no Windows é usar o **TiDB Cloud** (gratuito, sem instalar nada):

1. Acesse https://tidbcloud.com e crie uma conta gratuita
2. Clique em **"Create Cluster"** → escolha **Serverless** → clique em **"Create"**
3. Aguarde ~1 minuto até o cluster ficar verde
4. Clique em **"Connect"**
5. Em **"Connect With"**, selecione **"General"**
6. Copie a string de conexão que aparece — ela tem este formato:
   ```
   mysql://seu_usuario:sua_senha@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
   ```
7. **Guarde essa string** — você vai precisar no próximo passo

---

## ETAPA 4 — Clonar o projeto

No terminal do VS Code:
```
git clone https://github.com/Elminha/compara-aqui.git
cd compara-aqui
```

Ou pelo VS Code: `Ctrl+Shift+P` → **"Git: Clone"** → cole a URL `https://github.com/Elminha/compara-aqui.git`

---

## ETAPA 5 — Criar o arquivo `.env`

1. Dentro da pasta `compara-aqui`, crie um arquivo chamado **`.env`** (sem extensão, só `.env`)
2. Cole o conteúdo abaixo e **substitua a linha `DATABASE_URL`** pela string que você copiou no passo 3:

```env
DATABASE_URL=mysql://seu_usuario:sua_senha@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict

JWT_SECRET=compara-aqui-segredo-local-123456

VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=
OWNER_NAME=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

> **Atenção:** o arquivo `.env` não aparece no GitHub por segurança — você precisa criá-lo manualmente toda vez que clonar o projeto.

---

## ETAPA 6 — Instalar as dependências

No terminal do VS Code, dentro da pasta `compara-aqui`:
```
pnpm install
```

Aguarde baixar todos os pacotes (pode demorar 1-2 minutos na primeira vez).

---

## ETAPA 7 — Criar as tabelas no banco

```
pnpm drizzle-kit migrate
```

Isso cria todas as tabelas necessárias no banco do TiDB Cloud.

---

## ETAPA 8 — Popular o banco com produtos

```
node scripts/seed.mjs
```

Isso insere smartphones, notebooks, TVs e eletrodomésticos com histórico de preços e ofertas. Aguarde a mensagem de conclusão.

---

## ETAPA 9 — Iniciar o servidor

```
pnpm dev
```

Abra o navegador em **http://localhost:3000** — o site estará funcionando!

---

## Próximas vezes

Da segunda vez em diante, basta abrir o terminal na pasta do projeto e rodar:
```
pnpm dev
```

Não precisa repetir os outros passos.

---

## Problemas comuns no Windows

| Erro | Solução |
|---|---|
| `pnpm : cannot be loaded because running scripts is disabled` | Abra o PowerShell como Administrador e rode: `Set-ExecutionPolicy RemoteSigned` |
| `node: command not found` | Reinicie o VS Code após instalar o Node.js |
| `ECONNREFUSED` ou erro de banco | Verifique se a `DATABASE_URL` no `.env` está correta (sem espaços extras) |
| `Port 3000 already in use` | Feche outros programas que usam a porta 3000, ou reinicie o PC |
| Erro no `pnpm install` com `EACCES` | Abra o VS Code como Administrador |
