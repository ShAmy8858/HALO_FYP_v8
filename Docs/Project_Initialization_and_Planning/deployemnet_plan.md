# Deployment Plan: HALO Project

This plan outlines the steps to deploy the HALO project. The backend (Node.js/Express) will be hosted on **Railway**, and the frontend (React/Vite) will be hosted on **Vercel**.

## Phase 1: Prepare the Codebase

### 1. Push to GitHub
If you haven't already, you need to put your code on GitHub. Railway and Vercel both work best when they can "watch" your GitHub repository for changes.

1.  Go to [GitHub](https://github.com) and create a new repository (keep it private if you prefer).
2.  In your terminal (at the root of `HALO_FYP_v8`), run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for deployment"
    git branch -M main
    git remote add origin <your-github-repo-url>
    git push -u origin main
    ```

---

## Phase 2: Deploy Backend on Railway

Railway will host your database and your server.

### 1. Create a Railway Account
Go to [railway.app](https://railway.app/) and sign up with your GitHub account.

### 2. Setup PostgreSQL
1.  Click **"New Project"**.
2.  Select **"Provision PostgreSQL"**.
3.  Wait for it to initialize. Once done, click on the **PostgreSQL** box.
4.  Go to the **"Variables"** tab and find `DATABASE_URL`. Copy this value; you'll need it soon.

### 3. Setup Backend Service
1.  Click **"New"** (the plus button) in your project dashboard.
2.  Select **"GitHub Repo"** and choose your HALO repository.
3.  Click **"Configure"** (or it might start automatically).
4.  Go to **"Settings"**:
    - **Root Directory**: Change this to `Backend`.
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
5.  Go to **"Variables"** and add the following:
    - `DATABASE_URL`: (Paste the value you copied from the Postgres service).
    - `NODE_ENV`: `production`
    - `PORT`: `4000` (Railway actually provides this automatically, but setting it doesn't hurt).
    - `JWT_ACCESS_SECRET`: (Generate a long random string, e.g., using [1password generator](https://1password.com/password-generator/)).
    - `JWT_REFRESH_SECRET`: (Generate another long random string).
    - `WEB_ORIGIN`: (Leave this as `*` for now, we will update it after the frontend is deployed).
    - `ADMIN_EMAIL`: `admin@halo.pk` (or your choice).
    - `ADMIN_PASSWORD`: (Your secure admin password).
    - `CLOUDINARY_CLOUD_NAME`: (Your Cloudinary name).
    - `CLOUDINARY_API_KEY`: (Your Cloudinary key).
    - `CLOUDINARY_API_SECRET`: (Your Cloudinary secret).

### 4. Run Database Migrations
Railway might not run your migrations automatically.
1.  In your Railway Backend service, go to the **"Deployments"** tab.
2.  Once the build is successful, you might need to run the migration command manually once.
3.  You can add a "Post-install" script in Railway settings or simply run it from your local machine pointing to the production DB:
    ```bash
    # From your local Backend directory
    DATABASE_URL=<your-production-db-url> npm run db:push
    ```
    *Note: `db:push` is usually better for initial setup with Drizzle.*

### 5. Get Backend URL
1.  In Railway, go to your Backend service **Settings**.
2.  Look for **"Public Networking"** and click **"Generate Domain"**.
3.  Copy this URL (it will look like `something.up.railway.app`). **This is your `VITE_API_BASE_URL`**.

---

## Phase 3: Deploy Frontend on Vercel

Vercel is the gold standard for hosting Vite/React apps.

### 1. Create a Vercel Account
Go to [vercel.com](https://vercel.com/) and sign up with GitHub.

### 2. Import Project
1.  Click **"Add New"** -> **"Project"**.
2.  Import your GitHub repository.
3.  In the "Configure Project" screen:
    - **Project Name**: `halo-frontend` (or whatever you like).
    - **Framework Preset**: `Vite`.
    - **Root Directory**: Click "Edit" and select the `Frontend` folder.
4.  Expand **"Environment Variables"** and add:
    - `VITE_API_BASE_URL`: `https://your-backend-url.up.railway.app/api` (Ensure you add `/api` at the end).
5.  Click **"Deploy"**.

---

## Phase 4: Final Connection (CORS)

For security, the Backend needs to know it's allowed to talk to the Frontend.

1.  Copy your Vercel URL (e.g., `https://halo-frontend.vercel.app`).
2.  Go back to **Railway** -> **Backend Service** -> **Variables**.
3.  Update `WEB_ORIGIN` from `*` to your Vercel URL.
4.  Railway will automatically redeploy with the new security setting.

## Verification Plan

### Automated Tests
- Once deployed, I will guide you on how to check the `/api/health` (if it exists) or try logging in.

### Manual Verification
1.  Open the Vercel URL.
2.  Check if the Landing Page loads.
3.  Try to Sign In.
4.  Check browser console (F12) for any red errors related to "CORS" or "Network Error".
