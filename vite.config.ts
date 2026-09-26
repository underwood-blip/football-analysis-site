import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    allowedHosts: [".monkeycode-ai.live", ".monkeycode-ai.online"],
    proxy: {
      "/api/fd": {
        target: "https://football-data.co.uk",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fd/, ""),
      },
    },
  },
});
