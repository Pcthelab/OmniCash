import Icon from "./Icon";
import { money, dateLabel } from "../lib/finance";
export default function TransactionTable({
  rows,
  onEdit,
  onDelete,
  onCreate,
  filtered = false,
}) {
  if (!rows.length)
    return (
      <div className="empty-state">
        <span className="empty-icon">
          <Icon name="transfer" size={30} />
        </span>
        <h3>
          {filtered
            ? "Nenhum resultado por aqui"
            : "Comece com seu primeiro lançamento"}
        </h3>
        <p>
          {filtered
            ? "Experimente outro período ou ajuste os filtros."
            : "Registre uma receita ou despesa e veja seu dinheiro ganhar clareza."}
        </p>
        {!filtered && (
          <button className="secondary" onClick={onCreate}>
            <Icon name="plus" size={16} />
            Adicionar lançamento
          </button>
        )}
      </div>
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Data</th>
            <th className="align-right">Valor</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <div className="transaction-description">
                  <span className={`type-icon ${row.type.toLowerCase()}`}>
                    <Icon
                      name={row.type === "INCOME" ? "down" : "up"}
                      size={18}
                    />
                  </span>
                  <div>
                    <strong>{row.description}</strong>
                    <small>
                      {row.type === "INCOME" ? "Receita" : "Despesa"}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <span className="category-tag">
                  {row.categoryName || "Sem categoria"}
                </span>
              </td>
              <td className="date-cell">{dateLabel(row.date)}</td>
              <td className={`align-right amount ${row.type.toLowerCase()}`}>
                {row.type === "INCOME" ? "+" : "−"} {money(row.amount)}
              </td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-button"
                    aria-label={`Editar ${row.description}`}
                    onClick={() => onEdit(row)}
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    className="icon-button delete-button"
                    aria-label={`Excluir ${row.description}`}
                    onClick={() => onDelete(row)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
