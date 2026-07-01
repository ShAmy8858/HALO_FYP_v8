# Updated HALO Sprintsheet

This document details the functional requirements and use cases mapped out in the `Updated_HALO_sprintsheet.xlsx` document, organized by functional modules. This serves as the backlog and execution roadmap for the HALO platform development.

## MODULE 1: USER PROFILING & ACCESS CONTROL
**Target Users:** Admin & Hospital Manager

- **UC-1.1: Create Manager Account**
  - Capture standard profile fields: first name, last name, email, contact number, password with confirmation.
- **UC-1.2: Secure Login**
  - Select user role (Admin or Manager).
  - Authenticate using registered email and password.
- **UC-1.3: Password Recovery**
  - Verify existing email, send reset link, and confirm new password.
- **UC-1.4: Password Change**
  - Input current password, set new password, and confirm.
- **UC-1.5: View Profile & UC-1.6: Edit Profile**
  - Display and edit personal details (name, email, contact).
- **UC-1.8: Logout**
  - Safely terminate session and redirect to the login screen.

## MODULE 2: HOSPITAL TENANT ONBOARDING
**Target Users:** Hospital Manager

- **UC-2.1: Register Hospital**
  - Input facility type, hospital name, registration/license number, business email, contact, province, city, and postal code.
- **UC-2.3: Upload Documents**
  - Select document type and upload files to the server for verification.
- **UC-2.4: Check Registration Status**
  - Enter application ID and view current application status.
- **UC-2.11: Deactivate Hospital**
  - Select instance, provide a reason, confirm deactivation, and send notices.

## MODULE 3: PLATFORM ADMINISTRATION
**Target Users:** Platform Admin

- **UC-3.2: Process Hospital Registration**
  - Select pending applications, review details and uploaded documents.
  - Approve or Reject the hospital (with custom rejection reasons).
- **UC-3.4: View Hospitals**
  - View list of hospitals including name, ID, activation date, subscription status, and total appointments.
  - Apply filters by subscription status, general status, and facility type.
- **UC-3.10: View Platform Statistics**
  - View aggregate data: total hospitals, active hospitals, total appointments, total platform users, growth metrics, and trend summaries.

## MODULE 4: CLINICAL RESOURCES
**Target Users:** Hospital Manager

- **UC-4.1: Create Doctor Profile**
  - Enter doctor name, specialization, category (e.g., ENT, Cardiology), qualifications, and consultation fees.
- **UC-4.2: View & UC-4.3: Edit Doctor Profile**
  - Display list, search by name, filter by category.
  - Update profile details and photos.
- **UC-3.4: Configure Doctor Schedule** *(Mapped closely with Clinical Resources)*
  - Select working days, weekly schedule, and specific operational time slots. Save to DB.
- **UC-4.4: Deactivate Doctor**
  - Confirm deactivation and disable doctor availability.

## MODULE 5: AI-DRIVEN APPOINTMENTS (CONVERSATIONAL LAYER)
**Target Users:** Patient & AI Agent

- **UC-5.1: Access Booking Interface**
  - Patient initiates via website link/widget; system loads branding.
- **UC-5.3: Initialize Conversation**
  - Select language (English/Urdu) and mode (text, voice, or dual).
- **UC-5.4: Text-Based Conversation**
  - Display welcome message, send/receive text via the AI Engine.
- **UC-5.5: Voice-Based Conversation**
  - Request microphone access. Capture audio stream to Speech-to-Text (STT) engine.
  - Display real-time transcription and "Listening" indicator.
  - Send AI text responses to Text-to-Speech (TTS) engine for simultaneous audio playback.
  - Handle voice/mic failures with fallbacks to manual chat.
- **UC-5.16: Terminate Conversation**
  - Graceful termination by user intent or completion, closing the interface.

## MODULE 6: SCHEDULING ENGINE
**Target Users:** Patient & System Operations

- **UC-6.1: Query Doctor Availability**
  - Receive request, fetch doctor's configured schedule, and return available slots.
- **UC-6.3: Book Appointment**
  - Collect patient information, create record, generate unique ID, update doctor's schedule, and confirm.
- **UC-6.4: Reschedule Appointment**
  - Validate appointment ID, fetch details, offer new slots, release old slot, and update DB.
- **UC-6.5: Cancel Appointment**
  - Enter and confirm ID, release booked slot, update status to 'Cancelled'.
- **UC-6.8: View Appointment Details**
  - Fetch and return appointment record via ID.

## MODULE 7: OPERATIONS CONSOLE & SEARCH/FILTER
**Target Users:** Hospital Manager

- **UC-7.1: Search Doctors via Agent**
  - Let AI assist in finding doctors.
- **UC-7.2: View Daily Schedule & UC-7.5: Search Appointments**
  - View all appointments for current date.
  - Search by patient name, appointment ID, contact, or doctor.
- **UC-7.4: Register Walk-In Patient**
  - Select doctor and time slot, enter patient details manually (name, contact, age, reason), mark as 'walk-in' type.
- **UC-7.6: Filter Appointments & UC-7.7: Update Status**
  - Filter by date, status, doctor, or booking type.
  - Manually update status (Completed/No-Show/In-Progress).
- **UC-7.12: View Appointments Statistics**
  - Access total, online, and walk-in counts across customizable periods (daily/weekly/monthly).

## MODULE 8: REPORTS & ANALYTICS
**Target Users:** Hospital Manager & Admin

- **UC-8.1: Generate Appointment Volume Reports**
  - Select time periods, view completed vs cancelled appointments, and export as PDF/CSV.
- **UC-8.2: View Doctor Utilization**
  - View booking frequency and utilization percentages per doctor.
- **UC-8.3: View Peak Traffic Trends**
  - Analyze peak hours and days via trend charts.
- **UC-8.4: View Hospital Manager Dashboard**
  - High-level KPIs: today's count, active doctors, online vs. walk-in splits.
- **UC-8.5: View Admin Dashboard**
  - High-level KPIs for the entire platform.

## MODULE 9: NOTIFICATIONS & REMINDERS
**Target Users:** System Background Processes

- **UC-8.1 / 8.2 / 8.3 / 8.4:** Automated Notifications
  - Automatically generate confirmation, reminder, cancellation, and reschedule messages.
  - Distribute via email to patients and in-app alerts to Hospital Managers.
  - Log all notification events.
- **UC-8.10: Edit Email Templates**
  - Managers can customize the subject and body of templates.
- **UC-8.11: Retry Failed Notifications**
  - Dashboard to view and manually retry failed message dispatches.

## MODULE 10: BILLING & SUBSCRIPTION
**Target Users:** Platform Admin

- **UC-9.1: Configure Subscription Product**
  - Set tiers (Basic/Standard/Premium), limits (max doctors, max appointments), pricing, and feature flags.
- **UC-9.2: Manage Hospital Subscription**
  - View current status of a hospital. Lifecycle actions: Assign New, Extend, or Suspend.
  - Log transactions to the Billing Audit Trail and notify Hospital Admins.
