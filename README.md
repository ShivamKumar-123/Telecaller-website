<div align="center">

```
 ╔══════════════════════════════════════════════════════╗
 ║          ☀  ADVANCE SOLAR — FULL STACK  ☀           ║
 ║        Staff Portal · Lead Ops · Excel Pipeline      ║
 ╚══════════════════════════════════════════════════════╝
```

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Django](https://img.shields.io/badge/Django-5-092E20?style=flat-square&logo=django&logoColor=white)](https://djangoproject.com)
[![DRF](https://img.shields.io/badge/DRF-REST_Framework-red?style=flat-square&logo=django&logoColor=white)](https://django-rest-framework.org)
[![JWT](https://img.shields.io/badge/Auth-simplejwt-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://django-rest-framework-simplejwt.readthedocs.io)
[![MySQL](https://img.shields.io/badge/DB-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Node](https://img.shields.io/badge/Node-20.19+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)

</div>

---

## 📌 What Is This?

**Advance Solar** is a staff-facing internal platform built to manage solar lead operations end-to-end:

- 📤 Upload leads via Excel files
- 📊 Telecaller dashboards with KPIs and charts
- 🔄 Bulk & single-lead interest updates
- 📥 Lead exports and date-based filtering
- 🛡 Admin tools for staff management
- 🌐 Public marketing home with live stats

**Stack:** React + Vite (frontend) talking to Django REST Framework + MySQL (backend) over JWT-authenticated APIs.

---

## 🗂 Monorepo Structure

```
AdvanceSolar/
├── README.md                  ← you are here
│
├── XlfileData/                # ⚛  React + Vite frontend
│   ├── public/                #    favicon, robots.txt, OG image, manifest
│   ├── src/
│   │   ├── pages/             #    route-level screens
│   │   ├── Component/         #    Header, Form, Admin shell, etc.
│   │   └── config/
│   │       └── api.js         #    getApiBase(), readApiJson()
│   ├── index.html             #    SEO meta · %SITE_URL% replaced at build
│   ├── vite.config.js         #    proxy config · env injection
│   └── .env.example
│
└── Backend/                   # 🐍  Django REST API
    ├── .venv/                 #    optional local virtualenv
    └── backend/               #    Django project root (cwd for manage.py)
        ├── manage.py
        ├── backend/           #    settings · root urls
        ├── app/               #    models · views · urls
        │   └── utils/
        │       └── excel_processor.py   # MODEL_FIELD_MAP & column headers
        └── .env               #    secrets — never commit ⛔
```

---

## ⚡ Quick Start (Both Services)

Open **two terminals** and run them side by side:

### Terminal 1 — Django API

```bash
cd Backend

# Create & activate virtualenv
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS / Linux

cd backend
pip install -r requirements.txt

# Configure secrets
cp .env.example .env          # fill in your values

# Setup DB & superuser
python manage.py migrate
python manage.py createsuperuser

# Start server
python manage.py runserver
# → http://127.0.0.1:8000
```

### Terminal 2 — React + Vite

```bash
cd XlfileData
npm install

cp .env.example .env          # fill in your values

npm run dev
# → http://localhost:5173
```

> Vite proxies `/api` → Django automatically in dev. No `VITE_API_URL` needed locally.

---

## 🔧 Prerequisites

| Tool | Version | Used For |
|------|---------|----------|
| **Python** | `3.11+` | Django backend |
| **Node.js** | `20.19+` or `22.12+` | Vite frontend (Vite 7 warns on older 20.x) |
| **MySQL** | any modern | Primary database |

---

## 🌿 Environment Variables

### Backend — `Backend/backend/.env`

```env
# Django core
SECRET_KEY=your-secret-key-here
DEBUG=True

# MySQL connection
DB_NAME=advance_solar
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=127.0.0.1
DB_PORT=3306
```

> Read via `python-decouple` (`config(...)`).

### Frontend — `XlfileData/.env`

```env
VITE_API_URL=http://127.0.0.1:8000/api   # Leave unset in dev — Vite proxy handles /api
VITE_SITE_URL=https://yourdomain.com      # Public origin for SEO — no trailing slash
```

> ⛔ **Never commit `.env` files with real credentials.**

---

## 📦 Backend Dependencies

```bash
pip install \
  django \
  djangorestframework \
  djangorestframework-simplejwt \
  django-cors-headers \
  python-decouple \
  whitenoise \
  mysqlclient \
  pandas \
  openpyxl \
  "googletrans==4.0.0rc1"
```

> Prefer `pip install -r requirements.txt` once the file exists.

---

## 📜 Frontend Scripts

```bash
npm run dev        # Dev server on :5173 with /api proxy
npm run build      # Production build → dist/
npm run preview    # Serve dist/ locally (proxy active)
npm run lint       # ESLint check
```

---

## 🗺 Frontend Routes

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

## 🗺 Backend API Endpoints

| Area | Endpoints |
|------|-----------|
| **Auth** | `POST /api/token/` · `POST /api/token/refresh/` · `GET /api/me/` |
| **Excel** | `POST /api/upload-excel/` |
| **Leads** | `GET /api/my-assigned-records/` · fetch/assign by date · interest updates |
| **Stats** | `GET /api/dashboard-stats/` · `GET /api/home-stats/` *(public)* |
| **Admin** | `GET /api/admin/...` *(staff only)* |

> Excel column mapping and required headers → `app/utils/excel_processor.py` (`MODEL_FIELD_MAP`)

---

## 🔐 Auth Flow

```
Browser (React)               Django API
      │                            │
      │  POST /api/token/          │
      │  { username, password }    │
      │ ─────────────────────────► │
      │                            │  Validate credentials
      │ ◄───────────────────────── │
      │  { access, refresh }       │
      │                            │
      │  GET /api/...              │
      │  Authorization: Bearer ... │
      │ ─────────────────────────► │
      │ ◄───────────────────────── │
      │  200 + data                │
```

---

## 🌐 CORS

Configured via `django-cors-headers` in `settings.py`.  
Adjust `CORS_ALLOWED_ORIGINS` for your production SPA origin before deploying.

---

<div align="center">

Built for the **Advance Solar** team &nbsp;·&nbsp; Powered by ☀️ and ☕

</div>