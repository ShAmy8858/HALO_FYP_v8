# HALO Project Scope (Version 1.0)

## 1. Abstract (Summary)

Pakistan’s healthcare sector relies heavily on manual appointment scheduling, which causes administrative overload, limited after-hours access, scheduling conflicts, and low patient satisfaction.  
HALO proposes an **AI‑assisted conversational appointment management platform** that enables patients to book, reschedule, and cancel appointments through **voice and text** interactions in **English and Urdu**. It provides hospitals with a **multi‑tenant SaaS platform** featuring manager dashboards, automated scheduling, and centralized administration.

---

## 2. Introduction

HALO addresses operational inefficiencies in hospitals by offering:

- **Automated appointment booking** via AI agent
- **Web + telephony access**
- **Bilingual communication (English/Urdu)**
- **Hospital dashboards for staff**
- **Admin governance for approvals, configuration, and subscription**

---

## 3. Problem Statement

Key issues in current hospital appointment systems:

- Manual phone-based scheduling during limited hours
- Overloaded reception staff and call congestion
- Data entry errors and scheduling conflicts
- Lack of after-hours booking
- Limited language accessibility

---

## 4. Proposed Solution / Objectives

HALO automates appointment flows using conversational AI and provides structured operational tools for hospitals.

### Objectives

- **Automation:** Reduce receptionist workload
- **Accessibility:** 24/7 appointment availability
- **Accuracy:** Prevent double-booking via real-time validation
- **Inclusivity:** English + Urdu support
- **Operational Efficiency:** Centralized dashboards
- **Scalability:** Multi-tenant SaaS model
- **Engagement:** Automated reminders
- **Cost Optimization:** Reduce administrative overhead
- **Patient Experience:** Natural conversational interactions
- **Reliability:** Deterministic, auditable scheduling behavior

---

## 5. Vision Statement

HALO is a **white‑label, conversational SaaS platform** that allows hospitals in Pakistan to deliver automated appointment booking, reduce admin workloads, improve access, and prevent scheduling conflicts—without relying on third‑party marketplace platforms.

---

## 6. Scope

### Included

- Hospital registration and approval workflow
- Dedicated hospital instances (multi-tenant)
- Patient conversational booking (voice + text)
- Bilingual support (English/Urdu)
- Real-time schedule validation
- Hospital manager dashboards
- Admin oversight (configurations, subscriptions)
- Notifications & reminders (email + in‑app)
- Walk‑in appointment management

### Excluded

- Medical diagnosis / clinical decision-making
- Emergency handling
- Integration with external HIS/EMR systems (current scope)
- Native mobile applications

---

## 7. Functional Modules

### Module 1: User Profiling & Access Control

- Secure authentication and RBAC
- User profile management
- Session handling and audit logging

### Module 2: Hospital Tenant Onboarding

- Hospital registration
- Document upload
- Application tracking and approval status
- Unique hospital identifiers

### Module 3: Platform Administration

- Hospital approval/rejection
- Platform governance and monitoring
- System-wide configurations

### Module 4: Clinical Resources

- Doctor profile management
- Fee & schedule configuration
- Slot configuration and availability

### Module 5: AI‑Driven Appointments

- Web + telephony conversational booking
- Urdu/English with code-mix support
- NLU pipeline with FSM flow control
- Appointment reference IDs
- Automated confirmations and alerts

### Module 6: Operations Console

- Daily appointment dashboards
- Walk‑in appointment entry
- Operational statistics

### Module 7: Search & Filter

- Search by patient, doctor, appointment ID
- Filters by status, department, time, availability
- Real-time updates

### Module 8: Reports & Analytics

- Appointment volume reports
- Doctor utilization
- Peak-hour trends
- KPI dashboards for admin and hospitals
- Export to PDF/CSV

### Module 9: Notifications & Reminders

- Confirmation emails
- Reminder emails (24 hours before)
- In‑app alerts
- Delivery logs

### Module 10: Billing & Subscription

- Plan tiers (Basic / Standard / Premium)
- Plan assignment and renewal
- Subscription expiry simulation

---

## 8. System Constraints

- No clinical decision logic
- English and Urdu only (initial phase)
- Web-only delivery
- Appointment category depends on user input

---

## 9. Data Gathering Approach

### Primary

- Structured interviews with hospital staff
- Patient questionnaires
- Observational studies
- Appointment records analysis

### Secondary

- Academic literature review
- Focus groups
- Expert consultations
- Hospital operational data analysis

---

## 10. Project Contribution

Key contributions include:

- Multimodal AI (voice + text)
- Urdu/English NLU with code switching
- Automatic slot negotiation
- White‑label embed for hospital sites
- Real-time sync between walk‑in & online bookings

---

## 11. Tools & Technologies (Planned)

- **Frontend:** Next.js, Tailwind, TypeScript
- **Backend:** Node.js, Express, FastAPI
- **AI:** Llama 3.1 8B via Groq API, Whisper, LangChain
- **Infra:** Docker, Redis, PostgreSQL
- **Security:** JWT, TLS, SSL

---

## 12. Stakeholders & Roles

- **Sponsor:** COMSATS University Islamabad
- **Supervision:** Dr. Tehseen Riaz Abbasi
- **Team:**
  - Ihtisham Ul Islam (AI, UI/UX, QA, modules 2/3/5/7/8)
  - Shahid Nabi (Full-stack, QA, DevOps, modules 1/4/6/9/10)

---

## 13. WBS & Gantt (Summary)

Phases:

1. **Analysis** (8 days)
2. **Design** (21 days)
3. **Development** (22 days)
4. **Testing** (17 days)

---

## 14. Mockups

Mockups are referenced in the original proposal and will be documented separately based on provided assets.
