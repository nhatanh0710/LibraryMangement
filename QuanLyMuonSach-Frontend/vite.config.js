import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Nếu cần alias src -> @
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 5173,
  },
});
