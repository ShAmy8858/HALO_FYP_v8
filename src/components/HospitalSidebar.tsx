import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Stethoscope, LayoutGrid, UserPlus,
  BarChart3, Bell, Award, User, LogOut
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/hospital", icon: LayoutDashboard },
  { title: "Appointments", path: "/hospital/appointments", icon: Calendar, badge: "12" },
  { title: "Doctors", path: "/hospital/doctors", icon: Stethoscope },
  { title: "Departments", path: "/hospital/departments", icon: LayoutGrid },
  { title: "Walk-ins", path: "/hospital/walk-ins", icon: UserPlus },
  { title: "Reports", path: "/hospital/reports", icon: BarChart3 },
  { title: "Notifications", path: "/hospital/notifications", icon: Bell, badge: "5" },
  { title: "Subscription", path: "/hospital/subscription", icon: Award },
];

const bottomItems = [
  { title: "Profile", path: "/hospital/profile", icon: User },
  { title: "Logout", path: "/login", icon: LogOut },
];

interface HospitalSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function HospitalSidebar({ collapsed, onToggle }: HospitalSidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-200 z-30",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center gap-3 px-4 h-[60px] border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
          <span className="text-sidebar-accent-foreground font-bold text-sm">H</span>
        </div>
        {!collapsed && <span className="text-sidebar-foreground font-bold text-lg tracking-tight">HALO</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/hospital" && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-nav transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/20"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto bg-warning text-warning-foreground text-[10px] font-bold rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-2 pb-4 space-y-1 border-t border-sidebar-border pt-4">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-nav transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/20"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
