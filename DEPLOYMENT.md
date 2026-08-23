# ShopSense AI — Deployment Guide

**Frontend → Vercel | Backend → Render | Database → Supabase | AI → Gemini**

---

## Architecture Overview

```
Browser
  │
  ├─ Vercel (Next.js 16)           → https://your-app.vercel.app
  │    └─ /api/* proxy rewrites    → Render backend (server-side, no CORS)
  │
  └─ Render (Flask + Gunicorn)     → https://shopsense-ai-backend.onrender.com
       ├─ Supabase (PostgreSQL)    → https://your-project.supabase.co
       └─ Google Gemini API        → generativelanguage.googleapis.com
```

> The Next.js proxy is the key architecture decision: **the browser never calls Render directly.**
> All `/api/*` requests from the browser hit Vercel, which forwards them to Render server-side.
> This means CORS is only needed between Render and the Vercel **server** (same origin from browser perspective).

---

## 1. Prerequisites

| Requirement | Where to get it |
|------------|----------------|
| GitHub account | github.com |
| Vercel account | vercel.com (free) |
| Render account | render.com (free) |
| Supabase project | supabase.com (already configured) |
| Google Gemini API key | aistudio.google.com |

---

## 2. GitHub Setup

The repository is already on GitHub:
```
https://github.com/Lucifer2987/shopsense-ai
```

Ensure both Vercel and Render have access to this repository.

---

## 3. Supabase — No Changes Required

Your Supabase database is already configured and running.
You only need two values from the Supabase dashboard:

1. Go to **Supabase Dashboard** → Your Project → **Project Settings** → **API**
2. Copy:
   - **Project URL** → this is your `SUPABASE_URL`
   - **service_role** secret key → this is your `SUPABASE_KEY`

> ⚠️ Use the `service_role` key for the backend, NOT the `anon` key.
> The service role key bypasses Row Level Security and must **never** be exposed to the browser.

---

## 4. Backend Deployment — Render

### Step 1: Create a New Web Service

1. Log in to [render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub account and select `Lucifer2987/shopsense-ai`

### Step 2: Configure the Service

| Setting | Value |
|---------|-------|
| **Name** | `shopsense-ai-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn run:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |
| **Plan** | Free (or Starter for production) |

> **Why `run:app`?**
> `backend/run.py` creates `app = create_app()` at module level.
> Gunicorn reads this as: module=`run`, callable=`app`.

### Step 3: Set Environment Variables

In Render → your service → **Environment** tab, add:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `SUPABASE_KEY` | `your_supabase_service_role_key` |
| `GEMINI_API_KEY` | `your_gemini_api_key` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` *(update after Vercel deploy)* |
| `PYTHON_VERSION` | `3.11.0` |

> ⚠️ Do NOT set `PORT` — Render injects it automatically via `$PORT`.

### Step 4: Deploy

Click **Create Web Service**. Render will:
1. Clone the repo
2. `cd` into `backend/`
3. Run `pip install -r requirements.txt`
4. Start with `gunicorn run:app ...`

### Step 5: Note Your Backend URL

After deployment, your backend will be at:
```
https://shopsense-ai-backend.onrender.com
```
*(exact subdomain may differ — copy from Render dashboard)*

### Step 6: Set Health Check

In Render → your service → **Settings** → **Health Check Path**:
```
/api/health
```

Expected response:
```json
{ "status": "healthy", "database": "connected" }
```

---

## 5. Frontend Deployment — Vercel

### Step 1: Import Project

1. Log in to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import from GitHub: `Lucifer2987/shopsense-ai`

### Step 2: Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` *(auto-detected)* |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` *(default)* |
| **Output Directory** | `.next` *(default)* |
| **Install Command** | `npm install` *(default)* |
| **Node.js Version** | `20.x` |

### Step 3: Set Environment Variables

In Vercel → your project → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|------------|
| `NEXT_PUBLIC_API_URL` | `/api` | Production, Preview, Development |
| `BACKEND_URL` | `https://shopsense-ai-backend.onrender.com` | Production, Preview |

> **Why `NEXT_PUBLIC_API_URL=/api` in production?**
> In the browser, `/api` is a relative path that goes to the same Vercel domain.
> Vercel's Next.js proxy then rewrites it to your Render backend via `BACKEND_URL`.
> This is the correct architecture — the browser never needs the Render URL directly.

> **Why two variables?**
> - `NEXT_PUBLIC_API_URL` → used by the **browser** API client (public, safe)
> - `BACKEND_URL` → used by **Next.js server** for the proxy rewrite (server-side only, not sent to browser)

### Step 4: Deploy

Click **Deploy**. Vercel will:
1. `cd frontend/`
2. `npm install`
3. `npm run build`
4. Serve the Next.js app globally via CDN

### Step 5: Note Your Frontend URL

After deployment:
```
https://shopsense-ai.vercel.app
```
*(or your custom domain)*

---

## 6. Update CORS After Both Are Deployed

Once you have your actual Vercel URL, update Render:

1. Go to Render → `shopsense-ai-backend` → **Environment**
2. Update `CORS_ORIGINS`:
   ```
   https://shopsense-ai.vercel.app
   ```
   For multiple domains (e.g. preview + production):
   ```
   https://shopsense-ai.vercel.app,https://shopsense-ai-git-main-lucifer2987.vercel.app
   ```
3. Render will automatically redeploy with the new value.

---

## 7. Production Testing

### Health Check
```bash
curl https://shopsense-ai-backend.onrender.com/api/health
```
Expected:
```json
{ "status": "healthy", "database": "connected" }
```

### Products Endpoint
```bash
curl https://shopsense-ai-backend.onrender.com/api/products
```
Expected: JSON with product list.

### Frontend
Open `https://shopsense-ai.vercel.app` — the full e-commerce UI should load with products from Supabase.

### Voice Command (via frontend)
1. Open the site, click **Voice Shop**
2. Speak: *"bhai 2 litre doodh add kar de"*
3. Gemini should parse the intent and add milk to the shopping list

---

## 8. Local Development

Local development remains unchanged:

**Backend:**
```bash
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
python run.py
# Flask runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Next.js runs on http://localhost:3000
```

Local `.env` files required:
- `backend/.env` — copy from `backend/.env.example`, fill real values
- `frontend/.env.local` — copy from `frontend/.env.example`, keep defaults for local

---

## 9. Environment Variable Reference

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_KEY` | Supabase service_role key | `eyJhbGc...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `https://your-app.vercel.app` |
| `PYTHON_VERSION` | Python version for Render | `3.11.0` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Browser-side API base URL | `/api` |
| `BACKEND_URL` | Server-side Flask URL for proxy | `https://shopsense-ai-backend.onrender.com` |

> ⚠️ **Security rules:**
> - `NEXT_PUBLIC_*` variables are embedded in the browser bundle — keep them safe to expose
> - `BACKEND_URL` is server-side only — it proxies to Render without exposing the URL to the browser
> - `GEMINI_API_KEY` and `SUPABASE_KEY` must ONLY be in Render — never in the frontend

---

## 10. Render Free Tier — Important Notes

Render free tier services **spin down after 15 minutes of inactivity**. The first request after a spin-down takes ~30–60 seconds (cold start). To avoid this:

- Upgrade to the **Starter** plan (~$7/month) for always-on instances
- Or use a free uptime monitor (e.g. [UptimeRobot](https://uptimerobot.com)) to ping `/api/health` every 10 minutes to keep the service warm

---

## 11. Troubleshooting

### `Failed to fetch products` on the frontend
- Check browser console → look for the actual error URL
- Verify `BACKEND_URL` is set correctly on Vercel
- Test `GET https://your-backend.onrender.com/api/health` directly

### `CORS error` in browser console
- Check `CORS_ORIGINS` on Render — must exactly match your Vercel domain (no trailing slash)
- Ensure you updated after deploying to Vercel

### `Missing environment variables: SUPABASE_URL, SUPABASE_KEY...`
- Render service failed to start — check the logs in Render dashboard
- Verify all env vars are set under **Environment** tab

### `gunicorn: command not found` on Render
- Verify `gunicorn>=22.0.0` is in `backend/requirements.txt`
- Trigger a manual redeploy after confirming

### Voice command returns error but products load fine
- Check that `GEMINI_API_KEY` is correctly set on Render
- Test the intent endpoint:
  ```bash
  curl -X POST https://your-backend.onrender.com/api/voice/command \
    -H "Content-Type: application/json" \
    -d '{"text": "add milk", "list_id": "your-list-uuid", "user_id": "test"}'
  ```

### Vercel build fails: `Type error`
- Run `cd frontend && npm run build` locally to reproduce
- Fix TypeScript errors in source — do NOT suppress with `// @ts-ignore`

---

## 12. Quick Reference

### Vercel Settings Summary

| Field | Value |
|-------|-------|
| Root Directory | `frontend` |
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Node Version | 20.x |
| `NEXT_PUBLIC_API_URL` | `/api` |
| `BACKEND_URL` | `https://your-render-backend.onrender.com` |

### Render Settings Summary

| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn run:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |
| Health Check Path | `/api/health` |
| `PYTHON_VERSION` | `3.11.0` |

---

## 13. Deployment Checklist

- [ ] Supabase URL and service_role key collected
- [ ] Gemini API key available
- [ ] Render service created with `backend/` as root directory
- [ ] All Render env vars set (`SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `CORS_ORIGINS`)
- [ ] Render health check returns `{ "status": "healthy" }`
- [ ] Vercel project created with `frontend/` as root directory
- [ ] Vercel env vars set (`NEXT_PUBLIC_API_URL=​/api`, `BACKEND_URL=https://...onrender.com`)
- [ ] Vercel build passes
- [ ] Frontend loads and shows product catalog
- [ ] `CORS_ORIGINS` on Render updated with actual Vercel domain
- [ ] Voice shopping tested end-to-end
