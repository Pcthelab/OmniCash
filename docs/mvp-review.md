# Revisão do MVP — 11/09/2026

## Implementado

- Celular: campos de 16px, alvos de toque de 44–48px, navegação com área segura para iPhone, formulários compactos, quebra de descrições/valores longos e melhor leitura nos cartões. A composição do desktop foi preservada.
- Cadastro e redefinição: mínimo de 10 caracteres, maiúscula A–Z, minúscula a–z e número; limite de 72 bytes UTF-8 do BCrypt. Confirmação, requisitos visíveis e botão para mostrar senha. O login continua aceitando senhas antigas.
- Recuperação: token aleatório de 256 bits, hash SHA-256 no banco, validade de 30 minutos, uso único, bloqueio transacional contra reutilização concorrente e intervalo de dois minutos por conta. Novo pedido aceito substitui o link anterior.
- E-mail via API HTTPS do Resend, com timeouts, limite de 20 tentativas de envio/minuto por instância e resposta genérica para contas existentes/inexistentes. Falhas de envio não expõem dados do provedor nem persistem um novo link.
- Google Identity Services: botão oficial e validação no servidor de assinatura RS256, emissor, audiência, expiração e e-mail verificado. Identidade persistida por `sub`. Para e-mail já cadastrado, é necessário entrar com senha; associação de contas existentes pelo perfil ainda não foi implementada.
- Redefinir a senha invalida JWTs anteriores. Atualizar o nome não sobrescreve a senha de uma recuperação concorrente.
- Chave JWT fixa removida. Erros internos deixam de retornar detalhes técnicos. Cadastro e lançamentos recebem limites de tamanho; PATCH valida descrição, valor positivo, casas decimais e tipo.

## Ativar no Render e na Netlify

Configure no Render, preservando as variáveis de banco e CORS já existentes:

| Variável | Valor |
| --- | --- |
| `API_SECURITY_TOKEN_SECRET` | Segredo aleatório privado com pelo menos 32 bytes, estável entre reinícios e instâncias. |
| `FRONTEND_URL` | `https://omnicash.netlify.app` ou o domínio definitivo, sem caminho extra. |
| `RESEND_API_KEY` | Chave de envio da sua conta Resend. |
| `RECOVERY_EMAIL_FROM` | Remetente de domínio verificado, como `OmniCash <acesso@seu-dominio.com>`. |
| `GOOGLE_CLIENT_ID` | Client ID OAuth do tipo aplicação Web. |

No Google Cloud, configure consentimento, público/testadores e a origem JavaScript autorizada exata do frontend. O fluxo usa callback JavaScript, sem redirect de backend. O Client ID é público; nenhum client secret vai ao navegador. As opções vêm de `GET /OmniCash/auth-options`; não são necessárias novas variáveis de Google ou e-mail na Netlify.

Sem credenciais, os botões opcionais ficam ocultos e login/cadastro continuam disponíveis. Sem segredo JWT configurado, uma chave aleatória é gerada a cada inicialização para desenvolvimento; sessões não sobrevivem a reinícios. A nova versão também rejeita JWTs antigos sem vínculo de credencial, exigindo novo login na primeira implantação.

As tabelas `password_resets` e `google_identities` são adicionadas pelo `ddl-auto: update` já usado. Não há alteração destrutiva de tabelas existentes. Valide em staging e tenha backup antes de publicar. O link usa fragmento (`/#reset=...`), removido do endereço após a leitura; não aparece em requisições HTTP ou referrers. Recarregar essa tela exige abrir o link novamente.

## Pendências priorizadas

1. **Abuso de autenticação:** login e cadastro ainda não têm limitador de tentativas. A recuperação tem cooldown persistido e limite local de envio; múltiplas instâncias precisam de um limitador compartilhado. O envio síncrono permite diferenças de tempo entre conta existente e inexistente; fila de e-mail e monitoramento de entrega são evoluções indicadas.
2. **Tipo e categoria:** editar um lançamento permite mudar receita/despesa mantendo a categoria anterior. Permitir escolher categoria compatível ou impedir a troca de tipo, com validação no backend.
3. **Exclusão de conta:** lançamentos armazenam `user_id` sem vínculo JPA com usuário; excluir uma conta pode deixar registros órfãos. Definir exclusão transacional dos dados antes de oferecer esse botão no produto. As duas tabelas novas têm exclusão em cascata.
4. **Operação:** migrações versionadas em lugar de `ddl-auto: update`, backups verificados e observabilidade. A infraestrutura existente foi preservada.
5. **Identidade e sessão:** verificar e-mails de cadastros locais, permitir associação explícita com Google no perfil e avaliar cookies HttpOnly. O JWT continua no localStorage, como na base original.

## Validação local

Os testes usam H2 em memória; nenhum dado de produção foi alterado. A suíte Java cobre recuperação, expiração, uso único concorrente, revogação de sessão, falha de envio, proteção da senha na edição de perfil, login HTTP e assinatura/claims do Google. O frontend testa regras de senha e os cálculos existentes.

`frontend/tests/smoke.cjs` percorre o fluxo financeiro com API local real. `frontend/tests/auth-mobile.cjs` valida cadastro, recuperação e redefinição em 320, 360, 390, 720 e 1440px, com API simulada e sem enviar e-mail. Execute ambos com Playwright disponível (`PLAYWRIGHT_MODULE` pode indicar o módulo), `E2E_URL` e, no smoke, `E2E_API_URL` apontando para ambientes locais de teste.

O login Google com uma conta real e a entrega do e-mail ainda precisam ser homologados após configurar as credenciais. Os testes de viewport usam Chromium/Edge, não um aparelho iOS físico.

## Referências de integração

- [Verificar ID token Google](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
- [Botão Google](https://developers.google.com/identity/gsi/web/reference/js-reference)
- [E-mail Resend](https://resend.com/docs/api-reference/emails/send-email)
- [JWT no Spring Security](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
