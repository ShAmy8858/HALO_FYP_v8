# HALO Sprint Sheet (Use Case → Functional Requirements)

---

## Module 1: User Profiling & Access Control (Admin & Hospital Manager)

### UC‑1.1: Create Manager Account
- FR‑1.1.2 Enter first name  
- FR‑1.1.3 Enter last name  
- FR‑1.1.4 Enter email address  
- FR‑1.1.6 Enter contact number  
- FR‑1.1.5 Enter password  
- FR‑1.1.5 Confirm password  

### UC‑1.2: Secure Login
- FR‑1.1.1 Select user role (Admin or Hospital Manager)  
- FR‑1.2.1 Enter registered email  
- FR‑1.2.2 Enter password  

### UC‑1.3: Password Recovery
- FR‑1.3.1 Enter registered email  
- FR‑1.3.2 Verify email exists  
- FR‑1.3.4 Send reset link via email  
- FR‑1.3.6 Enter new password  
- FR‑1.3.7 Confirm new password  

### UC‑1.4: Password Change
- FR‑1.4.1 Enter current password  
- FR‑1.4.3 Enter new password  
- FR‑1.4.4 Confirm new password  

### UC‑1.5: View Profile
- FR‑1.5.2 View first name  
- FR‑1.5.3 View last name  
- FR‑1.5.4 View email address  
- FR‑1.5.5 View contact number  

### UC‑1.6: Edit Profile
- FR‑1.6.2 Edit first name  
- FR‑1.6.3 Edit last name  
- FR‑1.6.4 Edit contact number  
- FR‑1.6.6 Edit email  
- FR‑1.6.7 Save profile changes  

### UC‑1.8: Logout
- FR‑1.8.1 Initiate logout request  
- FR‑1.8.2 Confirm Logout  
- FR‑1.8.5 Redirect to login page  

---

## Module 2: Hospital Tenant Onboarding (Hospital Manager)

### UC‑2.1: Register Hospital
- FR‑2.1.1 Select facility type (general/speciality)  
- FR‑2.1.1 Enter hospital name  
- FR‑2.1.2 Enter registration/license number  
- FR‑2.1.3 Enter business email  
- FR‑2.1.4 Enter phone contact  
- FR‑2.1.5 Select province  
- FR‑2.1.6 Enter city  
- FR‑2.1.7 Enter postal code  

### UC‑2.3: Upload Documents
- FR‑2.3.1 Select document type (pdf/image/docx)  
- FR‑2.3.2 Choose file from device  
- FR‑2.3.5 Upload files  

### UC‑2.4: Check Registration Status
- FR‑2.4.1 Enter application ID  
- FR‑2.4.3 View current status  

### UC‑2.11: Deactivate Hospital
- FR‑2.11.1 Select hospital instance  
- FR‑2.11.3 Enter deactivation reason  
- FR‑2.11.4 Confirm deactivation  
- FR‑2.11.5 Suspend hospital access  
- FR‑2.11.8 Send deactivation notice  

---

## Module 3: Platform Administration (Admin)

### UC‑3.2: Process Hospital Registration
- FR‑3.2.1 Select pending application  
- FR‑3.2.2 Review hospital details  
- FR‑3.2.3 Verify uploaded documents  
- FR‑3.2.3 Approve Hospital  
- FR‑3.2.5 Confirm approval decision  
- FR‑3.2.3 Reject Hospital  
- FR‑3.3.2 Choose rejection reason from dropdown  
- FR‑3.3.3 Enter custom rejection message  
- FR‑3.3.4 Confirm rejection decision  

### UC‑3.4: View Hospitals
- FR‑3.4.1 View hospital list  
- FR‑3.4.2 View hospital name  
- FR‑3.4.3 View hospital ID  
- FR‑3.4.4 View activation date  
- FR‑3.4.5 View subscription status  
- FR‑3.4.8 Filter by subscription  
- FR‑3.4.8 Filter by status  
- FR‑3.4.8 Filter by facility type  

### UC‑3.10: View Platform Statistics
- FR‑3.10.1 View total hospitals  
- FR‑3.10.2 View active hospitals  
- FR‑3.10.3 View total appointments  
- FR‑3.10.4 View total users (patients + managers)  

### UC‑3.11: Edit Email Templates
- FR‑3.11.2 Select template type  
- FR‑3.11.4 Edit template subject  
- FR‑3.11.5 Edit template body  
- FR‑3.11.9 Save template changes  

### UC‑3.12: Retry Failed Notifications
- FR‑3.12.1 View failed notifications  
- FR‑3.12.4 Retry failed notifications  

---

## Module 4: Clinical Resources (Hospital Manager)

### UC‑4.1: Create Doctor Profile
- FR‑4.1.1 Enter doctor name  
- FR‑4.1.2 Enter specialization  
- FR‑4.1.3 Enter category (ENT, Cardiology etc)  
- FR‑4.1.3 Enter qualifications  
- FR‑4.1.4 Enter consultation fee  

### UC‑4.2: View Doctors Profile
- FR‑4.2.1 View all doctors  
- FR‑4.2.7 Search by name  
- FR‑4.2.5 Filter by category (ENT, Cardiology etc)  
- FR‑4.2.2 View doctor name  
- FR‑4.2.3 View specialization  
- FR‑4.2.9 View doctors count  

### UC‑4.3: Edit Doctor Profile
- FR‑4.3.2 Edit doctor name  
- FR‑4.3.3 Edit specialization  
- FR‑4.3.4 Edit qualifications  
- FR‑4.3.4 Edit consultations fee  
- FR‑4.3.5 Edit contact details  
- FR‑4.3.6 Update profile photo  

### UC‑4.4: Configure Doctor Schedule
- FR‑4.4.1 Select doctor profile  
- FR‑4.4.3 Set weekly schedule  
- FR‑4.4.2 Select working days  
- FR‑4.4.3 Set working hours (slots)  
- FR‑4.4.7 Save schedule  

### UC‑4.5: Deactivate Doctor
- FR‑4.5.1 Select doctor profile  
- FR‑4.5.2 Confirm deactivation  
- FR‑4.5.3 Disable doctor availability  

---

## Module 5: AI‑Driven Appointments (Patient & AI Agent)

### UC‑5.1: Initialize Conversation
- FR‑5.1.1 Open web chat interface  
- FR‑5.1.2 Choose text-based conversation  
- FR‑5.1.3 Choose voice-based conversation  
- FR‑5.1.4 Call hospital phone number  

### UC‑5.2: Text‑Based Conversation
- FR‑5.2.1 View welcome message  
- FR‑5.2.2 Enter text message in English/Urdu  
- FR‑5.2.3 Send message  
- FR‑5.2.4 Receive AI response as text  

### UC‑5.3: Voice‑Based Conversation
- FR‑5.3.1 Allow microphone access  
- FR‑5.3.2 Start voice recording  
- FR‑5.3.3 Speak in English/Urdu  
- FR‑5.3.4 View real‑time transcription  
- FR‑5.3.5 Stop recording  
- FR‑5.3.6 Receive AI audio response  
- FR‑5.3.7 View AI response as text simultaneously  

### UC‑5.4: Query Doctor Information
- FR‑5.4.1 Ask about doctors by name  
- FR‑5.4.2 Ask about doctors by specialty  
- FR‑5.4.3 Ask about doctors by department  
- FR‑5.4.4 View doctor details  
- FR‑5.4.5 View hospital information  

### UC‑5.5: Book Appointment
- FR‑5.5.1 Request to book appointment  
- FR‑5.5.2 View available doctors  
- FR‑5.5.3 Select doctor  
- FR‑5.5.4 View available slots grouped by date and time  
- FR‑5.5.5 Select date  
- FR‑5.5.6 Select time slot  
- FR‑5.5.7 Enter patient name  
- FR‑5.5.8 Enter contact number  
- FR‑5.5.9 Enter email  
- FR‑5.5.10 Enter age  
- FR‑5.5.11 Enter visit reason  
- FR‑5.5.12 Confirm booking details  
- FR‑5.5.13 View appointment reference ID  
- FR‑5.5.14 Receive confirmation notification  

### UC‑5.6: Reschedule Appointment
- FR‑5.6.1 Request to reschedule appointment  
- FR‑5.6.2 Enter appointment reference ID  
- FR‑5.6.3 Enter contact number for verification  
- FR‑5.6.4 View current appointment details  
- FR‑5.6.5 View new available slots  
- FR‑5.6.6 Select new date  
- FR‑5.6.7 Select new time slot  
- FR‑5.6.8 Confirm reschedule  
- FR‑5.6.9 Receive reschedule notification  

### UC‑5.7: Cancel Appointment
- FR‑5.7.1 Request to cancel appointment  
- FR‑5.7.2 Enter appointment reference ID  
- FR‑5.7.3 Enter contact number for verification  
- FR‑5.7.4 View appointment details  
- FR‑5.7.5 Confirm cancellation  
- FR‑5.7.6 Receive cancellation notification  

### UC‑5.8: Terminate Conversation
- FR‑5.8.1 End conversation  
- FR‑5.8.2 Close chat window  
- FR‑5.8.3 Redirect to hospital website  

---

## Module 6: Operations Console (Hospital Manager)

### UC‑6.1: View Daily Schedule
- FR‑6.1.1 View list of all appointments for current date  
- FR‑6.1.2 View list by doctor, status, or booking type (online/walk‑in)  
- FR‑6.1.3 View by Appointment ID  
- FR‑6.1.3 View by Patient Name  

### UC‑6.2: Register Walk‑In Patient
- FR‑6.2.1 Select doctor  
- FR‑6.2.4 Select available time slot  
- FR‑6.2.5 Enter patient first name  
- FR‑6.2.6 Enter patient last name  
- FR‑6.2.7 Enter patient contact number  
- FR‑6.2.8 Enter patient age  
- FR‑6.2.9 Enter visit reason  
- FR‑6.2.11 Mark as walk‑in type  

### UC‑6.3: Update Appointment Status
- FR‑6.3.1 Select appointment  
- FR‑6.3.2 Display current status  
- FR‑6.3.3 Choose new status (completed/no‑show/in‑progress)  
- FR‑6.3.5 Confirm status change  

### UC‑6.4: View Appointments Statistics
- FR‑6.4.1 Select time period (daily/weekly/monthly)  
- FR‑6.4.3 View total appointments  
- FR‑6.4.4 View online bookings  
- FR‑6.4.5 View walk‑in bookings  
- FR‑6.4.6 View average per day  
- FR‑6.4.7 View trend chart  
- FR‑6.4.8 View statistics summary  

---

## Module 7: Search & Filter

### UC‑7.1: Search Doctors via Agent
- FR‑7.1.1 Ask AI agent about doctors  
- FR‑7.1.2 Specify search by name  
- FR‑7.1.3 Specify search by specialty  
- FR‑7.1.4 Specify search by department  
- FR‑7.1.5 View matching doctor results  

### UC‑7.2: Search Appointments
- FR‑7.2.1 Open search interface  
- FR‑7.2.2 Search by appointment reference ID  
- FR‑7.2.3 Search by date  
- FR‑7.2.4 Search by doctor name  
- FR‑7.2.5 Search by patient name  
- FR‑7.2.6 Search by status  
- FR‑7.2.7 View matching appointments  

### UC‑7.3: Filter Appointments
- FR‑7.3.1 Open filter options  
- FR‑7.3.2 Filter by time slots  
- FR‑7.3.3 Filter by department  
- FR‑7.3.4 Filter by booking type (online/walk‑in)  
- FR‑7.3.4 Filter by availability status  
- FR‑7.3.5 Apply multiple filters together  
- FR‑7.3.6 View filtered results  
- FR‑7.3.7 Reset filters  

---

## Module 8: Reports & Analytics

### UC‑8.1: Generate Appointment Volume Reports
- FR‑8.1.1 Open reports section  
- FR‑8.1.2 Select appointment volume report  
- FR‑8.1.3 Select time period (daily/weekly/monthly)  
- FR‑8.1.4 Generate report  
- FR‑8.1.5 View total appointments  
- FR‑8.1.6 View completed appointments  
- FR‑8.1.7 View cancelled appointments  
- FR‑8.1.8 Export report as PDF/CSV  

### UC‑8.2: View Doctor Utilization
- FR‑8.2.1 Open doctor utilization report  
- FR‑8.2.2 Select time period  
- FR‑8.2.3 View doctor‑wise booking frequency  
- FR‑8.2.4 View utilization percentage  
- FR‑8.2.5 Export report as PDF  

### UC‑8.3: View Peak Traffic Trends
- FR‑8.3.1 Open traffic trends report  
- FR‑8.3.2 Select analysis period  
- FR‑8.3.3 View peak hours  
- FR‑8.3.4 View peak days  
- FR‑8.3.5 View trend chart  
- FR‑8.3.6 Export report as PDF  

### UC‑8.4: View Hospital Manager Dashboard
- FR‑8.4.1 Open hospital manager dashboard  
- FR‑8.4.2 View today’s appointments count  
- FR‑8.4.3 View online bookings count  
- FR‑8.4.4 View walk‑in bookings count  
- FR‑8.4.5 View active doctors count  
- FR‑8.4.6 View real‑time KPI updates  

### UC‑8.5: View Admin Dashboard
- FR‑8.5.1 Open admin dashboard  
- FR‑8.5.2 View total hospitals  
- FR‑8.5.3 View active hospitals  
- FR‑8.5.4 View total platform appointments  
- FR‑8.5.5 View total platform users  
- FR‑8.5.6 View platform statistics summary  

---

## Module 9: Notifications & Reminders (System)

### UC‑9.1: Send Appointment Confirmation
- FR‑9.1.2 Generate confirmation message (Automatic)  
- FR‑9.1.4 Send in‑app notification (Hospital Manager)  
- FR‑9.1.5 Send email notification (Patient)  
- FR‑9.1.6 Log notification event  

### UC‑9.2: Send Appointment Reminder
- FR‑9.2.3 Generate reminder message (Automatic)  
- FR‑9.2.4 Send in‑app notification (Hospital Manager)  
- FR‑9.2.5 Send email notification (Patient)  
- FR‑9.2.6 Log reminder event  

### UC‑9.3: Notify Appointment Cancellation
- FR‑9.3.2 Generate cancellation message (Automatic)  
- FR‑9.3.4 Send in‑app notification (Hospital Manager)  
- FR‑9.3.5 Send email notification (Patient)  
- FR‑9.3.6 Log cancellation notification  

### UC‑9.4: Notify Appointment Reschedule
- FR‑9.4.2 Generate reschedule message (Automatic)  
- FR‑9.4.4 Send in‑app notification (Hospital Manager)  
- FR‑9.4.5 Send email notification (Patient)  
- FR‑9.4.6 Log reschedule notification  

---

## Module 10: Billing & Subscription (Admin)

### UC‑10.1: Configure Subscription Product
- FR‑10.1.1 Initiate creation or modification of a subscription tier  
- FR‑10.1.4 Set plan tier (Basic/Standard/Premium)  
- FR‑10.1.5 Define Feature Flags (Voice support, Analytics, Priority support)  
- FR‑10.1.6 Set Usage Limits (Max doctors, Max appointments/month)  
- FR‑10.1.7 Configure Pricing & Billing Cycle (Price, Currency, Monthly/Yearly)  
- FR‑10.1.7 Display creation confirmation  

### UC‑10.2: Manage Hospital Subscription
- FR‑10.2.1 Select hospital instance  
- FR‑10.2.2 Display current status  
- FR‑10.2.3 Select Lifecycle Action (Assign New / Extend / Suspend)  
- FR‑10.2.4 Update Subscription parameters (Effective Date, Expiry, Plan Tier)  
- FR‑10.2.6 Generate and transmit notification (Email/In‑app) to Hospital Admin  
- FR‑10.2.7 Input Reason Code (Specifically for Suspensions or Extensions)  
- FR‑10.2.8 Log transaction in Billing Audit Trail  
