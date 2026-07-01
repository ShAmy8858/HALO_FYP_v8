# Software Requirements Specification (SRS) for HALO V1.0

This document summarizes the comprehensive SRS document for the **Hospital AI Liaison & Operations (HALO)** platform, connecting the academic and business requirements directly to the implemented codebase mockups and architectures.

## 1. Introduction & Overview
The SRS details the transition from traditional, manual hospital appointment systems to an automated, intelligent conversational digital receptionist. HALO employs NLU (Natural Language Understanding) to handle dual-mode (text and voice) patient communications and a robust multi-tenant backend for secure hospital data isolation. 

### Key Characteristics:
- **Primary Users:** Patients (conversational access), Hospital Managers (operational control), Platform Administrators (global oversight).
- **Major Features:** Automated conversational scheduling, real-time availability sync, walk-in management, billing/subscriptions, and robust notifications.
- **Constraints:** Not for clinical diagnoses or emergencies. Limited natively to English and Urdu.

## 2. Mockups & Current Codebase Implementation Map

The SRS document explicitly defines 33 User Interface mockups. The following list details their description and cross-references them to the actual implemented components within the React/Vite codebase (`src/pages/`):

### Authentication & Profiles
- **M1 : Unified Login Screen** -> Implemented at `src/pages/Login.tsx`. Secure entry for Admins and Managers.
- **M2 : Forgot Password Screen** -> Implemented at `src/pages/ForgotPassword.tsx`. Handles email verification and password resets.
- **M3 : Admin Profile Screen** -> Implemented at `src/pages/admin/Profile.tsx`.
- **M4 : Hospital Manager Profile Screen** -> Implemented at `src/pages/hospital/Profile.tsx`.

### Hospital Registration & Onboarding
- **M5/M6/M7 : Hospital Registration Steps 1-3** -> Implemented at `src/pages/registration/HospitalRegistration.tsx`. A multi-step form handling facility details and document uploads using `react-hook-form`.
- **M8 : Application Status Tracking Screen** -> Implemented at `src/pages/registration/ApplicationStatus.tsx`. Allows tracking via Application ID.

### Platform Administration
- **M9 : Admin Dashboard** -> Implemented at `src/pages/admin/Dashboard.tsx`. Overview of system-wide metrics.
- **M10 : Pending Hospital Applications List** -> Implemented at `src/pages/admin/PendingApplications.tsx`.
- **M11 : Hospital Application Detail Screen** -> Implemented at `src/pages/admin/ApplicationDetail.tsx`. Used to approve/reject onboarding requests.
- **M12 : All Hospitals Management Screen** -> Implemented at `src/pages/admin/AllHospitals.tsx`. Manage active instances.
- **M13 : Platform Configuration Screen** -> Implemented at `src/pages/admin/PlatformConfig.tsx`. Global settings control.
- **M28 : Admin Analytics Dashboard** -> Implemented at `src/pages/admin/Analytics.tsx`.
- **M32 : Admin Subscription Management Screen** -> Implemented at `src/pages/admin/SubscriptionManagement.tsx`. Assigning Basic/Standard/Premium tiers.

### Hospital Operations & Clinical Resources
- **M14 : Doctor Management List Screen** -> Implemented at `src/pages/hospital/DoctorManagement.tsx`.
- **M15 : Add/Edit Doctor Profile Screen** -> Implemented at `src/pages/hospital/AddEditDoctor.tsx`.
- **M16 : Doctor Schedule Configuration Screen** -> Implemented at `src/pages/hospital/DoctorSchedule.tsx`. Configures working days and intervals.
- **M17 : Department Management Screen** -> Implemented at `src/pages/hospital/DepartmentManagement.tsx`.
- **M23 : Hospital Manager Dashboard** -> Implemented at `src/pages/hospital/Dashboard.tsx`.
- **M24 : Daily Schedule and Calendar View** -> Implemented at `src/pages/hospital/DailySchedule.tsx`.
- **M25 : Walk-in Patient Entry Form** -> Implemented at `src/pages/hospital/WalkInForm.tsx`. Enables synchronous management of physical vs digital queues.
- **M26 : Appointment Search and Filter Screen** -> Implemented at `src/pages/hospital/AppointmentSearch.tsx`.
- **M27 : Doctor and Department Search Screen** -> Implemented at `src/pages/hospital/DoctorDepartmentSearch.tsx`.
- **M29 : Hospital Manager Analytics Dashboard** -> Implemented at `src/pages/hospital/Analytics.tsx`.
- **M30 : Notification Center Screen** -> Implemented at `src/pages/hospital/NotificationCenter.tsx`.
- **M31 : Notification Preferences Screen** -> Implemented at `src/pages/hospital/NotificationPreferences.tsx`.
- **M33 : Hospital Manager Subscription Screen** -> Implemented at `src/pages/hospital/Subscription.tsx`.

### Patient-Facing Interfaces
- **M18 : Hospital Website Landing Page** -> Implemented at `src/pages/patient/HospitalLanding.tsx`. The simulated patient view.
- **M19 : HALO Chat Widget Text Mode** -> Integrated within `HospitalLanding.tsx` and platform core features. Facilitates automated text bookings.
- **M20 : HALO Chat Widget Voice Mode** -> Integrated within `HospitalLanding.tsx`. Includes the real-time "Listening" transcriptions and Web RTC handling.
- **M21 : Booking Confirmation Summary** -> Rendered as modals/alerts post-conversation success.
- **M22 : Phone Number Display and Dial** -> Found on the `HospitalLanding.tsx` or main `Landing.tsx` hero sections as the telephony entry point.

## 3. Core Functional Requirements Alignment
The SRS mandates strict reliability (ACID compliance) during database writes (e.g., when the AI Engine allocates a slot, it locks it instantly to prevent double-booking). The codebase reflects this via rigorous state validation (`zod`) and reactive data fetching (`react-query`) across all mentioned mockups. The security requirements (RBAC) are strictly enforced in the routing configuration (`App.tsx` Layout wrappers).
