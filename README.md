# OmniCash

**Clareza para acompanhar seu dinheiro e decidir o próximo passo.**

Gestão financeira pessoal com receitas, despesas e relatórios em uma interface
responsiva. MVP funcional construído com React 19, Vite 8, Java 21, Spring Boot 4
e PostgreSQL.

**Created by [PcTheLab](https://github.com/Pcthelab)** · [LinkedIn](https://www.linkedin.com/in/pcthelab)

[Arquitetura](docs/architecture.md) · [API HTTP](docs/api.md) · [Desenvolvimento e entrega](docs/development.md)

## O produto

| Recurso | Experiência disponível |
| --- | --- |
| Conta pessoal | Cadastro, login e edição do nome |
| Visão geral | Receitas, despesas e saldo do período selecionado |
| Lançamentos | Criação, edição e exclusão com categorias |
| Consulta | Filtros por mês, tipo e categoria, busca e paginação na interface |
| Relatórios | Distribuição por categoria e evolução financeira em seis meses |
| Exportação | CSV dos lançamentos filtrados |
| Interface | Português, valores em reais e layout responsivo |

Os registros são associados ao usuário autenticado. O backend inicializa 13
categorias padrão, sem inserir transações fictícias nas contas.

## Estrutura

```text
OmniCash/
├── backend/
│   ├── .mvn/wrapper/        # Maven Wrapper
│   ├── src/main/java/OmniCash/api/
│   │   ├── application/    # Casos de uso
│   │   ├── domain/         # Modelos e contratos de persistência
│   │   └── infrastructure/ # HTTP, segurança e persistência JPA
│   ├── src/main/resources/ # Configuração da aplicação
│   ├── src/test/           # Testes e perfil H2
│   ├── compose.yaml        # PostgreSQL de desenvolvimento
│   └── pom.xml
├── frontend/
│   ├── public/             # Favicon
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Autenticação e perfil
│   │   ├── lib/            # Cálculos, filtros e CSV
│   │   ├── api.js          # Cliente HTTP
│   │   ├── creator.js      # Créditos do autor
│   │   └── App.jsx         # Sessão, navegação e painel
│   └── tests/              # Lógica financeira e smoke de navegador
├── docs/                   # Documentação transversal
├── compose.yaml            # Entrada do Compose pela raiz
├── start-backend.cmd
└── start-frontend.cmd
```

Dependências, builds, configurações de IDE e resultados de testes são locais e
ficam fora do versionamento. Cada módulo possui seu próprio ciclo de build.

O projeto está separado em `backend/` (Spring Boot/Maven) e `frontend/` (React/Vite).
O código Java está em `backend/src/main/java` e o projeto Maven em `backend/pom.xml`.

## Iniciar o backend no Windows

Com Java 21 ou superior e Docker Desktop em execução, rode na raiz do projeto:

```powershell
.\start-backend.cmd
```

O script usa a pasta `backend` como diretório de trabalho, onde está o `compose.yaml`.
O Spring Boot gerencia o PostgreSQL do Compose na porta 5433 e atende em http://localhost:8080.
O PostgreSQL que usa a porta 5432 pode continuar em execução.

Para executar diretamente ou rodar os testes:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
# Ou, para testar usando H2 em memória:
.\mvnw.cmd test
```

O perfil normal usa `ddl-auto: update` para não apagar as tabelas a cada inicialização/encerramento.
O perfil de testes continua usando `create-drop` apenas no H2 em memória.

## IntelliJ IDEA

Abra `backend/pom.xml` como projeto Maven ou adicione esse arquivo como projeto Maven
na janela Maven do projeto existente e recarregue os projetos Maven.
Na configuração de execução de `ApiApplication`, use o módulo Maven `api`.
O diretório de trabalho pode ser a raiz do repositório ou a pasta `backend`.
O `compose.yaml` da raiz inclui o arquivo do backend e usa o mesmo projeto Docker,
evitando criar outro PostgreSQL ao alternar entre o IntelliJ e o terminal.

## Iniciar o frontend

Em outro terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Para gerar a versão de produção, use `npm run build` dentro de `frontend`.

O frontend inclui login/cadastro, visão geral financeira, lançamentos com filtros,
relatórios, exportação CSV e edição do perfil. Consulte `frontend/README.md` para
os contratos HTTP, estrutura dos componentes e testes.

Use Node.js 22.12+ na linha 22 ou uma versão mais nova compatível. O Vite instalado
declara suporte a `^20.19.0 || >=22.12.0`. A primeira instalação exige acesso aos
registros de dependências e à imagem do banco.

Após instalar as dependências, também é possível iniciar pela raiz com
`.\start-frontend.cmd`. Abra a URL informada pelo Vite, normalmente
[localhost:5173](http://localhost:5173), e crie uma conta.

Em Linux/macOS, use `sh ./mvnw spring-boot:run` dentro de `backend/` e `npm run dev`
dentro de `frontend/`, em terminais separados.

## Qualidade

Na raiz:

```powershell
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
cd backend
.\mvnw.cmd clean test
```

Os testes Java verificam o contexto Spring e a inicialização das categorias usando
H2. O frontend testa lógica financeira e CSV. Há também um smoke test de navegador
com API real, descrito no [guia do frontend](frontend/README.md).
Essa suíte ainda não cobre todas as regras de negócio.

## Documentação e evolução

- [Backend](backend/README.md): execução, configuração e testes.
- [Frontend](frontend/README.md): componentes, comportamento e teste de navegador.
- [Arquitetura](docs/architecture.md): responsabilidades e fluxo de dados.
- [API HTTP](docs/api.md): autenticação, endpoints e exemplos.
- [Desenvolvimento e entrega](docs/development.md): manutenção e preparação para produção.

A base permite demonstrar o fluxo financeiro completo. Migrações de banco,
segredos por ambiente, backups, observabilidade e testes mais abrangentes são
próximos passos para uma operação comercial. Recuperação de senha, metas,
recorrência e integração bancária não fazem parte do MVP implementado.

## Autor e contato

Desenvolvido por **PcTheLab**. Para conversar sobre produtos, desenvolvimento ou
oportunidades profissionais, entre em contato pelo
[LinkedIn](https://www.linkedin.com/in/pcthelab) e conheça outros projetos no
[GitHub](https://github.com/Pcthelab).

O repositório ainda não define uma licença de distribuição. Condições de uso e
licenciamento devem ser combinadas com o autor.
