# Desenvolvimento e entrega

## Convenções

- Java e seus testes ficam em `backend/`; React e seus testes em `frontend/`.
- Documentação transversal fica em `docs/`; apresentação e início rápido no README raiz.
- Mantenha `package-lock.json`, instale com `npm ci` e use o Maven Wrapper.
- Atualize os contratos documentados e o cliente HTTP quando uma rota mudar.
- `.editorconfig` define formatação básica; `.gitignore` exclui builds e `.env` locais.

## Verificação

Na raiz:

```powershell
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
cd backend
.\mvnw.cmd clean test
```

`clean` remove classes compiladas antigas após renomear pacotes Java.
O smoke test de integração é descrito no README do frontend e requer ambos os
serviços ativos; ele cria e remove sua própria conta temporária.

## Diagnóstico

| Sintoma | Verificação |
| --- | --- |
| Compose não encontrado | Use o script raiz ou `backend/` como diretório de trabalho; preserve os dois Compose |
| Docker indisponível | Abra Docker Desktop e aguarde o engine iniciar |
| Porta 8080 ocupada | Confira se a API já está ativa no IntelliJ |
| Frontend antigo | Abra a URL informada pelo Vite e atualize com Ctrl+F5 |
| Requisições falham | Confira API na porta 8080 e proxy do Vite |
| Netlify abre, mas login falha | Confira `VITE_API_URL` no Netlify e `API_CORS_ALLOWED_ORIGINS` no Render |
| Erro CORS no navegador | O Render precisa aceitar `https://omnicash.netlify.app` e liberar `OPTIONS` |
| Token inválido após mudar chave | Faça login novamente |

## Entrega em produção

O ambiente configurado é de desenvolvimento. O build estático fica em
`frontend/dist/`; `mvnw package` gera o JAR em `backend/target/`.

Configure o servidor HTTP para encaminhar `/OmniCash`, `/usuario`, `/categories`
e `/lancamento` à API. O proxy Vite não acompanha o build. Outra origem exige
`VITE_API_URL` no build e configuração CORS no backend. Variáveis `VITE_*` são
públicas e não devem conter segredos.

Para Netlify + Render + Neon:

- Netlify: `VITE_API_URL=https://omnicash-gj66.onrender.com`
- Render: `API_CORS_ALLOWED_ORIGINS=https://omnicash.netlify.app`
- Render: `SPRING_DOCKER_COMPOSE_ENABLED=false`
- Render: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e
  `SPRING_DATASOURCE_PASSWORD` com os dados JDBC do Neon

Depois de alterar `VITE_API_URL`, publique um novo build no Netlify; variáveis
do Vite são gravadas no JavaScript durante o build.

Próximos passos para uma operação comercial:

- Substituir os padrões locais de JWT e banco por segredos do ambiente.
- Fixar uma versão PostgreSQL e definir persistência explícita, backups e restauração.
  O Compose atual usa `postgres:latest` e não declara volume nomeado.
- Introduzir migrações versionadas; `ddl-auto: update` não substitui migrações ou backup.
- Uniformizar validação de criação/edição, compatibilidade de tipo e categoria e erros.
- Ampliar testes de autorização e isolamento entre usuários.
- Configurar HTTPS, observabilidade e automação de build/testes/deploy.
- Definir recuperação de senha, política de sessão e exclusão de dados.

São evoluções documentadas, não funcionalidades entregues pela organização de pastas.
