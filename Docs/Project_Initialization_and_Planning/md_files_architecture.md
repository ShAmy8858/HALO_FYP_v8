# HALO System Architecture (Production Blueprint)

## 1. Architecture Summary
HALO follows a **hybrid layered multi‑tier architecture** with **microservice‑inspired AI separation**.  
The design keeps **core scheduling and governance centralized** (ACID critical) while isolating AI services for flexibility and scalability.

---

## 2. High-Level Blueprint (Production Style)

![image4](image4)

### Client Layer
- **Next.js Frontend**
  - Web App
  - Embedded Chat Widget

### API Gateway
- **NestJS API Gateway**
  - Entry point for all frontend requests

### Core Backend Modules
- **Auth Service** — JWT + RBAC  
- **Tenant Service** — Multi‑tenancy  
- **User Service** — Roles (Admin, Manager)  
- **Appointment Service** — Scheduling engine  
- **Doctor Service** — Availability management  
- **Notification Service** — Email/SMS  
- **Billing Service** — SaaS plans  

### Database Layer
- **PostgreSQL** — Primary DB  
- **Redis** — Cache + Sessions  

### AI Microservice (FastAPI)
- **NLP Engine** — BERT + NER  
- **Dialogue Manager** — FSM + LangChain  
- **Voice Processing** — Whisper + TTS  

### External Services
- Email/SMS APIs  
- Telephony APIs  

---

## 3. Architecture Style / Pattern

![image3](image3)

**Pattern:**  
Hybrid Layered Multi‑Tier with Microservice‑Inspired AI Component Separation.

**Justification:**  
- ACID‑critical scheduling requires centralized backend consistency.  
- AI workloads benefit from separate tech stack and isolated scaling.

---

## 4. Layered Component Model

### Layer 4 — Presentation Layer (Next.js)
![image2](image2)

- **User Interface Layer**
  - Patient  
  - Hospital Manager  
  - Admin  

- **Related Components**
  - Forms  
  - Dashboards  
  - Chat UI  

---

### Layer 3 — Application Layer (Node.js + Express)
![image2](image2)

- **Core Backend Services**
  - Auth  
  - Hospital Mgmt  
  - Doctor & Schedule  
  - Scheduling  
  - Billing  

- **Supporting Components**
  - Middleware  
  - Validators  
  - Error Handlers  
  - Loggers  

---

### Layer 2 — AI Service Layer (FastAPI)
![image2](image2)

- **AI Processing**
  - Intent Classification  
  - NER  
  - FSM Conversation Flow  

- **Related Components**
  - NLP Models  
  - State Machine  
  - Context Memory  
  - Response Generator  

---

### Layer 1 — Data Layer (PostgreSQL + Redis)
![image2](image2)

- **Data Persistence**
  - PostgreSQL (Primary)  
  - Redis (Cache + Sessions)  

- **Related**
  - Migrations  
  - Seeding  
  - Backups  
  - Replication  

- **External Integration**
  - Email  
  - Firebase  

---

## 5. Conceptual Architecture (Simplified Multi‑Tier View)

![image1](image1)

### Layer 1: Presentation
- Patient Interface (Chat | Voice | Booking)
- Hospital Manager (Dashboard | Analytics)
- Admin Panel (Users | Billing | System)

### Layer 2: Application (Core Backend)
- Auth  
- Hospital Mgmt  
- Doctor & Schedule  
- Scheduling Engine  
- Billing & Subscriptions  

### Layer 3: AI Service (Separated)
- Intent Classification  
- Entity Extraction  
- FSM Conversation  

### Layer 4: Data
- PostgreSQL (Primary DB)  
- Redis (Session Cache)  
- ACID Criticality enforced  

### External Services
- Email (SMTP / SendGrid)  
- Firebase  
- Payment Verification (JazzCash / Easypaisa + Admin Approval)

---

## 6. Component Interactions

From the architecture diagram:

1. **Client → Presentation**  
   HTTP/HTTPS requests from Next.js frontend  

2. **Presentation → Application**  
   REST API calls (JSON) to backend modules  

3. **Application → AI Service**  
   HTTP/JSON synchronous calls  
   AI returns structured output  

4. **Application → Data Layer**  
   ORM queries (ACID transactions)  
   Redis for cache/session  

5. **Application → External Services**  
   Email notifications, Firebase push, payment verification  

---

## 7. Cross‑Cutting Security

- **JWT Authentication**  
- **RBAC**  
- **TLS/SSL**  
- **Input Validation**  
- **Error Handling**  
- **Rate Limiting**  

---

## 8. Key Architectural Decisions

- **Not Full Microservices:**  
  Core backend remains a modular monolith to preserve ACID scheduling consistency.

- **AI Separation:**  
  AI service is isolated to allow independent scaling and a Python‑based stack.

- **PostgreSQL + Redis:**  
  Ensures relational integrity + high‑speed caching.

- **Manual Payment Verification:**  
  Realistic for local healthcare systems (admin approval model).
