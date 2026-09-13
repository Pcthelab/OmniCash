const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const origin = process.env.E2E_URL || "http://127.0.0.1:5173";
const apiOrigin = process.env.E2E_API_URL || "http://localhost:8080";
const output = path.resolve(__dirname, "../test-results");
(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const email = `omnicash-e2e-${randomUUID()}@example.test`,
    password = "OmniCash-test-2026!";
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let token;
  async function api(endpoint, method = "GET") {
    const response = await fetch(apiOrigin + endpoint, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.ok(response.ok, `${method} ${endpoint}: ${response.status}`);
    return response.status === 204 ? null : response.json();
  }
  async function add(description, amount, type, category) {
    await page
      .getByRole("button", { name: "Novo lançamento", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: type, exact: true }).click();
    await dialog.getByLabel("Descrição", { exact: true }).fill(description);
    await dialog.getByLabel("Valor (R$)", { exact: true }).fill(amount);
    await dialog
      .getByLabel("Categoria", { exact: true })
      .selectOption({ label: category });
    const saved = page.waitForResponse(
      (r) => r.url().endsWith("/lancamento") && r.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Salvar lançamento" }).click();
    assert.equal((await saved).status(), 201);
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page
      .getByRole("button", { name: `Editar ${description}`, exact: true })
      .waitFor();
  }
  try {
    await page.goto(origin);
    await page
      .getByRole("button", { name: "Criar conta", exact: true })
      .click();
    await page.getByLabel("Seu nome").fill("Marina Teste");
    await page.getByLabel("E-mail", { exact: true }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByLabel("Confirmar senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Criar minha conta" }).click();
    await page
      .getByText("Conta criada! Entre com seu e-mail e senha.")
      .waitFor();
    await page.getByLabel("Senha", { exact: true }).fill("senha-incorreta");
    await page.getByRole("button", { name: "Entrar na minha conta" }).click();
    await page.getByText("E-mail ou senha incorretos.").waitFor();
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar na minha conta" }).click();
    await page.getByRole("button", { name: "Ver lançamentos" }).click();
    await page
      .getByRole("heading", { name: "Comece com seu primeiro lançamento" })
      .waitFor();
    token = await page.evaluate(() => localStorage.getItem("omnicash.token"));
    assert.equal((await api("/categories")).length, 13);
    await add("Salário de setembro", "5200,00", "Receita", "Salário");
    await add("Compras da semana", "180,50", "Despesa", "Alimentação");
    await add("Assinatura de música", "21,90", "Despesa", "Assinaturas");
    assert.equal((await api("/lancamento/balance")).balance, 4997.6);
    await page
      .getByRole("button", { name: "Editar Compras da semana", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Valor (R$)", { exact: true })
      .fill("195,50");
    const patched = page.waitForResponse(
      (r) => r.request().method() === "PATCH",
    );
    await page.getByRole("button", { name: "Salvar lançamento" }).click();
    assert.equal((await patched).status(), 200);
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal((await api("/lancamento/balance")).balance, 4982.6);
    await page
      .getByRole("button", { name: "Atualizar dados", exact: true })
      .waitFor();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: path.join(output, "dashboard-desktop.png"),
      fullPage: true,
    });
    await page
      .getByRole("textbox", { name: "Buscar lançamentos" })
      .fill("música");
    assert.equal(await page.locator("tbody tr").count(), 1);
    await page.getByRole("button", { name: "Limpar", exact: true }).click();
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar CSV" }).click();
    const download = await downloadEvent;
    await download.saveAs(path.join(output, "export.csv"));
    assert.ok(
      (await fs.readFile(path.join(output, "export.csv"), "utf8")).includes(
        "Compras da semana",
      ),
    );
    await page
      .getByRole("button", {
        name: "Excluir Assinatura de música",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancelar" })
      .click();
    assert.equal((await api("/lancamento")).length, 3);
    await page
      .getByRole("button", {
        name: "Excluir Assinatura de música",
        exact: true,
      })
      .click();
    const deleted = page.waitForResponse(
      (r) => r.request().method() === "DELETE",
    );
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Excluir lançamento", exact: true })
      .click();
    assert.equal((await deleted).status(), 204);
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page
      .getByRole("navigation")
      .getByRole("button", { name: "Minha conta" })
      .click();
    await page.getByLabel("Nome", { exact: true }).fill("Marina Atualizada");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await page.getByText("Perfil atualizado.").waitFor();
    assert.equal((await api("/usuario/me")).name, "Marina Atualizada");
    await page.reload();
    await page
      .getByRole("heading", { name: "Olá, Marina. Vamos organizar?" })
      .waitFor();
    await page.getByRole("button", { name: "Ver lançamentos" }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    for (const width of [320, 360, 390, 720, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Dashboard overflow at ${width}px`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(output, "dashboard-mobile.png"),
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Mobile must not overflow horizontally",
    );
    await page
      .getByRole("button", { name: "Novo lançamento", exact: true })
      .click();
    await page.screenshot({
      path: path.join(output, "transaction-mobile.png"),
      fullPage: true,
    });
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page
      .getByRole("navigation")
      .getByRole("button", { name: "Relatórios" })
      .click();
    await page
      .getByRole("heading", { name: "Seus números, com você." })
      .waitFor();
    await page.evaluate(() =>
      localStorage.setItem("omnicash.token", "invalid-token"),
    );
    await page.reload();
    await page.getByText("Sua sessão expirou. Entre novamente.").waitFor();
    await page.screenshot({
      path: path.join(output, "auth-mobile.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: cadastro, login inválido/válido, categorias, criação, PATCH, saldo, busca, CSV, exclusão/cancelamento, perfil, persistência, mobile, modal, relatórios e sessão expirada.",
    );
  } catch (error) {
    await page.screenshot({
      path: path.join(output, "failure.png"),
      fullPage: true,
    });
    console.log((await page.locator("body").innerText()).slice(-3500));
    throw error;
  } finally {
    if (!token) {
      const login = await fetch(apiOrigin + "/OmniCash/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (login.ok) token = (await login.json()).token;
    }
    if (token) {
      const rows = await api("/lancamento");
      for (const row of rows) await api(`/lancamento/${row.id}`, "DELETE");
      await api("/usuario/me", "DELETE");
      console.log("Conta e lançamentos de teste removidos.");
    }
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
