# HALO Project Codebase

Welcome to the HALO Project. The codebase has been decoupled into distinct frontend and backend directories for improved maintainability and easier deployment.

## Directory Structure

- `/Frontend`: Contains the Vite + React frontend application.
- `/Backend`: Contains the Node.js + Express backend API services.
- `/Docs`: Contains all markdown documentation, implementation plans, architecture guides, and diagrams.

## Local Development

To run the project locally, you will need two terminal windows:

### 1. Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 2. Backend
```bash
cd Backend
npm install
npm run dev
```
*(Make sure to copy `Backend/.env` properly with your Supabase credentials to connect to the database)*.

## Deployment Guide

The project is fully prepared for cloud deployment on Vercel (Frontend) and Railway (Backend).

### Backend (Railway)
1. Import your GitHub repository into Railway.
2. In your Railway service settings, set the **Root Directory** to `/Backend`.
3. Add a **PostgreSQL** add-on within your Railway project.
4. Set your Environment Variables:
   - `DATABASE_URL`: Set to the Railway Postgres connection string.
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Generate secure random strings.
   - `WEB_ORIGIN`: Set to your deployed Vercel URL (e.g., `https://halo-receptionist.vercel.app`).
   - `CLOUDINARY_*`, `SMTP_*`: Your respective API keys for media and emails.
5. Railway will automatically detect Node.js, run `npm install`, build, and start the app.

### Frontend (Vercel)
1. Import your GitHub repository into Vercel.
2. Under Project Settings, set the **Framework Preset** to **Vite**.
3. Set the **Root Directory** to `Frontend`.
4. Add the following Environment Variable:
   - `VITE_API_BASE_URL`: The URL of your deployed Railway backend (e.g., `https://halo-api-production.up.railway.app/api`).
5. Click **Deploy**. Vercel will build your `dist/` and host the application seamlessly.
