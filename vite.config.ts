import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
const base = process.env.VITE_BASE || "/historinha/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
});
