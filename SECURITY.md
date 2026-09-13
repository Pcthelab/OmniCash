# Segurança

## Relatar uma vulnerabilidade

Entre em contato de forma privada com [Pcthelab pelo LinkedIn](https://www.linkedin.com/in/pcthelab)
para combinar um canal de envio dos detalhes. Não publique senhas, tokens,
dados financeiros ou dados pessoais em issues, comentários ou pull requests.
Se o GitHub oferecer a opção **Report a vulnerability** na aba Security,
ela também pode ser utilizada; sua disponibilidade depende das configurações do repositório.

Informe a versão afetada, o comportamento observado e passos mínimos de reprodução
com dados fictícios. Testes devem usar contas e ambientes próprios ou autorizados.

## Configuração privada

- `.env` e variantes locais, chaves privadas, dumps, builds e artefatos temporários
  devem permanecer fora do Git. Os arquivos `.env.example` contêm apenas modelos públicos.
- Variáveis `VITE_*` são incorporadas ao JavaScript entregue ao navegador. Nunca
  coloque nelas senhas de banco, chaves JWT ou chaves de envio de e-mail.
- Defina `API_SECURITY_TOKEN_SECRET` com um segredo aleatório privado de ao menos
  32 bytes em produção. A chave aleatória de desenvolvimento muda a cada reinício.
- As credenciais presentes no Compose são exemplos para o banco local. Não as
  reutilize em produção. Configure os valores reais no provedor de hospedagem.
- Não anexe `.env`, logs de autenticação, backups ou documentos pessoais a relatos.

## Se um segredo já foi publicado

Revogue ou substitua o segredo no serviço correspondente. Removê-lo do último
commit ou adicioná-lo ao `.gitignore` não apaga versões anteriores.
Avalie a limpeza do histórico e de referências com os colaboradores antes de
reescrevê-lo: cópias e forks existentes não desaparecem automaticamente.
Veja o [procedimento oficial do GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Limites conhecidos

A [revisão do MVP](docs/mvp-review.md) registra pendências de limitação de tentativas,
sessão, exclusão de dados e operação. A documentação e os testes não equivalem
a uma auditoria independente de segurança nem a uma garantia de ausência de falhas.
