const TOKEN_KEY = "omnicash.token";
const rawBase = import.meta.env?.VITE_API_URL || "";
export const normalizeApiBase = (value) => {
  const trimmed = value.trim();
  const markdownLink = trimmed.match(/^\[?(https?:\/\/[^\]\s)]+)\]?(?:\([^)]*\))?$/);
  return (markdownLink?.[1] || trimmed).replace(/\/$/, "");
};
const base = normalizeApiBase(rawBase);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export async function api(
  path,
  { method = "GET", body, signal, publicRequest = false } = {},
) {
  const token = publicRequest ? null : getToken();
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Não foi possível conectar. Confira sua conexão e tente novamente.",
    );
  }
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    if (token && [401, 403].includes(response.status)) {
      clearToken();
      window.dispatchEvent(new Event("omnicash:expired"));
      throw new Error("Sua sessão expirou. Entre novamente.");
    }
    throw new Error(
      publicRequest &&
        path.endsWith("/login") &&
        [400, 401, 403].includes(response.status)
        ? "E-mail ou senha incorretos."
        : data?.message ||
            (response.status >= 500
              ? "O serviço está indisponível. Tente novamente em instantes."
              : "Não foi possível concluir a operação."),
    );
  }
  return data;
}
export const endpoints = {
  login: (body) =>
    api("/OmniCash/login", { method: "POST", body, publicRequest: true }),
  register: (body) =>
    api("/OmniCash/cadastro", { method: "POST", body, publicRequest: true }),
  me: (signal) => api("/usuario/me", { signal }),
  profile: (body) => api("/usuario/me", { method: "PUT", body }),
  transactions: (signal) => api("/lancamento", { signal }),
  balance: (signal) => api("/lancamento/balance", { signal }),
  categories: (signal) => api("/categories", { signal }),
  create: (body) => api("/lancamento", { method: "POST", body }),
  update: (id, body) => api(`/lancamento/${id}`, { method: "PATCH", body }),
  remove: (id) => api(`/lancamento/${id}`, { method: "DELETE" }),
};
