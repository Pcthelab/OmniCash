import { useState } from "react";
import Modal from "./Modal";
import { endpoints } from "../api";
import { localDate, parseAmount } from "../lib/finance";
export default function TransactionForm({
  transaction,
  categories,
  onClose,
  onSaved,
}) {
  const editing = Boolean(transaction?.id);
  const [type, setType] = useState(transaction?.type || "EXPENSE"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const options = categories.filter((c) => c.type === type);
  async function submit(event) {
    event.preventDefault();
    setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget)),
      amount = parseAmount(fields.amount);
    if (!fields.description.trim()) return setError("Informe uma descrição.");
    if (!Number.isFinite(amount) || amount < 0.01)
      return setError(
        "Informe um valor positivo com até duas casas decimais, como 35,90.",
      );
    const body = {
      description: fields.description.trim(),
      amount,
      type,
      date: fields.date,
    };
    if (!editing) body.categoryId = Number(fields.categoryId);
    setBusy(true);
    try {
      if (editing) await endpoints.update(transaction.id, body);
      else await endpoints.create(body);
      onSaved(editing ? "Lançamento atualizado." : "Lançamento adicionado.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={editing ? "Editar lançamento" : "Novo lançamento"}
      busy={busy}
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={submit}>
        <div className="segmented">
          {[
            ["EXPENSE", "Despesa"],
            ["INCOME", "Receita"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={type === value}
              disabled={busy}
              className={type === value ? "active" : ""}
              onClick={() => setType(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {error && (
          <div role="alert" className="message error">
            {error}
          </div>
        )}
        <label>
          Descrição
          <input
            name="description"
            autoFocus
            required
            maxLength={255}
            defaultValue={transaction?.description}
            placeholder="Ex.: Compras da semana"
          />
        </label>
        <div className="form-row">
          <label>
            Valor (R$)
            <input
              name="amount"
              required
              inputMode="decimal"
              defaultValue={transaction?.amount?.toString().replace(".", ",")}
              placeholder="0,00"
            />
          </label>
          <label>
            Data
            <input
              name="date"
              required
              type="date"
              defaultValue={transaction?.date || localDate()}
            />
          </label>
        </div>
        {editing ? (
          <label>
            Categoria
            <input
              disabled
              value={transaction.categoryName || "Sem categoria"}
            />
            <small>A categoria é mantida na edição.</small>
          </label>
        ) : (
          <label>
            Categoria
            <select
              aria-label="Categoria"
              key={type}
              name="categoryId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Selecione uma categoria
              </option>
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {!editing && !options.length && (
          <p className="message error">
            Não há categorias disponíveis para este tipo. Atualize os dados e
            tente novamente.
          </p>
        )}
        <div className="modal-actions">
          <button
            className="secondary"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="primary"
            disabled={busy || (!editing && !options.length)}
          >
            {busy ? "Salvando…" : "Salvar lançamento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
