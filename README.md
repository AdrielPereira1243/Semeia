# Service Report 📊

**Service Report** (Relatório de Serviço de Campo) é uma aplicação web moderna projetada para facilitar o registro e o acompanhamento de horas mensais, visitas e contatos. 

Um sistema de produtividade pessoal construído para ajudar a organizar suas atividades e manter seu histórico seguro, e sempre a mão.

## 🚀 Funcionalidades

- **Visão Mensal (Mês):** Acompanhe seu progresso de horas, publicações distribuídas, revisitas e estudos no mês atual de forma rápida e intuitiva.
- **Histórico:** Mantenha um registro completo de todos os meses anteriores para análises retrospectivas.
- **Pessoas (Contatos):** Gerencie os seus contatos, incluindo informações importantes e detalhes de acompanhamento.
- **Revisitas (Follow-ups):** Acompanhe os retornos e pessoas interessadas com eficiência.
- **Configurações:** Adapte a experiência e defina suas metas.

## 💻 Tecnologias e Ferramentas

O projeto foi construído utilizando um ecossistema moderno focado em performance, simplicidade e experiência de usuário:

- **[Next.js](https://nextjs.org/)** (App Router)
- **[React 19](https://react.dev/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)** para estilização rápida e responsiva
- **[Supabase](https://supabase.com/)** para autenticação e banco de dados PostgreSQL
- **[TypeScript](https://www.typescriptlang.org/)** para maior segurança no código

## 🛠️ Como Executar o Projeto

### Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 22+) instalado na sua máquina.

### Passos de Instalação

1. Clone ou baixe o repositório.
2. Instale as dependências executando na raiz do projeto:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Crie um projeto no Supabase e copie o arquivo de exemplo de ambiente:

```bash
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
com os valores exibidos em **Connect** no painel do projeto. Nunca use uma chave
`service_role` no navegador.

4. Aplique a migration existente em `supabase/migrations` ao projeto.

5. Em **Authentication > URL Configuration**, configure a URL do site e adicione
`http://localhost:3000/auth/confirm` às URLs de redirecionamento durante o desenvolvimento.

Em **Authentication > Email Templates > Confirm signup**, use este link para o
fluxo SSR de confirmação:

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/
```

6. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

7. Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📂 Estrutura do Projeto

A arquitetura segue o App Router do Next.js e separa rotas, domínio e infraestrutura:

- `/app/(planner)`: rotas autenticadas e layout compartilhado, sem alterar as URLs públicas.
- `/app/login` e `/app/auth`: entrada, cadastro, confirmação de e-mail e logout.
- `/app/_features/planner`: regras, estado e componentes específicos do relatório.
- `/components/ui`: componentes visuais reutilizáveis.
- `/lib/supabase`: clientes de navegador/servidor, tipos e renovação da sessão.
- `/supabase/migrations`: schema PostgreSQL, índices, permissões e políticas RLS.

---
*Feito para registrar horas mensais de forma simples e eficiente.*
