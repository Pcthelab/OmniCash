export const passwordRules = [
  ["Pelo menos 10 caracteres", (value) => [...value].length >= 10],
  ["Uma letra maiúscula (A–Z)", (value) => /[A-Z]/.test(value)],
  ["Uma letra minúscula (a–z)", (value) => /[a-z]/.test(value)],
  ["Um número", (value) => /[0-9]/.test(value)],
  ["Até 72 bytes (acentos e emojis ocupam mais espaço)", (value) => new TextEncoder().encode(value).length <= 72],
];
export const validPassword = (value) => passwordRules.every(([, valid]) => valid(value));
