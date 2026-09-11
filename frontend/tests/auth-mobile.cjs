const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs/promises");
const origin = process.env.E2E_URL || "http://127.0.0.1:5173";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const output = path.resolve(__dirname, "../test-results");
  await fs.mkdir(output, { recursive: true });
  const requests = [], errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/OmniCash/**", async route => {
    const endpoint = new URL(route.request().url()).pathname;
    const body = route.request().postDataJSON();
    if (body) requests.push({ endpoint, body });
    const data = endpoint.endsWith("auth-options") ? { passwordRecovery: true, googleClientId: "" }
      : endpoint.endsWith("esqueci-senha") ? { message: "Se houver uma conta com esse e-mail, enviaremos um link para redefinir sua senha." }
      : endpoint.endsWith("redefinir-senha") ? { message: "Senha atualizada! Entre com sua nova senha." }
      : {};
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(data) });
  });
  async function noOverflow() {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal overflow");
  }
  try {
    for (const width of [320, 360, 390, 720, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(origin);
      await page.getByRole("button", { name: "Criar conta", exact: true }).click();
      await page.getByLabel("Seu nome").fill("Pessoa teste");
      await page.getByLabel("E-mail", { exact: true }).fill("test@example.test");
      await page.getByLabel("Senha", { exact: true }).fill("fraca");
      await page.getByLabel("Confirmar senha", { exact: true }).fill("fraca");
      await page.getByRole("button", { name: "Criar minha conta" }).click();
      await page.getByRole("alert").filter({ hasText: "requisitos" }).waitFor();
      assert.equal(requests.filter(r => r.endpoint.endsWith("cadastro")).length, 0);
      await page.getByLabel("Senha", { exact: true }).fill("SenhaForte123");
      await page.getByRole("button", { name: "Criar minha conta" }).click();
      await page.getByRole("alert").filter({ hasText: "não coincidem" }).waitFor();
      await page.getByRole("button", { name: "Mostrar senha", exact: true }).click();
      assert.equal(await page.getByLabel("Senha", { exact: true }).getAttribute("type"), "text");
      await noOverflow();
      if (width === 390) await page.screenshot({ path: path.join(output, "register-mobile.png"), fullPage: true });
      await page.getByRole("button", { name: "Entrar", exact: true }).click();
      await page.getByRole("button", { name: "Esqueci minha senha" }).click();
      await page.getByLabel("E-mail", { exact: true }).fill("test@example.test");
      await page.getByRole("button", { name: "Enviar link de recuperação" }).click();
      await page.getByRole("status").filter({ hasText: "Se houver" }).waitFor();
      await noOverflow();
      if (width === 390) await page.screenshot({ path: path.join(output, "recovery-mobile.png"), fullPage: true });
      await page.evaluate(() => localStorage.setItem("omnicash.token", "old-session"));
      await page.goto(origin + "/#reset=" + "a".repeat(43));
      await page.getByRole("heading", { name: "Escolha uma nova senha." }).waitFor();
      assert.equal(new URL(page.url()).hash, "");
      await page.getByLabel("Senha", { exact: true }).fill("SenhaNova123");
      await page.getByLabel("Confirmar senha", { exact: true }).fill("SenhaNova123");
      await page.getByRole("button", { name: "Salvar nova senha" }).click();
      await page.getByRole("status").filter({ hasText: "Senha atualizada" }).waitFor();
      assert.equal(await page.evaluate(() => localStorage.getItem("omnicash.token")), null);
      await noOverflow();
    }
    assert.equal(requests.filter(r => r.endpoint.endsWith("redefinir-senha")).length, 5);
    assert.deepEqual(errors, []);
    console.log("PASS: cadastro seguro, confirmação, visibilidade, recuperação e redefinição em 320/360/390/720/1440px (API simulada, sem envio de e-mail).");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
