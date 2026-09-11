import test from "node:test";
import assert from "node:assert/strict";
import { validPassword } from "../src/lib/password.js";

test("novas senhas exigem comprimento, maiúscula, minúscula e número", () => {
  for (const value of ["", "Senha123", "somenteletras123", "SOMENTELETRAS123", "SemNumerosAqui"])
    assert.equal(validPassword(value), false, value);
  assert.equal(validPassword("Uma frase longa 123"), true);
});
test("limita bytes UTF-8 para não truncar senhas no BCrypt", () => {
  assert.equal(validPassword("Aa1" + "a".repeat(69)), true);
  assert.equal(validPassword("Aa1" + "a".repeat(70)), false);
  assert.equal(validPassword("Aa1" + "🔒".repeat(18)), false);
});
