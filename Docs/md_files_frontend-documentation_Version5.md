# HALO Frontend Documentation

## 1. Project Overview
**HALO (Hospital AI Liaison & Operations)** is a frontend web application for hospital appointment management with three primary user experiences:
- **Public & Patient-facing pages** (landing, hospital site)
- **Authentication & onboarding** (login, sign‑up, registration)
- **Role-based dashboards** for:
  - Platform Admin
  - Hospital Manager

The frontend is implemented with **React + TypeScript** and built using **Vite**. Styling is done through **Tailwind CSS** plus custom CSS for authentication and landing experiences.

---

## 2. Tech Stack
- **React 18 + TypeScript**
- **Vite** (build tool)
- **React Router v6** (routing)
- **Tailwind CSS** (utility-first styling)
- **Radix UI components + shadcn/ui**
- **React Query** (QueryClientProvider initialized)
- **Lucide Icons**
- **Testing:** Vitest / Playwright (configured)

---

## 3. Application Bootstrap
### Entry Point
- **`src/main.tsx`**
  - Imports global styles: `auth.css`, `landing.css`, `index.css`
  - Applies **dark mode** class on initial load based on:
    - `localStorage.halo_dark`
    - OS theme preference
  - Mounts `<App />` into `#root`

### Root App & Providers
- **`src/App.tsx`**
  - Wraps app with:
    - `QueryClientProvider`
    - `TooltipProvider`
    - Toast systems (`Toaster`, `Sonner`)
  - Defines all public and role‑based routes.

---

## 4. Routing Structure

### Public Routes
| Path | Component | Purpose |
|------|----------|---------|
| `/` | `Landing` | Marketing / product landing page |
| `/login` | `Login` | Admin/Hospital manager login |
| `/signup` | `SignUp` | Basic signup form |
| `/forgot-password` | `ForgotPassword` | Password reset flow |
| `/register` | `HospitalRegistration` | Multi-step hospital registration |
| `/application-status` | `ApplicationStatus` | Track application progress |
| `/hospital-site` | `HospitalLanding` | Patient-facing hospital site |

### Admin Routes (wrapped by `AdminLayout`)
| Path | Component | Purpose |
|------|----------|---------|
| `/admin` | `Dashboard` | Admin KPI dashboard |
| `/admin/applications` | `PendingApplications` | Review hospital applications |
| `/admin/applications/:id` | `ApplicationDetail` | Application review and decision |
| `/admin/hospitals` | `AllHospitals` | Tenant hospital management |
| `/admin/config` | `PlatformConfig` | Platform settings & templates |
| `/admin/analytics` | `Analytics` | Platform analytics |
| `/admin/subscriptions` | `SubscriptionManagement` | Subscription management |
| `/admin/profile` | `Profile` | Admin profile settings |

### Hospital Manager Routes (wrapped by `HospitalLayout`)
| Path | Component | Purpose |
|------|----------|---------|
| `/hospital` | `Dashboard` | Hospital operations overview |
| `/hospital/appointments` | `DailySchedule` | Appointment calendar |
| `/hospital/appointments/search` | `AppointmentSearch` | Global appointment search |
| `/hospital/doctors` | `DoctorManagement` | Doctors listing |
| `/hospital/doctors/new` | `AddEditDoctor` | Add doctor |
| `/hospital/doctors/edit` | `AddEditDoctor` | Edit doctor |
| `/hospital/doctors/schedule` | `DoctorSchedule` | Doctor schedule |
| `/hospital/departments` | `DepartmentManagement` | Department management |
| `/hospital/walk-ins` | `WalkInForm` | Walk-in patient entry |
| `/hospital/reports` | `Analytics` | Hospital analytics |
| `/hospital/notifications` | `NotificationCenter` | Alerts and notifications |
| `/hospital/notifications/preferences` | `NotificationPreferences` | Notification settings |
| `/hospital/subscription` | `Subscription` | Plan details |
| `/hospital/profile` | `Profile` | Hospital manager profile |
| `/hospital/search` | `DoctorDepartmentSearch` | Search by doctor/department |

---

## 5. Layout System

### `AdminLayout`
- Top header with greeting, notifications, theme toggle, and profile dropdown.
- Side navigation (`AdminSidebar`)
- Uses sessionStorage `halo_user` for admin identity.
- Supports **collapsed sidebar** layout.

### `HospitalLayout`
- Similar structure to Admin layout with hospital-specific context.
- Uses `halo_user` to show hospital name and manager identity.
- Notification bell links to `/hospital/notifications`.

---

## 6. Authentication & Session Flow

### Login (`Login.tsx`)
- Supports **role switching**: Admin vs Hospital Manager.
- Credentials:
  - **Admin demo**: `admin@halo.pk` / `Admin@2025`
  - **Hospital demo**: `manager@hospital.pk` / `Hospital@123`
- Successful login writes to `sessionStorage.halo_user` with role metadata.
- Registered hospital managers are stored in `localStorage.halo_registered_managers`.

### Sign Up (`SignUp.tsx`)
- Client-side validation and password strength meter.
- Does not persist users; redirects to `/login`.

### Forgot Password (`ForgotPassword.tsx`)
- Email form with cooldown resend logic (client-side only).

---

## 7. Hospital Registration (Multi-Step)
**`HospitalRegistration.tsx`** implements a 3-step registration wizard:

1. **Hospital + Manager Info**
   - Facility type, city, contact, manager credentials
2. **Documents Upload**
   - Simulated document uploads (client-only)
3. **Review & Submit**
   - Displays summary and submits

Upon submission:
- Manager credentials are saved into `localStorage.halo_registered_managers`
- Confirmation screen displays application ID and login credentials.

---

## 8. Key UI Components

### Shared Components
- **`PageHeader`**: Standard page title + subtitle + action slot
- **`KPICard`**: Summary cards with value, trend, icon
- **`StatusBadge`**: Status display with standardized color mapping
- **`DarkModeToggle`**: Theme switcher with persistent storage
- **`AuthLayout`**: Two-column auth UI with image panel

### Navigation Components
- **`AdminSidebar`**
- **`HospitalSidebar`**

Both use route matching and support collapsed mode.

---

## 9. Data Approach (Current)
All data used in dashboards and tables is **static mock data** in each page file.  
No API integration currently exists.

---

## 10. Styling & Theming
- **Tailwind CSS** is the primary styling system.
- Custom styles:
  - `auth.css` (authentication layouts)
  - `landing.css` (marketing landing page)
  - `index.css` (global theme variables and utilities)
- Dark mode is handled via the `.dark` class on `<html>`.

---

## 11. Assets
Located in `public/`:
- `hospital-receptionist.png` (auth panel)
- `hero-robot.png`, `main-robot.png`, `tiny-robot.png`
- `hospital.html` (patient-facing static page)
- `favicon.ico`

---

## 12. Known Gaps / Placeholder Areas
- No backend integration yet
- No real authentication provider
- Registration and login rely on localStorage/sessionStorage
- All dashboards use static mock data
- No form validation library beyond custom logic

---

## 13. Frontend UX Flow Summary
1. User visits `/` (Landing)
2. User navigates to:
   - Login
   - Hospital Registration
3. On login:
   - Admin → `/admin`
   - Hospital Manager → `/hospital`
4. Users interact with role-based dashboards and tools.

---

## 14. Recommended File Naming (for this documentation set)
This file: **`md_files/frontend-documentation.md`**
