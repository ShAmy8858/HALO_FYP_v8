# HALO Platform Deployment Reference Guide

This document serves as a complete record of the deployment setup for the HALO (Hospital AI Liaison & Operations) platform.

## 🏗 System Architecture
The project is structured as a monorepo with two primary deployments:
1.  **Frontend**: React + Vite + ShadcnUI (Hosted on Vercel)
2.  **Backend**: Node.js + Express + Drizzle ORM (Hosted on Railway)
3.  **Database**: PostgreSQL (Provisioned via Railway)

---

## 🚀 Deployment Workflow

### 1. Source Control (GitHub)
*   **Repository**: `https://github.com/ShAmy8858/HALO_FYP_v8.git`
*   **Branch**: `main`
*   **CI/CD**: Both Vercel and Railway are connected to this branch. Any push to `main` triggers an automatic redeploy.

### 2. Backend & Database (Railway)
*   **Service Name**: `HALO_FYP_v8`
*   **Postgres Service**: `Postgres`
*   **Root Directory**: `Backend`
*   **Internal Port**: `8080` (Railway automatically assigns this; Networking must point here).
*   **Database Schema**: Managed via Drizzle ORM.
    *   *Initial Setup Command*: `npm run db:push` (Local machine -> Public DB URL).
    *   *Initial Data Command*: `npm run db:seed` (Created admin `shamykhan3260@gmail.com`).

### 3. Frontend (Vercel)
*   **Project Name**: `halo-frontend`
*   **Framework**: `Vite`
*   **Root Directory**: `Frontend`
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Routing Fix**: Added `vercel.json` to handle SPA rewrites (redirects all routes to `index.html`).

---

## 🔐 Environment Variables Reference

### Backend (Railway Dashboard)
| Key | Value / Purpose |
| :--- | :--- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway internal link) |
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `WEB_ORIGIN` | `https://halo-frontend-phi.vercel.app` (The Vercel URL) |
| `JWT_ACCESS_SECRET` | 32+ character random string |
| `JWT_REFRESH_SECRET` | 32+ character random string |
| `ADMIN_EMAIL` | `shamykhan3260@gmail.com` |
| `ADMIN_PASSWORD` | Your secure admin password |

### Frontend (Vercel Dashboard)
| Key | Value / Purpose |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://halofypv8-production.up.railway.app/api` |

---

## 🛠 Troubleshooting Log & Solutions

### 1. Windows/PowerShell Syntax
*   **Issue**: `VAR=val command` fails on Windows.
*   **Fix**: Use `$env:VAR="val"; command` in PowerShell.

### 2. JWT Length Error
*   **Issue**: Backend crashed on startup.
*   **Reason**: Zod schema required secrets to be $\ge 32$ characters.
*   **Fix**: Updated variables in Railway to long, secure strings.

### 3. 502 Bad Gateway
*   **Issue**: Backend unreachable even though status was "Active".
*   **Reason**: Port mismatch. App was listening on 8080 (default Railway PORT), but Railway Networking was looking at 4000.
*   **Fix**: Changed Railway Networking port to **8080**.

### 4. Vercel 404 on Refresh
*   **Issue**: Navigating directly to `/login` or refreshing a page gave a Vercel 404.
*   **Fix**: Added `Frontend/vercel.json` with a rewrite rule to redirect all traffic to `index.html`.
