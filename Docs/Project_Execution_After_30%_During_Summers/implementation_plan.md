# HALO Complete Migration & AI Agent Implementation Plan

Migrate HALO from **Vite + Custom JWT** to **Next.js + Firebase Auth + Neon PostgreSQL**, and build the **patient-facing AI agent** for the FYP evaluation.

---

## Answers to Open Questions

### Q1: Firebase Project Setup Guide

> [!TIP]
> **Step-by-step Firebase setup — do this before we start coding:**

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Create a project** → Name it `halo-fyp`
2. **Disable** Google Analytics (not needed for FYP)
3. Go to **Authentication** → **Get started** → Enable **Email/Password** sign-in method
4. Go to **Cloud Messaging** → Note the **Server Key** (for backend push notifications)
5. Go to **Project Settings** → **General** → **Add app** → Select **Web** (`</>`)
   - Register app name: `halo-web`
   - Copy the `firebaseConfig` object (you'll paste this into `lib/firebase.ts`)
6. Go to **Project Settings** → **Service accounts** → **Generate new private key**
   - Download the JSON file → save as `Backend/firebase-service-account.json`
   - **Add this file to `.gitignore` immediately** — never commit it

**Environment variables you'll get:**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=halo-fyp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=halo-fyp
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789

# Backend (.env)
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

---

### Q2: Neon Database Setup Guide

> [!TIP]
> **Step-by-step Neon setup:**

1. Go to [Neon Console](https://console.neon.tech/) → **Sign up** (free tier: 0.5 GB storage, 1 project)
2. **Create a project** → Name: `halo-fyp` → Region: pick closest (AWS eu-central-1 or ap-southeast-1)
3. A default database `neondb` is created automatically
4. Go to **Dashboard** → Copy the **Connection string** (looks like `postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)
5. Paste it as `DATABASE_URL` in your backend `.env`

**That's it.** Drizzle ORM works with Neon out of the box — just a connection string swap. Neon is wire-compatible PostgreSQL.

---

### Q3: Firebase Password Reset + Reminders

**Password Reset:** We'll use Firebase's built-in `sendPasswordResetEmail()`. This eliminates the custom reset token flow entirely. Firebase sends the email from `noreply@halo-fyp.firebaseapp.com` (customizable in Firebase Console → Authentication → Templates).

**Appointment Reminders:** Firebase Cloud Messaging (FCM) **delivers** push notifications, but doesn't **schedule** them. The scheduling logic lives in the backend:

```
Backend (node-cron) → runs every hour → checks appointments in next 24 hours
                    → sends FCM push + email to patient contact
```

We'll use `node-cron` (lightweight scheduler for Express) instead of BullMQ+Redis to keep the stack simpler for the FYP. If you scale later, you can upgrade to BullMQ.

---

### Q4: Patient-Facing AI Agent — Complete Architecture

> [!IMPORTANT]
> This is the **core innovation** of HALO. The architecture is designed for your FYP evaluation demo while being production-extensible.

See **Phase 4** below for the full design.

---

### Q5: Deployment

- **Frontend:** Vercel (stays as-is, native Next.js support)
- **Backend:** **Heroku** via university credentials (GitHub Student Developer Pack):
  - ~$13/month in platform credits (free for students)
  - No cold-start sleep issues like Render free tier
  - Native Node.js buildpack support
  - Easy GitHub auto-deploy
- **Database:** Neon PostgreSQL (free tier)
- **AI Service (FastAPI):** Heroku (same credits) or Google Cloud Run ($300 free credits)

---

## Migration Strategy

> [!IMPORTANT]
> **5-Phase approach** — each phase produces a working, testable system:
>
> **Phase 1:** Infrastructure setup (Firebase + Neon + schema expansion)
> **Phase 2:** Backend auth migration + core domain APIs (doctors, appointments)
> **Phase 3:** Frontend Next.js migration
> **Phase 4:** AI Agent Service (FastAPI + Chat Widget + Voice + Telephony)
> **Phase 5:** Integration, demo data seeding, evaluation preparation

---

## New Database Schema (Missing Core Domain Tables)

> [!CAUTION]
> Your current database has **no tables** for doctors, departments, appointments, schedules, or patients. These are the core domain entities that the AI agent needs to function. They must be created in Phase 1.

### New Tables to Add

```sql
-- Core domain tables (currently missing)
departments          -- hospital departments (Cardiology, Orthopedics, etc.)
doctors              -- doctor profiles per hospital
doctor_schedules     -- weekly working hours per doctor
appointments         -- all appointments (online + walk-in + telephony)

-- Firebase/Agent support tables (new)
fcm_tokens           -- push notification device tokens per user
chat_sessions        -- AI agent conversation sessions per patient
chat_messages        -- individual messages in chat sessions
```

### Table Schemas (Drizzle ORM)

```typescript
// departments
departments = pgTable('departments', {
  id: uuid().primaryKey().defaultRandom(),
  hospitalId: uuid().notNull().references(() => hospitals.id),
  name: text().notNull(),          // "Cardiology"
  description: text(),
  isActive: boolean().default(true),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

// doctors
doctors = pgTable('doctors', {
  id: uuid().primaryKey().defaultRandom(),
  hospitalId: uuid().notNull().references(() => hospitals.id),
  departmentId: uuid().notNull().references(() => departments.id),
  name: text().notNull(),          // "Dr. Ahmed Khan"
  specialization: text().notNull(), // "Cardiologist"
  qualifications: text(),          // "MBBS, FCPS"
  consultationFee: integer(),      // in PKR
  slotDurationMinutes: integer().default(30),
  contactNumber: text(),
  email: text(),
  profileImageUrl: text(),
  isActive: boolean().default(true),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

// doctor_schedules (weekly recurring)
doctorSchedules = pgTable('doctor_schedules', {
  id: uuid().primaryKey().defaultRandom(),
  doctorId: uuid().notNull().references(() => doctors.id),
  dayOfWeek: integer().notNull(),   // 0=Sunday, 1=Monday...6=Saturday
  startTime: text().notNull(),      // "09:00"
  endTime: text().notNull(),        // "17:00"
  breakStart: text(),               // "13:00"
  breakEnd: text(),                 // "14:00"
  isActive: boolean().default(true),
});

// appointments
appointmentStatusEnum = pgEnum('appointment_status', [
  'PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'
]);
appointmentSourceEnum = pgEnum('appointment_source', [
  'ONLINE_CHAT', 'VOICE_CHAT', 'TELEPHONY', 'WALK_IN'
]);

appointments = pgTable('appointments', {
  id: uuid().primaryKey().defaultRandom(),
  hospitalId: uuid().notNull().references(() => hospitals.id),
  doctorId: uuid().notNull().references(() => doctors.id),
  referenceId: text().notNull().unique(),  // "APT-ABC12345"
  patientName: text().notNull(),
  patientPhone: text().notNull(),
  patientEmail: text(),
  appointmentDate: date().notNull(),       // "2026-07-15"
  appointmentTime: text().notNull(),       // "14:30"
  visitReason: text(),
  status: appointmentStatusEnum().default('CONFIRMED'),
  source: appointmentSourceEnum().notNull(),
  cancelReason: text(),
  chatSessionId: uuid(),                   // links to the chat that created it
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

// chat_sessions (AI agent conversations)
chatSessions = pgTable('chat_sessions', {
  id: uuid().primaryKey().defaultRandom(),
  hospitalId: uuid().notNull().references(() => hospitals.id),
  sessionToken: text().notNull().unique(), // random token for unauthenticated patients
  patientName: text(),
  patientPhone: text(),
  source: text().notNull(),                // "web_chat" | "voice_chat" | "telephony"
  language: text().default('en'),          // "en" | "ur" | "mixed"
  status: text().default('active'),        // "active" | "completed" | "abandoned"
  metadata: jsonb(),                       // FSM state, booking data in progress
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

// fcm_tokens
fcmTokens = pgTable('fcm_tokens', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull().references(() => users.id),
  token: text().notNull(),
  deviceInfo: text(),
  createdAt: timestamp().defaultNow(),
});
```

---

## Phase 1: Infrastructure Setup (~4 hours)

### 1.1 Firebase Project Creation
- Follow the Q1 guide above
- Enable Email/Password auth + Cloud Messaging
- Download service account JSON

### 1.2 Neon Database Creation
- Follow the Q2 guide above
- Get connection string

### 1.3 Database Schema Expansion

#### [MODIFY] [schema.ts](file:///d:/7th%20Semester/7.%20Senior%20Project%20Design%20I/SDS/HALO_FYP_v8/Backend/src/db/schema.ts)
- Add `firebaseUid` column to `users` table
- Remove `passwordHash` column from `users`
- Delete `refreshTokens` table
- Delete `passwordResetTokens` table
- Add all new tables: `departments`, `doctors`, `doctorSchedules`, `appointments`, `chatSessions`, `fcmTokens`

#### [NEW] `Backend/src/config/firebase.ts`
- Initialize Firebase Admin SDK
- Export `firebaseAuth` and `firebaseMessaging`

#### [MODIFY] [env.ts](file:///d:/7th%20Semester/7.%20Senior%20Project%20Design%20I/SDS/HALO_FYP_v8/Backend/src/config/env.ts)
- Remove `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Add `GOOGLE_APPLICATION_CREDENTIALS`
- Add `GROQ_API_KEY` (for AI service)

---

## Phase 2: Backend — Auth Migration + Core Domain APIs (~12-15 hours)

### 2.1 Auth Migration (Firebase Admin SDK)

#### [MODIFY] [middleware/auth.ts](file:///d:/7th%20Semester/7.%20Senior%20Project%20Design%20I/SDS/HALO_FYP_v8/Backend/src/middleware/auth.ts)
- Full rewrite: `jwt.verify()` → `firebaseAuth.verifyIdToken(token)`
- Look up user in PostgreSQL by `firebaseUid` → attach to `req.user`

#### [MODIFY] [modules/auth/auth.routes.ts](file:///d:/7th%20Semester/7.%20Senior%20Project%20Design%20I/SDS/HALO_FYP_v8/Backend/src/modules/auth/auth.routes.ts)
- Delete: login, refresh, forgot-password, reset-password
- Add: `POST /auth/session` (verify Firebase token → return user profile)
- Keep: logout (audit log only), simplified change-password

#### [MODIFY] [utils/security.ts](file:///d:/7th%20Semester/7.%20Senior%20Project%20Design%20I/SDS/HALO_FYP_v8/Backend/src/utils/security.ts)
- Remove ~60% of file (hashPassword, verifyPassword, signAccessToken, etc.)
- Keep: `createApplicationId`, `addDays`, `addMinutes`

#### [MODIFY] [modules/hospital-applications/hospital-applications.routes.ts](file:///d:/7th%20Semester/7.%20Senior%20Project%20Design%20I/SDS/HALO_FYP_v8/Backend/src/modules/hospital-applications/hospital-applications.routes.ts)
- User creation: `hashPassword()` → `firebaseAuth.createUser({ email, password })`

#### [MODIFY] [db/seed.ts](file:///d:/7th%20Semester/7.%20Senior%20Project%20Design%20I/SDS/HALO_FYP_v8/Backend/src/db/seed.ts)
- Create admin via Firebase Admin SDK → insert with `firebaseUid`

### 2.2 Core Domain APIs (New Modules)

These modules don't exist yet — they need to be built from scratch. They implement the data layer that the AI agent will query.

#### [NEW] `Backend/src/modules/doctors/`
- `doctors.routes.ts` — CRUD for doctors (Manager role)
- `doctors.schemas.ts` — Zod validation
- Endpoints: `GET /doctors`, `POST /doctors`, `PATCH /doctors/:id`, `DELETE /doctors/:id`
- `GET /doctors/available?date=2026-07-15&departmentId=xxx` — slot availability calculation

#### [NEW] `Backend/src/modules/departments/`
- `departments.routes.ts` — CRUD for departments (Manager role)
- `departments.schemas.ts` — Zod validation

#### [NEW] `Backend/src/modules/appointments/`
- `appointments.routes.ts` — CRUD + search/filter
- `appointments.schemas.ts` — Zod validation
- Endpoints:
  - `POST /appointments` — book (checks slot conflicts via ACID transaction)
  - `PATCH /appointments/:id/reschedule` — reschedule
  - `PATCH /appointments/:id/cancel` — cancel
  - `GET /appointments?date=&doctorId=&status=` — search/filter
  - `GET /appointments/daily-schedule?date=` — manager daily view
  - `POST /appointments/walk-in` — manager walk-in entry

#### [NEW] `Backend/src/modules/ai-bridge/`
- `ai-bridge.routes.ts` — proxy endpoints to FastAPI AI Service
- `POST /ai/chat` — forward text message to AI service
- `POST /ai/voice` — forward audio to AI service (Whisper STT + response)
- `GET /ai/session/:sessionId` — get chat session history

#### [NEW] `Backend/src/services/push.service.ts`
- Firebase Cloud Messaging push notification delivery
- `sendPush(userId, title, body)` — sends to all user's registered devices

#### [NEW] `Backend/src/services/reminder.service.ts`
- `node-cron` scheduled job: every hour, check appointments in next 24 hours
- Send FCM push + email reminder to patient contact

---

## Phase 3: Frontend — Next.js Migration (~12-15 hours)

*Same as the previous plan — create fresh Next.js project, port all components/pages.*

### 3.1 Project Setup
- `npx create-next-app@14 --typescript --tailwind --eslint --app --src-dir`
- Install shadcn, Firebase client SDK, React Query, Zod, etc.

### 3.2 Core Infrastructure
- `lib/firebase.ts` — Firebase Client SDK init
- `lib/auth-context.tsx` — Firebase Auth with `onAuthStateChanged()`
- `lib/api.ts` — API client with Firebase ID tokens
- `middleware.ts` — Next.js middleware for route protection

### 3.3 Port Layouts, Components, Pages
- All 49 shadcn components → copy with `"use client"`
- 7 custom components → update router imports
- 30+ pages → port to App Router file structure
- Replace: `useNavigate` → `useRouter`, `<Link to>` → `<Link href>`, `import.meta.env` → `process.env`

### 3.4 New Pages for Core Domain

#### [NEW] Hospital Manager pages (currently using mock data → connect to real APIs):
- `app/hospital/doctors/page.tsx` — Doctor management (real CRUD)
- `app/hospital/doctors/new/page.tsx` — Add doctor form
- `app/hospital/doctors/[id]/page.tsx` — Edit doctor
- `app/hospital/doctors/[id]/schedule/page.tsx` — Configure weekly schedule
- `app/hospital/departments/page.tsx` — Department management (real CRUD)
- `app/hospital/appointments/page.tsx` — Daily schedule (real data)
- `app/hospital/walk-ins/page.tsx` — Walk-in entry form (real submission)

---

## Phase 4: AI Agent Service — The Core Innovation (~15-20 hours)

> [!IMPORTANT]
> This is what makes HALO special and what the evaluation committee will focus on. The architecture follows your implementation guide's 4-service model.

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    PATIENT CHANNELS                      │
├─────────────┬──────────────┬────────────────────────────┤
│  Text Chat  │  Voice Chat  │  Phone Call (Twilio)       │
│  (Widget)   │  (Widget)    │  (Pakistani number)        │
└──────┬──────┴──────┬───────┴────────────┬───────────────┘
       │             │                    │
       ▼             ▼                    ▼
┌──────────────────────────────────────────────────────────┐
│              Express API (Node.js) — port 4000           │
│  POST /ai/chat     POST /ai/voice     Twilio Webhook     │
│  ──────────────────────────────────────────────────────   │
│  Validates hospitalId, manages sessions, proxies to AI   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│            FastAPI AI Service — port 8000                 │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Conversation Manager (FSM)                         │ │
│  │  States: GREETING → INTENT → COLLECT_INFO →         │ │
│  │          SLOT_SELECTION → CONFIRMATION → DONE       │ │
│  └──────────┬──────────────────────────────────────────┘ │
│             │                                            │
│  ┌──────────▼──────────┐  ┌────────────────────────────┐ │
│  │  LLM Service        │  │  Speech Services           │ │
│  │  Groq API           │  │  STT: Whisper (Urdu+En)    │ │
│  │  (Llama 3.1 8B)     │  │  TTS: gTTS / Edge-TTS     │ │
│  │  via LangChain      │  │       (Urdu+En)            │ │
│  └──────────┬──────────┘  └────────────────────────────┘ │
│             │                                            │
│  ┌──────────▼──────────────────────────────────────────┐ │
│  │  Tool/Function Calling                              │ │
│  │  • search_doctors(specialty, hospital_id)           │ │
│  │  • get_available_slots(doctor_id, date)             │ │
│  │  • book_appointment(doctor_id, patient, slot)       │ │
│  │  • cancel_appointment(reference_id)                 │ │
│  │  • reschedule_appointment(ref_id, new_slot)         │ │
│  │  • get_hospital_info(hospital_id)                   │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTP calls back to Express API
                           ▼
┌──────────────────────────────────────────────────────────┐
│           Neon PostgreSQL (shared database)               │
│  doctors, departments, appointments, schedules,           │
│  chat_sessions, hospitals                                │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Why Groq API (Not Local Ollama)

Your implementation guide suggests Ollama + Llama 3.1 8B locally. For the FYP, **Groq API is better**:

| | Local Ollama | Groq API ✅ CONFIRMED |
|---|---|---|
| Speed | ~5-10 tokens/sec on CPU | **~500 tokens/sec** (fastest inference) |
| Hardware needed | 16GB+ RAM, decent GPU | None (cloud API) |
| Cost | Free but slow | **Free tier: 30 req/min** (enough for demo) |
| Urdu support | Llama 3.1 8B handles it | Same model, faster |
| Deployment | Must run on same server | Just an API key |

> [!TIP]
> **Confirmed: Groq API** — free tier gives **30 requests/minute** with **Llama 3.1 8B/70B**. No GPU needed, no local setup. The team does not have local resources for Ollama, making Groq the optimal choice.

### 4.3 FastAPI AI Service Structure

```
AI-Service/
├── app/
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Settings (Groq key, API URLs)
│   ├── api/
│   │   ├── chat.py             # POST /api/v1/chat
│   │   ├── voice.py            # POST /api/v1/voice
│   │   └── health.py           # GET /api/v1/health
│   ├── core/
│   │   ├── agent.py            # LangChain agent with tools
│   │   ├── prompts.py          # System prompts (bilingual)
│   │   └── session.py          # Conversation state manager
│   ├── services/
│   │   ├── llm_service.py      # Groq API client via LangChain
│   │   ├── stt_service.py      # Whisper STT (faster-whisper)
│   │   ├── tts_service.py      # Text-to-speech (edge-tts)
│   │   └── tools.py            # Function tools for the LLM agent
│   └── models/
│       ├── chat_models.py      # Pydantic request/response
│       └── voice_models.py     # Audio request/response
├── requirements.txt
└── .env
```

### 4.4 The AI Agent — How It Works

The agent uses **LangChain's tool-calling** with Groq's Llama 3.1:

```python
# System prompt (bilingual)
SYSTEM_PROMPT = """
You are HALO, an AI-powered appointment booking assistant for {hospital_name}.
You help patients book, reschedule, and cancel appointments.

You MUST:
- Respond in the same language the patient uses (English, Urdu, or mixed)
- Be polite, professional, and concise
- Ask for ONE piece of information at a time
- Always confirm before making changes
- If you cannot understand the patient's intent after 2 attempts, offer to connect them
  to the hospital reception desk

Available tools:
- search_doctors: Find doctors by specialty or name
- get_available_slots: Check doctor availability for a date
- book_appointment: Create a new appointment
- cancel_appointment: Cancel by reference ID
- reschedule_appointment: Change date/time
- get_hospital_info: General hospital information

Hospital: {hospital_name}
Hospital ID: {hospital_id}
Current Date: {current_date}
"""
```

**Tool functions** call back to the Express API (which queries PostgreSQL):

```python
@tool
def search_doctors(specialty: str, hospital_id: str) -> dict:
    """Search for doctors by specialty in the given hospital."""
    response = httpx.get(f"{API_URL}/doctors/available",
        params={"specialty": specialty, "hospitalId": hospital_id},
        headers={"X-AI-Service-Key": AI_SERVICE_KEY}
    )
    return response.json()

@tool
def book_appointment(doctor_id: str, patient_name: str, patient_phone: str,
                     date: str, time: str, hospital_id: str, visit_reason: str = "") -> dict:
    """Book an appointment for a patient."""
    response = httpx.post(f"{API_URL}/appointments", json={...},
        headers={"X-AI-Service-Key": AI_SERVICE_KEY}
    )
    return response.json()
```

### 4.5 Chat Widget — Embeddable Component

The chat widget is a **Next.js component** on the hospital landing page (`/hospital/[slug]/page.tsx`):

```
app/hospital/[slug]/
├── page.tsx          # Hospital landing page (SSR — loads hospital data)
├── components/
│   ├── ChatWidget.tsx      # Root widget (text + voice tabs)
│   ├── ChatMessage.tsx     # Individual message bubble
│   ├── ChatInput.tsx       # Text input + send button
│   ├── VoiceMode.tsx       # Voice recording + playback
│   ├── SlotCards.tsx        # Available slot selection cards
│   ├── BookingConfirmCard.tsx  # Booking summary + confirm
│   └── QuickReplyChips.tsx    # Quick action buttons
```

**For the embeddable widget** (hospitals adding to their own websites), we'll create a standalone script:
```html
<!-- Hospital adds this to their website -->
<script src="https://halo-platform.vercel.app/widget.js"
        data-hospital-id="uuid-here"
        data-theme="light">
</script>
```

> [!IMPORTANT]
> For the FYP demo, the widget lives directly on the Next.js hospital page (`/hospital/[slug]`). The embeddable `<script>` tag version is a future enhancement — the committee just needs to see the widget working on a demo hospital page.

### 4.6 Voice Mode

**Text-to-Speech (TTS):** Use `edge-tts` (Microsoft Edge's TTS engine, free, supports Urdu)
```python
# Urdu voice: "ur-PK-UzmaNeural" (female) or "ur-PK-AsadNeural" (male)
# English voice: "en-US-JennyNeural"
import edge_tts
async def synthesize(text: str, language: str) -> bytes:
    voice = "ur-PK-UzmaNeural" if language == "ur" else "en-US-JennyNeural"
    communicate = edge_tts.Communicate(text, voice)
    audio_bytes = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes += chunk["data"]
    return audio_bytes
```

**Speech-to-Text (STT):** Use `faster-whisper` with the `large-v3` model (best for Urdu):
```python
from faster_whisper import WhisperModel
model = WhisperModel("large-v3", device="cpu", compute_type="int8")
# Auto-detects language (English/Urdu/mixed)
segments, info = model.transcribe(audio_file, language=None)
```

> [!WARNING]
> **Whisper large-v3 on CPU** is slow (~10-15 sec for a 10-sec audio clip). For the FYP demo, this is acceptable. For production, you'd use a GPU or a cloud STT API (Google Cloud Speech-to-Text has excellent Urdu support).

### 4.7 Telephonic Integration (Twilio)

> [!IMPORTANT]
> This is the **"wow factor"** for the committee but the most complex channel. Here's how it works:

```
Patient dials +92-51-xxx-xxxx (Pakistani number via Twilio)
       │
       ▼
Twilio Voice API → Webhook → Express API (POST /telephony/incoming)
       │
       ▼
Express streams audio → FastAPI AI Service
       │
       ▼
Whisper STT → Llama 3.1 agent → books/cancels/queries
       │
       ▼
Agent response text → edge-tts → audio bytes
       │
       ▼
Express → TwiML response → Twilio plays audio to patient
```

**Twilio Pakistan:** Pakistani numbers are available but require business verification. For the FYP demo, you can:
- **Option A:** Use a Twilio trial account with a US number (free, +1 number) — demo shows the concept
- **Option B:** Use Twilio's Pakistan number (+92, ~$1/month + per-minute charges)
- **Option C:** Skip phone and focus on the chat widget — still demonstrates the agentic workflow

> [!IMPORTANT]
> **Confirmed: Twilio with Pakistani number.** The team will use Twilio for phone integration. Cost is ~$2-5/month for the number + per-minute charges. University student credentials may include **$50 Twilio credits** via GitHub Student Developer Pack or Twilio for Education program — check both.

### 4.8 Bilingual Support (English/Urdu/Code-Switching)

Llama 3.1 8B (via Groq) handles multilingual conversations natively. The system prompt instructs the agent to:
1. **Detect language** from the patient's first message
2. **Respond in the same language** or code-switch naturally
3. **Fallback:** If intent is unclear after 2 attempts, ask "Kya aap English mein baat karna chahenge?" / "Would you like to continue in English?"

Example conversation:
```
Patient: "Mujhe Dr. Khan se milna hai kal"
HALO: "Zarur! Dr. Khan kal available hain. Unke paas ye slots hain:
       - 10:00 AM
       - 2:30 PM
       - 4:00 PM
       Aap kis time pe appointment lena chahenge?"

Patient: "2:30 pe book kardo, my name is Ali and number 0300-1234567"
HALO: "Perfect! Main aapki appointment confirm kar raha hoon:
       📋 Doctor: Dr. Ahmed Khan
       📅 Date: Kal (1 July 2026)
       ⏰ Time: 2:30 PM
       👤 Patient: Ali
       📱 Contact: 0300-1234567
       
       Kya ye sab theek hai? Confirm karoon?"
```

---

## Phase 5: Demo Data & Evaluation Preparation (~5-8 hours)

### 5.1 Dummy Hospital — "Al-Shifa Medical Center"

> [!IMPORTANT]
> For the evaluation, we'll seed a realistic Pakistani hospital with complete data:

**Hospital Profile:**
- **Name:** Al-Shifa Medical Center
- **Location:** F-8 Markaz, Islamabad, Pakistan
- **Phone:** +92-51-111-4256 (HALO)
- **Website:** demo page at `/hospital/al-shifa-medical-center`
- **Subscription:** Professional tier (active)

**Departments (6):**
| Department | Head Doctor |
|---|---|
| Cardiology | Dr. Ahmed Khan |
| Orthopedics | Dr. Fatima Zaidi |
| Pediatrics | Dr. Hassan Ali |
| Dermatology | Dr. Ayesha Malik |
| General Medicine | Dr. Bilal Hussain |
| Neurology | Dr. Sana Raza |

**Doctors (10):** Each with realistic Pakistani names, qualifications (MBBS, FCPS, etc.), consultation fees (PKR 1,500 - 5,000), and weekly schedules (Mon-Sat, varying hours).

**Pre-seeded Appointments (15-20):** Mix of CONFIRMED, COMPLETED, CANCELLED, and NO_SHOW statuses across the past week and upcoming week. Mix of ONLINE_CHAT, WALK_IN, and TELEPHONY sources.

### 5.2 Demo Flow for Evaluation

```
1. ADMIN LOGIN → Show the platform admin approving the hospital application
2. MANAGER LOGIN → Show hospital manager adding doctors, departments, schedules
3. PATIENT FLOW → Open the hospital landing page
   → Text Chat: "I need to see a cardiologist tomorrow"
   → Agent responds, shows available slots
   → Patient selects slot, provides info
   → Booking confirmed with reference ID
4. MANAGER DASHBOARD → Show the new appointment appearing in real-time
5. VOICE MODE → Switch to voice, speak in Urdu
   → "Mujhe appointment cancel karni hai, reference number ABC123"
   → Agent cancels and confirms
6. (OPTIONAL) PHONE DEMO → Call the Twilio number, speak to the agent
```

### 5.3 Seed Script

#### [NEW] `Backend/src/db/seed-demo-hospital.ts`
- Creates the demo hospital, manager user, departments, doctors, schedules, and sample appointments
- Runs after the main schema migration
- Uses realistic Pakistani data (names, qualifications, fees, phone numbers)

---

## Verification Plan

### Automated Tests
```bash
# Backend build
cd Backend && npm run build

# Frontend build  
cd Frontend && npm run build

# Database migration
cd Backend && npx drizzle-kit push

# AI Service health
curl http://localhost:8000/api/v1/health
```

### Manual Verification
1. **Firebase Auth:** Register hospital → login → access dashboard
2. **Doctor CRUD:** Add/edit/delete doctors and departments
3. **Appointment Booking (Chat):** Full text flow — search → select → confirm
4. **Appointment Booking (Voice):** Speak in Urdu → agent books
5. **Walk-in Entry:** Manager adds walk-in → appears in daily schedule
6. **Cancellation:** Cancel via reference ID in chat
7. **Daily Schedule:** Manager sees all appointments (online + walk-in) for today
8. **Push Notification:** FCM reminder sent 24h before appointment
9. **Bilingual:** Test English, Urdu, and code-switching conversations

---

## Estimated Effort

| Phase | Effort | Description |
|---|---|---|
| Phase 1 (Infrastructure) | ~4 hours | Firebase + Neon setup, schema expansion |
| Phase 2 (Backend Auth + APIs) | ~12-15 hours | Auth migration, doctors/departments/appointments CRUD, AI bridge |
| Phase 3 (Frontend Next.js) | ~12-15 hours | Next.js project, port 30+ pages, connect to real APIs |
| Phase 4 (AI Agent) | ~15-20 hours | FastAPI service, Groq agent, chat widget, voice mode |
| Phase 5 (Demo + Polish) | ~5-8 hours | Seed data, demo flow, bug fixes, evaluation prep |
| **Total** | **~48-62 hours** | Spread across ~8-10 focused work days |

---

## Recommended Execution Order

> [!TIP]
> **Build backend APIs first** (doctors, departments, appointments), then the chat widget, then the Next.js migration. This way you have real data flowing before you polish the UI.

```
Week 1: Phase 1 + Phase 2 (Backend foundation)
Week 2: Phase 4.1-4.4 (AI Service + Chat Widget)
Week 3: Phase 3 (Frontend Next.js migration)
Week 4: Phase 4.5-4.7 (Voice + Telephony) + Phase 5 (Demo prep)
```
