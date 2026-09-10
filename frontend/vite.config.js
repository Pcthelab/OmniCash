import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/OmniCash": "http://localhost:8080",
      "/lancamento": "http://localhost:8080",
      "/categories": "http://localhost:8080",
      "/usuario": "http://localhost:8080",
    },
  },
});
