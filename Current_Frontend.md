# HALO Frontend Architecture & Build Details

This document provides a detailed, logical sequence of the existing frontend build and architecture for the HALO (Healthflow) application.

## 1. Technology Stack
The application is a modern Single Page Application (SPA) utilizing the following core technologies:
- **Core Framework:** React 18
- **Build Tool:** Vite (for fast HMR and optimized production builds)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (utility-first) coupled with Vanilla CSS (`index.css`, `landing.css`, `auth.css`) for specific custom animations and global overrides.
- **UI Component Library:** Shadcn UI (built on top of `@radix-ui/react-*` accessible primitives)
- **Routing:** React Router DOM v6
- **Data Fetching & State:** `@tanstack/react-query`
- **Form Management:** `react-hook-form` with `zod` for schema validation.
- **Icons:** `lucide-react`
- **Animations:** `framer-motion` and `tailwindcss-animate`
- **Charts:** `recharts`

## 2. Directory Structure (`src/`)

The `src` directory is highly organized by feature and function:

- **`components/`**: Houses all reusable UI components.
  - Contains layout-specific components like `AdminSidebar.tsx`, `HospitalSidebar.tsx`, `PageHeader.tsx`, and `AuthLayout.tsx`.
  - Includes a `ui/` subdirectory containing all the individual Shadcn UI components (e.g., buttons, dialogs, inputs, toasts).
- **`hooks/`**: Custom React hooks.
  - `use-mobile.tsx`: Detects mobile viewport sizes for responsive adjustments.
  - `use-toast.ts`: Hook for managing toast notifications (via Sonner & Radix).
- **`layouts/`**: Top-level layout wrappers that define the structural shell for different user roles.
  - `AdminLayout.tsx`: Sidebar and main content area for Platform Administrators.
  - `HospitalLayout.tsx`: Sidebar and main content area for Hospital Managers.
- **`lib/`**: Contains core utility functions.
  - `utils.ts`: Typical `cn` utility for merging Tailwind classes (`clsx` + `tailwind-merge`).
- **`pages/`**: Route-level components, logically separated by domain:
  - **`admin/`**: Admin dashboard, application review, platform config, analytics.
  - **`hospital/`**: Hospital manager dashboard, daily schedule, doctor management, department management, analytics.
  - **`patient/`**: Patient-facing views like `HospitalLanding.tsx`.
  - **`registration/`**: Multi-step registration flow (`HospitalRegistration.tsx`, `ApplicationStatus.tsx`).
  - **Root Pages**: `Landing.tsx`, `Login.tsx`, `SignUp.tsx`, `ForgotPassword.tsx`, `NotFound.tsx`.
- **Root Files**:
  - `App.tsx`: Central routing configuration and context providers.
  - `main.tsx`: React DOM rendering entry point.
  - `index.css`, `landing.css`, `auth.css`: Global styles.

## 3. Application Routing (`App.tsx`)

The routing architecture defines clear boundaries based on user roles, wrapped in their respective Context Providers (`QueryClientProvider`, `TooltipProvider`):

### Public Routes
- `/` - Main HALO Landing Page (`Landing.tsx`)
- `/login` - Authentication (`Login.tsx`)
- `/signup` - New User Sign Up (`SignUp.tsx`)
- `/forgot-password` - Password Recovery
- `/register` - Hospital Onboarding (`HospitalRegistration.tsx`)
- `/application-status` - Post-registration status view
- `/hospital-site` - Patient-facing hospital prototype (`HospitalLanding.tsx`)

### Admin Routes (Base: `/admin`)
Wrapped in `AdminLayout`.
- `/admin/` - Dashboard
- `/admin/applications` & `/admin/applications/:id` - Review hospital registrations
- `/admin/hospitals` - Manage all approved hospitals
- `/admin/config` - Platform configuration
- `/admin/analytics` - Platform-wide statistics
- `/admin/subscriptions` - Billing and subscription plans
- `/admin/profile` - Admin settings

### Hospital Manager Routes (Base: `/hospital`)
Wrapped in `HospitalLayout`.
- `/hospital/` - Dashboard
- `/hospital/appointments`, `/hospital/appointments/search` - Appointment management
- `/hospital/doctors`, `/hospital/doctors/new`, `/hospital/doctors/edit`, `/hospital/doctors/schedule` - Doctor & Schedule management
- `/hospital/departments` - Department management
- `/hospital/walk-ins` - Walk-in registration form
- `/hospital/reports` - Hospital-specific analytics
- `/hospital/notifications` & `/hospital/notifications/preferences` - Alerts
- `/hospital/subscription` - Hospital billing
- `/hospital/profile` - Hospital settings
- `/hospital/search` - Internal directory search

## 4. Configuration and Build Tooling

- **`vite.config.ts`**: Configures Vite with the `@vitejs/plugin-react-swc` plugin for extremely fast compilation. It sets up path aliases (`@/` maps to `./src/`).
- **`tailwind.config.ts`**: Defines the extensive design system. It includes custom color palettes, CSS variables for theming (e.g., standard, dark mode), and custom animation keyframes (like `accordion-down`, `accordion-up`).
- **`tsconfig.json` & variants**: Configures TypeScript compiler options for strict type checking, targeting modern ECMAScript features.
- **`eslint.config.js`**: Enforces code quality and best practices for React and TypeScript.
- **Testing**: Pre-configured with `vitest.config.ts` (unit testing) and `playwright.config.ts` (end-to-end testing).

## 5. State Management & Data Flow
- **Server State**: Managed by `@tanstack/react-query` to handle caching, background updates, and stale data invalidation efficiently without requiring complex Redux setups.
- **Local State**: Managed via standard React hooks (`useState`, `useReducer`, `useContext`).
- **Form State**: `react-hook-form` is used across the application to handle complex form states (especially in registration and booking flows) with Zod schemas ensuring strong client-side validation before API submission.
