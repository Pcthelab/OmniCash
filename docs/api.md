# API HTTP

Base local: `http://localhost:8080`. Corpos usam JSON e
`Content-Type: application/json`. Os caminhos diferenciam maiúsculas e minúsculas.
Cadastro, login, opções de autenticação, recuperação de senha e login Google são públicos. Demais rotas exigem
`Authorization: Bearer <token>`.

| Método | Caminho | Entrada | Sucesso |
| --- | --- | --- | --- |
| POST | `/OmniCash/cadastro` | `name`, `email`, `password` | 201, usuário sem senha |
| POST | `/OmniCash/login` | `email`, `password` | 200, `{ token }` |
| GET | `/usuario/me` | — | 200, `id`, `name`, `email` |
| PUT | `/usuario/me` | `name` | 200, usuário atualizado |
| DELETE | `/usuario/me` | — | 204 |
| GET | `/categories` | — | 200, categorias |
| GET | `/lancamento` | — | 200, lançamentos do usuário |
| GET | `/lancamento/balance` | — | 200, `totalIncome`, `totalExpense`, `balance` |
| POST | `/lancamento` | Exemplo abaixo | 201, lançamento |
| PATCH | `/lancamento/{id}` | Campos opcionais abaixo | 200, lançamento atualizado |
| DELETE | `/lancamento/{id}` | — | 204 |

## Conta

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "uma-senha-pessoal"
}
```

O cadastro exige todos esses campos e e-mail válido e único. O login usa apenas
`email` e `password`. Cadastro não retorna token; autentique após criar a conta.

## Lançamentos

Consulte `/categories` antes de criar e use um ID real compatível com o tipo.
O ID abaixo é ilustrativo:

```json
{
  "description": "Almoço",
  "amount": 35.90,
  "type": "EXPENSE",
  "date": "2026-09-10",
  "categoryId": 1
}
```

Tipos: `INCOME` e `EXPENSE`. O POST exige todos os campos e valor mínimo `0.01`.
Datas usam `YYYY-MM-DD` e valores JSON usam ponto decimal.

PATCH parcial:

```json
{
  "description": "Almoço e café",
  "amount": 42.50
}
```

PATCH aceita `description`, `amount`, `type` e `date`; nulos mantêm o valor atual.
Não aceita alteração de categoria. Ainda não aplica as mesmas validações
declarativas do POST; validação da interface não substitui a do servidor.

Não há filtros ou paginação HTTP: o frontend processa a lista localmente.
O saldo da API abrange todo o histórico do usuário.

## Erros e limites

O handler retorna `timestamp`, `status`, `error`, `message` e `path`: 422 para
validação de DTO, 404 para `ResourceNotFoundException` e 400 para exceções de
execução tratadas genericamente. Erros de segurança podem ter outro formato;
nem todo recurso ausente é convertido em 404 atualmente.

Exclusão de conta existe somente na API. Não há contrato de cascata documentado;
o smoke test remove seus lançamentos antes da conta. Não há refresh token,
recuperação de senha, integração bancária nem CRUD de categorias.
# Recuperação de senha e Google

Os seguintes endpoints são públicos:

| Método e rota | Corpo / resposta |
| --- | --- |
| `GET /OmniCash/auth-options` | `{ "passwordRecovery": true, "googleClientId": "..." }`; valores dependem da configuração. |
| `POST /OmniCash/esqueci-senha` | `{ "email": "pessoa@exemplo.com" }`; resposta genérica com `message`. |
| `POST /OmniCash/redefinir-senha` | `{ "token": "token recebido", "password": "NovaSenha123" }`; `message` de sucesso, sem login automático. |
| `POST /OmniCash/google` | `{ "credential": "ID token do Google" }`; `{ "token": "JWT OmniCash" }`. |

Cadastro e redefinição exigem mínimo de 10 caracteres, maiúscula, minúscula e número,
com máximo de 72 bytes UTF-8. Senhas anteriores continuam válidas no login.
Links de recuperação expiram em 30 minutos e só podem ser usados uma vez.
Consulte [ativação e limitações](mvp-review.md).
