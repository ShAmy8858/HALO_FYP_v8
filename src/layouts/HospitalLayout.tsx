import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { Bell, Menu, LogOut, ChevronDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DarkModeToggle, useDarkMode } from "@/components/DarkModeToggle";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function HospitalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { dark, setDark } = useDarkMode();

  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem("halo_user") || "{}"); } catch { return {}; }
  })();
  const displayName = user.name || "Hospital Manager";
  const hospitalName = user.hospital || "Your Hospital";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    sessionStorage.removeItem("halo_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <HospitalSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn("transition-all duration-200", collapsed ? "ml-16" : "ml-60")}>
        {/* ─── Top Header ─── */}
        <header
          className="sticky top-0 z-20 h-[68px] flex items-center justify-between px-5 shadow-md"
          style={{ background: "linear-gradient(135deg, #00ACC1 0%, #1976D2 100%)" }}
        >
          {/* Left: hamburger + greeting */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white/80 hover:text-white hover:bg-white/15 transition-all p-2 rounded-lg flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Building2 className="h-3 w-3 text-white/70 flex-shrink-0" />
                <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider leading-none truncate">{hospitalName}</p>
              </div>
              <p className="text-base font-bold text-white leading-none">
                {getGreeting()}, <span className="text-white/90">{displayName}</span> 👋
              </p>
            </div>
          </div>

          {/* Right: dark mode + notifications + profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <DarkModeToggle dark={dark} onToggle={() => setDark(!dark)} variant="dark" />

            {/* Notification bell */}
            <button
              className="relative text-white/80 hover:text-white hover:bg-white/15 transition-all p-2 rounded-lg"
              onClick={() => navigate("/hospital/notifications")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-orange-400 text-white text-[9px] flex items-center justify-center font-bold shadow">5</span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl border border-white/25 hover:border-white/50 hover:bg-white/15 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-white leading-none">{displayName}</p>
                  <p className="text-[11px] text-white/75 leading-none mt-0.5">Hospital Manager</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-white/70 group-hover:text-white transition-colors" />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#162032] rounded-xl border border-[#E3F0F7] dark:border-[#263a52] shadow-xl py-1.5 z-50">
                  <div className="px-4 py-3 border-b border-[#F0F4F7] dark:border-[#263a52]">
                    <p className="text-sm font-bold text-[#1a3a5c] dark:text-[#D4E8F5]">{displayName}</p>
                    <p className="text-[11px] text-[#90A4AE] mt-0.5">{user.email || "manager@hospital.pk"}</p>
                    <p className="text-[11px] text-[#00ACC1] mt-0.5 font-medium">{hospitalName}</p>
                  </div>
                  <button
                    onClick={() => { setShowProfile(false); navigate("/hospital/profile"); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#546E7A] dark:text-[#90A4AE] hover:bg-[#F0FBFD] dark:hover:bg-[#1e3a52] hover:text-[#00ACC1] transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); navigate("/hospital/subscription"); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#546E7A] dark:text-[#90A4AE] hover:bg-[#F0FBFD] dark:hover:bg-[#1e3a52] hover:text-[#00ACC1] transition-colors"
                  >
                    Subscription Plan
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

      {showProfile && <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />}
    </div>
  );
}
