import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Bell, Menu, LogOut, ChevronDown, Shield, FileText, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { DarkModeToggle, useDarkMode } from "@/components/DarkModeToggle";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { dark, setDark } = useDarkMode();
  const { user, logout } = useAuth();

  // Fetch real notification counts
  const { data: notifData } = useQuery({
    queryKey: ["admin-notification-counts"],
    queryFn: () => apiRequest<{ pendingApplications: number; pendingPayments: number; total: number }>("/admin/notifications/counts"),
    refetchInterval: 30000, // refresh every 30 seconds
  });

  const notifTotal = notifData?.total || 0;
  const displayName = user?.name || "Administrator";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        pendingApplications={notifData?.pendingApplications || 0}
      />
      <div className={cn("transition-all duration-200", collapsed ? "ml-16" : "ml-60")}>
        {/* ─── Top Header ─── */}
        <header
          className="sticky top-0 z-20 h-[68px] flex items-center justify-between px-5 shadow-md"
          style={{ background: "linear-gradient(135deg, #00ACC1 0%, #1976D2 100%)" }}
        >
          {/* Left: hamburger + greeting */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white/80 hover:text-white hover:bg-white/15 transition-all p-2 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Shield className="h-3 w-3 text-white/70" />
                <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider leading-none">HALO Admin Console</p>
              </div>
              <p className="text-base font-bold text-white leading-none">
                {getGreeting()}, <span className="text-white/90">{displayName}</span> 👋
              </p>
            </div>
          </div>

          {/* Right: dark mode + notifications + profile */}
          <div className="flex items-center gap-2">
            <DarkModeToggle dark={dark} onToggle={() => setDark(!dark)} variant="dark" />

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative text-white/80 hover:text-white hover:bg-white/15 transition-all p-2 rounded-lg"
              >
                <Bell className="h-5 w-5" />
                {notifTotal > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-orange-400 text-white text-[9px] flex items-center justify-center font-bold shadow animate-pulse">
                    {notifTotal > 9 ? "9+" : notifTotal}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#162032] rounded-xl border border-[#E3F0F7] dark:border-[#263a52] shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#F0F4F7] dark:border-[#263a52]">
                    <p className="text-sm font-bold text-[#1a3a5c] dark:text-[#D4E8F5]">Notifications</p>
                  </div>

                  {notifTotal === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-[#90A4AE]">No pending items</p>
                    </div>
                  ) : (
                    <div className="py-1">
                      {(notifData?.pendingApplications || 0) > 0 && (
                        <button
                          onClick={() => { setShowNotifications(false); navigate("/admin/applications"); }}
                          className="w-full text-left px-4 py-3 hover:bg-[#F0FBFD] dark:hover:bg-[#1e3a52] transition-colors flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1a3a5c] dark:text-[#D4E8F5]">
                              {notifData.pendingApplications} Pending Application{notifData.pendingApplications > 1 ? "s" : ""}
                            </p>
                            <p className="text-[11px] text-[#90A4AE]">Hospital registrations awaiting review</p>
                          </div>
                        </button>
                      )}

                      {(notifData?.pendingPayments || 0) > 0 && (
                        <button
                          onClick={() => { setShowNotifications(false); navigate("/admin/payment-reviews"); }}
                          className="w-full text-left px-4 py-3 hover:bg-[#F0FBFD] dark:hover:bg-[#1e3a52] transition-colors flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <CreditCard className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1a3a5c] dark:text-[#D4E8F5]">
                              {notifData.pendingPayments} Payment Receipt{notifData.pendingPayments > 1 ? "s" : ""}
                            </p>
                            <p className="text-[11px] text-[#90A4AE]">Subscription payments awaiting review</p>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl border border-white/25 hover:border-white/50 hover:bg-white/15 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-white leading-none">{displayName}</p>
                  <p className="text-[11px] text-white/75 leading-none mt-0.5">Super Admin</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-white/70 group-hover:text-white transition-colors" />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#162032] rounded-xl border border-[#E3F0F7] dark:border-[#263a52] shadow-xl py-1.5 z-50">
                  <div className="px-4 py-3 border-b border-[#F0F4F7] dark:border-[#263a52]">
                    <p className="text-sm font-bold text-[#1a3a5c] dark:text-[#D4E8F5]">{displayName}</p>
                    <p className="text-[11px] text-[#90A4AE] mt-0.5">{user?.email || "admin@halo.pk"}</p>
                    <p className="text-[11px] text-[#00ACC1] mt-0.5 font-medium">Platform Administrator</p>
                  </div>
                  <button
                    onClick={() => { setShowProfile(false); navigate("/admin/profile"); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#546E7A] dark:text-[#90A4AE] hover:bg-[#F0FBFD] dark:hover:bg-[#1e3a52] hover:text-[#00ACC1] transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#EF5350] hover:bg-[#FFF5F5] dark:hover:bg-[#3a1515] flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 max-w-[1280px] mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {(showProfile || showNotifications) && <div className="fixed inset-0 z-40" onClick={() => { setShowProfile(false); setShowNotifications(false); }} />}
    </div>
  );
}
