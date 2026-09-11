import test from "node:test";
import assert from "node:assert/strict";
import { normalizeApiBase } from "../src/api.js";

test("normaliza a URL base da API configurada no Vite", () => {
  assert.equal(
    normalizeApiBase("https://omnicash-gj66.onrender.com/"),
    "https://omnicash-gj66.onrender.com",
  );
  assert.equal(
    normalizeApiBase("[https://omnicash-gj66.onrender.com](https://omnicash-gj66.onrender.com)"),
    "https://omnicash-gj66.onrender.com",
  );
});
