const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

(async () => {
  const safari = process.env.E2E_BROWSER === "webkit";
  const browser = await (safari ? webkit.launch({ headless: true }) : chromium.launch({ channel: "msedge", headless: true }));
  const page = await browser.newPage({ locale: "pt-BR", hasTouch: true, isMobile: true });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const date = new Date();
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const categories = [{ id: 1, name: "CategoriaMuitoLongaSemEspacos".repeat(3), type: "EXPENSE" }];
  let name = "Marina".repeat(16);
  const saved = [];
  let rows = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, description: `Compra ${i} ${"DescriçãoLonga".repeat(10)}`, amount: 9876543.21, date: `${month}-01`, type: "EXPENSE", categoryId: 1, categoryName: categories[0].name }));
  await page.addInitScript(() => localStorage.setItem("omnicash.token", "layout-test"));
  await page.route("**/*", async route => {
    const endpoint = new URL(route.request().url()).pathname;
    if (endpoint === "/lancamento" && route.request().method() === "POST") {
      saved.push(route.request().postDataJSON());
      return route.fulfill({ status: 201, json: { id: 11, ...saved.at(-1) } });
    }
    const data = endpoint === "/usuario/me" ? { name, email: "marina@example.test" }
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
      const dialog = document.querySelector("dialog[open]");
      if (dialog && dialog.scrollWidth > dialog.clientWidth) problems.push("dialog overflow");
      for (const el of document.querySelectorAll(".panel button, .panel input, .panel select, .stat-card strong, dialog button, dialog input, dialog select")) {
        if (!el.getClientRects().length) continue;
        const box = el.getBoundingClientRect();
        const parent = el.closest(".panel, .stat-card, dialog").getBoundingClientRect();
        if (box.left < parent.left - 1 || box.right > parent.right + 1) problems.push(el.outerHTML.slice(0, 120));
        if (el.matches(".transaction-form input, .transaction-form select")) {
          const label = el.closest("label").getBoundingClientRect();
          if (box.left < label.left - 1 || box.right > label.right + 1 || el.scrollWidth > el.clientWidth + 1) problems.push(`field overflow: ${el.name}`);
        }
      }
      return problems;
    });
    assert.deepEqual(issues, [], label);
  }
  try {
    await fs.mkdir(path.resolve(__dirname, "../test-results"), { recursive: true });
    for (const width of [320, 360, 375, 390, 414, 480, 720, 768, 1024, 1440]) {
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
      assert.equal(await page.locator(":focus").getAttribute("id"), "modal-title");
      const dateField = page.getByLabel("Data", { exact: true });
      await dateField.fill(`${month}-12`);
      assert.equal(await dateField.inputValue(), `${month}-12`);
      await check(`modal ${width}`);
      if (width <= 720) {
        const amountBox = await page.getByLabel("Valor (R$)", { exact: true }).boundingBox();
        const dateBox = await dateField.boundingBox();
        assert.ok(dateBox.y >= amountBox.y + amountBox.height, "Date below amount on mobile");
        assert.ok(Math.abs(dateBox.width - amountBox.width) < 1, "Aligned field widths");
      }
      await page.keyboard.press("Escape");
      await page.getByRole("navigation").getByRole("button", { name: "Relatórios" }).click();
      await check(`reports ${width}`);
      await page.getByRole("navigation").getByRole("button", { name: "Minha conta" }).click();
      await check(`profile ${width}`);
    }
    name = "Marina";
    categories[0].name = "Alimentação";
    rows = [{ id: 1, description: "Compras da semana", amount: 180.5, date: `${month}-01`, type: "EXPENSE", categoryId: 1, categoryName: "Alimentação" }, { id: 2, description: "Salário", amount: 5200, date: `${month}-01`, type: "INCOME", categoryName: "Salário" }];
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.getByRole("button", { name: "Ver lançamentos" }).waitFor();
    await page.screenshot({ path: path.resolve(__dirname, "../test-results/overview-mobile.png"), fullPage: true });
    await page.getByRole("button", { name: "Novo lançamento", exact: true }).click();
    await page.screenshot({ path: path.resolve(__dirname, "../test-results/date-mobile.png") });
    await page.getByLabel("Descrição", { exact: true }).fill("Teste de data");
    await page.getByLabel("Valor (R$)", { exact: true }).fill("42,50");
    await page.getByLabel("Data", { exact: true }).fill(`${month}-12`);
    await page.getByRole("dialog").getByLabel("Categoria", { exact: true }).selectOption("1");
    await page.setViewportSize({ width: 390, height: 420 });
    await check("modal with limited vertical space");
    await page.getByRole("button", { name: "Salvar lançamento", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(saved.at(-1).date, `${month}-12`);
    assert.equal(saved.at(-1).amount, 42.5);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    rows = [];
    await page.reload();
    await page.getByRole("button", { name: "Ver lançamentos" }).click();
    await page.getByRole("heading", { name: "Comece com seu primeiro lançamento" }).waitFor();
    assert.deepEqual(errors, []);
    console.log("PASS: navigation, search, pagination, empty state and containment at 10 widths; date alignment, focus, short viewport and saved payload.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
