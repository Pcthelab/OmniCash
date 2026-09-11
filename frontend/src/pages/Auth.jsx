import { useEffect, useState } from "react";
import { clearToken, endpoints, setToken } from "../api";
import { passwordRules, validPassword } from "../lib/password";
import GoogleSignIn from "../components/GoogleSignIn";
import Icon, { Brand } from "../components/Icon";
import { creator } from "../creator";
export default function Auth({ onLogin, notice, initialResetToken = "" }) {
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [mode, setMode] = useState(resetToken ? "reset" : "login");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [options, setOptions] = useState({});
  const register = mode === "register", recovery = mode === "forgot", resetting = mode === "reset";
  const newPassword = register || resetting;
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    endpoints.authOptions(controller.signal).then(setOptions).catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (resetToken) window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [resetToken]);
  function switchMode(next) {
    setMode(next); setPassword(""); setShowPassword(false); setError(""); setSuccess("");
    if (next !== "reset") setResetToken("");
  }
  async function googleLogin(credential) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const result = await endpoints.google({ credential });
      if (!result?.token) throw new Error("Não foi possível iniciar sua sessão.");
      setToken(result.token); onLogin();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (fields.email) fields.email = fields.email.trim();
    if (register) fields.name = fields.name.trim();
    try {
      if (newPassword && !validPassword(fields.password)) throw new Error("Confira os requisitos da senha abaixo.");
      if (newPassword && fields.password !== fields.confirmPassword) throw new Error("As senhas não coincidem.");
      delete fields.confirmPassword;
      if (recovery) {
        const result = await endpoints.forgotPassword(fields);
        setSuccess(result.message);
      } else if (resetting) {
        const result = await endpoints.resetPassword({ token: resetToken, password: fields.password });
        clearToken(); switchMode("login"); setSuccess(result.message);
      } else if (register) {
        await endpoints.register(fields);
        switchMode("login");
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
            {recovery ? "Vamos recuperar seu acesso." : resetting ? "Escolha uma nova senha." : register
              ? "Seu próximo passo começa aqui."
              : "Bom ter você de volta."}
          </h2>
          <p>
            {recovery ? "Informe seu e-mail para receber um link de recuperação." : resetting ? "Crie uma senha segura para voltar a cuidar das suas finanças." : register
              ? "Crie sua conta e dê um novo ritmo às suas finanças."
              : "Entre na sua conta e veja como está sua vida financeira."}
          </p>
          {!recovery && !resetting && <div className="segmented">
            <button
              disabled={busy}
              className={!register ? "active" : ""}
              onClick={() => {
                switchMode("login");
              }}
            >
              Entrar
            </button>
            <button
              disabled={busy}
              className={register ? "active" : ""}
              onClick={() => {
                switchMode("register");
              }}
            >
              Criar conta
            </button>
          </div>}
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
          <form key={mode} onSubmit={submit} className="form-stack" aria-busy={busy}>
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
            {!resetting && <label>
              E-mail
              <input
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="voce@exemplo.com"
                maxLength={255}
                autoCapitalize="none"
                spellCheck={false}
              />
            </label>}
            {!recovery && <div className="password-group">
              <label htmlFor="auth-password">Senha</label>
              <span className="password-field">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={newPassword ? "password-rules" : undefined}
                autoComplete={newPassword ? "new-password" : "current-password"}
                placeholder="Digite sua senha"
              />
              <button type="button" className="text-button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button>
              </span>
            </div>}
            {newPassword && <>
              <ul className="password-rules" id="password-rules">
                {passwordRules.map(([label, valid]) => <li key={label} className={password && valid(password) ? "met" : ""}>
                  <span aria-hidden="true">{password && valid(password) ? "✓" : "○"}</span> {label}
                </li>)}
              </ul>
              <label>Confirmar senha<input name="confirmPassword" type={showPassword ? "text" : "password"}
                autoComplete="new-password" required maxLength={72} placeholder="Digite a senha novamente" /></label>
            </>}
            {mode === "login" && options.passwordRecovery && <button type="button" className="text-button forgot-password"
              disabled={busy} onClick={() => switchMode("forgot")}>Esqueci minha senha</button>}
            <button className="primary full" disabled={busy}>
              {busy
                ? "Aguarde…"
                : recovery ? "Enviar link de recuperação" : resetting ? "Salvar nova senha" : register
                  ? "Criar minha conta"
                  : "Entrar na minha conta"}
              <Icon name="arrow" />
            </button>
          </form>
          {(recovery || resetting) && <button className="text-button auth-back" disabled={busy}
            onClick={() => switchMode("login")}>Voltar para entrar</button>}
          {resetting && options.passwordRecovery && <button className="text-button auth-back" disabled={busy}
            onClick={() => switchMode("forgot")}>Solicitar outro link</button>}
          {!recovery && !resetting && options.googleClientId && <GoogleSignIn clientId={options.googleClientId}
            onCredential={googleLogin} disabled={busy} />}
          <div className="auth-assurance">
            <Icon name="lock" size={16} />
            Seu espaço pessoal para cuidar das finanças.
          </div>
        </div>
      </section>
    </main>
  );
}
