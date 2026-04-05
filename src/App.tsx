import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layouts
import { AdminLayout } from "@/layouts/AdminLayout";
import { HospitalLayout } from "@/layouts/HospitalLayout";

// Auth & Registration
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import HospitalRegistration from "@/pages/registration/HospitalRegistration";
import ApplicationStatus from "@/pages/registration/ApplicationStatus";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import PendingApplications from "@/pages/admin/PendingApplications";
import ApplicationDetail from "@/pages/admin/ApplicationDetail";
import AllHospitals from "@/pages/admin/AllHospitals";
import PlatformConfig from "@/pages/admin/PlatformConfig";
import AdminAnalytics from "@/pages/admin/Analytics";
import SubscriptionManagement from "@/pages/admin/SubscriptionManagement";
import AdminProfile from "@/pages/admin/Profile";

// Hospital Manager Pages
import HospitalDashboard from "@/pages/hospital/Dashboard";
import DailySchedule from "@/pages/hospital/DailySchedule";
import WalkInForm from "@/pages/hospital/WalkInForm";
import AppointmentSearch from "@/pages/hospital/AppointmentSearch";
import DoctorDepartmentSearch from "@/pages/hospital/DoctorDepartmentSearch";
import DoctorManagement from "@/pages/hospital/DoctorManagement";
import AddEditDoctor from "@/pages/hospital/AddEditDoctor";
import DoctorSchedule from "@/pages/hospital/DoctorSchedule";
import DepartmentManagement from "@/pages/hospital/DepartmentManagement";
import HospitalAnalytics from "@/pages/hospital/Analytics";
import NotificationCenter from "@/pages/hospital/NotificationCenter";
import NotificationPreferences from "@/pages/hospital/NotificationPreferences";
import HospitalSubscription from "@/pages/hospital/Subscription";
import HospitalProfile from "@/pages/hospital/Profile";

// Patient
import HospitalLanding from "@/pages/patient/HospitalLanding";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<HospitalRegistration />} />
          <Route path="/application-status" element={<ApplicationStatus />} />
          <Route path="/hospital-site" element={<HospitalLanding />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="applications" element={<PendingApplications />} />
            <Route path="applications/:id" element={<ApplicationDetail />} />
            <Route path="hospitals" element={<AllHospitals />} />
            <Route path="config" element={<PlatformConfig />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Hospital Manager Routes */}
          <Route path="/hospital" element={<HospitalLayout />}>
            <Route index element={<HospitalDashboard />} />
            <Route path="appointments" element={<DailySchedule />} />
            <Route path="appointments/search" element={<AppointmentSearch />} />
            <Route path="doctors" element={<DoctorManagement />} />
            <Route path="doctors/new" element={<AddEditDoctor />} />
            <Route path="doctors/edit" element={<AddEditDoctor />} />
            <Route path="doctors/schedule" element={<DoctorSchedule />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="walk-ins" element={<WalkInForm />} />
            <Route path="reports" element={<HospitalAnalytics />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="notifications/preferences" element={<NotificationPreferences />} />
            <Route path="subscription" element={<HospitalSubscription />} />
            <Route path="profile" element={<HospitalProfile />} />
            <Route path="search" element={<DoctorDepartmentSearch />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
