import { useState } from "react";
import { endpoints } from "../api";
import Icon from "../components/Icon";
export default function Profile({ user, onUpdated, onLogout }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    const name = new FormData(event.currentTarget).get("name").trim();
    if (!name) return setError("Informe seu nome.");
    setBusy(true);
    try {
      const updated = await endpoints.profile({ name });
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel profile-panel">
      <span className="profile-avatar">
        {user.name.slice(0, 1).toUpperCase()}
      </span>
      <h2>Seu espaço, do seu jeito.</h2>
      <p>Mantenha suas informações atualizadas.</p>
      <form onSubmit={submit} className="form-stack">
        {error && (
          <div className="message error" role="alert">
            {error}
          </div>
        )}
        <label>
          Nome
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={user.name}
          />
        </label>
        <label>
          E-mail
          <input type="email" value={user.email} disabled />
          <small>O e-mail é o identificador da sua conta.</small>
        </label>
        <button className="primary" disabled={busy}>
          {busy ? "Salvando…" : "Salvar alterações"}
          <Icon name="check" size={18} />
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onLogout}
          disabled={busy}
        >
          <Icon name="logout" size={18} />
          Sair da conta
        </button>
      </form>
    </section>
  );
}
