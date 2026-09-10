import { localDate, summarize, money } from "../lib/finance";
export function FlowChart({ rows, month }) {
  const end = new Date(`${month || localDate().slice(0, 7)}-01T12:00:00`);
  const series = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(end.getFullYear(), end.getMonth() - 5 + i, 1),
      key = localDate(date).slice(0, 7);
    return {
      label: date
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      key,
      ...summarize(rows.filter((row) => row.date.startsWith(key))),
    };
  });
  const max = Math.max(
    1,
    ...series.flatMap((s) => [s.totalIncome, s.totalExpense]),
  );
  return (
    <section className="panel flow-panel">
      <div className="panel-heading">
        <div>
          <h2>Seu fluxo financeiro</h2>
          <p>Receitas e despesas nos últimos 6 meses</p>
        </div>
        <div className="legend">
          <span>
            <i />
            Receitas
          </span>
          <span>
            <i />
            Despesas
          </span>
        </div>
      </div>
      <div className="bar-chart">
        <div className="chart-axis">
          {[1, 0.5, 0].map((n) => (
            <span key={n}>{money(max * n)}</span>
          ))}
        </div>
        <div className="bar-plot">
          {series.map((s) => (
            <div className="bar-group" key={s.key}>
              <div
                className="bars"
                aria-label={`${s.key}: receitas ${money(s.totalIncome)}, despesas ${money(s.totalExpense)}`}
              >
                <div
                  className="bar income-bar"
                  style={{ height: `${(s.totalIncome / max) * 100}%` }}
                  title={`Receitas: ${money(s.totalIncome)}`}
                />
                <div
                  className="bar expense-bar"
                  style={{ height: `${(s.totalExpense / max) * 100}%` }}
                  title={`Despesas: ${money(s.totalExpense)}`}
                />
              </div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
const colors = [
  "#2c6953",
  "#84a98c",
  "#c0cf9b",
  "#d6ba80",
  "#b6b6a8",
  "#e0ded2",
];
export function CategoryChart({ rows }) {
  const sums = new Map();
  rows
    .filter((r) => r.type === "EXPENSE")
    .forEach((r) => {
      const name = r.categoryName || "Sem categoria";
      sums.set(
        name,
        (sums.get(name) || 0) + Math.round(Number(r.amount) * 100),
      );
    });
  const entries = [...sums].sort((a, b) => b[1] - a[1]);
  const groups =
    entries.length > 5
      ? [
          ...entries.slice(0, 5),
          [
            "Outras",
            entries.slice(5).reduce((sum, [, value]) => sum + value, 0),
          ],
        ]
      : entries;
  const total = groups.reduce((sum, [, value]) => sum + value, 0);
  const gradient = groups
    .map(([, value], i) => {
      const start =
        (groups.slice(0, i).reduce((sum, [, amount]) => sum + amount, 0) /
          total) *
        100;
      return `${colors[i]} ${start}% ${start + (value / total) * 100}%`;
    })
    .join(",");
  return (
    <section className="panel category-panel">
      <div className="panel-heading">
        <div>
          <h2>Para onde vai seu dinheiro?</h2>
          <p>Despesas por categoria no período</p>
        </div>
      </div>
      {total ? (
        <>
          <div
            className="donut"
            style={{ background: `conic-gradient(${gradient})` }}
            role="img"
            aria-label={`Total de despesas: ${money(total / 100)}`}
          >
            <div>
              <small>Total de despesas</small>
              <strong>{money(total / 100)}</strong>
            </div>
          </div>
          <div className="category-legend">
            {groups.map(([name, value], i) => (
              <div key={name}>
                <span>
                  <i style={{ background: colors[i] }} />
                  {name}
                </span>
                <strong>{Math.round((value / total) * 100)}%</strong>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="chart-empty">
          <div className="donut empty-donut">
            <div>
              <strong>Sem despesas</strong>
              <small>Um novo começo</small>
            </div>
          </div>
          <p>
            Suas categorias aparecem aqui
            <br />
            depois do primeiro lançamento.
          </p>
        </div>
      )}
    </section>
  );
}
