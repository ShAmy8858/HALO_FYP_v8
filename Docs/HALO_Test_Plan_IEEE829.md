# HALO — Test Plan Document

## (IEEE 829-1998 Format)

---

# 1. Test Plan Identifier

**Test Plan ID:** HALO-TP-MAS-001

**Test Plan Title:** HALO Platform — Master Test Plan

**Version:** 1.0

**Version Date:** May 15, 2026

**Authors:**

| Name              | Roll Number  | Role                                                  | Contact                   |
| ----------------- | ------------ | ----------------------------------------------------- | ------------------------- |
| Ihtisham Ul Islam | SP23-BSE-016 | AI/UI Lead, QA (Modules 2, 3, 5, 7, 8)                | ihtisham@cuilahore.edu.pk |
| Shahid Nabi       | SP23-BSE-043 | Full-Stack Lead, QA & DevOps (Modules 1, 4, 6, 9, 10) | shahid@cuilahore.edu.pk   |

**Supervisor:** Dr. Tehseen Riaz Abbasi

**Institution:** COMSATS University Islamabad

**Program:** BS Software Engineering (2023–2027), 7th Semester — Senior Project Design I

**Revision History:**

| Version | Date         | Author                         | Description                                         |
| ------- | ------------ | ------------------------------ | --------------------------------------------------- |
| 0.1     | May 01, 2026 | Ihtisham Ul Islam              | Initial draft; test items and scope defined         |
| 0.2     | May 08, 2026 | Shahid Nabi                    | Added test cases for Modules 1–3 backend            |
| 0.3     | May 12, 2026 | Ihtisham Ul Islam              | Added features-to-test, approach, and risk sections |
| 1.0     | May 15, 2026 | Ihtisham Ul Islam, Shahid Nabi | Final release; all sections reviewed and approved   |

**Related Software Version:** HALO Platform v0.1.0 (Frontend v0.0.0, Backend @halo/api v0.1.0)

**Plan Level:** Master Test Plan — covers all implemented modules across frontend and backend.

---

# 2. Introduction

## 2.1 Purpose

This document serves as the Master Test Plan for the HALO (Hospital AI Liaison & Operations) platform, developed as the Senior Project Design I (FYP) at COMSATS University Islamabad. It defines the overall testing strategy, scope, resources, schedule, and deliverables required to verify and validate that the HALO platform meets its stated functional and non-functional requirements as defined in the Software Requirements Specification (SRS HALO V1.0), the Updated Scope Document (V1.0), and the Sprint Sheet (Use Case to Functional Requirements mapping).

The plan covers all testing activities for the currently implemented portions of the platform, including the React/Vite frontend, the Node.js/Express backend API, the PostgreSQL database layer, and the integration points between these components.

## 2.2 Scope

HALO is a multi-tenant SaaS platform that provides AI-powered receptionist capabilities for hospitals. The platform enables hospitals to register, get admin-verified, manage subscriptions, and (in later phases) use AI-powered features for appointment management and patient communication.

The testing effort described in this document covers:

- **Modules 1–4 and 10** which are fully implemented with backend API integration.
- **Modules 5–9** which have frontend UI screens implemented but are pending full backend integration for certain features (AI engine, real-time notifications, appointment CRUD).
- All API endpoints across Authentication, Hospital Applications, Admin, Manager, Subscription, and Users modules.
- Database schema integrity, migration correctness, and seed data validation.
- Security controls including JWT authentication, role-based access control (RBAC), rate limiting, input validation, and CORS enforcement.
- Cross-browser compatibility and responsive design verification.

## 2.3 References

| Document                          | Version | Description                                |
| --------------------------------- | ------- | ------------------------------------------ |
| SRS_HALO_1.0.md                   | 1.0     | Software Requirements Specification        |
| md_files_srs_Version5.md          | 5.0     | SRS with mockup-to-screen mapping          |
| Updated_HALO_Scope_V1.0.md        | 1.0     | Project scope, objectives, and constraints |
| md_files_scope_Version5.md        | 5.0     | Extended scope with module details         |
| Updated_HALO_sprintsheet.md       | 1.0     | Use case to sprint mapping                 |
| md_files_sprintsheet_Version5.md  | 5.0     | FR-level sprint sheet                      |
| HALO_PROJECT_DOCUMENTATION.md     | 2.0     | Comprehensive project documentation        |
| HALO_Implementation_Guide.md      | 1.0     | Full implementation guide                  |
| md_files_architecture.md          | 1.0     | System architecture blueprint              |
| 1-3_module_implementation_plan.md | 1.0     | Modules 1–3 implementation details         |

## 2.4 Constraints

- **Team Size:** Two developers handling both development and testing.
- **Timeline:** Testing runs in parallel with development within a single-semester FYP timeline.
- **Budget:** No commercial testing tools; all tools are free/open-source.
- **Infrastructure:** Testing is performed on local development machines and the Supabase-hosted PostgreSQL instance. No dedicated staging environment exists.
- **AI Module:** The AI conversational engine (Module 5 core — Llama 3.1, Whisper, LangChain) is not yet implemented; testing for AI features is limited to UI-level verification of the chat widget shell.

---

# 3. Test Items

The following items are subject to testing under this plan. Each item is identified by its component, version, and source location within the HALO repository.

## 3.1 Frontend Application

| Item                            | Version | Location                                                   | Description                                             |
| ------------------------------- | ------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| Landing Page                    | 0.0.0   | `Frontend/src/pages/Landing.tsx`                           | Public marketing page with hero, features, pricing, FAQ |
| Login Screen (M1)               | 0.0.0   | `Frontend/src/pages/Login.tsx`                             | Role-based authentication (Admin / Manager)             |
| Forgot Password (M2)            | 0.0.0   | `Frontend/src/pages/ForgotPassword.tsx`                    | Password reset request form                             |
| Reset Password                  | 0.0.0   | `Frontend/src/pages/ResetPassword.tsx`                     | Token-based password reset                              |
| Hospital Registration (M5-M7)   | 0.0.0   | `Frontend/src/pages/registration/HospitalRegistration.tsx` | 3-step registration wizard                              |
| Application Status (M8)         | 0.0.0   | `Frontend/src/pages/registration/ApplicationStatus.tsx`    | Public status lookup by Application ID                  |
| Admin Dashboard (M9)            | 0.0.0   | `Frontend/src/pages/admin/Dashboard.tsx`                   | Admin KPI overview                                      |
| Pending Applications (M10)      | 0.0.0   | `Frontend/src/pages/admin/PendingApplications.tsx`         | Application review list                                 |
| Application Detail (M11)        | 0.0.0   | `Frontend/src/pages/admin/ApplicationDetail.tsx`           | Approve/reject with document review                     |
| All Hospitals (M12)             | 0.0.0   | `Frontend/src/pages/admin/AllHospitals.tsx`                | Hospital management list                                |
| Platform Config (M13)           | 0.0.0   | `Frontend/src/pages/admin/PlatformConfig.tsx`              | Global settings editor                                  |
| Admin Analytics (M28)           | 0.0.0   | `Frontend/src/pages/admin/Analytics.tsx`                   | Platform-wide charts                                    |
| Subscription Management (M32)   | 0.0.0   | `Frontend/src/pages/admin/SubscriptionManagement.tsx`      | Plan assignment overview                                |
| Payment Review                  | 0.0.0   | `Frontend/src/pages/admin/PaymentReview.tsx`               | Admin payment approval/rejection                        |
| Admin Profile (M3)              | 0.0.0   | `Frontend/src/pages/admin/Profile.tsx`                     | Admin profile management                                |
| Hospital Dashboard (M23)        | 0.0.0   | `Frontend/src/pages/hospital/Dashboard.tsx`                | Manager KPI overview                                    |
| Doctor Management (M14)         | 0.0.0   | `Frontend/src/pages/hospital/DoctorManagement.tsx`         | Doctor listing                                          |
| Add/Edit Doctor (M15)           | 0.0.0   | `Frontend/src/pages/hospital/AddEditDoctor.tsx`            | Doctor profile form                                     |
| Doctor Schedule (M16)           | 0.0.0   | `Frontend/src/pages/hospital/DoctorSchedule.tsx`           | Schedule configuration                                  |
| Department Management (M17)     | 0.0.0   | `Frontend/src/pages/hospital/DepartmentManagement.tsx`     | Department CRUD                                         |
| Daily Schedule (M24)            | 0.0.0   | `Frontend/src/pages/hospital/DailySchedule.tsx`            | Appointment calendar view                               |
| Walk-In Form (M25)              | 0.0.0   | `Frontend/src/pages/hospital/WalkInForm.tsx`               | Walk-in patient entry                                   |
| Appointment Search (M26)        | 0.0.0   | `Frontend/src/pages/hospital/AppointmentSearch.tsx`        | Search and filter                                       |
| Doctor/Department Search (M27)  | 0.0.0   | `Frontend/src/pages/hospital/DoctorDepartmentSearch.tsx`   | Internal directory search                               |
| Hospital Analytics (M29)        | 0.0.0   | `Frontend/src/pages/hospital/Analytics.tsx`                | Hospital-specific charts                                |
| Notification Center (M30)       | 0.0.0   | `Frontend/src/pages/hospital/NotificationCenter.tsx`       | Alert management                                        |
| Notification Preferences (M31)  | 0.0.0   | `Frontend/src/pages/hospital/NotificationPreferences.tsx`  | Notification settings                                   |
| Hospital Subscription (M33)     | 0.0.0   | `Frontend/src/pages/hospital/Subscription.tsx`             | Payment upload and plan view                            |
| Hospital Profile (M4)           | 0.0.0   | `Frontend/src/pages/hospital/Profile.tsx`                  | Manager profile management                              |
| Hospital Landing (M18)          | 0.0.0   | `Frontend/src/pages/patient/HospitalLanding.tsx`           | Patient-facing hospital page                            |
| Auth Context & Protected Routes | 0.0.0   | `Frontend/src/lib/auth-context.tsx`                        | Session management and route guarding                   |
| API Client                      | 0.0.0   | `Frontend/src/lib/api.ts`                                  | Centralized HTTP client with auth headers               |

## 3.2 Backend API

| Item                         | Version | Location                                     | Description                                            |
| ---------------------------- | ------- | -------------------------------------------- | ------------------------------------------------------ |
| Express Application Factory  | 0.1.0   | `Backend/src/app.ts`                         | App creation, middleware pipeline, route mounting      |
| Auth Module                  | 0.1.0   | `Backend/src/modules/auth/`                  | Login, logout, refresh, forgot/reset password          |
| Hospital Applications Module | 0.1.0   | `Backend/src/modules/hospital-applications/` | Registration, document upload, submit, status          |
| Admin Module                 | 0.1.0   | `Backend/src/modules/admin/`                 | Application review, hospital management, config, stats |
| Manager Module               | 0.1.0   | `Backend/src/modules/manager/`               | Manager dashboard data, profile                        |
| Subscription Module          | 0.1.0   | `Backend/src/modules/subscription/`          | Payment submission, review, plan upgrade               |
| Users Module                 | 0.1.0   | `Backend/src/modules/users/`                 | User CRUD, profile management                          |
| Auth Middleware              | 0.1.0   | `Backend/src/middleware/auth.ts`             | JWT verification and role checking                     |
| Rate Limiter                 | 0.1.0   | `Backend/src/middleware/rate-limit.ts`       | Sliding-window rate limiting                           |
| Validation Middleware        | 0.1.0   | `Backend/src/middleware/validate.ts`         | Zod schema validation                                  |
| Error Handler                | 0.1.0   | `Backend/src/middleware/error.ts`            | Centralized error handling                             |

## 3.3 Database Layer

| Item            | Version | Location                   | Description                              |
| --------------- | ------- | -------------------------- | ---------------------------------------- |
| Database Schema | 0.1.0   | `Backend/src/db/schema.ts` | 12 Drizzle ORM table definitions         |
| Migrations      | 0.1.0   | `Backend/migrations/`      | SQL migration files                      |
| Seed Script     | 0.1.0   | `Backend/src/db/seed.ts`   | Admin user and platform settings seeding |

## 3.4 Critical Prerequisites

Before testing can begin, the following steps must be completed:

1. PostgreSQL database must be running (locally via Docker or via Supabase cloud).
2. Database migrations must be applied using `npm run db:push` or `npm run db:migrate`.
3. Admin seed must be run using `npm run db:seed` to create the default admin account.
4. Backend `.env` file must be configured with valid `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
5. Frontend must have `VITE_API_BASE_URL` pointing to the running backend.
6. Both frontend (`npm run dev`) and backend (`npm run dev`) servers must be running.

---

# 4. Features To Be Tested

The following features are listed from the user's perspective, grouped by module. Each feature is assigned a risk level: **H** (High), **M** (Medium), or **L** (Low).

## 4.1 Module 1: User Profiling & Access Control

| ID     | Feature                                                                   | Risk | Rationale                                                    |
| ------ | ------------------------------------------------------------------------- | ---- | ------------------------------------------------------------ |
| F-1.1  | Role-based login (Admin selects Admin role; Manager selects Manager role) | H    | Core entry point; failure blocks all authenticated workflows |
| F-1.2  | Password validation and error feedback on login                           | M    | User experience and security                                 |
| F-1.3  | JWT access token issuance on successful login                             | H    | All protected API calls depend on this                       |
| F-1.4  | Refresh token stored as HTTP-only cookie                                  | H    | Session persistence across page reloads                      |
| F-1.5  | Token refresh on page reload (seamless session)                           | H    | Users lose session if this fails                             |
| F-1.6  | Logout clears session and revokes refresh token                           | M    | Security requirement                                         |
| F-1.7  | Forgot password sends reset email                                         | M    | Account recovery path                                        |
| F-1.8  | Reset password with valid token changes password                          | M    | Account recovery completion                                  |
| F-1.9  | Admin profile view and edit                                               | L    | Non-critical profile management                              |
| F-1.10 | Manager profile view and edit                                             | L    | Non-critical profile management                              |
| F-1.11 | Rate limiting on login endpoint (5 attempts / 60 seconds)                 | H    | Prevents brute-force attacks                                 |
| F-1.12 | Audit logging for login/logout events                                     | M    | Security compliance                                          |
| F-1.13 | Protected route guards redirect unauthenticated users to login            | H    | Prevents unauthorized dashboard access                       |
| F-1.14 | Role-based route guards prevent cross-role access                         | H    | Admin cannot access manager routes and vice versa            |

## 4.2 Module 2: Hospital Tenant Onboarding

| ID     | Feature                                                                  | Risk | Rationale                                           |
| ------ | ------------------------------------------------------------------------ | ---- | --------------------------------------------------- |
| F-2.1  | 3-step hospital registration wizard navigation                           | M    | Multi-step form must maintain state correctly       |
| F-2.2  | Step 1: Hospital info validation (name, license, email, phone, location) | H    | Data integrity for onboarding                       |
| F-2.3  | Step 1: Manager credentials creation (name, email, password)             | H    | Creates the manager user account                    |
| F-2.4  | Step 2: Document upload to Cloudinary (PDF, JPG, PNG, max 5MB)           | H    | Verification documents are mandatory                |
| F-2.5  | Step 3: Review and submit application                                    | H    | Submission triggers the approval workflow           |
| F-2.6  | Auto-generated unique Application ID (APP-2026-XXXXXXXX)                 | M    | Tracking identifier for applicants                  |
| F-2.7  | Duplicate license number rejection                                       | H    | Prevents duplicate hospital registrations           |
| F-2.8  | Duplicate manager email rejection                                        | H    | Prevents account conflicts                          |
| F-2.9  | Application status tracking via public page                              | M    | Applicants need visibility into their status        |
| F-2.10 | Manager with PENDING status blocked from dashboard access                | H    | Security: unapproved managers cannot use the system |

## 4.3 Module 3: Platform Administration

| ID    | Feature                                                                           | Risk | Rationale                           |
| ----- | --------------------------------------------------------------------------------- | ---- | ----------------------------------- |
| F-3.1 | Admin dashboard shows platform-wide statistics                                    | M    | Operational overview for governance |
| F-3.2 | Pending applications list with status badges                                      | M    | Admin workflow entry point          |
| F-3.3 | Application detail view with document download                                    | M    | Review capability                   |
| F-3.4 | Approve application: creates hospital record + activates manager                  | H    | Core onboarding completion          |
| F-3.5 | Reject application with custom reason                                             | M    | Feedback mechanism                  |
| F-3.6 | All hospitals management list with status toggle                                  | M    | Hospital lifecycle management       |
| F-3.7 | Platform configuration persistence (registration toggle, file types, upload size) | M    | System-wide settings                |
| F-3.8 | Admin-only access enforcement on all admin endpoints                              | H    | Authorization security              |

## 4.4 Module 4: Clinical Resources (Frontend UI)

| ID    | Feature                               | Risk | Rationale                        |
| ----- | ------------------------------------- | ---- | -------------------------------- |
| F-4.1 | Doctor management list display        | L    | UI verification; backend pending |
| F-4.2 | Add/Edit doctor form                  | L    | UI verification                  |
| F-4.3 | Doctor schedule configuration display | L    | UI verification                  |
| F-4.4 | Department management display         | L    | UI verification                  |

## 4.5 Module 10: Billing & Subscription

| ID     | Feature                                             | Risk | Rationale                   |
| ------ | --------------------------------------------------- | ---- | --------------------------- |
| F-10.1 | Manager submits payment receipt with bank reference | H    | Payment workflow initiation |
| F-10.2 | Payment receipt upload to Cloudinary                | M    | File handling               |
| F-10.3 | Admin reviews pending payments                      | M    | Approval workflow           |
| F-10.4 | Admin approves payment: hospital tier upgraded      | H    | Subscription state change   |
| F-10.5 | Admin rejects payment with admin notes              | M    | Feedback mechanism          |
| F-10.6 | Payment history tracking                            | L    | Audit trail                 |

## 4.6 Cross-Cutting Concerns

| ID     | Feature                                                        | Risk | Rationale                    |
| ------ | -------------------------------------------------------------- | ---- | ---------------------------- |
| F-CC.1 | CORS enforcement (only WEB_ORIGIN allowed)                     | H    | Cross-origin security        |
| F-CC.2 | Helmet security headers (CSP, X-Frame-Options, HSTS)           | M    | Defense in depth             |
| F-CC.3 | JSON body size limit (1MB)                                     | L    | Denial-of-service prevention |
| F-CC.4 | SQL injection prevention via Drizzle ORM parameterized queries | H    | Data integrity and security  |
| F-CC.5 | Health endpoint responds correctly                             | L    | Monitoring                   |
| F-CC.6 | Dark mode toggle persistence                                   | L    | User preference              |
| F-CC.7 | Responsive layout on tablet viewports                          | M    | Usability                    |
| F-CC.8 | 404 Not Found page for unknown routes                          | L    | User experience              |

---

# 5. Features Not To Be Tested

The following features are excluded from this testing cycle, along with the reason for exclusion.

| Feature                                                               | Reason for Exclusion                                                                                                             |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| AI Voice Receptionist (Module 5 core — Llama 3.1, Whisper, LangChain) | Not yet implemented. The AI microservice (FastAPI) has not been developed. Only the chat widget UI shell exists on the frontend. |
| Patient Booking Portal (appointment creation via AI chat)             | Depends on the AI engine and appointment backend endpoints, neither of which are built yet.                                      |
| Appointment Calendar Backend (CRUD endpoints for appointments)        | API endpoints for appointment creation, rescheduling, cancellation are not implemented. Frontend screens show static mock data.  |
| Doctor Schedule Backend (availability calculation, slot management)   | Backend logic for schedule computation and slot availability is not developed. Frontend displays UI-only mockups.                |
| Real-time WebSocket Notifications                                     | Socket.io integration is not implemented. The notification center screen is UI-only.                                             |
| Telephony Integration (SIP/VoIP via Twilio)                           | Out of scope for the current semester; planned for future phases.                                                                |
| PDF/CSV Report Export                                                 | Export functionality in analytics dashboards is not connected to a backend data source.                                          |
| Subscription Expiry and Auto-Downgrade                                | No background job or cron exists to automatically expire or downgrade subscriptions.                                             |
| Two-Factor Authentication (2FA)                                       | Not implemented; listed as a low-priority future enhancement.                                                                    |
| CSRF Protection                                                       | Token-based CSRF for cookie-authenticated requests is not yet implemented.                                                       |
| Email Verification for Manager Accounts                               | Manager email is trusted from the registration form; no verification flow exists.                                                |
| Native Mobile Applications                                            | The project is web-only per scope constraints.                                                                                   |
| External HIS/EMR Integrations                                         | Explicitly excluded from project scope.                                                                                          |
| Bilingual (Urdu) NLP Support                                          | Depends on the AI engine which is not implemented.                                                                               |
| Walk-in Synchronization with Online Bookings                          | Backend appointment logic is not built; walk-in form is UI-only.                                                                 |

---

# 6. Approach

## 6.1 Overall Strategy

This is a Master Test Plan covering a two-person FYP team performing both development and testing. The testing approach follows a bottom-up strategy:

1. **Unit-Level Testing** — Validate individual backend utility functions, middleware, and schema validations using Vitest.
2. **API Integration Testing** — Test each REST endpoint against the running Express server and PostgreSQL database using Postman collections and scripted HTTP requests.
3. **Frontend Component Testing** — Verify React component rendering, form validation behavior, and routing logic using Vitest with React Testing Library.
4. **System-Level End-to-End Testing** — Walk through complete user workflows (registration → approval → login → dashboard) using Playwright browser automation.
5. **Manual Exploratory Testing** — Hands-on testing of UI flows, edge cases, and cross-browser behavior.

## 6.2 Tools

| Tool                               | Purpose                                                | Training Required                                    |
| ---------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| Vitest                             | Unit and component testing (frontend + backend)        | No; team is familiar with the Jest-compatible API    |
| Playwright                         | End-to-end browser testing                             | Minimal; configuration already exists in the project |
| Postman                            | Manual and semi-automated API endpoint testing         | No; team already uses it during development          |
| React Testing Library              | Frontend component rendering tests                     | Minimal; follows standard React testing patterns     |
| Browser DevTools (Chrome, Firefox) | Network inspection, console errors, responsive testing | No                                                   |
| pgAdmin / TablePlus                | Direct database inspection during test validation      | No                                                   |

## 6.3 Metrics

| Metric                       | Collection Level       | Description                                                                |
| ---------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| Test Case Pass Rate          | Per module and overall | Percentage of test cases that pass vs. total executed                      |
| Defect Density               | Per module             | Number of defects found per module                                         |
| Defect Severity Distribution | Overall                | Count of Critical / Major / Minor / Cosmetic defects                       |
| Code Coverage                | Unit test level        | Percentage of backend utility and middleware code covered by Vitest        |
| Requirements Coverage        | Overall                | Percentage of SRS functional requirements traced to at least one test case |

## 6.4 Configuration Management

- All test artifacts (test scripts, Postman collections, Playwright specs) are stored in the project Git repository.
- Test results and incident reports are tracked in markdown files within the `Docs/` directory.
- The application is tested against a single configuration: the current `main` branch of the repository.
- Database state is reset before each test cycle using the seed script (`npm run db:seed`).

## 6.5 Regression Testing

- Regression tests are executed after every significant code change (new module integration, bug fix, schema change).
- The regression suite consists of all High-risk and Medium-risk test cases from Modules 1–3 and Module 10 (the backend-integrated modules).
- Regression scope increases based on defect severity: Critical defects trigger a full regression; Major defects trigger regression of the affected module plus its dependencies; Minor defects do not trigger regression.

## 6.6 Handling Untestable Requirements

- Requirements that reference unimplemented features (AI engine, real-time notifications) are logged as "Deferred" in the requirements traceability matrix.
- Requirements that are ambiguous or incomplete are escalated to the project supervisor for clarification before test design.

## 6.7 Constraints on Testing

- **No dedicated test environment:** Testing occurs on the same local machines used for development. Database may contain development data that must be cleaned before formal test execution.
- **No concurrent user simulation:** Load testing tools are not available; concurrent user behavior is verified through manual rapid-action testing and code review of database transaction handling.
- **SMTP dependency:** Email-related tests (password reset, approval notifications) depend on SMTP configuration. When SMTP is not configured, the email service logs instead of sending, and tests verify log output rather than actual email delivery.

---

# 7. Item Pass/Fail Criteria

## 7.1 Individual Test Case Level

A test case is considered **PASSED** when:

- The actual result matches the expected result exactly as documented in the test case specification.
- No unexpected errors appear in the browser console or server logs during execution.
- The response status code, response body structure, and database state changes all match expectations.

A test case is considered **FAILED** when:

- The actual result deviates from the expected result in any observable way.
- An unhandled exception or crash occurs during execution.
- Data corruption or inconsistent database state is detected after execution.

## 7.2 Module Level

A module is considered to have **PASSED** testing when:

- All High-risk test cases for that module pass without any open Critical or Major defects.
- At least 90% of Medium-risk test cases pass.
- Any remaining Minor defects have documented workarounds.

A module is considered to have **FAILED** testing when:

- Any High-risk test case has an open Critical defect.
- More than 20% of test cases fail.
- A defect blocks downstream modules from functioning.

## 7.3 Master Plan Level (Overall Completion)

The overall testing effort is considered **COMPLETE** when:

- All backend-integrated modules (1, 2, 3, 10) pass at the module level.
- Frontend-only modules (4, 6, 7, 8, 9) pass UI rendering and navigation tests.
- No Critical defects remain open across any module.
- Total defect count of Major severity or higher does not exceed 5.
- The core user workflow (Register Hospital → Admin Approve → Manager Login → Dashboard Access) executes successfully end-to-end without failure.

## 7.4 Defect Severity Definitions

| Severity | Definition                                                                                   | Example                                                                                    |
| -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Critical | System crash, data loss, security breach, or complete feature failure                        | Login returns 500 error; database connection drops; unauthorized user accesses admin panel |
| Major    | Feature does not work as specified but a workaround exists, or a significant usability issue | Application approval does not activate manager account; file upload silently fails         |
| Minor    | Cosmetic issue, minor deviation from specification, or inconvenience                         | Status badge shows wrong color; date format inconsistent across pages                      |
| Cosmetic | Purely visual issue with no functional impact                                                | Misaligned button; extra whitespace; font size slightly off                                |

---

# 8. Suspension Criteria and Resumption Requirements

## 8.1 Suspension Criteria

Testing shall be suspended under any of the following conditions:

1. **Database connectivity failure:** If the PostgreSQL database becomes unreachable and cannot be restored within 30 minutes, all testing that depends on API calls is suspended.
2. **Critical defect accumulation:** If 3 or more Critical defects are identified within a single module during a test cycle, testing of that module is suspended. Continuing would produce unreliable results since subsequent failures may be side effects of the existing critical issues.
3. **Build failure:** If the frontend or backend fails to compile or start, all testing is suspended until the build issue is resolved.
4. **Environment corruption:** If the test database contains corrupted or inconsistent data that cannot be resolved by re-running the seed script, testing is suspended until the database is reset.
5. **Authentication system failure:** If the login or token refresh mechanism is broken, all authenticated testing is suspended since no protected endpoint can be reached.

## 8.2 Resumption Requirements

Testing may resume when:

1. The condition that caused suspension has been resolved and verified by the developer who fixed it.
2. The database has been reset to a clean state (migrations re-applied, seed re-run).
3. A smoke test of the core login flow (Admin login → Dashboard load) passes successfully.
4. Any regression tests related to the previously suspended area pass.

## 8.3 Impact of Suspension

- Upon resumption, the test cases that were in progress at the time of suspension must be re-executed from the beginning, not from the point of interruption.
- If the suspension was caused by Critical defects, a targeted regression test of the affected module and its immediate dependencies must be completed before proceeding to new test areas.

---

# 9. Test Deliverables

The following deliverables shall be produced as part of the testing process:

| Deliverable                      | Description                                                               | Format                                   | Owner                                  |
| -------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------- |
| Master Test Plan                 | This document; defines overall testing strategy and scope                 | Markdown / Word                          | Ihtisham Ul Islam, Shahid Nabi         |
| Test Case Specifications         | Detailed test cases for each module with steps, inputs, expected results  | Markdown tables / Spreadsheet            | Module-specific owner (see Section 12) |
| Postman API Collection           | Organized collection of all API endpoint requests with test scripts       | Postman JSON export                      | Shahid Nabi                            |
| Playwright E2E Test Scripts      | Automated browser test scripts for critical user workflows                | TypeScript files in `Frontend/src/test/` | Ihtisham Ul Islam                      |
| Vitest Unit Test Files           | Unit tests for backend utilities and frontend components                  | TypeScript files                         | Both team members                      |
| Test Execution Log               | Record of each test run: date, tester, environment, pass/fail counts      | Markdown                                 | Executing tester                       |
| Test Incident Reports            | Documented defects with severity, steps to reproduce, screenshots         | Markdown in `Docs/`                      | Discovering tester                     |
| Test Summary Report              | Final summary of testing outcomes, defect statistics, and recommendations | Markdown / Word                          | Both team members                      |
| Requirements Traceability Matrix | Mapping of SRS functional requirements to test cases and their results    | Spreadsheet / Markdown table             | Ihtisham Ul Islam                      |

**Note:** The software itself (frontend and backend source code) is not a test deliverable. It is a development deliverable listed under Test Items (Section 3) and is provided by the development team.

Dependencies between deliverables:

- Test Case Specifications depend on finalized SRS and implementation being code-complete for the target module.
- Playwright E2E scripts depend on stable frontend routing and backend API availability.
- Test Summary Report depends on completion of all planned test execution cycles.

---

# 10. Test Tasks

## 10.1 Task Breakdown

| Task ID | Task                                                                        | Predecessor                                       | Owner             | Skill Level  | Estimated Effort |
| ------- | --------------------------------------------------------------------------- | ------------------------------------------------- | ----------------- | ------------ | ---------------- |
| TT-01   | Set up test environment (install dependencies, configure DB, run seed)      | Development setup complete                        | Shahid Nabi       | Basic        | 0.5 days         |
| TT-02   | Create Postman collection for Auth endpoints (/api/auth/\*)                 | TT-01; Auth module code-complete                  | Shahid Nabi       | Intermediate | 1 day            |
| TT-03   | Create Postman collection for Hospital Applications endpoints               | TT-01; Hospital Applications module code-complete | Ihtisham Ul Islam | Intermediate | 1 day            |
| TT-04   | Create Postman collection for Admin endpoints (/api/admin/\*)               | TT-01; Admin module code-complete                 | Ihtisham Ul Islam | Intermediate | 1 day            |
| TT-05   | Create Postman collection for Subscription endpoints                        | TT-01; Subscription module code-complete          | Shahid Nabi       | Intermediate | 0.5 days         |
| TT-06   | Write Vitest unit tests for backend middleware (auth, rate-limit, validate) | TT-01                                             | Shahid Nabi       | Intermediate | 1 day            |
| TT-07   | Write Vitest unit tests for backend utility functions (security, api-error) | TT-01                                             | Shahid Nabi       | Intermediate | 0.5 days         |
| TT-08   | Write React Testing Library tests for Login component                       | TT-01; Frontend stable                            | Ihtisham Ul Islam | Intermediate | 0.5 days         |
| TT-09   | Write React Testing Library tests for Registration wizard                   | TT-01; Frontend stable                            | Ihtisham Ul Islam | Intermediate | 1 day            |
| TT-10   | Write Playwright E2E test: full registration-to-approval workflow           | TT-02, TT-03, TT-04                               | Ihtisham Ul Islam | Advanced     | 1.5 days         |
| TT-11   | Write Playwright E2E test: login, dashboard access, profile edit            | TT-02                                             | Shahid Nabi       | Advanced     | 1 day            |
| TT-12   | Write Playwright E2E test: subscription payment workflow                    | TT-05                                             | Shahid Nabi       | Advanced     | 1 day            |
| TT-13   | Execute Module 1 test cases (manual + automated)                            | TT-02, TT-06, TT-07, TT-08                        | Shahid Nabi       | Basic        | 1 day            |
| TT-14   | Execute Module 2 test cases (manual + automated)                            | TT-03, TT-09                                      | Ihtisham Ul Islam | Basic        | 1 day            |
| TT-15   | Execute Module 3 test cases (manual + automated)                            | TT-04                                             | Ihtisham Ul Islam | Basic        | 1 day            |
| TT-16   | Execute Module 10 test cases (manual + automated)                           | TT-05, TT-12                                      | Shahid Nabi       | Basic        | 0.5 days         |
| TT-17   | Execute frontend-only UI verification for Modules 4, 6–9                    | TT-01                                             | Ihtisham Ul Islam | Basic        | 1 day            |
| TT-18   | Execute cross-cutting security tests (CORS, headers, rate limit, injection) | TT-02                                             | Shahid Nabi       | Intermediate | 0.5 days         |
| TT-19   | Execute cross-browser testing (Chrome, Firefox, Edge)                       | TT-13 through TT-17                               | Ihtisham Ul Islam | Basic        | 0.5 days         |
| TT-20   | Execute regression test suite after defect fixes                            | Defect fixes merged                               | Both              | Intermediate | 1 day            |
| TT-21   | Compile Test Summary Report                                                 | TT-13 through TT-20                               | Both              | Basic        | 0.5 days         |

## 10.2 Phases Not Covered

The following areas are not addressed in this test plan and will be covered in future project phases:

- AI Service (FastAPI) testing — will require separate test infrastructure (Python test framework, model mocking).
- Appointment CRUD backend testing — endpoints do not exist yet.
- Load and performance testing — requires tools and infrastructure beyond current scope.
- Mobile responsiveness deep testing — targeted for a polish phase after core functionality stabilizes.

---

# 11. Environmental Needs

## 11.1 Hardware

| Item                 | Specification                | Purpose                                           |
| -------------------- | ---------------------------- | ------------------------------------------------- |
| Development Laptop 1 | Windows 10/11, 8GB+ RAM, SSD | Primary development and test execution (Ihtisham) |
| Development Laptop 2 | Windows 10/11, 8GB+ RAM, SSD | Primary development and test execution (Shahid)   |

No special hardware such as simulators, static generators, or dedicated test servers is required. All testing is performed on standard development machines.

## 11.2 Software

| Software        | Version       | Purpose                                                    |
| --------------- | ------------- | ---------------------------------------------------------- |
| Node.js         | 20.x LTS      | Runtime for frontend build and backend API                 |
| npm             | 10.x          | Package management                                         |
| PostgreSQL      | 15 or 16      | Primary database (via Supabase cloud or local Docker)      |
| Docker Desktop  | 24.x          | Local PostgreSQL and Redis containers via `docker-compose` |
| Google Chrome   | Latest stable | Primary test browser                                       |
| Mozilla Firefox | Latest stable | Cross-browser verification                                 |
| Microsoft Edge  | Latest stable | Cross-browser verification                                 |
| VS Code         | Latest        | IDE for writing and running tests                          |
| Postman         | 10.x          | API endpoint testing                                       |
| Git             | Latest        | Version control for test artifacts                         |

## 11.3 Network and Connectivity

- Internet connectivity is required for accessing the Supabase-hosted PostgreSQL database.
- Cloudinary API access is required for document upload testing (requires active API keys in `.env`).
- SMTP server access (or Mailtrap for development) is required for email notification testing.
- If testing locally with Docker, no external network is needed for the database.

## 11.4 Test Data

- **Seed Data:** The `npm run db:seed` script provides the initial admin account (`admin@halo.pk` / `Admin@2025`) and default platform settings.
- **Registration Test Data:** Test hospital registrations will use fictional hospital names, license numbers, and manager credentials created specifically for testing.
- **Document Uploads:** Sample PDF and image files (under 5MB) will be prepared for upload testing. Files exceeding the size limit will also be prepared for negative testing.
- **Payment Testing:** Sample receipt images will be used for subscription payment upload testing.

## 11.5 Access and Permissions

- Both team members have full access to the Git repository, database, and all cloud services (Supabase, Cloudinary, SMTP).
- No restricted system access or special permissions are needed during testing.
- The system is not shared with external users during the testing phase.

---

# 12. Responsibilities

| Responsibility                                                      | Assigned To                          | Details                                                                                |
| ------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| Overall test planning and coordination                              | Ihtisham Ul Islam                    | Maintains the master test plan; coordinates test schedules                             |
| Risk assessment for features                                        | Both members jointly                 | Risk levels assigned during sprint planning meetings                                   |
| Module 1 (Auth) test design and execution                           | Shahid Nabi                          | Owns all auth-related test cases: login, logout, tokens, password reset, rate limiting |
| Module 2 (Onboarding) test design and execution                     | Ihtisham Ul Islam                    | Owns registration wizard, document upload, application tracking test cases             |
| Module 3 (Admin) test design and execution                          | Ihtisham Ul Islam                    | Owns admin dashboard, application review, hospital management, config test cases       |
| Module 4 (Clinical Resources) UI test execution                     | Shahid Nabi                          | Verifies doctor/department/schedule UI screens render correctly                        |
| Modules 6–9 (Operations, Search, Analytics, Notifications) UI tests | Ihtisham Ul Islam                    | Verifies frontend-only screens render and navigate correctly                           |
| Module 10 (Subscription) test design and execution                  | Shahid Nabi                          | Owns payment upload, admin review, tier upgrade test cases                             |
| Security and cross-cutting tests                                    | Shahid Nabi                          | CORS, headers, rate limiting, JWT validation, SQL injection prevention                 |
| Cross-browser compatibility testing                                 | Ihtisham Ul Islam                    | Chrome, Firefox, Edge verification                                                     |
| Playwright E2E test script development                              | Ihtisham Ul Islam                    | Writes and maintains end-to-end browser automation scripts                             |
| Postman collection maintenance                                      | Shahid Nabi                          | Creates and updates API test collections                                               |
| Vitest unit test development (backend)                              | Shahid Nabi                          | Middleware, utilities, and schema validation unit tests                                |
| Vitest component test development (frontend)                        | Ihtisham Ul Islam                    | React component rendering and interaction tests                                        |
| Defect logging and tracking                                         | Discovering tester                   | Each tester logs defects they find with full reproduction steps                        |
| Defect resolution verification                                      | Opposite tester                      | The tester who did not fix the defect verifies the fix                                 |
| Test environment setup and maintenance                              | Shahid Nabi                          | Database provisioning, seed scripts, environment configuration                         |
| Go/no-go decision for release                                       | Dr. Tehseen Riaz Abbasi (Supervisor) | Final approval based on test summary report                                            |
| Scheduling conflict resolution                                      | Dr. Tehseen Riaz Abbasi (Supervisor) | Resolves priority disputes between development and testing activities                  |
| Delivery of test items (software builds)                            | Both members (as developers)         | Each developer delivers their module code for testing                                  |

---

# 13. Staffing and Training Needs

## 13.1 Staffing

The testing team consists of the two primary developers of the HALO project. No external testing staff or specialized QA roles are required for this phase of the project.

- **Ihtisham Ul Islam:** AI/UI Lead and QA for Modules 2, 3, 5, 7, 8.
- **Shahid Nabi:** Full-Stack Lead and QA/DevOps for Modules 1, 4, 6, 9, 10.

## 13.2 Training Needs

The team is already proficient in the core technology stack. However, minor internal knowledge sharing is required for the following:

| Area                             | Recipient         | Training Source                               |
| -------------------------------- | ----------------- | --------------------------------------------- |
| Playwright E2E configuration     | Shahid Nabi       | Ihtisham Ul Islam (Knowledge sharing session) |
| Postman script advanced features | Ihtisham Ul Islam | Shahid Nabi (Knowledge sharing session)       |
| Cloudinary storage management    | Ihtisham Ul Islam | Cloudinary documentation / Shahid Nabi        |
| Drizzle ORM advanced queries     | Ihtisham Ul Islam | Drizzle documentation / Shahid Nabi           |

No formal external training sessions or certifications are planned.

---

# 14. Schedule

Testing is performed in an iterative manner following the development of each module. The formal test execution period for the final project submission is outlined below:

| Milestone                                 | Start Date    | End Date      | Duration |
| ----------------------------------------- | ------------- | ------------- | -------- |
| **Phase 1: Test Planning**                | May 01, 2026  | May 15, 2026  | 15 days  |
| **Phase 2: Test Case Design**             | May 16, 2026  | May 20, 2026  | 5 days   |
| **Phase 3: Test Environment & Scripting** | May 21, 2026  | May 25, 2026  | 5 days   |
| **Phase 4: Formal Test Execution**        | May 26, 2026  | June 05, 2026 | 11 days  |
| - Module 1–3 Execution                    | May 26, 2026  | May 28, 2026  | 3 days   |
| - Module 10 Execution                     | May 29, 2026  | May 30, 2026  | 2 days   |
| - Frontend UI Verification                | May 31, 2026  | June 01, 2026 | 2 days   |
| - Security & Cross-Cutting                | June 02, 2026 | June 03, 2026 | 2 days   |
| - Regression Testing                      | June 04, 2026 | June 05, 2026 | 2 days   |
| **Phase 5: Evaluation & Final Report**    | June 06, 2026 | June 08, 2026 | 3 days   |

**Deliverable Dates:**

- Master Test Plan Final: May 15, 2026
- Test Summary Report: June 08, 2026

---

# 15. Risks and Contingencies

| Risk                                                               | Probability | Impact | Contingency / Mitigation Plan                                                                                                |
| ------------------------------------------------------------------ | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Technical: DB Connection Lag** (Supabase latency during testing) | High        | Medium | Use local Docker-based PostgreSQL instance for execution if cloud latency is too high.                                       |
| **Technical: Cloudinary Quota** (Upload limit reached)             | Low         | Low    | Prepare secondary "Sandbox" Cloudinary account as backup.                                                                    |
| **Technical: AI API Timeout** (Groq/Llama latency)                 | Medium      | Medium | Mock AI responses during UI testing to avoid dependency on external service availability.                                    |
| **Resources: Team Illness** (One member unavailable)               | Low         | High   | Re-prioritize test cases to focus only on High-risk items (Modules 1–3).                                                     |
| **Schedule: Development Delay** (Features not ready for testing)   | High        | High   | Adopt "test-driven" approach where possible; test ready modules while finishing others. Shorten regression window if needed. |
| **Technical: Build Failure** (Environment issues)                  | Medium      | High   | Maintain "clean" branches in Git; use VS Code Dev Containers if needed to ensure environment parity.                         |
| **Technical: SQL Injection Vulnerability**                         | Low         | High   | Use Drizzle's strict type-safe queries; run manual injection tests on all search and login fields.                           |
| **Technical: Token Leakage** (Sensitive data in logs)              | Medium      | Medium | Review all log middleware to ensure no JWTs or passwords are being logged.                                                   |

---

# 16. Approvals

The following individuals have reviewed and approved this Master Test Plan:

| Role                   | Name                    | Signature                        | Date         |
| ---------------------- | ----------------------- | -------------------------------- | ------------ |
| **Project Lead 1**     | Ihtisham Ul Islam       | **\*\*\*\***\_\_\_\_**\*\*\*\*** | May 15, 2026 |
| **Project Lead 2**     | Shahid Nabi             | **\*\*\*\***\_\_\_\_**\*\*\*\*** | May 15, 2026 |
| **Project Supervisor** | Dr. Tehseen Riaz Abbasi | **\*\*\*\***\_\_\_\_**\*\*\*\*** | May 15, 2026 |

**Status:** APPROVED / FINAL

---

**End of Document**
