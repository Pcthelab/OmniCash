import { useState } from "react";
import { endpoints, setToken } from "../api";
import Icon, { Brand } from "../components/Icon";
import { creator } from "../creator";
export default function Auth({ onLogin, notice }) {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    fields.email = fields.email.trim();
    if (register) fields.name = fields.name.trim();
    try {
      if (register) {
        await endpoints.register(fields);
        setRegister(false);
        setSuccess("Conta criada! Entre com seu e-mail e senha.");
      } else {
        const result = await endpoints.login(fields);
        if (!result?.token)
          throw new Error("Não foi possível iniciar sua sessão.");
        setToken(result.token);
        onLogin();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Brand />
        <div className="story-copy">
          <span className="eyebrow">MENOS PLANILHAS. MAIS POSSIBILIDADES.</span>
          <h1>
            Seu dinheiro.
            <br />
            Sua vida.
            <br />
            <em>Em equilíbrio.</em>
          </h1>
          <p>
            Um lugar para organizar suas finanças e transformar pequenas
            decisões em grandes conquistas.
          </p>
          <div className="story-visual" aria-hidden="true">
            <div className="orbit one" />
            <div className="orbit two" />
            <div className="visual-card">
              <Icon name="wallet" size={30} />
              <span>Uma nova perspectiva</span>
              <strong>
                Clareza para
                <br />o que vem a seguir.
              </strong>
              <div className="mini-bars">
                {[25, 42, 35, 57, 51, 74, 91].map((h, i) => (
                  <i key={i} style={{ height: h }} />
                ))}
              </div>
            </div>
            <span className="floating-note">
              <Icon name="check" />
              Cada passo conta.
            </span>
          </div>
        </div>
        <footer>
          Feito para a sua vida real.{" "}
          <span className="auth-credit">
            Created by {creator.name}
            {creator.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </span>
        </footer>
      </section>
      <section className="auth-form-area">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <div className="auth-form-card">
          <span className="eyebrow">BEM-VINDO AO OMNICASH</span>
          <h2>
            {register
              ? "Seu próximo passo começa aqui."
              : "Bom ter você de volta."}
          </h2>
          <p>
            {register
              ? "Crie sua conta e dê um novo ritmo às suas finanças."
              : "Entre na sua conta e veja como está sua vida financeira."}
          </p>
          <div className="segmented">
            <button
              disabled={busy}
              className={!register ? "active" : ""}
              onClick={() => {
                setRegister(false);
                setError("");
                setSuccess("");
              }}
            >
              Entrar
            </button>
            <button
              disabled={busy}
              className={register ? "active" : ""}
              onClick={() => {
                setRegister(true);
                setError("");
                setSuccess("");
              }}
            >
              Criar conta
            </button>
          </div>
          {(error || notice) && (
            <div className="message error" role="alert">
              {error || notice}
            </div>
          )}
          {success && (
            <div className="message success" role="status">
              {success}
            </div>
          )}
          <form onSubmit={submit} className="form-stack">
            {register && (
              <label>
                Seu nome
                <input
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Como podemos chamar você?"
                />
              </label>
            )}
            <label>
              E-mail
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@exemplo.com"
                maxLength={255}
              />
            </label>
            <label>
              Senha
              <input
                name="password"
                type="password"
                required
                maxLength={72}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder="Digite sua senha"
              />
            </label>
            <button className="primary full" disabled={busy}>
              {busy
                ? "Aguarde…"
                : register
                  ? "Criar minha conta"
                  : "Entrar na minha conta"}
              <Icon name="arrow" />
            </button>
          </form>
          <div className="auth-assurance">
            <Icon name="lock" size={16} />
            Seu espaço pessoal para cuidar das finanças.
          </div>
        </div>
      </section>
    </main>
  );
}
