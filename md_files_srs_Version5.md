# HALO Software Requirements Specification (SRS) — Version 1.0

## 1. Title & Metadata

**Project:** HALO (Hospital AI Liaison & Operations)  
**Institution:** COMSATS University Islamabad  
**Program:** BS Software Engineering (2023–2027)  
**Authors:** Ihtisham Ul Islam, Shahid Nabi  
**Supervisor:** Dr. Tehseen Riaz Abbasi

---

## 2. Executive Summary

HALO is a multi-tenant SaaS platform designed to automate hospital appointment management using a conversational AI agent. It provides hospitals with admin dashboards, doctor scheduling, walk‑in tracking, and AI‑driven booking via web and telephony, with bilingual Urdu/English support.

---

## 3. Project Overview

### 3.1 Vision Statement

HALO provides a **white‑label, hospital‑owned appointment system**, replacing manual call handling and improving access, scheduling accuracy, and patient engagement.

### 3.2 Problem Statement

Hospitals in Pakistan rely on manual phone or form-based appointment systems. These cause:

- call congestion
- scheduling conflicts
- limited after‑hours access
- data entry errors
- language barriers

### 3.3 Proposed Solution

HALO introduces conversational AI for booking, rescheduling, cancellation, reminders, and hospital inquiries. It integrates:

- role‑based dashboards
- doctor schedule management
- multi‑tenant isolation
- automated notifications

---

## 4. Scope

### Included

- Hospital registration & approval
- Role‑based dashboards (Admin + Hospital Manager)
- Patient AI booking via text/voice
- Telephony channel integration
- Bilingual AI interaction
- Notifications & reminders
- Reports & analytics
- Subscription simulation

### Excluded

- Medical diagnosis & emergency handling
- Native mobile apps
- External HIS/EMR integrations

---

## 5. User Classes

| User                 | Description                                             |
| -------------------- | ------------------------------------------------------- |
| **Administrator**    | Platform governance, approvals, subscription management |
| **Hospital Manager** | Doctor schedules, appointments, walk-ins, analytics     |
| **Patient**          | Conversational booking via chat/voice/phone             |

---

## 6. Operating Environment

- Web-based on modern browsers (Chrome, Firefox, Edge, Safari)
- Admin & Manager UIs responsive for tablets
- Patient widget supports mobile devices
- Backend: Node.js + Express
- AI service: FastAPI + Python
- Data: PostgreSQL + Redis

---

## 7. Design & Implementation Constraints

- Frontend: Next.js + Tailwind + TypeScript
- Backend: Node.js + Express (REST)
- AI: LangChain + Whisper + Llama 3.1 8B via Groq API
- Auth: JWT + TLS
- Data: PostgreSQL only
- English + Urdu only

---

## 8. System Modules

(Modules 1–10, identical to scope document)

---

## 9. Functional Requirements

Functional requirements are derived using **mockup‑based analysis**, mapped to FR IDs.

---

## 10. Non‑Functional Requirements

- **Reliability:** deterministic scheduling; no slot conflicts
- **Usability:** accessible, bilingual, low‑literacy friendly
- **Performance:** fast conversational flow (<2s response)
- **Security:** RBAC, TLS, JWT, tenant isolation

---

## 11. External Interfaces

- Web UI
- Telephony interface (SIP/VoIP via Twilio)
- Email and in‑app notification services

---

## 12. Mockup‑to‑Screen Mapping (from SRS)

### Module 1: User Profiling & Access Control

- **M1:** Unified Login Screen
- **M2:** Forgot Password Screen
- **M3:** Admin Profile Screen
- **M4:** Hospital Manager Profile Screen

### Module 2: Hospital Tenant Onboarding

- **M5:** Hospital Registration Step 1
- **M6:** Hospital Registration Step 2
- **M7:** Hospital Registration Step 3
- **M8:** Application Status Tracking

### Module 3: Platform Administration

- **M9:** Admin Dashboard
- **M10:** Pending Hospital Applications List
- **M11:** Hospital Application Detail
- **M12:** All Hospitals Management
- **M13:** Platform Configuration

### Module 4: Clinical Resources

- **M14:** Doctor Management List
- **M15:** Add/Edit Doctor
- **M16:** Doctor Schedule Configuration
- **M17:** Department Management

### Module 5: AI‑Driven Appointments

- **M18:** Hospital Website Landing (with HALO Widget)
- **M19:** HALO Chat Widget (Text)
- **M20:** HALO Chat Widget (Voice)
- **M21:** Booking Confirmation Summary
- **M22:** Phone Number Display & Dial

### Module 6: Operations Console

- **M23:** Hospital Manager Dashboard
- **M24:** Daily Schedule & Calendar
- **M25:** Walk‑in Patient Entry

### Module 7: Search & Filter

- **M26:** Appointment Search & Filter
- **M27:** Doctor & Department Search

### Module 8: Report & Analytics

- **M28:** Admin Analytics Dashboard
- **M29:** Hospital Manager Analytics

### Module 9: Notifications

- **M30:** Notification Center
- **M31:** Notification Preferences

### Module 10: Billing & Subscription

- **M32:** Admin Subscription Management
- **M33:** Hospital Subscription Screen

---

## 13. Mockup Description vs Current Code

### Screens already implemented in the current frontend:

- **M1:** Login → `Login.tsx`
- **M2:** Forgot Password → `ForgotPassword.tsx`
- **M3:** Admin Profile → `src/pages/admin/Profile.tsx`
- **M4:** Hospital Manager Profile → `src/pages/hospital/Profile.tsx`
- **M5–M7:** Registration Steps → `HospitalRegistration.tsx`
- **M8:** Application Status → `ApplicationStatus.tsx`
- **M9:** Admin Dashboard → `admin/Dashboard.tsx`
- **M10:** Pending Applications → `admin/PendingApplications.tsx`
- **M11:** Application Detail → `admin/ApplicationDetail.tsx`
- **M12:** All Hospitals → `admin/AllHospitals.tsx`
- **M13:** Platform Config → `admin/PlatformConfig.tsx`
- **M14:** Doctor Management → `hospital/DoctorManagement.tsx`
- **M15:** Add/Edit Doctor → `hospital/AddEditDoctor.tsx`
- **M16:** Doctor Schedule → `hospital/DoctorSchedule.tsx`
- **M17:** Department Mgmt → `hospital/DepartmentManagement.tsx`
- **M18:** Hospital Landing → `patient/HospitalLanding.tsx` + `public/hospital.html`
- **M23:** Hospital Dashboard → `hospital/Dashboard.tsx`
- **M24:** Daily Schedule → `hospital/DailySchedule.tsx`
- **M25:** Walk‑in Form → `hospital/WalkInForm.tsx`
- **M26:** Appointment Search → `hospital/AppointmentSearch.tsx`
- **M27:** Doctor/Department Search → `hospital/DoctorDepartmentSearch.tsx`
- **M28:** Admin Analytics → `admin/Analytics.tsx`
- **M29:** Hospital Analytics → `hospital/Analytics.tsx`
- **M30:** Notification Center → `hospital/NotificationCenter.tsx`
- **M31:** Notification Preferences → `hospital/NotificationPreferences.tsx`
- **M32:** Admin Subscriptions → `admin/SubscriptionManagement.tsx`
- **M33:** Hospital Subscription → `hospital/Subscription.tsx`

### Screens not yet implemented:

- **M19 / M20 / M21 / M22**  
  (Chat widget text/voice, booking confirmation, telephony dial UI)

---

## 14. References

References are listed in the original SRS and will be preserved as provided in the official document.
