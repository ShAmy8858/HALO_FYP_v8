# HALO Modules 1-3 Implementation Guide

**Summary**
Build the first three modules as the platform foundation: secure users, tenant onboarding, and admin governance. Use the documented target stack: `Next.js + TypeScript + Tailwind/shadcn`, `Node.js/Express`, `PostgreSQL + Drizzle`, `Redis`, `JWT`, `Cloudinary`, `Nodemailer/BullMQ`. Reuse the current React/Vite screens as UI references, but replace mock `localStorage/sessionStorage` flows with real API-backed auth and data.

Sources reviewed: `HALO_Implementation_Guide.md`, `md_files_srs_Version5.md`, `md_files_scope_Version5.md`, `md_files_sprintsheet_Version5.md`, `Updated_HALO_sprintsheet.md`, `Current_Frontend.md`, and `md_files_frontend-documentation_Version5.md`.

**Core Architecture Rules**
- All Admin/Manager browser actions go through the frontend API/proxy, then Express API, then PostgreSQL.
- Use RBAC roles: `ADMIN` and `MANAGER`.
- Store access token in memory; store refresh token in an `httpOnly` cookie.
- Access token lifetime: `8 hours`; refresh token lifetime: `30 days`.
- Never trust `hospital_id` from request bodies. For manager-owned data, derive `hospitalId` only from verified JWT/session context.
- Use standard API responses:
  - Success: `{ success: true, data, meta? }`
  - Error: `{ success: false, error: { code, message, details? } }`
- Every important action must create an audit log: login, logout, password reset, profile update, application submit, approval, rejection, deactivation, config edit, template edit.

**Public Interfaces And Data Model**
- Core tables:
  - `users`: admin/manager accounts, password hash, role, status, optional `hospital_id`.
  - `refresh_tokens`: hashed refresh tokens, expiry, revoked state.
  - `password_reset_tokens`: hashed reset token, expiry, used state.
  - `session_audit_logs`: user/session/security events.
  - `hospital_applications`: draft/submitted onboarding records with application ID.
  - `hospital_documents`: uploaded verification documents with Cloudinary metadata.
  - `hospitals`: approved tenants with unique hospital ID/code/slug.
  - `platform_settings`: global configuration values.
  - `email_templates`: editable templates for reset, approval, rejection, deactivation.
  - `notification_logs`: delivery attempts, failures, retries.
- Important enums:
  - `UserStatus`: `PENDING`, `ACTIVE`, `SUSPENDED`
  - `ApplicationStatus`: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`
  - `HospitalStatus`: `ACTIVE`, `SUSPENDED`, `DEACTIVATED`
  - `DocumentStatus`: `UPLOADED`, `VERIFIED`, `REJECTED`
  - `SubscriptionTier`: `TRIAL`, `BASIC`, `STANDARD`, `PREMIUM`
  - `NotificationStatus`: `PENDING`, `SENT`, `FAILED`, `RETRYING`
- Seed one platform admin account for development.

**Module 1: User Profiling & Access Control**
Implement M1-M4: login, forgot password, admin profile, manager profile.

Backend endpoints:
- `POST /api/auth/login`: accepts role, email, password; returns user profile + access token; sets refresh cookie.
- `POST /api/auth/refresh`: validates refresh cookie and issues a new access token.
- `POST /api/auth/logout`: revokes refresh token, clears cookie, logs logout.
- `POST /api/auth/forgot-password`: verifies email and queues reset email without leaking whether the email exists.
- `POST /api/auth/reset-password`: validates reset token, stores new bcrypt hash, invalidates token.
- `PATCH /api/auth/change-password`: authenticated current-password check.
- `GET /api/users/me`: returns current user.
- `PATCH /api/users/me`: edits first name, last name, contact number, and email with uniqueness validation.

Frontend work:
- Replace demo login credentials with API login.
- Keep role switching on login, but enforce role on backend too.
- Add protected route/layout guards:
  - Admin users may access `/admin/*`.
  - Managers may access `/hospital/*` only after activation.
  - Pending managers go to application/onboarding status.
- Connect admin and manager profile screens to `GET/PATCH /api/users/me`.
- Remove auth dependence on `sessionStorage.halo_user` and `localStorage.halo_registered_managers`.

**Module 2: Hospital Tenant Onboarding**
Implement M5-M8 plus documented deactivation flow: hospital registration steps, document upload, review/submit, status tracking, deactivation.

Backend endpoints:
- `POST /api/hospital-applications`: creates a draft application and pending manager account.
- `PATCH /api/hospital-applications/:id`: updates draft hospital/manager details.
- `POST /api/hospital-applications/:id/documents`: uploads `pdf`, image, or `docx` files to Cloudinary using `multer`.
- `POST /api/hospital-applications/:id/submit`: validates required details/documents and marks application `SUBMITTED`.
- `GET /api/hospital-applications/status/:applicationId`: public-safe status lookup by application ID.
- `POST /api/manager/hospital/deactivate`: manager deactivates own active hospital with reason and confirmation.

Onboarding rules:
- Required fields: facility type, hospital name, license number, business email, phone, province, city, postal code, manager first/last name, manager email/contact/password.
- Application ID must be random and hard to guess.
- Manager account remains `PENDING` until admin approval.
- Approval creates the real `hospitals` tenant row, assigns unique hospital identifier/slug, and links manager to `hospital_id`.
- Status tracking must not expose private documents or manager credentials.

Frontend work:
- Keep the 3-step wizard: details, documents, review.
- Persist draft progress via API, not browser storage.
- Upload documents during step 2 and show upload status.
- Final submit displays application ID and current status.
- Application status screen calls status endpoint and shows `submitted`, `under review`, `approved`, or `rejected` with rejection reason when available.

**Module 3: Platform Administration**
Implement M9-M13 plus sprint-sheet admin controls: pending applications, detail review, all hospitals, platform stats, platform config, email templates, failed notification retry.

Backend endpoints:
- `GET /api/admin/dashboard`: total hospitals, active hospitals, total users, total appointments, growth/trend placeholders until appointment modules exist.
- `GET /api/admin/applications?status=&page=&limit=`: pending/application list.
- `GET /api/admin/applications/:id`: full application detail including documents.
- `POST /api/admin/applications/:id/approve`: verifies docs, creates/activates hospital tenant, activates manager, queues approval email.
- `POST /api/admin/applications/:id/reject`: stores dropdown/custom rejection reason, queues rejection email.
- `GET /api/admin/hospitals?subscription=&status=&facilityType=`: hospital list with filters.
- `PATCH /api/admin/hospitals/:id/status`: suspend/reactivate/deactivate with audit log.
- `GET/PATCH /api/admin/platform-settings`: registration enabled, allowed file types, max upload size, default subscription tier, support email, rejection reasons.
- `GET/PATCH /api/admin/email-templates/:type`: editable subject/body.
- `GET /api/admin/notifications/failed` and `POST /api/admin/notifications/:id/retry`.

Frontend work:
- Admin dashboard should use real counts where available; appointments can safely show `0` until later modules.
- Pending applications page supports list, status filter, and pagination.
- Application detail page shows hospital data, manager data, documents, approve/reject actions, confirmation dialogs, and custom rejection message.
- All hospitals page shows name, hospital ID, activation date, subscription status, total appointments, status, and facility type filters.
- Platform config page edits persisted settings instead of mock state.
- Email template and failed-notification controls can be inside config/admin tools if separate screens are too heavy for v1.

**Implementation Sequence**
1. Create backend foundation: env validation, DB connection, Drizzle schemas, migrations, error middleware, validation middleware, auth/role middleware, response helpers.
2. Implement Module 1 backend and frontend integration first, including admin seed and protected routes.
3. Implement Module 2 application lifecycle, document upload, public status lookup, and pending manager behavior.
4. Implement Module 3 admin approval/rejection and dashboard/list/config tools.
5. Add notification/email infrastructure only to the depth needed for password reset, approval, rejection, deactivation, and retry logs.
6. Replace existing mock data screen-by-screen with React Query hooks and API calls.

**Test Plan**
- Module 1: login success/failure, role mismatch, refresh, logout, password reset, password change, profile edit, protected route redirects.
- Module 2: required-field validation, duplicate manager email/license handling, file type rejection, successful upload, draft submit, status lookup, pending manager blocked from dashboard, deactivation audit.
- Module 3: admin-only access, list/filter applications, approve creates tenant and activates manager, reject records reason, all hospitals filters, platform settings persistence, template edit, failed notification retry.
- Security: manager cannot access another hospital, body-supplied `hospital_id` is ignored, expired/invalid JWT fails, login/reset endpoints are rate-limited.
- Acceptance: after approval, a manager can log in and land in the hospital area with their assigned tenant; before approval, they only see onboarding/status.

**Assumptions**
- The target implementation follows the documented Next.js + Express architecture; the existing Vite frontend is treated as a prototype/reference unless the team decides to keep Vite.
- Billing enforcement is not implemented in Modules 1-3, but approved hospitals receive a default `TRIAL` subscription status so admin lists work.
- Full appointment totals remain `0` or read-only placeholders until later appointment/scheduling modules are implemented.
