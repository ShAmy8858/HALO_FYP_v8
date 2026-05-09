# Updated HALO Scope V1.0

This document serves as an extensively detailed markdown representation of the **HALO (Hospital AI Liaison & Operations)** project proposal and scope document.

## 1. Project Overview & Vision
**HALO** is a web-based, AI-assisted appointment management platform for hospitals in Pakistan. The vision is to eliminate traditional manual telephone-based call handling and static forms by introducing an autonomous conversational agent (acting as a digital receptionist). The platform allows patients to book, reschedule, and cancel appointments natively through voice or text interactions, seamlessly handling bilingual communication (English and Urdu).

## 2. Problem Statement & Solution
### The Problem:
- Continued reliance on manual booking creates call congestion and extended waiting times.
- Receptionists manage physical patients and phone calls simultaneously, leading to scheduling errors (double bookings).
- Absence of after-hours appointment facilities.
- High "no-show" rates due to lack of automated reminders.

### The Solution:
- An **Agentic Conversational System** embedded natively into hospital websites (white-label).
- 24/7 service availability.
- Automated scheduling engine that actively negotiates slots based on real-time doctor availability.
- Multi-tenant Software-as-a-Service (SaaS) architecture enabling multiple hospitals to operate isolated environments on shared infrastructure.

## 3. Core Objectives
- **Automation:** Minimize manual workload for human receptionists.
- **Accessibility & Inclusivity:** 24/7 access with robust bilingual (English/Urdu) NLP support.
- **Accuracy:** Prevent double-booking through ACID-compliant database transactions.
- **Engagement:** Reduce "no-shows" via automated in-app and email reminders.
- **Cost Optimization:** Reduce administrative overhead.

## 4. Platform Modules
The scope of HALO is categorized into 10 fundamental modules:

1. **User Profiling & Access Control (Admin & Hospital Manager):** Secure role-based access control (RBAC), authentication, and profile maintenance.
2. **Hospital Tenant Onboarding (Hospital Manager):** Multi-step registration, document verification, and tenant provisioning.
3. **Platform Administration (Admin):** Centralized governance to approve/reject hospitals, configure platform limits, and view global statistics.
4. **Clinical Resources (Hospital Manager):** Management of doctors' profiles, consultation fees, and weekly working schedules/time slots.
5. **AI-Driven Appointments (Patient & AI Agent):** The conversational interface (web text and voice modes) powered by an NLU pipeline to interact with patients, capture booking data, and negotiate slot availability.
6. **Operations Console (Hospital Manager):** Real-time dashboard for hospital managers to view daily schedules and enter walk-in patients manually.
7. **Search & Filter:** Advanced querying to find doctors, appointments, and availability status across the platform.
8. **Reports & Analytics:** Data-driven insights including appointment volume, doctor utilization, and peak traffic trends.
9. **Notifications & Reminders:** Automated confirmation emails and 24-hour reminder alerts to mitigate missed appointments.
10. **Billing & Subscription:** SaaS subscription tier management (Basic, Standard, Premium) for onboarded hospitals.

## 5. System Limitations & Constraints
- The AI acts solely as an administrative receptionist. It **does not** perform medical symptom analysis, diagnosis, or clinical decision-making.
- It **does not** handle medical emergencies.
- Only English and Urdu are supported in the initial phase.
- No native mobile apps (Android/iOS) will be developed; it operates fully as a responsive web platform.

## 6. Project Contributions & Relevance
- **Unified Multimodal AI:** Seamlessly switching between voice and text modes.
- **Localized Bilingual NLU:** Optimized for Urdu and English code-switching.
- **Zero-Friction "White-Label" Injection:** Simple widget integration for legacy hospital platforms.
- **Academic Relevance:** Touches upon AI & NLP, Software Architecture (Multi-Tenant SaaS), DB Systems, Info Security, and SE methodologies.

## 7. Technology Stack
- **Frontend:** Next.js (Note: implementation evolved to React/Vite based on current codebase), Tailwind CSS, HTML5, CSS3, React.
- **Backend/API:** Node.js, Express.js, FastAPI, PostgreSQL.
- **AI/ML:** Python, Vicuna 13B-v1.5, Ollama, LangChain, Whisper AI (Large-v3 for Urdu Speech-to-Text).
- **Other:** Web RTC, Redis, JWT, Docker, Postman.
