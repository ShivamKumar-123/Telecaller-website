import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Shared by dev server and `vite preview` — preview does NOT inherit `server.proxy` without this.
const apiProxy = {
  "/api": {
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
    secure: false,
  },
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL || "").trim().replace(/\/+$/, "") || "http://localhost:5173";

  return {
    plugins: [
      react(),
      {
        name: "html-seo-site-url",
        transformIndexHtml(html) {
          return html.replace(/%SITE_URL%/g, siteUrl);
        },
      },
    ],
    server: {
      host: true,
      proxy: apiProxy,
    },
    preview: {
      host: true,
      proxy: apiProxy,
    },
  };
});
