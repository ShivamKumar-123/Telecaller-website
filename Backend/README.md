<div align="center">

```
 ╔═══════════════════════════════════════════╗
 ║   ⚙  ADVANCE SOLAR — DJANGO REST API  ⚙  ║
 ╚═══════════════════════════════════════════╝
```

# Advance Solar · Backend

**Django 5 + DRF + JWT** — REST API serving the React SPA: Excel ingestion, lead assignment, interest updates, dashboards, and admin endpoints.

[![Django](https://img.shields.io/badge/Django-5-092E20?style=flat-square&logo=django&logoColor=white)](https://djangoproject.com)
[![DRF](https://img.shields.io/badge/DRF-REST_Framework-red?style=flat-square&logo=django&logoColor=white)](https://django-rest-framework.org)
[![JWT](https://img.shields.io/badge/Auth-simplejwt-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://django-rest-framework-simplejwt.readthedocs.io)
[![MySQL](https://img.shields.io/badge/DB-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)

</div>

---

## ⚡ Quick Start

```bash
# 1. Create & activate virtualenv (from Backend/)
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS / Linux

# 2. Install dependencies
cd backend
pip install -r requirements.txt
# or manually — see Install section below

# 3. Configure environment
cp .env.example backend/.env  # fill in your secrets

# 4. Migrate & create superuser
python manage.py migrate
python manage.py createsuperuser

# 5. Run
python manage.py runserver
```

> API base: **`http://127.0.0.1:8000/api/`**

> ⚠️ All `manage.py` commands assume **`Backend/backend/`** as your working directory.  
> Windows: `cd Backend\backend` from the repo root.

---

## 🔧 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Python** | `3.11+` | Recommended |
| **MySQL** | any modern | Connection via `.env` vars |

---

## 🗂 Project Structure

```
Backend/
├── README.md               ← you are here
├── .venv/                  # optional local virtualenv
└── backend/                # Django project root (cwd for manage.py)
    ├── manage.py
    ├── backend/            # settings · root urls
    ├── app/                # main API app
    │   ├── models.py
    │   ├── views.py
    │   ├── urls.py
    │   └── utils/
    │       └── excel_processor.py   # MODEL_FIELD_MAP & column headers
    └── .env                # secrets — never commit ⛔
```

---

## 🌿 Environment Variables

Create `backend/.env` from your team's template. Keys read via `python-decouple`:

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

> ⛔ **Never commit `.env` files with real credentials.**

---

## 📦 Install

```bash
# Preferred — once requirements.txt exists
pip install -r requirements.txt

# Manual install
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

> Pin versions to match your environment if `requirements.txt` is not yet present.

---

## 🗺 Notable API Endpoints

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
Client                        API
  │                            │
  │  POST /api/token/          │
  │  { username, password }   │
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
Adjust `CORS_ALLOWED_ORIGINS` for production to match your SPA's deployed origin.

---

## 🔗 Related

- 🖥 **Frontend (React + Vite)** → [`../XlfileData/README.md`](../XlfileData/README.md)

---

<div align="center">

Built for the **Advance Solar** team &nbsp;·&nbsp; Powered by ☀️ and ☕

</div>