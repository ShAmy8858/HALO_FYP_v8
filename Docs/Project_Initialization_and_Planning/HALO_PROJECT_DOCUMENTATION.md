# HALO — Hospital AI Liaison & Operations
## Comprehensive Project Documentation

> **Version:** 2.0 · **Last Updated:** May 2026  
> **Course:** Senior Project Design I (7th Semester)

---

## 1. Project Overview

HALO is a **full-stack hospital management SaaS platform** that provides AI-powered receptionist capabilities. It allows hospitals to register on the platform, get admin-verified, manage subscriptions, and use AI-powered features for appointment management, doctor scheduling, and patient communication.

### Core Idea
A centralized platform where:
- **Hospitals** register themselves and their manager credentials
- **Admin** reviews, approves, or rejects applications  
- **Hospital Managers** manage doctors, departments, appointments, and subscriptions
- **Patients** interact via a public-facing hospital page (future: AI voice receptionist)

---

## 2. Technology Stack & Rationale

### 2.1 Frontend

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **React** | 18.3 | UI framework | Industry-standard SPA framework with rich ecosystem, component reusability, and virtual DOM for performance |
| **TypeScript** | 5.8 | Type safety | Catches bugs at compile-time, provides autocomplete, and enforces contracts between frontend/backend |
| **Vite** | 5.4 | Build tool | 10x faster than Webpack in dev mode (ESBuild + HMR), instant cold starts |
| **React Router** | 6.30 | Client-side routing | Standard routing for SPAs with nested routes, protected routes, and URL parameters |
| **TanStack React Query** | 5.83 | Server state management | Automatic caching, background refetching, optimistic updates, and loading/error states |
| **TailwindCSS** | 3.4 | Utility CSS (dashboard pages) | Rapid UI development for dashboard and admin pages |
| **Vanilla CSS** | — | Custom styles (landing, auth) | Full control over complex animations, glass effects, and premium design for public-facing pages |
| **Radix UI / shadcn/ui** | Various | Accessible component primitives | WAI-ARIA compliant, unstyled headless components that work with Tailwind |
| **Lucide React** | 0.462 | Icon library | Tree-shakeable, consistent SVG icons (same family as Feather Icons) |
| **Recharts** | 2.15 | Data visualization | React-native charting library for dashboard analytics |
| **Framer Motion** | 11.0 | Animations | Declarative animations, page transitions, and micro-interactions |
| **Zod** | 3.25 | Client-side validation | Same validation library as backend — shared mental model, consistent error handling |

### 2.2 Backend

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Node.js + Express** | 4.21 | REST API server | Lightweight, mature HTTP framework; easy middleware composition for auth, validation, error handling |
| **TypeScript** | 5.8 | Type safety | Full-stack type safety; shared types between frontend/backend |
| **Drizzle ORM** | 0.45 | Database ORM | Type-safe SQL queries, zero-overhead abstraction, PostgreSQL-native, schema-as-code with migrations |
| **Zod** | 3.25 | Request validation | Schema-based validation at API boundaries; auto-generates TypeScript types |
| **bcryptjs** | 2.4 | Password hashing | Industry-standard password hashing with salt rounds (10) |
| **jsonwebtoken** | 9.0 | Authentication tokens | JWT access/refresh token pair for stateless authentication |
| **multer** | 2.1 | File uploads | Memory-based multipart/form-data parsing for document uploads |
| **helmet** | 8.0 | Security headers | Sets CSP, X-Frame-Options, HSTS, and other security headers automatically |
| **morgan** | 1.10 | Request logging | HTTP request logger for debugging and monitoring |
| **cookie-parser** | 1.4 | Cookie handling | Parse refresh tokens from HTTP-only cookies |
| **nodemailer** | 8.0 | Email sending | SMTP-based email delivery for notifications (application status, approvals) |

### 2.3 Database & Cloud Services

| Service | Purpose | Rationale |
|---------|---------|-----------|
| **Supabase (PostgreSQL)** | Primary database | Managed PostgreSQL with connection pooling via PgBouncer, free tier for development, built-in backups, and dashboard for data inspection. We use Supabase **only as a PostgreSQL host** — not the Supabase SDK/auth/storage. This keeps the architecture vendor-agnostic. |
| **Cloudinary** | Document/image storage | CDN-backed media storage with automatic optimization, secure URLs, and folder organization. Used for hospital registration documents and payment receipt uploads. |
| **Drizzle Kit** | Schema migrations | Generates SQL migration files from TypeScript schema changes; supports `push` for dev and `migrate` for production |

### 2.4 Development & Testing Tools

| Tool | Purpose |
|------|---------|
| **tsx** | TypeScript execution for backend dev (watch mode with auto-restart) |
| **ESLint** | Code quality and consistency |
| **Vitest** | Unit testing framework (compatible with Vite) |
| **Playwright** | End-to-end browser testing |

---

## 3. Architecture & Design Patterns

### 3.1 Architecture Style: **Modular Monolith (Monorepo)**

```
HALO_FYP_v6/
├── apps/api/                    # Backend API (Express + Drizzle)
│   ├── src/
│   │   ├── config/              # Environment validation (Zod)
│   │   ├── db/                  # Schema, migrations, seeds
│   │   ├── middleware/          # Auth, validation, rate-limit, error
│   │   ├── modules/             # Feature modules (see below)
│   │   ├── services/            # Shared services (email, upload, audit)
│   │   ├── types/               # Express type extensions
│   │   └── utils/               # Helpers (security, errors, responses)
│   ├── migrations/              # Generated SQL migration files
│   └── .env                     # Environment variables
│
├── src/                         # Frontend (React + Vite)
│   ├── components/              # Reusable UI (shadcn/ui + custom)
│   ├── hooks/                   # Custom React hooks
│   ├── layouts/                 # Admin & Hospital layout shells
│   ├── lib/                     # API client, auth context, utilities
│   ├── pages/                   # Page components
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── hospital/            # Hospital manager pages
│   │   ├── patient/             # Patient-facing pages
│   │   └── registration/       # Hospital registration flow
│   └── types/                   # Shared TypeScript types
│
├── public/                      # Static assets (images, robots.txt)
└── package.json                 # Frontend dependencies & scripts
```

### 3.2 Backend Module Structure

Each backend module follows a consistent pattern:

```
modules/<feature>/
├── <feature>.routes.ts          # Express router + route handlers
├── <feature>.schemas.ts         # Zod validation schemas
└── <feature>.queries.ts         # Database queries (optional)
```

**Modules:**
| Module | Responsibility |
|--------|---------------|
| `auth` | Login, logout, token refresh, password reset |
| `hospital-applications` | Registration flow, document upload, application submission, status tracking |
| `admin` | Application review, hospital management, platform configuration |
| `manager` | Hospital manager dashboard data, profile updates |
| `subscription` | Payment submission, plan management, admin payment review |
| `users` | User CRUD, profile management |

### 3.3 Design Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| **Middleware Pipeline** | `requireAuth → requireRole → validate → handler` | Separation of concerns; each middleware handles one responsibility |
| **Repository Pattern** (implicit) | Drizzle queries in route handlers | Database queries are co-located with route logic for simplicity |
| **DTO/Schema Validation** | Zod schemas at API boundaries | Ensures data integrity before touching the database |
| **Error Boundary Pattern** | `asyncHandler` + `errorHandler` middleware | Centralized error handling; route handlers throw, middleware catches |
| **JWT Access/Refresh Token** | Auth module | Stateless auth with short-lived access tokens (15min) + HTTP-only refresh cookies (7d) |
| **Audit Logging** | `sessionAuditLogs` table | Track security-sensitive actions (login, logout, application reviews) |
| **Factory Pattern** | `createApp()` in `app.ts` | Testable Express app creation |

### 3.4 Frontend Architecture Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **Context API** | `AuthProvider` | Global auth state (user, tokens) shared across all components |
| **Protected Routes** | `ProtectedRoute` component | Role-based route guarding (ADMIN vs MANAGER) |
| **Compound Layouts** | `AdminLayout`, `HospitalLayout` | Sidebar navigation + content area with nested routes |
| **React Query for Server State** | Dashboard pages | Caching, automatic refetching, loading states |
| **Custom API Client** | `lib/api.ts` | Centralized fetch wrapper with auth headers, error parsing, token injection |

---

## 4. Database Schema (12 Tables)

```mermaid
erDiagram
    hospitals ||--o{ users : has
    hospitals ||--o{ subscription_payments : has
    users ||--o{ refresh_tokens : has
    users ||--o{ password_reset_tokens : has
    users ||--o{ hospital_applications : submitted_by
    hospital_applications ||--o{ hospital_documents : has
    users ||--o{ session_audit_logs : performed
    hospitals ||--o{ session_audit_logs : related_to

    hospitals {
        uuid id PK
        varchar hospital_code UK
        varchar slug UK
        varchar name
        varchar facility_type
        varchar license_number UK
        varchar business_email
        varchar phone
        varchar province
        varchar city
        varchar postal_code
        text address
        enum status "ACTIVE|SUSPENDED|DEACTIVATED"
        enum subscription_tier "TRIAL|STARTER|PROFESSIONAL|ENTERPRISE"
    }

    users {
        uuid id PK
        varchar first_name
        varchar last_name
        varchar email UK
        text password_hash
        enum role "ADMIN|MANAGER"
        enum status "PENDING|ACTIVE|SUSPENDED"
        uuid hospital_id FK
    }

    hospital_applications {
        uuid id PK
        varchar application_id UK "APP-2026-XXXXXXXX"
        enum status "DRAFT|SUBMITTED|UNDER_REVIEW|APPROVED|REJECTED"
        varchar hospital_name
        varchar manager_email
        uuid manager_user_id FK
        text rejection_reason
    }
```

### Key Tables

| Table | Records | Purpose |
|-------|---------|---------|
| `hospitals` | Active hospitals on platform | Core entity; linked to managers and subscriptions |
| `users` | Admin + Manager accounts | Authentication & authorization |
| `hospital_applications` | Registration requests | Multi-step application workflow |
| `hospital_documents` | Uploaded verification docs | Stored via Cloudinary |
| `refresh_tokens` | JWT refresh tokens | Secure session management |
| `password_reset_tokens` | Password reset flows | Time-limited reset tokens |
| `session_audit_logs` | Action audit trail | Security and compliance logging |
| `platform_settings` | Global configuration | Admin-configurable platform settings |
| `email_templates` | Notification templates | Customizable email content |
| `notification_logs` | Email delivery logs | Track email sending status |
| `subscription_payments` | Payment receipts | Manual payment verification workflow |

---

## 5. Supabase Connection Assessment

### Current Configuration
```
DATABASE_URL=postgresql://postgres.opsjdwcozqpfqtjgzyos:***@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

### Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| **Connection String** | ✅ Good | Correctly uses Supabase Transaction Pooler (port 6543) |
| **Region** | ✅ Good | `ap-south-1` (Mumbai) — optimal for Pakistan-based users |
| **Pooler Type** | ✅ Good | PgBouncer transaction pooler (port 6543) — better for serverless/short connections |
| **Connection Pool Size** | ✅ Good | `max: 10` in code — appropriate for development |
| **Password Encoding** | ✅ Good | Special character `@` is URL-encoded as `%40` |
| **SSL** | ⚠️ Note | Supabase enforces SSL by default; `pg` library handles this automatically via the pooler URL |
| **Direct vs Pooler** | ✅ Using Pooler | Port 6543 = transaction pooler (recommended). Port 5432 = direct (avoid for apps) |

### How You're Using Supabase

You're using Supabase **only as a managed PostgreSQL database** — which is the correct approach for this architecture:
- ❌ NOT using Supabase Auth (you have your own JWT auth)
- ❌ NOT using Supabase Storage (you use Cloudinary)  
- ❌ NOT using Supabase Realtime
- ✅ Using Supabase PostgreSQL via Drizzle ORM with raw SQL

**Why this is a good approach:** Your app is **vendor-agnostic**. If you ever need to switch to AWS RDS, Railway, or Neon, you only change the `DATABASE_URL`. Zero code changes.

> **Note:** The `@supabase/supabase-js` package in your frontend `package.json` is **unused** — it was likely installed by a template. You can safely remove it to reduce bundle size.

---

## 6. Implemented Features

### 6.1 Public / Landing Page
- [x] Modern landing page with hero section, features, pricing, FAQ, testimonials
- [x] Dark mode toggle with CSS variable system
- [x] Responsive navbar with glass-effect and mobile hamburger menu
- [x] Robot mascot animation with breathing effect
- [x] "Track Registration Status" — public application status lookup
- [x] Smooth scroll navigation to page sections
- [x] Dashboard preview mockup with animated elements

### 6.2 Hospital Registration Flow
- [x] 3-step wizard: Hospital Info → Document Upload → Review
- [x] Frontend validation with per-field error messages (email format, required fields, password strength)
- [x] Backend Zod validation with field-specific error parsing
- [x] Document upload to Cloudinary (PDF, JPG, PNG, max 5MB)
- [x] Auto-generated unique Application ID (`APP-2026-XXXXXXXX`)
- [x] Manager user account created during registration (with hashed password)
- [x] Copy application ID to clipboard with confirmation
- [x] Post-submission success screen with login credentials display

### 6.3 Authentication System
- [x] JWT access token (15 min) + refresh token (7 days, HTTP-only cookie)
- [x] Role-based login (Admin vs Hospital Manager)
- [x] Protected route guards on frontend (`ProtectedRoute` component)
- [x] Token refresh on page load (seamless session persistence)
- [x] Rate limiting on login endpoint (5 attempts / 60 seconds)
- [x] Audit logging for login/logout events
- [x] Password reset flow (token-based)
- [x] Conditional UI: admin login hides registration links; manager login shows them

### 6.4 Admin Dashboard
- [x] Overview dashboard with stats cards (total hospitals, pending applications, active subscriptions)
- [x] Pending applications list with status badges
- [x] Application detail view with document download
- [x] Approve / reject applications with reason
- [x] On approval: auto-create hospital record + activate manager account
- [x] All hospitals management (view, status toggle)
- [x] Platform configuration (registration toggle, file types, upload size, support email)
- [x] Payment receipt review (approve/reject subscription upgrades)
- [x] Subscription management overview
- [x] Admin analytics with charts
- [x] Admin profile management

### 6.5 Hospital Manager Dashboard
- [x] Hospital overview dashboard with key metrics
- [x] Doctor management (add, edit, list)
- [x] Doctor scheduling
- [x] Department management
- [x] Daily appointment schedule view
- [x] Walk-in patient form
- [x] Appointment search
- [x] Doctor/department search
- [x] Notification center
- [x] Notification preferences
- [x] Subscription management with payment upload
- [x] Manager profile management
- [x] Hospital analytics

### 6.6 Application Status Tracking
- [x] Public page — anyone can check with application ID
- [x] Status timeline visualization (Draft → Submitted → Under Review → Approved/Rejected)
- [x] Shows rejection reason if applicable
- [x] Accessible from landing page navbar

### 6.7 Subscription & Payment System
- [x] Tiered plans: Trial → Starter → Professional → Enterprise
- [x] Manager can upload payment receipt with bank reference
- [x] Admin reviews and approves/rejects payment
- [x] On approval: hospital subscription tier upgraded in database
- [x] Payment history tracking

---

## 7. Validations & Edge Cases

### 7.1 Input Validations Implemented

| Area | Validation | Type |
|------|-----------|------|
| Hospital name | Required, max 160 chars | Frontend + Backend |
| Business email | Required, valid email format (`/@/` regex) | Frontend + Backend (Zod `.email()`) |
| Manager email | Required, valid email format | Frontend + Backend |
| License number | Required, unique across applications | Backend (unique index) |
| Password | Min 8 characters, strength indicator (weak/medium/strong) | Frontend + Backend |
| Password confirm | Must match password | Frontend |
| Phone | Required | Frontend + Backend |
| Province/City | Required, dropdown selection | Frontend + Backend |
| Documents | At least 2 required uploads, max 5MB per file | Frontend + Backend |
| File types | PDF, JPG, PNG, DOCX | Frontend (accept attribute) + Backend (configurable) |
| Login email | Required | Frontend |
| Login password | Required | Frontend |

### 7.2 Security Validations

| Check | Implementation |
|-------|---------------|
| Rate limiting | 5 requests / 60s per IP+path (sliding window) |
| JWT token verification | Access token verified on every protected route |
| Role-based access | `requireRole("ADMIN")` or `requireRole("MANAGER")` middleware |
| Password hashing | bcrypt with 10 salt rounds |
| HTTP-only cookies | Refresh tokens stored in HTTP-only, same-site cookies |
| Security headers | Helmet.js (CSP, X-Frame-Options, HSTS, etc.) |
| CORS | Restricted to `WEB_ORIGIN` only |
| Request body limit | 1MB JSON limit |
| SQL injection | Prevented by Drizzle ORM parameterized queries |

### 7.3 Edge Cases Handled

| Edge Case | How It's Handled |
|-----------|-----------------|
| Duplicate license number | Unique index on `hospital_applications.license_number`; backend returns validation error |
| Duplicate manager email | Unique index on `users.email`; checked before insertion |
| Manager login before approval | Redirected to application status page (not dashboard) |
| Expired access token | Frontend auto-refreshes via refresh token cookie on page load |
| Invalid file upload (>5MB) | Frontend rejects; backend configurable via `platform_settings.max_upload_size_mb` |
| Cloudinary not configured | Fallback to dev storage provider (stores key only, no URL) |
| SMTP not configured | Email service logs instead of sending; doesn't crash the app |
| Concurrent login sessions | Multiple refresh tokens per user supported |
| Application already submitted | Backend checks application status; prevents re-submission of SUBMITTED+ applications |
| Admin self-deletion | Prevented by role checks |
| Password with special chars in DB URL | URL-encoded (`@` → `%40`) in connection string |

### 7.4 Edge Cases NOT Yet Handled (Known Gaps)

| Gap | Risk Level | Notes |
|-----|-----------|-------|
| No CSRF protection | Medium | Should add CSRF tokens for cookie-based auth |
| No email verification | Medium | Manager email is trusted from registration form |
| JWT secret rotation | Low | Hardcoded secrets; should use key rotation in production |
| No file virus scanning | Low | Uploaded documents aren't scanned for malware |
| No pagination on lists | Low | Admin application/hospital lists load all records |
| No websocket notifications | Low | Polling-based; no real-time push |
| Subscription expiry | Medium | No automatic expiry/downgrade when subscription period ends |
| No 2FA | Low | Single-factor auth only |

---

## 8. API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | Public | Login with role, email, password |
| POST | `/logout` | Auth | Revoke refresh token |
| POST | `/refresh` | Cookie | Refresh access token |
| POST | `/forgot-password` | Public | Send reset email |
| POST | `/reset-password` | Public | Reset with token |

### Hospital Applications (`/api/hospital-applications`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Public | Create new application + manager user |
| POST | `/:id/documents` | Public | Upload verification document |
| POST | `/:id/submit` | Public | Submit application for review |
| GET | `/status/:applicationId` | Public | Track application status |

### Admin (`/api/admin`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/applications` | Admin | List all applications |
| GET | `/applications/:id` | Admin | Get application detail |
| POST | `/applications/:id/approve` | Admin | Approve application |
| POST | `/applications/:id/reject` | Admin | Reject with reason |
| GET | `/hospitals` | Admin | List all hospitals |
| PATCH | `/hospitals/:id/status` | Admin | Toggle hospital status |
| GET | `/stats` | Admin | Dashboard statistics |
| GET | `/config` | Admin | Get platform settings |
| PATCH | `/config` | Admin | Update platform settings |

### Subscription (`/api/subscription`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments` | Manager | Submit payment receipt |
| GET | `/payments` | Manager | Get payment history |
| GET | `/payments/pending` | Admin | List pending reviews |
| POST | `/payments/:id/approve` | Admin | Approve payment |
| POST | `/payments/:id/reject` | Admin | Reject payment |

---

## 9. Application Flow

### 9.1 Hospital Registration & Onboarding Flow

```mermaid
flowchart TD
    A[Hospital visits Landing Page] --> B[Clicks Register Hospital]
    B --> C[Step 1: Hospital Info + Manager Credentials]
    C --> D{Frontend Validation}
    D -->|Fail| C
    D -->|Pass| E[Step 2: Upload Documents]
    E --> F[Step 3: Review & Submit]
    F --> G[Backend creates User PENDING + Application DRAFT]
    G --> H[Upload docs to Cloudinary]
    H --> I[Submit → Status changes to SUBMITTED]
    I --> J[Success Screen with Application ID]
    J --> K[Admin sees in Pending Applications]
    K --> L{Admin Decision}
    L -->|Approve| M[Create Hospital record + Activate Manager]
    L -->|Reject| N[Set rejection reason]
    M --> O[Manager can now login to Dashboard]
    N --> P[Manager sees rejection on status page]
```

### 9.2 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB

    User->>Frontend: Enter email + password
    Frontend->>API: POST /auth/login
    API->>DB: Find user by email + role
    API->>API: Verify bcrypt password
    API->>DB: Create refresh token
    API-->>Frontend: Access token + Set-Cookie (refresh)
    Frontend->>Frontend: Store access token in memory
    
    Note over Frontend: On page reload
    Frontend->>API: POST /auth/refresh (cookie)
    API->>DB: Verify refresh token
    API-->>Frontend: New access token
```

### 9.3 Subscription Payment Flow

```mermaid
flowchart TD
    A[Manager opens Subscription page] --> B[Selects plan upgrade]
    B --> C[Uploads payment receipt + bank reference]
    C --> D[Backend stores receipt on Cloudinary]
    D --> E[Payment status: PENDING_REVIEW]
    E --> F[Admin sees in Payment Reviews]
    F --> G{Admin Decision}
    G -->|Approve| H[Hospital tier upgraded in DB]
    G -->|Reject| I[Manager notified with reason]
```

---

## 10. What Remains (Roadmap)

### 10.1 High Priority
| Feature | Status | Description |
|---------|--------|-------------|
| AI Voice Receptionist | ❌ Not started | Core differentiator — AI phone agent for patient calls |
| Patient Booking Portal | ❌ Not started | Public page for patients to book appointments |
| Appointment Calendar Backend | ❌ Not started | API endpoints for appointment CRUD |
| Doctor Schedule Backend | ❌ Not started | API for doctor availability management |
| Email Notifications | ⚠️ Partial | SMTP configured but templates need content; currently logs only |

### 10.2 Medium Priority
| Feature | Status | Description |
|---------|--------|-------------|
| Real-time Notifications | ❌ Not started | WebSocket-based push notifications |
| Hospital Public Site | ⚠️ UI only | `/hospital-site` exists but needs backend data |
| Subscription Expiry | ❌ Not started | Auto-downgrade when payment period ends |
| File Download Streaming | ⚠️ Partial | Admin document download needs stream piping fix |
| Pagination | ❌ Not started | All list endpoints return full datasets |

### 10.3 Low Priority (Polish)
| Feature | Status | Description |
|---------|--------|-------------|
| 2FA Authentication | ❌ Not started | TOTP-based two-factor |
| CSRF Protection | ❌ Not started | Token-based CSRF for cookie auth |
| Email Verification | ❌ Not started | Verify manager email on registration |
| Unit Tests | ❌ Not started | Backend route tests with Vitest |
| E2E Tests | ⚠️ Partial | Playwright setup exists but needs test cases |
| Mobile Responsive Polish | ⚠️ Partial | Dashboard pages need mobile optimization |

---

## 11. Scripts Reference

### Frontend
```bash
npm run dev          # Start Vite dev server (port 8080)
npm run build        # Production build
npm run lint         # ESLint check
npm run test         # Run Vitest tests
```

### Backend
```bash
cd apps/api
npm run dev          # Start API with tsx watch (port 4000)
npm run build        # Compile TypeScript
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database (dev)
npm run db:migrate   # Run migration files (production)
npm run db:seed      # Seed admin user + platform settings
```

### Full Stack
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm --prefix apps/api run dev
```

---

## 12. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase pooler) |
| `JWT_ACCESS_SECRET` | ✅ | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing refresh tokens (min 32 chars) |
| `ADMIN_EMAIL` | ✅ | Seed admin email (default: admin@halo.pk) |
| `ADMIN_PASSWORD` | ✅ | Seed admin password (default: Admin@2025) |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name for file uploads |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |
| `SMTP_HOST` | Optional | SMTP server for email notifications |
| `SMTP_PORT` | Optional | SMTP port (default: 587) |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASS` | Optional | SMTP password |
| `WEB_ORIGIN` | Optional | Frontend URL for CORS (default: http://localhost:8080) |

---

*This document was generated as part of the HALO Senior Project Design I (FYP). For questions or contributions, refer to the codebase at `HALO_FYP_v6/`.*
