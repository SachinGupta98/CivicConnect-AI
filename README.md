# CivicConnect AI — Setup & Run Guide

## Prerequisites
Before running, make sure these are installed on your machine:

| Tool | Version | Check with |
|------|---------|-----------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| PostgreSQL | 14+ (you have 18) | pgAdmin or `psql --version` |

---

## One-Click Launch (Easiest)

**Just double-click this file:**
```
d:\Hackathon\CivicConnect Ai\START_PROJECT.bat
```
It opens two windows automatically — one for backend, one for frontend.

---

## Manual Launch (Step by Step)

### Step 1 — Start PostgreSQL
Make sure your PostgreSQL 18 server is running. You can check in **Services** or pgAdmin.

Your database connection is already configured in:
```
backend\.env  →  DATABASE_URL=postgresql://postgres:Postgre9887@localhost:5432/civicconnect_db
```

---

### Step 2 — Start the Backend (Flask)

Open a terminal in `d:\Hackathon\CivicConnect Ai\backend\` and run:

```powershell
# First time only — create virtual environment
python -m venv venv

# Activate it (every time)
venv\Scripts\activate

# First time only — install packages
pip install -r requirements.txt

# First time only — seed the database
python seed.py

# Start the Flask server
python run.py
```

✅ Backend runs at **http://localhost:5000**

---

### Step 3 — Start the Frontend (React)

Open a **second** terminal in `d:\Hackathon\CivicConnect Ai\frontend\` and run:

```powershell
# First time only — install npm packages
npm install

# Start the Vite dev server
npm run dev
```

✅ Frontend runs at **http://localhost:5173**

---

## Open in Browser

Go to: **http://localhost:5173**

### Demo Login Credentials

| Role | Email | Password |
|------|-------|---------|
| Admin | `admin@civicconnect.gov` | `Admin@1234` |
| Citizen | Register a new account | Any password (6+ chars) |

---

## API Reference

| Endpoint | Description |
|----------|-------------|
| `GET  /api/health` | Health check |
| `POST /api/auth/login` | Login |
| `POST /api/auth/register` | Register |
| `GET  /api/departments/` | List departments |
| `POST /api/complaints/submit` | Submit a complaint (AI-powered) |
| `GET  /api/complaints/my` | My complaints |
| `GET  /api/analytics/overview` | Admin analytics |
| `POST /api/assistant/chat` | AI chatbot |

---

## Project Structure

```
CivicConnect Ai/
├── START_PROJECT.bat        ← Double-click to launch everything
├── backend/
│   ├── .env                 ← API keys & DB config
│   ├── requirements.txt     ← Python packages
│   ├── run.py               ← Flask entry point
│   ├── seed.py              ← Database seeder
│   ├── start.bat            ← Backend launcher
│   └── app/
│       ├── models/          ← SQLAlchemy DB models
│       ├── routes/          ← Flask API endpoints
│       └── services/        ← Groq AI + Claude AI logic
└── frontend/
    ├── start.bat            ← Frontend launcher
    ├── package.json
    └── src/
        ├── pages/           ← React page components
        ├── components/      ← Shared UI components
        ├── contexts/        ← Auth state management
        └── services/api.js  ← Axios HTTP client
```

---

## Troubleshooting

**Backend won't start?**
- Check PostgreSQL is running: open Services → find `postgresql-x64-18`
- Verify the password in `backend\.env` matches your PostgreSQL password

**`pip install` fails on psycopg2?**
```powershell
pip install psycopg2 --no-binary psycopg2
```

**Port already in use?**
```powershell
# Kill Flask (port 5000)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill Vite (port 5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**npm install fails?**
```powershell
npm cache clean --force
npm install
```
