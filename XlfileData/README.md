<div align="center">

```
 ╔═══════════════════════════════════════════╗
 ║   ☀  ADVANCE SOLAR — STAFF PORTAL  ☀    ║
 ╚═══════════════════════════════════════════╝
```

# Advance Solar · Frontend

**React + Vite** — Staff-facing SPA for lead operations, telecaller dashboards, Excel pipelines, and live marketing stats.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Node-20.19+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Django Backend](https://img.shields.io/badge/API-Django-092E20?style=flat-square&logo=django&logoColor=white)](../Backend/README.md)

</div>

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
cd XlfileData && npm install

# 2. Configure environment
cp .env.example .env

# 3. Start Django (separate terminal)
cd ../Backend/backend && python manage.py runserver

# 4. Start Vite dev server
npm run dev
```

> Open **http://localhost:5173** — API calls proxy through `/api` to Django on port 8000.

---

## 🔧 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | `20.19+` or `22.12+` | Vite 7 warns on older 20.x releases |
| **Backend** | Django running on `:8000` | See [`../Backend/README.md`](../Backend/README.md) |

---

## 🌿 Environment Variables

Create `.env` from the template and configure:

```env
VITE_API_URL=http://127.0.0.1:8000/api   # Leave unset in dev → Vite proxy handles /api
VITE_SITE_URL=https://yourdomain.com      # Public origin for SEO — no trailing slash
```

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Django API base URL. In dev, leave unset — Vite proxy routes `/api` → Django. |
| `VITE_SITE_URL` | Public origin for canonical URLs and Open Graph meta tags. |

---

## 📜 Scripts

```bash
npm run dev        # Dev server on :5173 with /api proxy
npm run build      # Production build → dist/
npm run preview    # Serve dist/ locally (proxy active)
npm run lint       # ESLint check
```

---

## 🗺 Routes

| Path | Area | Auth |
|------|------|------|
| `/` | Public marketing home with live stats | 🌐 Public |
| `/login` | JWT authentication | 🌐 Public |
| `/dashboard` | Telecaller KPIs, assigned leads, charts | 🔒 Staff |
| `/see-data` | Fetch leads by date · bulk interest update | 🔒 Staff |
| `/update-interest` | Single-lead interest form | 🔒 Staff |
| `/update-interest/:id` | Same form, prefilled from API | 🔒 Staff |
| `/add-excel` | Excel upload pipeline | 🔒 Staff |
| `/download-excel` | Lead data exports | 🔒 Staff |
| `/admin` | Staff admin dashboard | 🔒 Admin only |

---

## 🗂 Project Structure

```
XlfileData/
├── public/                   # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   ├── site.webmanifest
│   └── og-image.png          # Open Graph image
│
├── src/
│   ├── pages/                # Route-level screens
│   ├── Component/            # Shared UI
│   │   ├── Header/
│   │   ├── Form/
│   │   └── Admin/            # Admin shell components
│   └── config/
│       └── api.js            # getApiBase(), readApiJson()
│
├── index.html                # SEO meta · %SITE_URL% replaced at build
├── vite.config.js            # Proxy config · env injection
└── .env.example              # Environment template
```

---

## 🔗 Related

- 📦 **API & Excel Pipeline** → [`../Backend/README.md`](../Backend/README.md)

---

<div align="center">

Built for the **Advance Solar** team &nbsp;·&nbsp; Powered by ☀️ and ☕

</div>