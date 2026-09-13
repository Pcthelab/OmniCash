import { useCallback, useEffect, useRef, useState } from "react";
import { clearToken, endpoints, getToken } from "./api";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Icon, { Brand } from "./components/Icon";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import Modal from "./components/Modal";
import { CategoryChart, FlowChart } from "./components/Charts";
import {
  exportCSV,
  filterRows,
  localDate,
  money,
  monthLabel,
  summarize,
} from "./lib/finance";
import { creator } from "./creator";
import "./App.css";
const navigation = [
  ["overview", "Visão geral", "grid"],
  ["transactions", "Lançamentos", "transfer"],
  ["reports", "Relatórios", "chart"],
  ["profile", "Minha conta", "user"],
];
export default function App() {
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("reset") || "");
  const [resetVersion, setResetVersion] = useState(0);
  const [logged, setLogged] = useState(() => !new URLSearchParams(window.location.hash.slice(1)).has("reset") && Boolean(getToken()));
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);
  const [view, setView] = useState("overview");
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const [search, setSearch] = useState(""),
    [type, setType] = useState(""),
    [category, setCategory] = useState("");
  const [page, setPage] = useState(1),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const [editor, setEditor] = useState(null),
    [deleting, setDeleting] = useState(null),
    [deleteBusy, setDeleteBusy] = useState(false),
    [deleteError, setDeleteError] = useState("");
  const request = useRef(null);
  const logout = useCallback((message = "") => {
    request.current?.abort();
    clearToken();
    setLogged(false);
    setData(null);
    setEditor(null);
    setDeleting(null);
    setNotice(message);
    setError("");
    setToast("");
    setView("overview");
    setMonth(localDate().slice(0, 7));
    setSearch("");
    setType("");
    setCategory("");
    setPage(1);
  }, []);
  useEffect(() => {
    const openReset = () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("reset");
      if (token) { logout(); setResetToken(token); setResetVersion((version) => version + 1); }
    };
    window.addEventListener("hashchange", openReset);
    return () => window.removeEventListener("hashchange", openReset);
  }, [logout]);
  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");
    try {
      const [user, rows, balance, categories] = await Promise.all([
        endpoints.me(controller.signal),
        endpoints.transactions(controller.signal),
        endpoints.balance(controller.signal),
        endpoints.categories(controller.signal),
      ]);
      if (!controller.signal.aborted)
        setData({ user, rows, balance, categories });
    } catch (err) {
      if (err.name !== "AbortError" && !controller.signal.aborted)
        setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  // Synchronize the remote account data when the authenticated session changes.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    if (logged) load();
    return () => request.current?.abort();
  }, [logged, load]);
  useEffect(() => {
    const expired = () => logout("Sua sessão expirou. Entre novamente.");
    window.addEventListener("omnicash:expired", expired);
    return () => window.removeEventListener("omnicash:expired", expired);
  }, [logout]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  if (!logged)
    return (
      <Auth
        key={resetToken ? `reset-${resetVersion}` : "auth"}
        initialResetToken={resetToken}
        notice={notice}
        onLogin={() => {
          setResetToken("");
          setNotice("");
          setLogged(true);
        }}
      />
    );
  const rows = data?.rows || [],
    periodRows = filterRows(rows, { month }),
    filtered = filterRows(rows, { month, search, type, category });
  const balance = month
    ? summarize(periodRows)
    : data?.balance || summarize(rows);
  const pages = Math.max(1, Math.ceil(filtered.length / 8)),
    currentPage = Math.min(page, pages);
  const savings =
    balance.totalIncome > 0
      ? Math.round((balance.balance / balance.totalIncome) * 100)
      : null;
  async function remove() {
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await endpoints.remove(deleting.id);
      setDeleting(null);
      setToast("Lançamento excluído.");
      await load();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  }
  const changeView = (next) => {
    setView(next);
    setSearch("");
    setType("");
    setCategory("");
    setPage(1);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand />
        <span className="nav-caption">SEU ESPAÇO</span>
        <nav aria-label="Navegação principal">
          {navigation.map(([id, label, icon]) => (
            <button
              key={id}
              aria-label={label}
              aria-current={view === id ? "page" : undefined}
              className={view === id ? "selected" : ""}
              onClick={() => changeView(id)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {view === id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-spark">✳</span>
            <h3>
              Pequenos hábitos.
              <br />
              Grandes conquistas.
            </h3>
            <p>Seu futuro começa com o que você organiza hoje.</p>
          </div>
          <button className="logout" onClick={() => logout()}>
            <Icon name="logout" />
            Sair da conta
          </button>
          <div className="creator-credit" aria-label={`Created by ${creator.name}`}>
            <span>Created by</span>
            <strong>{creator.name}</strong>
            <div>
              {creator.links.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                  <Icon name="external" size={12} />
                </a>
              ))}
            </div>
          </div>
          <small>OMNICASH © {new Date().getFullYear()}</small>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Meu espaço</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{navigation.find(([id]) => id === view)[1]}</strong>
          </div>
          <button className="user-chip" onClick={() => changeView("profile")}>
            <span className="avatar">
              {data?.user.name?.slice(0, 1).toUpperCase() || "O"}
            </span>
            <span>{data?.user.name || "Minha conta"}</span>
          </button>
        </header>
        <main className="workspace">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {view === "overview"
                  ? "UM OLHAR PARA O SEU DINHEIRO"
                  : "MAIS CLAREZA, TODOS OS DIAS"}
              </span>
              <h1>
                {view === "overview"
                  ? `Olá${data ? `, ${data.user.name.split(" ")[0]}` : ""}. Vamos organizar?`
                  : navigation.find(([id]) => id === view)[1]}
              </h1>
              <p>
                {view === "overview"
                  ? "Acompanhe seus movimentos. Abra espaço para suas conquistas."
                  : view === "transactions"
                    ? "Cada entrada e saída, no lugar certo."
                    : view === "reports"
                      ? "Entenda seus hábitos e planeje o próximo passo."
                      : "As informações que fazem desse espaço o seu."}
              </p>
            </div>
            {view !== "profile" && (
              <button
                className="primary"
                disabled={!data || loading}
                onClick={() => setEditor({})}
              >
                <Icon name="plus" size={18} />
                Novo lançamento
              </button>
            )}
          </div>
          {toast && (
            <div className="toast" role="status">
              <Icon name="check" size={18} />
              {toast}
              <button
                className="icon-button"
                aria-label="Dispensar mensagem"
                onClick={() => setToast("")}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          {error && (
            <div className="message error" role="alert">
              {error}{" "}
              <button className="text-button" onClick={load}>
                Tentar novamente
              </button>
            </div>
          )}
          {!data ? (
            <section className="panel loading-state" role="status">
              {loading
                ? "Preparando seu espaço…"
                : "Não foi possível carregar seu espaço. Tente novamente acima."}
            </section>
          ) : view === "profile" ? (
            <Profile
              onLogout={() => logout()}
              user={data.user}
              onUpdated={(user) => {
                setData((old) => ({ ...old, user }));
                setToast("Perfil atualizado.");
              }}
            />
          ) : (
            <>
              <div className="period-toolbar">
                <div className="period-control">
                  <Icon name="chart" size={17} />
                  <label className="sr-only" htmlFor="period">
                    Período
                  </label>
                  <select
                    id="period"
                    value={month}
                    onChange={(event) => {
                      setMonth(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Todo o período</option>
                    {[
                      ...new Set([
                        localDate().slice(0, 7),
                        ...rows.map((r) => r.date.slice(0, 7)),
                      ]),
                    ]
                      .sort()
                      .reverse()
                      .map((m) => (
                        <option value={m} key={m}>
                          {monthLabel(m)}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  className="text-button"
                  onClick={load}
                  disabled={loading}
                >
                  <Icon name="refresh" size={15} />
                  {loading ? "Atualizando…" : "Atualizar dados"}
                </button>
              </div>
              {view === "overview" && <section className="stats-grid" aria-label="Resumo financeiro">
                <article className="stat-card balance-card">
                  <div>
                    <span>Saldo do período</span>
                    <Icon name="wallet" />
                  </div>
                  <strong>{money(balance.balance)}</strong>
                  <small>
                    {month ? monthLabel(month) : "Todos os seus lançamentos"}
                  </small>
                  <span className="balance-decoration" />
                </article>
                <article className="stat-card">
                  <div>
                    <span>Receitas</span>
                    <span className="stat-icon income">
                      <Icon name="down" />
                    </span>
                  </div>
                  <strong>{money(balance.totalIncome)}</strong>
                  <small>
                    <span className="dot green" />
                    Entradas no período
                  </small>
                </article>
                <article className="stat-card">
                  <div>
                    <span>Despesas</span>
                    <span className="stat-icon expense">
                      <Icon name="up" />
                    </span>
                  </div>
                  <strong>{money(balance.totalExpense)}</strong>
                  <small>
                    <span className="dot orange" />
                    Saídas no período
                  </small>
                </article>
                <article className="stat-card">
                  <div>
                    <span>Saldo / receitas</span>
                    <Icon name="chart" />
                  </div>
                  <strong>{savings === null ? "—" : `${savings}%`}</strong>
                  <small>
                    {savings === null
                      ? "Adicione sua primeira receita"
                      : savings >= 0
                        ? "Parte das receitas que ficou com você"
                        : "As despesas superaram as receitas"}
                  </small>
                </article>
              </section>}
              {view === "overview" && (
                <div className="overview-grid">
                  <section className="panel overview-shortcuts" aria-label="Explore seu espaço">
                    <span className="eyebrow">CADA COISA NO SEU LUGAR</span>
                    <h2>O essencial, por aqui.</h2>
                    <p>Consulte seu saldo acima e escolha o que quer fazer agora.</p>
                    <button className="overview-link" onClick={() => changeView("transactions")}>
                      <Icon name="transfer" />
                      <span><strong>Ver lançamentos</strong><small>Busque, filtre e organize suas entradas e saídas.</small></span>
                      <span aria-hidden="true">→</span>
                    </button>
                    <button className="overview-link" onClick={() => changeView("reports")}>
                      <Icon name="chart" />
                      <span><strong>Explorar relatórios</strong><small>Acompanhe a evolução do seu dinheiro e exporte os dados.</small></span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </section>
                  <CategoryChart rows={periodRows} />
                </div>
              )}
              {view === "reports" && (
                <div className="charts-grid">
                  <FlowChart rows={rows} month={month} />
                  <CategoryChart rows={periodRows} />
                </div>
              )}
              {view === "transactions" && (
                <section className="panel transactions-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        Todos os lançamentos
                      </h2>
                      <p>
                        {filtered.length}{" "}
                        {filtered.length === 1
                          ? "movimentação encontrada"
                          : "movimentações encontradas"}{" "}
                        no período
                      </p>
                    </div>
                    <button
                      className="secondary"
                      disabled={!filtered.length}
                      onClick={() => exportCSV(filtered)}
                    >
                      <Icon name="download" size={16} />
                      <span>Exportar CSV</span>
                    </button>
                  </div>
                  <div className="filters">
                    <label className="search-input">
                      <Icon name="search" size={18} />
                      <input
                        aria-label="Buscar lançamentos"
                        placeholder="Buscar descrição ou categoria…"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                      />
                    </label>
                    <select
                      aria-label="Filtrar por tipo"
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="">Todos os tipos</option>
                      <option value="INCOME">Receitas</option>
                      <option value="EXPENSE">Despesas</option>
                    </select>
                    <select
                      aria-label="Filtrar por categoria"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="">Todas as categorias</option>
                      {data.categories.map((c) => (
                        <option value={c.id} key={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {(search || type || category) && (
                      <button
                        className="text-button"
                        onClick={() => {
                          setSearch("");
                          setType("");
                          setCategory("");
                        }}
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <TransactionTable
                    rows={filtered.slice(
                      (currentPage - 1) * 8,
                      currentPage * 8,
                    )}
                    onEdit={setEditor}
                    onDelete={(row) => {
                      setDeleteError("");
                      setDeleting(row);
                    }}
                    onCreate={() => setEditor({})}
                    filtered={Boolean(
                      search || type || category || rows.length,
                    )}
                  />
                  {!!filtered.length && (
                    <div className="table-footer">
                      <span>
                        {(currentPage - 1) * 8 + 1}–
                        {Math.min(currentPage * 8, filtered.length)} de{" "}
                        {filtered.length} lançamentos
                      </span>
                      <div>
                        <button
                          className="secondary"
                          disabled={currentPage === 1}
                          onClick={() => setPage(currentPage - 1)}
                        >
                          Anterior
                        </button>
                        <span>
                          {currentPage} / {pages}
                        </span>
                        <button
                          className="secondary"
                          disabled={currentPage === pages}
                          onClick={() => setPage(currentPage + 1)}
                        >
                          Próxima
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
              {view === "reports" && (
                <section className="report-banner">
                  <div>
                    <h2>Seus números, com você.</h2>
                    <p>
                      Exporte os lançamentos do período para analisar no seu
                      ritmo.
                    </p>
                  </div>
                  <button
                    className="secondary"
                    disabled={!periodRows.length}
                    onClick={() => exportCSV(periodRows)}
                  >
                    <Icon name="download" />
                    Exportar período
                  </button>
                </section>
              )}
              <footer className="workspace-footer">
                <span>Um passo de cada vez. Você está no controle.</span>
                <span>Feito com clareza. OmniCash.</span>
              </footer>
            </>
          )}
        </main>
      </div>
      {editor && data && (
        <TransactionForm
          transaction={editor}
          categories={data.categories}
          onClose={() => setEditor(null)}
          onSaved={(message) => {
            setEditor(null);
            setToast(message);
            load();
          }}
        />
      )}
      {deleting && (
        <Modal
          title="Excluir lançamento?"
          busy={deleteBusy}
          onClose={() => setDeleting(null)}
        >
          <p>
            O lançamento <strong>“{deleting.description}”</strong> de{" "}
            {money(deleting.amount)} será excluído. Essa ação não pode ser
            desfeita.
          </p>
          {deleteError && (
            <div className="message error" role="alert">
              {deleteError}
            </div>
          )}
          <div className="modal-actions">
            <button
              className="secondary"
              disabled={deleteBusy}
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </button>
            <button className="danger" disabled={deleteBusy} onClick={remove}>
              {deleteBusy ? "Excluindo…" : "Excluir lançamento"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
