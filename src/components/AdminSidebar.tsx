import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Building2, CreditCard, BarChart3,
  Settings, User, LogOut
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Applications", path: "/admin/applications", icon: FileText, badge: "3" },
  { title: "Hospitals", path: "/admin/hospitals", icon: Building2 },
  { title: "Subscription", path: "/admin/subscriptions", icon: CreditCard },
  { title: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { title: "Configuration", path: "/admin/config", icon: Settings },
];

const bottomItems = [
  { title: "Profile", path: "/admin/profile", icon: User },
  { title: "Logout", path: "/login", icon: LogOut },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-200 z-30",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[60px] border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
          <span className="text-sidebar-accent-foreground font-bold text-sm">H</span>
        </div>
        {!collapsed && <span className="text-sidebar-foreground font-bold text-lg tracking-tight">HALO</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/admin" && location.pathname.startsWith(item.path));
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

      {/* Bottom */}
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
