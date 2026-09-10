export const money = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const dateLabel = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
export const monthLabel = (month) =>
  new Date(`${month}-01T12:00:00`).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
export function summarize(rows) {
  let income = 0,
    expense = 0;
  for (const row of rows) {
    const cents = Math.round(Number(row.amount) * 100);
    if (row.type === "INCOME") income += cents;
    if (row.type === "EXPENSE") expense += cents;
  }
  return {
    totalIncome: income / 100,
    totalExpense: expense / 100,
    balance: (income - expense) / 100,
  };
}
export function parseAmount(raw) {
  const value = String(raw).trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return NaN;
  return Number(value.replace(",", "."));
}
export function filterRows(
  rows,
  { month = "", search = "", type = "", category = "" },
) {
  return rows
    .filter(
      (row) =>
        (!month || row.date.startsWith(month)) &&
        (!type || row.type === type) &&
        (!category || String(row.categoryId) === category) &&
        `${row.description} ${row.categoryName || ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(search.toLocaleLowerCase("pt-BR")),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}
export function csvContent(rows) {
  const escape = (value) =>
    `"${String(value ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""')}"`;
  return (
    "\uFEFF" +
    [
      ["Descrição", "Tipo", "Categoria", "Valor (R$)", "Data"],
      ...rows.map((row) => [
        row.description,
        row.type === "INCOME" ? "Receita" : "Despesa",
        row.categoryName,
        Number(row.amount).toFixed(2).replace(".", ","),
        row.date,
      ]),
    ]
      .map((row) => row.map(escape).join(";"))
      .join("\r\n")
  );
}
export function exportCSV(rows) {
  const url = URL.createObjectURL(
    new Blob([csvContent(rows)], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `omnicash-${localDate()}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
