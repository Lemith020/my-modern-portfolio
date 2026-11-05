import { defineConfig, loadEnv } from "vite";
import { createSeoPlugin } from "./scripts/seo.ts";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    createSeoPlugin({ ...loadEnv(mode, process.cwd(), ""), ...process.env })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
