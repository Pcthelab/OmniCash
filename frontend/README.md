# OmniCash Frontend

MVP em React e Vite integrado à API Spring Boot. Interface em português, valores em
reais, layout adaptado a desktop e celular. Não há transações fictícias ou modo
de demonstração nas contas.

## Executar

Inicie o Docker Desktop e o backend pela raiz (`.\start-backend.cmd`). Em outro terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Abra o endereço informado pelo Vite. O proxy de desenvolvimento encaminha as rotas
da API para `http://localhost:8080`.

```powershell
npm run build
npm run lint
npm test
```

A assinatura "Created by PcTheLab" aparece no login e na área autenticada, com
links para GitHub e LinkedIn configurados em `src/creator.js`.

O build fica em `dist/`. Para publicar, configure um proxy reverso da mesma origem
para as rotas abaixo. `VITE_API_URL` pode apontar para outra origem no build, mas
nesse caso o backend precisa permitir essa origem por CORS. O proxy de desenvolvimento
não é incluído no build nem no comando `vite preview`.

## Organização

- `src/api.js`: cliente HTTP, token Bearer, erros e contratos da API.
- `src/pages/`: autenticação e perfil.
- `src/components/`: formulários, modal acessível, tabela, gráficos e ícones.
- `src/lib/finance.js`: filtros, datas locais, resumo em centavos e CSV.
- `src/creator.js`: assinatura do criador e link de portfólio/LinkedIn.
- `src/App.jsx`: sessão, carregamento, navegação e composição do painel.
- `src/App.css` e `src/index.css`: estilos responsivos e tokens visuais.
- `tests/finance.test.js`: cálculos, valores decimais, filtros e segurança do CSV.
- `tests/smoke.cjs`: fluxo completo no navegador usando a API real.

## Contratos usados

| Método | Endpoint | Corpo / resultado |
| --- | --- | --- |
| POST | `/OmniCash/cadastro` | `{ name, email, password }`; cria conta |
| POST | `/OmniCash/login` | `{ email, password }`; retorna `{ token }` |
| GET | `/usuario/me` | Retorna `{ id, name, email }` |
| PUT | `/usuario/me` | `{ name }`; atualiza nome |
| GET | `/categories` | Lista `{ id, name, type }` |
| GET | `/lancamento` | Lançamentos do usuário autenticado |
| GET | `/lancamento/balance` | `{ totalIncome, totalExpense, balance }` |
| POST | `/lancamento` | `{ description, amount, type, date, categoryId }` |
| PATCH | `/lancamento/{id}` | `{ description, amount, type, date }` |
| DELETE | `/lancamento/{id}` | Exclui lançamento; resposta 204 |

O backend também possui `DELETE /usuario/me`. A exclusão de conta não é exposta
neste MVP; o teste de navegador usa essa rota somente para limpar sua própria
conta temporária depois de apagar seus lançamentos.

## Regras e comportamento

- Autenticação usa token Bearer em `localStorage`, na chave `omnicash.token`.
  Respostas 401/403 em chamadas autenticadas encerram a sessão; falhas de rede
  mostram erro e permitem tentar novamente.
- Cadastro e login usam os campos em inglês da API, e não `nome`/`senha` do projeto antigo.
- Tipos são `INCOME` e `EXPENSE`. O formulário traduz para receita e despesa.
- Valores devem ser positivos, com até duas casas decimais. Aceita `35,90` ou `35.90`,
  sem separadores de milhar. Datas são locais no formato `YYYY-MM-DD`.
- A categoria é obrigatória na criação. As opções vêm da API e são filtradas por tipo.
  O backend inicializa 13 categorias padrão, preservando registros existentes.
- A edição mantém a categoria: o contrato PATCH atual não possui `categoryId`.
  Não é enviado um campo que o servidor ignoraria.
- Filtro de mês afeta saldo e distribuição por categoria. Busca, tipo e categoria
  filtram a lista e seu CSV; os cartões financeiros continuam resumindo o período.
- O gráfico de fluxo mostra seis meses terminando no mês selecionado, ou no mês
  atual quando selecionado todo o período.
- CSV exporta todas as linhas filtradas, inclusive outras páginas, e escapa células
  com aspas e possíveis fórmulas. A lista exibe oito registros por página.
- Modais usam o elemento nativo `dialog`, com foco contido e fechamento por Escape.
- Sem endpoint de metas, recuperação de senha ou criação de categorias, esses
  recursos não são simulados na interface.

## Teste de navegador

O smoke test precisa de Playwright e Microsoft Edge instalados, com frontend e
backend em execução. `PLAYWRIGHT_MODULE` permite usar um módulo Playwright existente
fora deste projeto, sem adicioná-lo às dependências de produção.

```powershell
# Configure PLAYWRIGHT_MODULE se o Playwright não estiver instalado localmente.
node tests/smoke.cjs
```

`E2E_URL` e `E2E_API_URL` permitem alterar os endereços padrão. O teste cria uma
conta com e-mail aleatório `@example.test`, testa operações reais e remove a conta
e seus lançamentos ao final. Capturas e CSV ficam em `test-results/`, ignorado no Git.
