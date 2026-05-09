HALO
Hospital AI Liaison & Operations
Complete Implementation Guide
Tech Stack · Architecture · Folder Structure · Coding Standards
Ihtisham Ul Islam (SP23-BSE-016) · Syeda Bisma (SP23-BSE-043)
Supervisor: Dr. Tehseen Riaz Abbasi · COMSATS University Islamabad
Version 1.0 · May 2025

# 1. How to Use This Guide

This document is your single source of truth for the entire HALO implementation. It covers every decision from choosing a library to naming a variable. Read it once, then keep it open in a second window while coding. Every section builds on the previous one — do not skip ahead.

You are building a real-world SaaS product for the first time. Everything in this guide is chosen to protect you from the most common mistakes that first-time developers make when building at this scale. Each recommendation comes with a reason — read the reasons, not just the rules.

## 1.1 What This Guide Covers

Section 2 — The complete tech stack with every library, version, and the reason it was chosen
Section 3 — System architecture: how the pieces connect to each other
Section 4 — Exact folder and file structure for every sub-project
Section 5 — Coding standards, naming rules, and commenting conventions
Section 6 — Database design principles and PostgreSQL conventions
Section 7 — API design rules (REST conventions, error formats, auth headers)
Section 8 — Git workflow and branch naming
Section 9 — Environment variables and secrets management
Section 10 — What to build first: the recommended sprint sequence

# 2. Complete Tech Stack

Every technology listed here is exactly what is documented in your SRS (SRS_HALO_v0.1). No changes have been made to the core stack. What this guide adds is the supporting libraries, tooling, and configuration that the SRS does not specify — these fill the gaps between high-level decisions and actual code.

## 2.1 Overview: The Four Services

HALO is not a single application. It is four services that work together. Understanding this separation is critical before you write a single line of code.

The worker service shares the same Node.js codebase as the api service. It is not a separate repo — it is a separate process entry point in the same repo. This keeps things simple for a two-person team.

## 2.2 Frontend: Next.js 14.6 Application

This is the layer your users see. It contains all screens across all three roles: Administrator, Hospital Manager, and Patient.

### 2.2.1 Core Framework

### 2.2.2 Styling

### 2.2.3 UI Component Library

shadcn/ui is not a package you install like normal libraries. You run 'npx shadcn-ui@latest add button' for each component, and it copies the component source code into your project under src/components/ui/. This is intentional — you own the code and can modify it freely.

### 2.2.4 State Management

There are two types of state: UI state (is this modal open?) and server state (what appointments exist?). Use Zustand for UI state and React Query for server state. Never store server data in Zustand.

### 2.2.5 Forms

### 2.2.6 HTTP Client

### 2.2.7 Date and Time

### 2.2.8 Charts and Data Visualization

### 2.2.9 Real-time Communication

### 2.2.10 PDF and File Export

## 2.3 Backend: Node.js API Service

This is the brain of the system. Every database query, every business rule, every authentication check runs here. The frontend never touches the database directly.

### 2.3.1 Core Framework

### 2.3.2 Security and Authentication

### 2.3.3 Database Access

Why Drizzle over Prisma? Prisma requires a background process (query engine) and has a heavier footprint. For a first-time SaaS on limited resources, Drizzle gives you the same type safety with less overhead. Also, Drizzle lets you drop to raw SQL easily when you need complex appointment queries.

### 2.3.4 Caching — Redis

### 2.3.5 Email

### 2.3.6 Background Jobs

### 2.3.7 File Upload

### 2.3.8 Real-time

### 2.3.9 Validation and Utilities

## 2.4 AI Service: Python / FastAPI

This service handles everything AI-related. The Node.js API never calls Llama 3.1 8B via Groq API or Whisper directly — it always goes through this service. This separation means you can update the AI pipeline without touching the main API.

### 2.4.1 Core Framework

### 2.4.2 AI and NLP

### 2.4.3 WebRTC / Audio Processing

## 2.5 Infrastructure and Tooling

### 2.5.1 Database

### 2.5.2 Development Environment

### 2.5.3 Code Quality

# 3. System Architecture

This section explains exactly how the four services communicate with each other in both development and production. Understanding this prevents the most common beginner mistake: calling the database directly from the frontend.

## 3.1 Request Flow Diagram (Text)

Every user action follows one of two paths:

Path A — Hospital Manager or Admin (authenticated dashboard users):
Browser (Next.js) → /api routes (Next.js API Route) → Express API (port 4000) → PostgreSQL

Path B — Patient chat widget (unauthenticated, AI-driven):
Browser (chat widget) → Express API (port 4000) → FastAPI AI Service (port 8000) → Ollama (Llama 3.1 8B via Groq API)
→ Whisper (if voice)
→ PostgreSQL (slot booking)

Path C — Background jobs:
BullMQ Worker → reads job from Redis → processes (send email, check expiry) → PostgreSQL + Nodemailer

## 3.2 Multi-Tenancy Strategy

Each hospital in HALO is a 'tenant'. You must ensure that Hospital A can never see Hospital B's data. The approach used is Row-Level Isolation — every relevant database table has a hospital_id column, and every API query filters by the logged-in manager's hospital_id.

This is the single most important security rule in HALO. In every Express route that accesses hospital data, the first thing you do is extract the hospital_id from req.user (set by the JWT middleware) and include it as a WHERE clause condition. Never trust hospital_id coming from the request body.

// CORRECT — hospital_id comes from the verified JWT
const appointments = await db.query.appointments.findMany({
where: eq(appointments.hospitalId, req.user.hospitalId),
});

// WRONG — never do this, user could send any hospital_id
const appointments = await db.query.appointments.findMany({
where: eq(appointments.hospitalId, req.body.hospitalId), // DANGEROUS
});

## 3.3 JWT Authentication Flow

HALO uses two tokens: an access token (short-lived) and a refresh token (long-lived). This is the industry standard.

Storing the access token in memory (Zustand) and NOT in localStorage prevents XSS attacks from stealing the token. The refresh token in an httpOnly cookie cannot be read by JavaScript at all.

## 3.4 API Communication Pattern

The Next.js frontend does NOT call the Express API directly from the browser in production. Instead, Next.js API routes act as a proxy. This hides the backend URL from the browser and lets you add server-side logic (like token refresh) centrally.

// src/app/api/appointments/route.ts (Next.js API Route — acts as proxy)
export async function GET(req: NextRequest) {
const token = getTokenFromCookie(req); // get from httpOnly cookie
const response = await fetch(`${process.env.API_URL}/appointments`, {
headers: { Authorization: `Bearer ${token}` },
});
return Response.json(await response.json());
}

# 4. Folder and File Structure

The project uses a monorepo structure — all four services live in one Git repository. This makes it easy to share code (like Zod schemas) between frontend and backend.

## 4.1 Root Monorepo Layout

halo/
├── apps/
│ ├── web/ ← Next.js 14 frontend
│ ├── api/ ← Express backend
│ └── ai-service/ ← Python FastAPI service
├── packages/
│ ├── shared-types/ ← TypeScript types shared between web and api
│ └── shared-utils/ ← Shared utility functions (date formatting, etc.)
├── docker/
│ ├── docker-compose.yml
│ └── docker-compose.prod.yml
├── .github/
│ └── workflows/ ← CI/CD (later)
├── .gitignore
├── .env.example ← Template for environment variables (committed)
└── README.md

## 4.2 Next.js Frontend Structure (apps/web/)

apps/web/
├── src/
│ ├── app/ ← Next.js App Router pages
│ │ ├── (auth)/ ← Route group: no layout wrapper
│ │ │ ├── login/
│ │ │ │ └── page.tsx ← M1: Unified Login Screen
│ │ │ └── forgot-password/
│ │ │ └── page.tsx ← M2: Forgot Password Screen
│ │ │
│ │ ├── admin/ ← Admin dashboard (requires admin role)
│ │ │ ├── layout.tsx ← Admin layout with sidebar
│ │ │ ├── page.tsx ← M9: Admin Dashboard
│ │ │ ├── applications/
│ │ │ │ ├── page.tsx ← M10: Pending Applications List
│ │ │ │ └── [id]/
│ │ │ │ └── page.tsx ← M11: Application Detail
│ │ │ ├── hospitals/
│ │ │ │ └── page.tsx ← M12: All Hospitals Management
│ │ │ ├── configuration/
│ │ │ │ └── page.tsx ← M13: Platform Configuration
│ │ │ ├── subscriptions/
│ │ │ │ └── page.tsx ← M32: Admin Subscription Management
│ │ │ ├── analytics/
│ │ │ │ └── page.tsx ← M28: Admin Analytics Dashboard
│ │ │ └── profile/
│ │ │ └── page.tsx ← M3: Admin Profile
│ │ │
│ │ ├── manager/ ← Hospital Manager dashboard
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx ← M23: Hospital Manager Dashboard
│ │ │ ├── onboarding/ ← M5/M6/M7/M8 (pre-activation flow)
│ │ │ ├── doctors/
│ │ │ │ ├── page.tsx ← M14: Doctor List
│ │ │ │ ├── [id]/
│ │ │ │ │ ├── page.tsx ← M15: Edit Doctor
│ │ │ │ │ └── schedule/
│ │ │ │ │ └── page.tsx ← M16: Doctor Schedule
│ │ │ │ └── new/
│ │ │ │ └── page.tsx ← M15: Add Doctor
│ │ │ ├── departments/
│ │ │ │ └── page.tsx ← M17: Department Management
│ │ │ ├── schedule/
│ │ │ │ └── page.tsx ← M24: Daily Schedule View
│ │ │ ├── walk-in/
│ │ │ │ └── page.tsx ← M25: Walk-in Entry Form
│ │ │ ├── appointments/
│ │ │ │ └── page.tsx ← M26: Appointment Search & Filter
│ │ │ ├── analytics/
│ │ │ │ └── page.tsx ← M29: Manager Analytics
│ │ │ ├── notifications/
│ │ │ │ ├── page.tsx ← M30: Notification Center
│ │ │ │ └── settings/
│ │ │ │ └── page.tsx ← M31: Notification Settings
│ │ │ ├── subscription/
│ │ │ │ └── page.tsx ← M33: Manager Subscription
│ │ │ └── profile/
│ │ │ └── page.tsx ← M4: Manager Profile
│ │ │
│ │ ├── hospital/ ← Patient-facing hospital website
│ │ │ └── [slug]/ ← Dynamic route per hospital
│ │ │ └── page.tsx ← M18: Hospital Landing Page + Widget
│ │ │
│ │ └── api/ ← Next.js API Routes (proxy layer)
│ │ ├── auth/
│ │ │ ├── login/route.ts
│ │ │ ├── logout/route.ts
│ │ │ └── refresh/route.ts
│ │ └── [...proxy]/route.ts ← Generic proxy to Express API
│ │
│ ├── components/
│ │ ├── ui/ ← shadcn/ui components (auto-generated)
│ │ │ ├── button.tsx
│ │ │ ├── input.tsx
│ │ │ ├── dialog.tsx
│ │ │ └── ...
│ │ │
│ │ ├── layout/ ← Layout components
│ │ │ ├── AdminSidebar.tsx
│ │ │ ├── ManagerSidebar.tsx
│ │ │ ├── TopBar.tsx
│ │ │ └── NotificationBell.tsx
│ │ │
│ │ ├── chat/ ← Patient chat widget (Module 5)
│ │ │ ├── ChatWidget.tsx ← Root widget component
│ │ │ ├── ChatMessage.tsx
│ │ │ ├── ChatInput.tsx
│ │ │ ├── QuickReplyChips.tsx
│ │ │ ├── SlotCards.tsx
│ │ │ ├── VoiceMode.tsx
│ │ │ └── BookingConfirmCard.tsx
│ │ │
│ │ ├── dashboard/ ← Reusable dashboard components
│ │ │ ├── KpiCard.tsx
│ │ │ ├── AppointmentRow.tsx
│ │ │ ├── DoctorCard.tsx
│ │ │ └── StatusBadge.tsx
│ │ │
│ │ ├── forms/ ← Form components
│ │ │ ├── DoctorProfileForm.tsx
│ │ │ ├── WalkInForm.tsx
│ │ │ └── HospitalRegistrationForm.tsx
│ │ │
│ │ └── common/ ← Miscellaneous reusable components
│ │ ├── PageHeader.tsx
│ │ ├── DataTable.tsx
│ │ ├── ConfirmDialog.tsx
│ │ └── EmptyState.tsx
│ │
│ ├── hooks/ ← Custom React hooks
│ │ ├── useAuth.ts ← Login, logout, session
│ │ ├── useAppointments.ts ← React Query hooks for appointments
│ │ ├── useDoctors.ts
│ │ ├── useSocket.ts ← WebSocket connection hook
│ │ └── useNotifications.ts
│ │
│ ├── lib/ ← Utility functions and config
│ │ ├── api.ts ← Axios instance with interceptors
│ │ ├── queryClient.ts ← React Query client setup
│ │ ├── validations/ ← Zod schemas
│ │ │ ├── auth.schema.ts
│ │ │ ├── doctor.schema.ts
│ │ │ ├── appointment.schema.ts
│ │ │ └── hospital.schema.ts
│ │ └── utils.ts ← clsx, formatDate, etc.
│ │
│ ├── store/ ← Zustand global state
│ │ ├── authStore.ts ← Current user, access token
│ │ ├── uiStore.ts ← Sidebar open/closed, modal states
│ │ └── notificationStore.ts ← Unread count badge
│ │
│ └── types/ ← TypeScript interfaces
│ ├── auth.types.ts
│ ├── appointment.types.ts
│ └── hospital.types.ts
│
├── public/
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json

## 4.3 Express API Structure (apps/api/)

apps/api/
├── src/
│ ├── index.ts ← Server entry point (starts Express)
│ │
│ ├── config/
│ │ ├── db.ts ← Drizzle ORM setup, connection pool
│ │ ├── redis.ts ← ioredis client
│ │ ├── email.ts ← Nodemailer transporter
│ │ └── env.ts ← Validates env vars with Zod on startup
│ │
│ ├── db/
│ │ ├── schema/ ← Drizzle table definitions
│ │ │ ├── users.ts
│ │ │ ├── hospitals.ts
│ │ │ ├── doctors.ts
│ │ │ ├── appointments.ts
│ │ │ ├── schedules.ts
│ │ │ ├── notifications.ts
│ │ │ ├── subscriptions.ts
│ │ │ └── index.ts ← Re-exports all schemas
│ │ └── migrations/ ← Auto-generated by drizzle-kit
│ │
│ ├── middleware/
│ │ ├── auth.middleware.ts ← Verifies JWT, attaches req.user
│ │ ├── role.middleware.ts ← Checks admin/manager role
│ │ ├── tenant.middleware.ts ← Ensures hospitalId isolation
│ │ ├── validate.middleware.ts ← Runs Zod schema validation
│ │ └── error.middleware.ts ← Central error handler
│ │
│ ├── modules/ ← One folder per domain module
│ │ ├── auth/
│ │ │ ├── auth.router.ts
│ │ │ ├── auth.controller.ts
│ │ │ ├── auth.service.ts
│ │ │ └── auth.schema.ts
│ │ ├── hospitals/
│ │ │ ├── hospitals.router.ts
│ │ │ ├── hospitals.controller.ts
│ │ │ ├── hospitals.service.ts
│ │ │ └── hospitals.schema.ts
│ │ ├── doctors/
│ │ ├── appointments/
│ │ ├── schedules/
│ │ ├── notifications/
│ │ ├── subscriptions/
│ │ ├── analytics/
│ │ └── ai-bridge/ ← Routes that forward to FastAPI
│ │
│ ├── jobs/ ← BullMQ job definitions
│ │ ├── reminder.job.ts ← 24-hour appointment reminder (ER2.1)
│ │ ├── expiry.job.ts ← Subscription expiry check (ER2.3)
│ │ └── queue.ts ← BullMQ queue setup
│ │
│ ├── sockets/
│ │ └── notifications.socket.ts ← Socket.io event handlers
│ │
│ └── utils/
│ ├── jwt.utils.ts
│ ├── hash.utils.ts
│ ├── response.utils.ts ← Standardized API response format
│ └── date.utils.ts
│
├── .env
├── package.json
└── tsconfig.json

## 4.4 FastAPI AI Service Structure (apps/ai-service/)

apps/ai-service/
├── app/
│ ├── main.py ← FastAPI app entry point
│ │
│ ├── api/
│ │ ├── v1/
│ │ │ ├── chat.py ← POST /api/v1/chat (text conversation)
│ │ │ ├── voice.py ← POST /api/v1/voice (STT + response)
│ │ │ └── health.py ← GET /api/v1/health
│ │ └── deps.py ← Dependency injection
│ │
│ ├── core/
│ │ ├── config.py ← Settings from .env
│ │ ├── fsm.py ← Finite State Machine for dialogue
│ │ └── session.py ← Patient conversation session manager
│ │
│ ├── services/
│ │ ├── nlu_service.py ← Intent classification + NER
│ │ ├── llm_service.py ← LangChain + Llama 3.1 8B via Groq API via Ollama
│ │ ├── stt_service.py ← Whisper speech-to-text
│ │ ├── tts_service.py ← Text-to-speech synthesis
│ │ └── scheduling_service.py ← Calls Node.js API for slot data
│ │
│ └── models/
│ ├── chat_models.py ← Pydantic request/response models
│ └── fsm_models.py ← FSM state definitions
│
├── requirements.txt
└── .env

# 5. Coding Standards and Conventions

These rules apply to every file in the project. Both team members must follow them without exception. The reason is not pedantry — it is so that when you read each other's code at 2am before the evaluation deadline, you immediately understand what you are looking at.

## 5.1 TypeScript Naming Conventions

## 5.2 File and Function Size Rules

No file should exceed 300 lines. If it does, split it.
No function should exceed 40 lines. If it does, extract helper functions.
No React component should have more than 3 useState hooks. If it does, extract a custom hook.
No function should have more than 3 parameters. If it does, use an object parameter.

// WRONG — too many parameters
function createAppointment(patientName, doctorId, date, time, reason, hospitalId) {}

// CORRECT — use an object
interface CreateAppointmentParams {
patientName: string;
doctorId: string;
date: string;
time: string;
reason?: string;
hospitalId: string;
}
function createAppointment(params: CreateAppointmentParams) {}

## 5.3 Comment Rules

Code should be readable without comments. Comments explain WHY, not WHAT. The code shows what — the comment explains the reasoning behind a non-obvious decision.

// WRONG — explains what the code obviously does
// Loop through appointments
for (const apt of appointments) { ... }

// CORRECT — explains a non-obvious business rule
// Per SRS ER1.6: duplicate check uses contact number + date only,
// not patient name (patients may share phones)
const isDuplicate = await checkDuplicate(contactNumber, date, doctorId);

Required comment locations:
Every function in the services layer (auth.service.ts, etc.) must have a JSDoc comment
Every database schema file must have a comment explaining the table's purpose
Every Zod schema must have a comment explaining what request it validates
Complex business logic (slot conflict detection, FSM state transitions) must have inline comments

/\*\*

- Creates an appointment record and sends confirmation email.
- Throws ConflictError if the requested slot is already booked.
- Per SRS requirement ER1.3: reference ID must be min 8 alphanumeric chars.
- @param params - Appointment creation parameters
- @returns The created appointment with reference ID
  \*/
  export async function createAppointment(params: CreateAppointmentParams) { ... }

## 5.4 Error Handling Rules

All errors must be handled. Silent failures (empty catch blocks, ignored promise rejections) are strictly forbidden. Every async function must either handle its errors or throw them to be handled by the central error middleware.

// WRONG — swallows the error
try {
await sendEmail(patient.email);
} catch (error) {} // Never do this

// CORRECT — log and handle gracefully
try {
await sendEmail(patient.email);
} catch (error) {
// Per SRS ER1.3: if email fails, log it but still issue the reference ID
logger.error({ appointmentId, error }, 'Confirmation email failed');
await db.update(notifications).set({ status: 'FAILED' }).where(...);
}

Standard API Error Response Format (all errors must follow this shape):
{
"success": false,
"error": {
"code": "SLOT_UNAVAILABLE",
"message": "The requested appointment slot is no longer available.",
"details": {} // optional extra info
}
}

## 5.5 React Component Rules

Always use named exports, not default exports (exception: page.tsx files in Next.js, which must be default export)
All props must be explicitly typed with a TypeScript interface
Never use 'any' as a type — use 'unknown' if you must, then narrow the type
One component per file — no exception
Keep components presentational (display data) and move logic to custom hooks

// CORRECT component structure
interface KpiCardProps {
title: string;
value: number;
trend?: 'up' | 'down' | 'neutral';
isLoading?: boolean;
}

export function KpiCard({ title, value, trend, isLoading }: KpiCardProps) {
if (isLoading) return <KpiCardSkeleton />;
return (

<div className='rounded-xl border bg-white p-6 shadow-sm'>
<p className='text-sm font-medium text-gray-500'>{title}</p>
<p className='mt-2 text-3xl font-bold text-gray-900'>{value}</p>
</div>
);
}

## 5.6 VS Code Extensions (Install These Now)

# 6. Database Design Conventions

## 6.1 Universal Rules for Every Table

Every table must have an 'id' column of type uuid, generated as default uuid_generate_v4().
Every table must have 'created_at' and 'updated_at' timestamp columns with defaults.
Every table that belongs to a hospital must have 'hospital_id' uuid NOT NULL referencing hospitals(id).
Use snake_case for all column names.
Never store passwords, tokens, or raw sensitive data in any table other than users.
Every foreign key must have an index created on it for query performance.

## 6.2 Drizzle Schema Example (How to Write Tables)

// apps/api/src/db/schema/appointments.ts

import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { hospitals } from './hospitals';
import { doctors } from './doctors';

// Define ENUMs at the top of the schema file
export const appointmentStatusEnum = pgEnum('appointment_status', [
'PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED',
]);

export const appointmentSourceEnum = pgEnum('appointment_source', [
'ONLINE', 'WALK_IN', 'TELEPHONY',
]);

/\*\*

- Stores all appointments across all hospital tenants.
- hospital_id is always required for multi-tenant isolation.
  \*/
  export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  hospitalId: uuid('hospital_id').notNull().references(() => hospitals.id),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id),
  referenceId: text('reference_id').notNull().unique(), // e.g. 'APT-ABC12345'
  patientName: text('patient_name').notNull(),
  patientPhone: text('patient_phone').notNull(),
  patientEmail: text('patient_email'),
  patientAge: text('patient_age'),
  visitReason: text('visit_reason'),
  appointmentDate: text('appointment_date').notNull(), // ISO date: '2025-06-15'
  appointmentTime: text('appointment_time').notNull(), // '14:30'
  status: appointmentStatusEnum('status').default('CONFIRMED').notNull(),
  source: appointmentSourceEnum('source').notNull(),
  cancelReason: text('cancel_reason'),
  isLateCancel: text('is_late_cancel'), // SRS ER1.5: flag cancellations < 2hrs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });

# 7. API Design Rules

## 7.1 Route Naming Convention

## 7.2 Standard Success Response Format

{
"success": true,
"data": { ... }, // the actual response data
"meta": { // optional, for lists
"total": 120,
"page": 1,
"limit": 15
}
}

Create a sendSuccess() and sendError() helper in utils/response.utils.ts and use it in every controller. This guarantees the format is consistent without relying on team members to remember.

# 8. Git Workflow

## 8.1 Branch Naming

## 8.2 Commit Message Format

type(scope): short description

feat(auth): add JWT refresh token endpoint
fix(appointments): prevent double-booking on concurrent requests
docs(api): add Postman collection for auth routes
refactor(doctors): extract slot calculation to separate service

## 8.3 Branch Rules

main — production-ready code only. Never commit directly to main.
dev — integration branch. Merge your feature branches here first.
Each feature/fix gets its own branch. Open a Pull Request into dev when done.
Both team members must review and approve before merging.

# 9. Environment Variables

Never hardcode credentials, URLs, or secrets in your code. Every value that differs between development and production must be an environment variable. The .env file is never committed to Git.

## 9.1 apps/api/.env Template

# Database

DATABASE_URL=postgresql://postgres:password@localhost:5432/halo

# Redis

REDIS_URL=redis://localhost:6379

# Authentication

JWT_SECRET=your-very-long-random-secret-minimum-64-chars
JWT_REFRESH_SECRET=another-very-long-random-secret
JWT_ACCESS_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d

# Server

PORT=4000
NODE_ENV=development

# AI Service

AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=internal-secret-key

# Email (use Mailtrap for development — free, does not send real emails)

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
EMAIL_FROM=noreply@halo.health

# Frontend URL (for CORS)

FRONTEND_URL=http://localhost:3000

# Cloudinary (document storage)

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

## 9.2 apps/web/.env.local Template

NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:4000 # server-side only, not exposed to browser
NEXTAUTH_SECRET=your-nextauth-secret

# 10. Recommended Build Order — Sprint Sequence

This is the most important section for your actual work. Do not start Module 5 (AI chat) without finishing Modules 1-4 first. The dependencies are real: the AI needs doctor schedules (Module 4) to book appointments, and doctor schedules require hospitals (Module 2) to exist.

Each sprint is approximately one week. Given your 10-module scope and 2-person team, focus on getting a working end-to-end flow before polishing any individual screen.

## Sprint 0 — Infrastructure Setup (3-4 days)

Set up the monorepo structure exactly as described in Section 4
Initialize Next.js, Express, and FastAPI services
Configure Docker Compose with PostgreSQL and Redis
Set up ESLint, Prettier, and Husky
Create all Drizzle schemas and run first migration
Set up Mailtrap for development email testing
Create shared .env.example files
Initialize Git with main and dev branches

## Sprint 1 — Module 1: Authentication (1 week)

Backend: POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout
Backend: Password reset flow (forgot password + reset link + reset endpoint)
Frontend: M1 Unified Login Screen — migrate your existing React work to Next.js
Frontend: M2 Forgot Password Screen
Frontend: Auth middleware in Next.js (redirect to login if no token)
Test: Manual testing via Postman, verify JWT works, verify role separation

## Sprint 2 — Module 2 + 3: Hospital Onboarding + Admin (1 week)

Backend: Hospital registration CRUD, document upload to Cloudinary
Backend: Admin approve/reject endpoints
Backend: Hospital tenant creation logic (unique tenant ID)
Frontend: M3 Admin Profile, M9 Admin Dashboard (skeleton)
Frontend: M10 Pending Applications, M11 Application Detail (approve/reject flow)
Frontend: M5/M6/M7 Hospital Registration wizard
Frontend: M8 Application Status Tracking

## Sprint 3 — Module 4: Clinical Resources (1 week)

Backend: Doctor CRUD, Department CRUD
Backend: Doctor schedule configuration (working hours, breaks, leaves)
Backend: Slot availability calculation algorithm
Frontend: M14 Doctor List, M15 Add/Edit Doctor
Frontend: M16 Doctor Schedule Configuration
Frontend: M17 Department Management

## Sprint 4 — Module 5 Core: Text Chat (1.5 weeks)

AI Service: Set up Ollama + Llama 3.1 8B via Groq API 13B locally
AI Service: Basic FSM with states: GREETING → INTENT → COLLECT_INFO → CONFIRM → DONE
AI Service: LangChain chain for Llama 3.1 8B via Groq API conversation generation
Backend: AI bridge endpoint (POST /api/ai/chat) that forwards to FastAPI
Backend: Appointment creation endpoint (POST /api/appointments)
Frontend: M18 Hospital Landing Page with embedded widget button
Frontend: M19 Chat Widget Text Mode — full working booking flow
Frontend: M21 Booking Confirmation Summary card in chat

## Sprint 5 — Module 6: Operations Console (1 week)

Backend: Dashboard KPI aggregation queries
Backend: Walk-in appointment creation endpoint
Backend: Real-time Socket.io notification on new booking
Frontend: M23 Hospital Manager Dashboard with real KPIs
Frontend: M24 Daily Schedule and Calendar View
Frontend: M25 Walk-in Patient Entry Form

## Sprint 6 — Modules 7, 8, 9 (1 week)

Backend: Search and filter endpoints for appointments and doctors
Backend: Analytics aggregation queries for admin and manager
Backend: BullMQ job for 24-hour email reminders (ER2.1)
Backend: BullMQ job for subscription expiry (ER2.3)
Frontend: M26/M27 Search and filter screens
Frontend: M28/M29 Analytics dashboards with Recharts
Frontend: M30/M31 Notification center and preferences

## Sprint 7 — Module 5 Advanced: Voice + Module 10 (1 week)

AI Service: Whisper STT integration for voice input
AI Service: TTS output for voice responses
Frontend: M20 HALO Chat Widget Voice Mode with WebRTC
Frontend: M22 Phone Number Display screen
Backend + Frontend: M32/M33 Billing simulation screens
Backend: Subscription management admin endpoints

## Sprint 8 — Polish, Testing, Evaluation Prep (1 week)

Complete all remaining admin screens: M12, M13 Platform Configuration
Complete M3/M4 Profile screens
End-to-end testing of all critical flows
Fix all critical bugs
Prepare demo hospital setup
Verify all SRS event-response requirements (ER1.1 through ER2.5) are implemented

# 11. Quick Reference — Commands

## Starting Development

# Start infrastructure (PostgreSQL + Redis)

cd halo && docker-compose up -d

# Start Next.js frontend (port 3000)

cd apps/web && npm run dev

# Start Express API (port 4000)

cd apps/api && npm run dev

# Start FastAPI AI service (port 8000)

cd apps/ai-service && uvicorn app.main:app --reload --port 8000

# Start Ollama (Llama 3.1 8B via Groq API) — run in separate terminal

ollama serve
ollama run llama2:13b # first time, downloads the model

## Database Operations

# Generate migration from schema changes

cd apps/api && npx drizzle-kit generate

# Apply migrations to database

cd apps/api && npx drizzle-kit migrate

# Push schema directly (development only, no migration file)

cd apps/api && npx drizzle-kit push

## shadcn/ui Component Installation

cd apps/web
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add card
npx shadcn-ui@latest add select
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add toast

# 12. A Note to Both of You

Building HALO is a significant undertaking for a first real-world SaaS project. The fact that you have a detailed SRS already puts you ahead of most students at this stage. A few things to keep in mind as you start:

1. The AI pipeline (Module 5) is the hardest part. Do not let it block everything else. Build the text chat first with a simple echo bot if needed, then replace it with Llama 3.1 8B via Groq API. The dashboards and admin screens are straightforward and will give you visible progress.

2. Test on real data as early as possible. Create a dummy hospital, add three doctors with different schedules, and actually try to book an appointment through your own chat widget. Bugs you find this way in Sprint 4 are easy to fix. Bugs you find in Sprint 8 are not.

3. The evaluators will ask why you made each technology choice. The answers are all in Section 2 of this guide. Read it once more before your evaluation and you will be able to answer any question confidently.

Good luck. You have everything you need.

| Service | Technology | Purpose | Port (local dev) |
| web | Next.js 14.6 | All UI screens: Admin, Hospital Manager, Patient widget, Hospital landing page | 3000 |
| api | Node.js 20.2 + Express 4.3 | All business logic, authentication, database operations, REST endpoints | 4000 |
| ai-service | Python 3.11 + FastAPI 0.104 | NLU pipeline, LangChain orchestration, Llama 3.1 8B via Groq API via Ollama, Whisper STT | 8000 |
| worker | Node.js 20.2 + BullMQ | Background jobs: email reminders, subscription expiry checks, notification queues | internal |

| Package | Version | Why |
| next | 14.6.x | Required by SRS. App Router for layout system, server components for performance. |
| react | 18.3.x | Peer dependency of Next.js 14. |
| react-dom | 18.3.x | Required to render React to the browser. |
| typescript | 5.2.x | Required by SRS. Catches type errors before runtime. |

| Package | Version | Why |
| tailwindcss | 3.3.x | Required by SRS. Utility-first CSS — no separate CSS files needed. |
| @tailwindcss/forms | 0.5.x | Resets browser form styles so your inputs look consistent everywhere. |
| @tailwindcss/typography | 0.5.x | Needed for the chat widget message rendering with proper text formatting. |
| clsx | 2.1.x | Utility to combine CSS class names conditionally without messy string concatenation. |
| tailwind-merge | 2.x | Resolves Tailwind class conflicts (e.g., when two classes target the same property). |

| Package | Version | Why |
| shadcn/ui (components) | latest | Pre-built accessible components built on Radix UI. You install components individually — they live in your own codebase and you can edit them. |
| @radix-ui/react-\* | latest | The headless primitives that shadcn/ui is built on. Installed automatically. |
| lucide-react | 0.383.x | Icon library used by shadcn/ui. Consistent, tree-shakable. |
| class-variance-authority | 0.7.x | Supports variant-based component styling used by shadcn/ui. |

| Package | Version | Why |
| zustand | 4.5.x | Lightweight global state. Use for: current user session, notification badge count, chat widget state. No boilerplate. |
| @tanstack/react-query | 5.x | Server state management. All API calls, caching, loading/error states. This replaces useState+useEffect for data fetching. |

| Package | Version | Why |
| react-hook-form | 7.51.x | The standard for forms in React. Minimal re-renders, built-in validation. |
| zod | 3.22.x | Schema validation library. Define what valid data looks like, reuse schemas on both frontend and backend. |
| @hookform/resolvers | 3.3.x | Connects zod schemas to react-hook-form so validation runs automatically. |

| Package | Version | Why |
| axios | 1.6.x | HTTP client for calling your own API. Provides interceptors to automatically attach JWT tokens and handle 401 errors globally. |

| Package | Version | Why |
| date-fns | 3.x | Date manipulation library. Lighter than moment.js. Functions like format(), addDays(), differenceInHours() for appointment scheduling logic. |
| date-fns-tz | 3.x | Timezone support for date-fns. Important for appointment slot display across Pakistan Standard Time. |

| Package | Version | Why |
| recharts | 2.12.x | Charts for the Analytics dashboards (Module 8). Built for React, responsive by default, well-documented. |

| Package | Version | Why |
| socket.io-client | 4.7.x | WebSocket client. For Hospital Manager real-time notifications (new booking alerts, walk-in sync). Matches socket.io on the API server. |
| simple-peer | 9.11.x | WebRTC wrapper. For the voice interaction feature in the patient chat widget (Module 5 M19/M20). |

| Package | Version | Why |
| @react-pdf/renderer | 3.4.x | Generate PDF reports inside the browser or server side. For Module 8 report export feature. |
| react-dropzone | 14.2.x | File upload drag-and-drop for hospital document upload (Module 2: M6 document upload screen). |

| Package | Version | Why |
| express | 4.18.x | Required by SRS. The most widely-used Node.js web framework. Every tutorial you find online will use it. |
| typescript | 5.2.x | Same TypeScript version as frontend. Catches errors before they reach production. |
| ts-node | 10.9.x | Run TypeScript directly without pre-compiling. Used in development. |
| tsx | 4.x | Fast TypeScript execution. Faster than ts-node for watch mode. |
| nodemon | 3.x | Auto-restarts the API server when you save a file. Development only. |

| Package | Version | Why |
| jsonwebtoken | 9.x | Required by SRS. Creates and verifies JWT tokens for authentication. |
| bcryptjs | 2.4.x | Hashes passwords before storing them. Never store plain-text passwords. |
| helmet | 7.x | Sets HTTP security headers automatically. Prevents common web attacks. |
| cors | 2.8.x | Controls which origins can call your API. Critical for multi-domain setup. |
| express-rate-limit | 7.x | Limits how many requests a single IP can make. Prevents brute-force attacks on login. |
| express-validator | 7.x | Validates and sanitizes request body/query/params. Prevents injection attacks. |
| cookie-parser | 1.4.x | Parses cookies. Needed for refresh token storage in httpOnly cookies. |

| Package | Version | Why |
| pg | 8.11.x | PostgreSQL client for Node.js. Raw SQL queries. |
| drizzle-orm | 0.30.x | Type-safe ORM for PostgreSQL. Generates TypeScript types from your schema. Lighter than Prisma, faster queries, no proxy server needed. |
| drizzle-kit | 0.20.x | CLI tool for drizzle-orm: generates migration files, pushes schema changes. |

| Package | Version | Why |
| ioredis | 5.3.x | Redis client. Better TypeScript support than the official 'redis' package. |
| connect-redis | 7.x | Express session store backed by Redis. For Hospital Manager dashboard sessions. |

| Package | Version | Why |
| nodemailer | 6.9.x | Sends emails via SMTP. Connect to any email provider (Gmail, SendGrid, etc.). |
| @react-email/components | 0.0.x | Build email templates using React. Same developer experience as building UI. |
| react-email | 2.x | CLI and preview server for email templates. Preview your emails in the browser before sending. |

| Package | Version | Why |
| bullmq | 5.x | Job queue backed by Redis. For the 24-hour reminder emails (ER2.1 from SRS), subscription expiry checks (ER2.3), report generation. |
| @bull-board/express | 5.x | Web dashboard to monitor your job queues. Shows failed jobs, retries, processing status. Invaluable for debugging. |

| Package | Version | Why |
| multer | 1.4.x | Handles multipart/form-data for hospital document uploads (Module 2 M6). |
| cloudinary | 2.x | Cloud storage for uploaded files. Free tier is sufficient for FYP. Avoids local disk storage problems. |

| Package | Version | Why |
| socket.io | 4.7.x | WebSocket server. Hospital Manager receives real-time booking notifications. Pairs with socket.io-client on frontend. |

| Package | Version | Why |
| zod | 3.22.x | Same Zod used on frontend. Validate request bodies. Define schemas once, use on both sides. |
| uuid | 9.x | Generate unique IDs for appointments, application IDs, reference numbers. |
| dotenv | 16.x | Loads environment variables from .env files. |
| morgan | 1.10.x | HTTP request logger. Shows every incoming request in development. Helps debug API issues. |
| compression | 1.7.x | Gzip compresses API responses. Faster data transfer. |
| dayjs | 1.11.x | Date manipulation on the backend. Lightweight. For appointment scheduling calculations. |

| Package | Version | Why |
| fastapi | 0.104.x | Required by SRS. High-performance async Python web framework. Auto-generates API documentation. |
| uvicorn | 0.24.x | ASGI server to run FastAPI. Use with --reload in development. |
| pydantic | 2.x | Data validation for FastAPI. Defines request/response models with type checking. |
| python-dotenv | 1.x | Loads .env variables in Python. |

| Package | Version | Why |
| langchain | 0.1.4 | Required by SRS. Orchestrates the conversation chain: intent → FSM state → Llama 3.1 8B via Groq API → response. |
| langchain-community | 0.0.x | Langchain integrations including Ollama connector for Llama 3.1 8B via Groq API. |
| openai-whisper | latest | Required by SRS (Whisper Large-v3). Speech-to-text for voice and telephony input. |
| faster-whisper | 1.x | CTranslate2-based Whisper implementation. 4x faster than original, same accuracy. Use this instead of openai-whisper for the actual inference. |
| ollama | 0.2.x | Python client for the Ollama server running Llama 3.1 8B via Groq API 13B locally. |
| transformers | 4.38.x | Hugging Face transformers. For NER (Named Entity Recognition) to extract doctor names, dates, times from patient input. |
| torch | 2.2.x | PyTorch — required by transformers and whisper. |

| Package | Version | Why |
| soundfile | 0.12.x | Reads audio files for Whisper processing. |
| numpy | 1.26.x | Array operations for audio processing pipeline. |
| httpx | 0.27.x | Async HTTP client for making calls to the Node.js API from within FastAPI. |
| websockets | 12.x | WebSocket support for real-time audio streaming from browser to FastAPI. |

| Tool | Version | Why |
| PostgreSQL | 15 or 16 | Required by SRS. Local install via postgres.app (Mac) or apt (Linux/WSL). |
| Redis | 7.x | Required by SRS. Local install via brew or apt. Used for sessions, job queues, caching. |
| TablePlus | free tier | GUI for PostgreSQL. Lets you browse tables, run queries, inspect data without command line. |
| RedisInsight | free | GUI for Redis. See your job queues and cached values visually. |

| Tool | Version | Why |
| Docker Desktop | 24.x | Required by SRS. Run PostgreSQL and Redis in containers so your local machine stays clean. |
| docker-compose | included | Start all local services (postgres, redis, ollama) with one command: docker-compose up. |
| VS Code | latest | Primary editor. Install extensions listed in Section 5. |
| Postman | 10.x | Test your API endpoints as you build them. Create a collection for all HALO routes. |

| Tool | Version | Why |
| eslint | 8.x | Finds code problems in JavaScript/TypeScript. |
| @typescript-eslint/parser | 7.x | ESLint plugin for TypeScript rules. |
| prettier | 3.x | Auto-formats code so both team members write in the same style. |
| eslint-config-prettier | 9.x | Disables ESLint rules that conflict with Prettier. |
| husky | 9.x | Git hooks — runs ESLint and Prettier before every commit automatically. |
| lint-staged | 15.x | Only runs linting on files you actually changed (faster than linting everything). |

| Token | Lifetime | Storage | Purpose |
| Access Token | 8 hours (per SRS NFR) | Memory (Zustand store) | Sent with every API request in Authorization header |
| Refresh Token | 30 days | httpOnly cookie (not readable by JS) | Used to get a new access token when the old one expires |

| What | Convention | Example |
| Variables and functions | camelCase | const hospitalId, function getAppointments() |
| React components | PascalCase | DoctorCard, AppointmentTable |
| TypeScript interfaces | PascalCase with I prefix (optional) | IAppointment or Appointment (be consistent, pick one) |
| TypeScript types | PascalCase | type AppointmentStatus = 'confirmed' | 'cancelled' |
| Enums | PascalCase, values SCREAMING_SNAKE_CASE | enum Role { ADMIN = 'ADMIN', MANAGER = 'MANAGER' } |
| Constants (non-primitive) | SCREAMING_SNAKE_CASE | const MAX_RETRY_ATTEMPTS = 3 |
| Files: React components | PascalCase | DoctorCard.tsx, AppointmentRow.tsx |
| Files: everything else | kebab-case | auth.service.ts, appointment.schema.ts |
| Database columns | snake_case (Drizzle maps to camelCase) | hospital_id → hospitalId in code |
| API route paths | kebab-case, plural nouns | /api/doctors, /api/appointments/:id |
| Environment variables | SCREAMING_SNAKE_CASE | DATABASE_URL, JWT_SECRET |

| Extension | ID | Why |
| ESLint | dbaeumer.vscode-eslint | Real-time linting in editor |
| Prettier | esbenp.prettier-vscode | Auto-format on save |
| Tailwind IntelliSense | bradlc.vscode-tailwindcss | Autocomplete for Tailwind classes |
| TypeScript Hero | ms-vscode.vscode-typescript-next | Better TypeScript support |
| Drizzle ORM Snippets | drizzle.vscode-drizzle-orm | Schema autocomplete |
| GitLens | eamodio.gitlens | See who wrote each line and when |
| Error Lens | usernamehw.errorlens | Shows errors inline in the editor |
| REST Client | humao.rest-client | Test API routes directly in VS Code |
| Python (ms-python) | ms-python.python | For the FastAPI service |
| Pylance | ms-python.vscode-pylance | Python type checking |

| Action | Method | Path | Example |
| List all | GET | /api/{resource} | GET /api/appointments |
| Get one | GET | /api/{resource}/:id | GET /api/appointments/uuid-here |
| Create | POST | /api/{resource} | POST /api/appointments |
| Update | PATCH | /api/{resource}/:id | PATCH /api/appointments/uuid-here |
| Delete | DELETE | /api/{resource}/:id | DELETE /api/doctors/uuid-here |
| Actions | POST | /api/{resource}/:id/{action} | POST /api/hospitals/uuid/approve |

| Type | Pattern | Example |
| Feature | feature/short-description | feature/doctor-schedule-config |
| Bug fix | fix/short-description | fix/appointment-double-booking |
| Documentation | docs/description | docs/update-readme |
| Refactor | refactor/description | refactor/auth-middleware |
