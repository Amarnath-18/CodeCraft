import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    proxy: {
      '/api/avatar': {
        target: 'https://api.dicebear.com/8.x/pixel-art/svg',
        changeOrigin: true,
        rewrite: (path) => {
          const seed = path.split('/api/avatar/')[1];
          return `?seed=${seed}`;
        },
        secure: true,
      }
    }
  },
});
