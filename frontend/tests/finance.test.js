import test from "node:test";
import assert from "node:assert/strict";
import {
  summarize,
  parseAmount,
  filterRows,
  csvContent,
  localDate,
} from "../src/lib/finance.js";
const rows = [
  {
    id: 1,
    amount: 0.1,
    type: "INCOME",
    date: "2026-09-01",
    description: "Salário",
    categoryName: "Trabalho",
    categoryId: 1,
  },
  {
    id: 2,
    amount: 0.2,
    type: "INCOME",
    date: "2026-09-02",
    description: "Freelance",
    categoryName: "Trabalho",
    categoryId: 1,
  },
  {
    id: 3,
    amount: 0.3,
    type: "EXPENSE",
    date: "2026-08-31",
    description: "Mercado",
    categoryName: "Alimentação",
    categoryId: 2,
  },
];
test("calcula saldo em centavos, sem resíduos de ponto flutuante", () => {
  assert.deepEqual(summarize(rows), {
    totalIncome: 0.3,
    totalExpense: 0.3,
    balance: 0,
  });
  assert.equal(summarize(rows.slice(2)).balance, -0.3);
});
test("aceita vírgula decimal e rejeita valores ambíguos", () => {
  assert.equal(parseAmount("35,90"), 35.9);
  assert.equal(parseAmount("35.90"), 35.9);
  for (const value of ["1.000,00", "1,2,3", "3.456", "", "-2", "1e3"])
    assert.ok(Number.isNaN(parseAmount(value)));
});
test("combina período, tipo, categoria e busca sem mutar os dados", () => {
  assert.deepEqual(
    filterRows(rows, {
      month: "2026-09",
      type: "INCOME",
      category: "1",
      search: "FREELANCE",
    }).map((r) => r.id),
    [2],
  );
  assert.deepEqual(
    filterRows(rows, {}).map((r) => r.id),
    [2, 1, 3],
  );
  assert.equal(rows[0].id, 1);
});
test("exporta CSV escapado e neutraliza fórmulas em descrições", () => {
  const csv = csvContent([{ ...rows[0], description: '=HYPERLINK("teste");' }]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'=HYPERLINK(""teste"");"'));
  assert.ok(csv.includes('"0,10"'));
});
test("usa a data local sem conversão UTC", () =>
  assert.equal(localDate(new Date(2026, 8, 10, 23, 59)), "2026-09-10"));
