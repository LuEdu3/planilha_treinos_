# Roadmap — Planilha de Progressão de Carga (Academia)

Aplicativo web para planejamento e acompanhamento de progressão de carga nos treinos, com deploy na **Vercel**.

---

## 1. Visão geral do produto

- **Objetivo:** planilha digital para progressão de carga na academia.
- **Regra de séries:**
  - **1 série aquecimento** → 50% da carga total
  - **1 série preparação** → 70% da carga total
  - **3 séries válidas** → 100% da carga
- **Comportamento:** ao preencher o valor da série válida (100%), os valores de preparação (70%) e aquecimento (50%) são calculados e preenchidos automaticamente.
- **Dados editáveis:** exercícios e tipos de treino.
- **Identidade visual:** paleta em tons de **azul**.
- **Plataforma:** web, **responsivo (mobile-first)**.
- **Deploy:** **Vercel**.

---

## 2. Funcionalidades por fase

### Fase 1 — MVP (planilha + cálculo)

| # | Item | Descrição |
|---|------|-----------|
| 1.1 | Estrutura do app | Projeto web (ex.: Next.js ou React + Vite) preparado para Vercel |
| 1.2 | Layout base | Página principal com grid/tabela para exercícios e séries |
| 1.3 | Cálculo automático | Ao informar carga da série válida (100%), calcular e exibir: preparação (70%) e aquecimento (50%) |
| 1.4 | Exercícios | Campos para cadastro/nome dos exercícios |
| 1.5 | Tipos de treino | Campos para definir tipos de treino (ex.: A, B, C ou nomes livres) |
| 1.6 | UI azul | Tema em tons de azul (primário, secundário, fundo) |
| 1.7 | Responsivo | Layout adaptado para celular (telas pequenas primeiro) |

**Entregável:** planilha utilizável no navegador, sem login.

---

### Fase 2 — Autenticação e persistência

| # | Item | Descrição |
|---|------|-----------|
| 2.1 | Login com Google | Autenticação OAuth (Google Sign-In / Firebase Auth ou NextAuth, etc.) |
| 2.2 | Criação de contas | Novo usuário pode criar conta usando Google |
| 2.3 | Recuperação de contas | Fluxo “Esqueci minha senha” (quando houver senha) + orientações para contas apenas Google |
| 2.4 | Manter login | “Lembrar de mim” / sessão persistente (cookie ou token em armazenamento seguro) |
| 2.5 | Senhas (se houver email/senha) | Uso de **hash seguro** para senhas (ver seção Segurança abaixo) |

**Entregável:** usuário logado com Google, sessão persistente, recuperação de acesso quando aplicável.

---

### Fase 3 — Dados por usuário e deploy

| # | Item | Descrição |
|---|------|-----------|
| 3.1 | Dados por usuário | Exercícios, tipos de treino e cargas vinculados à conta logada |
| 3.2 | Backend/API | API ou serverless (ex.: Vercel Serverless + DB) para salvar/carregar dados |
| 3.3 | Deploy Vercel | Repositório conectado à Vercel, build e domínio configurados |
| 3.4 | Variáveis de ambiente | Chaves de API (Google OAuth, DB) em env da Vercel, nunca no código |

**Entregável:** app na Vercel com login e dados salvos por usuário.

---

## 3. Regras de negócio (cálculo de carga)

- **Carga total** = valor informado para a série válida (100%).
- **Preparação (70%):** `carga_total * 0.70`
- **Aquecimento (50%):** `carga_total * 0.50`
- Arredondamento: definir padrão (ex.: inteiros ou uma casa decimal) e usar em toda a UI.

Exemplo: série válida = 100 kg  
→ Preparação: 70 kg | Aquecimento: 50 kg  

---

## 4. Stack sugerida (exemplo)

- **Frontend:** React (Next.js ou Vite + React)
- **Estilização:** CSS Modules / Tailwind / styled-components (tema azul)
- **Auth:** NextAuth.js (Google) ou Firebase Authentication
- **Backend/Dados:** Vercel Serverless + banco (ex.: Vercel Postgres, Supabase, PlanetScale)
- **Deploy:** Vercel (GitHub → deploy automático)

Alternativa: apenas frontend + Supabase (auth + DB) também funciona bem com Vercel.

---

## 5. Segurança (senhas e auth)

- **Login com Google:** não armazena senha; OAuth gerido pelo provedor.
- **Se houver login com email/senha:**
  - **Não usar SHA-256 sozinho** para senhas (é rápido e facilita ataques por força bruta).
  - Usar **algoritmo de hash para senhas**: **bcrypt**, **scrypt** ou **Argon2** (com salt).
  - Se for obrigatório citar SHA: usar **SHA-256 (ou superior)** apenas como parte de um esquema maior (ex.: HMAC ou PBKDF2 com muitas iterações), nunca SHA puro para senha.
- **Recuperação de contas:** email de redefinição com link temporário e token seguro.
- **Sessão:** HTTP-only cookies para token/sessão quando possível.

*(Nota: “SHA-8” não existe; o padrão usual é SHA-256. Para senhas, o recomendado é bcrypt/Argon2.)*

---

## 6. Design (azul + mobile)

- Paleta azul: definir 1 cor primária, 1 secundária e tons para fundo e texto.
- Componentes: botões, inputs e cards seguindo o mesmo tema.
- Breakpoints: primeiro layout para mobile (ex.: 320px–480px), depois tablet e desktop.
- Toques: áreas de toque ≥ 44px, inputs e botões legíveis sem zoom.

---

## 7. Checklist pré-deploy (Vercel)

- [ ] Build local sem erros (`npm run build` ou equivalente)
- [ ] Variáveis de ambiente configuradas na Vercel (OAuth, DB, etc.)
- [ ] Domínio ou subdomínio vercel.app testado
- [ ] Login com Google testado em produção
- [ ] Fluxo “recuperar conta” testado (se existir)
- [ ] Teste em celular (responsivo e usabilidade)

---

## 8. Ordem sugerida de implementação

1. Criar projeto (Next.js ou Vite + React).
2. Implementar tela da planilha + cálculo 50% / 70% / 100%.
3. Adicionar exercícios e tipos de treino (estado local).
4. Aplicar tema azul e deixar responsivo.
5. Integrar login com Google e “manter login”.
6. Conectar backend/DB e vincular dados ao usuário.
7. Implementar recuperação de contas (se email/senha existir).
8. Configurar deploy na Vercel e testes finais.

---

## 9. Resumo rápido

| Requisito | Como atender |
|-----------|----------------|
| App web na Vercel | Next.js/React + deploy Vercel |
| Progressão de carga | 1 aquec. 50% + 1 prep. 70% + 3 válidas 100% |
| Cálculo automático | Ao preencher 100%, calcular e preencher 70% e 50% |
| Exercícios e tipos de treino | Campos/cadastro na planilha e no modelo de dados |
| Cores azul | Tema global em azul |
| Mobile | Layout responsivo (mobile-first) |
| Login/criar conta com Google | OAuth Google (NextAuth ou Firebase) |
| Recuperação e salvar login | Fluxo “esqueci senha” + sessão persistente |
| Senhas seguras | Bcrypt/Argon2 (e não SHA puro); se citar SHA, usar SHA-256 em esquema seguro |

Quando quiser, podemos desdobrar uma dessas fases em tarefas técnicas (componentes, rotas, tabelas) ou começar pelo código do MVP (Fase 1).
