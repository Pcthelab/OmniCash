const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const date = new Date();
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const categories = [{ id: 1, name: "CategoriaMuitoLongaSemEspacos".repeat(3), type: "EXPENSE" }];
  let rows = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, description: `Compra ${i} ${"DescriçãoLonga".repeat(10)}`, amount: 9876543.21, date: `${month}-01`, type: "EXPENSE", categoryId: 1, categoryName: categories[0].name }));
  await page.addInitScript(() => localStorage.setItem("omnicash.token", "layout-test"));
  await page.route("**/*", async route => {
    const endpoint = new URL(route.request().url()).pathname;
    const data = endpoint === "/usuario/me" ? { name: "Marina".repeat(16), email: "marina@example.test" }
      : endpoint === "/lancamento" ? rows
      : endpoint === "/categories" ? categories
      : endpoint === "/lancamento/balance" ? { balance: -98765432.1, totalExpense: 98765432.1, totalIncome: 0 } : null;
    if (data === null) return route.continue();
    await route.fulfill({ json: data });
  });
  async function check(label) {
    const issues = await page.evaluate(() => {
      const problems = [];
      if (document.documentElement.scrollWidth > innerWidth) problems.push("page overflow");
      for (const el of document.querySelectorAll(".panel button, .panel input, .panel select, .stat-card strong, dialog button, dialog input, dialog select")) {
        if (!el.getClientRects().length) continue;
        const box = el.getBoundingClientRect();
        const parent = el.closest(".panel, .stat-card, dialog").getBoundingClientRect();
        if (box.left < parent.left - 1 || box.right > parent.right + 1) problems.push(el.outerHTML.slice(0, 120));
      }
      return problems;
    });
    assert.deepEqual(issues, [], label);
  }
  try {
    await fs.mkdir(path.resolve(__dirname, "../test-results"), { recursive: true });
    for (const width of [320, 360, 390, 480, 720, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(process.env.E2E_URL || "http://127.0.0.1:5173");
      await page.getByRole("button", { name: "Ver lançamentos" }).waitFor();
      assert.equal(await page.locator(".transactions-panel").count(), 0);
      await check(`overview ${width}`);
      if (width === 390) await page.screenshot({ path: path.resolve(__dirname, "../test-results/overview-mobile.png"), fullPage: true });
      await page.getByRole("button", { name: "Ver lançamentos" }).click();
      assert.equal(await page.locator(".stats-grid, .charts-grid").count(), 0);
      await check(`transactions ${width}`);
      await page.getByRole("button", { name: "Próxima", exact: true }).click();
      assert.equal(await page.locator("tbody tr").count(), 2);
      await page.getByRole("textbox", { name: "Buscar lançamentos" }).fill("Compra 0");
      assert.equal(await page.locator("tbody tr").count(), 1);
      await page.getByRole("button", { name: "Novo lançamento", exact: true }).click();
      await check(`modal ${width}`);
      await page.keyboard.press("Escape");
      await page.getByRole("navigation").getByRole("button", { name: "Relatórios" }).click();
      await check(`reports ${width}`);
      await page.getByRole("navigation").getByRole("button", { name: "Minha conta" }).click();
      await check(`profile ${width}`);
    }
    rows = [];
    await page.reload();
    await page.getByRole("button", { name: "Ver lançamentos" }).click();
    await page.getByRole("heading", { name: "Comece com seu primeiro lançamento" }).waitFor();
    assert.deepEqual(errors, []);
    console.log("PASS: section navigation, search, pagination, empty state and card containment at 8 widths, including dialogs.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
