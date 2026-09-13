# OmniCash API

API REST com Java 21, Spring Boot 4.1.1, Spring Security, JPA/Hibernate e
PostgreSQL. Autenticação JWT e senhas codificadas com BCrypt.

## Executar

Com Docker Desktop ativo, nesta pasta:

```powershell
.\mvnw.cmd spring-boot:run
```

Na raiz, use `.\start-backend.cmd`. No IntelliJ, importe `backend/pom.xml`,
selecione JDK 21 e execute `ApiApplication` com diretório de trabalho na raiz ou
em `backend/`. A API atende em `http://localhost:8080`.

## Configuração

`src/main/resources/application.yaml` contém os padrões locais. O Compose usa
o banco `omnicash_test` em `localhost:5433`, com credenciais de desenvolvimento.

| Variável de ambiente | Finalidade |
| --- | --- |
| `SERVER_PORT` | Porta HTTP, padrão 8080 |
| `SPRING_DATASOURCE_URL` | URL JDBC do banco externo |
| `SPRING_DATASOURCE_USERNAME` | Usuário do banco |
| `SPRING_DATASOURCE_PASSWORD` | Senha do banco |
| `API_CORS_ALLOWED_ORIGINS` | Origens liberadas para o frontend, separadas por vírgula |
| `API_SECURITY_TOKEN_SECRET` | Chave JWT, ao menos 32 bytes para HS256 |
| `SPRING_DOCKER_COMPOSE_ENABLED` | `false` ao usar banco externo |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Estratégia de esquema, atualmente `update` |
| `FRONTEND_URL` | Origem do frontend para links de recuperação |
| `RESEND_API_KEY` | Chave privada do serviço de envio de e-mail |
| `RECOVERY_EMAIL_FROM` | Remetente verificado no Resend |
| `GOOGLE_CLIENT_ID` | Client ID OAuth Web, usado para validar tokens Google |

Para banco externo, desative Compose e configure a conexão no processo Java.
O Spring não carrega um arquivo `.env` automaticamente.
O perfil normal usa `update`; o perfil `test` usa H2 com `create-drop`.
O inicializador adiciona categorias padrão ausentes e preserva as existentes.

Sem chave JWT configurada, o ambiente local gera uma chave aleatória por inicialização.
Em produção, configure um segredo privado estável: reiniciar com outra chave invalida
as sessões. Recuperação e Google ficam indisponíveis sem suas configurações.
Consulte [ativação das integrações](../docs/mvp-review.md) e [segurança](../SECURITY.md).

Em deploy separado, como Netlify + Render, configure no Render:

```text
API_CORS_ALLOWED_ORIGINS=https://omnicash.netlify.app
SPRING_DOCKER_COMPOSE_ENABLED=false
```

Use as variáveis `SPRING_DATASOURCE_*` com os dados JDBC do Neon.

## Testes e pacote

```powershell
.\mvnw.cmd clean test
.\mvnw.cmd package
```

O JAR fica em `target/`. Configure um banco acessível e as variáveis do ambiente
antes de executá-lo. Consulte os [contratos HTTP](../docs/api.md), a
[arquitetura](../docs/architecture.md) e o [guia de entrega](../docs/development.md).
