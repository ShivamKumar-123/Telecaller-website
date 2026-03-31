/**
 * Django REST base URL (no trailing slash).
 * - Dev: prefers Vite `/api` proxy when env points at the SPA dev server or is missing.
 * - Auto-appends `/api` if you only set origin (e.g. http://127.0.0.1:8000).
 * - Prod: defaults to `/api` (reverse proxy); override with VITE_API_URL.
 */

export function getApiBase() {
  let base = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "") || "";

  if (base) {
    try {
      const u = new URL(base);
      const path = (u.pathname || "/").replace(/\/$/, "") || "/";
      const port = u.port || (u.protocol === "https:" ? "443" : "80");

      // Hitting Vite (or another SPA dev port) without /api returns index.html → "HTML not JSON"
      if (import.meta.env.DEV) {
        const spaDevPorts = ["5173", "4173", "3000"];
        if (spaDevPorts.includes(String(port)) && path !== "/api") {
          base = "";
        }
      }

      if (base && (path === "/" || path === "")) {
        base = `${u.origin}/api`.replace(/\/+$/, "");
      }
    } catch {
      if (!base.startsWith("/")) {
        base = "";
      }
    }
  }

  if (!base) return "/api";
  return base;
}

/**
 * Parse JSON from an API response; fail clearly if the server sent HTML (SPA or error page).
 */
export async function readApiJson(res) {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
    const previewHint =
      res.status === 404
        ? " `vite preview` pe bhi `/api` proxy chahiye (vite.config.js → preview.proxy), ya .env mein VITE_API_URL=http://127.0.0.1:8000/api set karein. "
        : " ";
    throw new Error(
      `Server returned HTML instead of JSON (HTTP ${res.status}).${previewHint}` +
        "Dev: Django `runserver` + `npm run dev` (proxy /api), ya seedha VITE_API_URL=http://127.0.0.1:8000/api. " +
        "Agar naya endpoint 404 hai to Django restart karke latest `urls.py` load karein."
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(trimmed.slice(0, 200) || "Invalid JSON from server.");
  }
}
