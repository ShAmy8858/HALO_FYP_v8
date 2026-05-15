import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Building2, Activity, Calendar, Users, FileText, CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { HospitalApplication } from "@/types/api";

interface AuditLogEntry {
  id: string;
  action: string;
  userId: string | null;
  hospitalId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "User logged in",
  LOGOUT: "User logged out",
  PASSWORD_RESET_REQUESTED: "Password reset requested",
  PASSWORD_RESET_COMPLETED: "Password reset completed",
  PASSWORD_CHANGED: "Password changed",
  APPLICATION_SUBMITTED: "New application submitted",
  APPLICATION_APPROVED: "Hospital approved",
  APPLICATION_REJECTED: "Hospital application rejected",
  HOSPITAL_DEACTIVATED: "Hospital deactivated",
  HOSPITAL_STATUS_CHANGED: "Hospital status changed",
  PLATFORM_CONFIG_UPDATED: "Platform config updated",
  EMAIL_TEMPLATE_UPDATED: "Email template updated",
  PLATFORM_SEED: "Platform seed completed",
};

function formatAction(entry: AuditLogEntry): { action: string; detail: string } {
  const action = ACTION_LABELS[entry.action] || entry.action.replace(/_/g, " ").toLowerCase();
  const meta = entry.metadata as Record<string, string> | null;
  const detail = meta?.role || meta?.template || meta?.field || meta?.description || entry.action;
  return { action, detail: String(detail) };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiRequest<{
      totals: { hospitals: number; activeHospitals: number; users: number; appointments: number; pendingApplications: number };
      recentApplications: HospitalApplication[];
      recentActivity: AuditLogEntry[];
      trends: { hospitals: string; appointments: string };
    }>("/admin/dashboard"),
  });

  const totals = data?.totals || { hospitals: 0, activeHospitals: 0, users: 0, appointments: 0, pendingApplications: 0 };
  const pendingApps = data?.recentApplications || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview and quick actions" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Hospitals" value={isLoading ? "..." : totals.hospitals} icon={Building2} trend={{ value: data?.trends.hospitals || "Live from DB", positive: true }} bgClass="bg-kpi-teal-bg" />
        <KPICard title="Active Hospitals" value={isLoading ? "..." : totals.activeHospitals} icon={Activity} trend={{ value: `${totals.hospitals ? Math.round((totals.activeHospitals / totals.hospitals) * 100) : 0}% active`, positive: true }} bgClass="bg-kpi-green-bg" />
        <KPICard title="Total Appointments" value={totals.appointments} icon={Calendar} trend={{ value: data?.trends.appointments || "Later module", positive: true }} bgClass="bg-kpi-amber-bg" />
        <KPICard title="Platform Users" value={isLoading ? "..." : totals.users} icon={Users} trend={{ value: "Admin + managers", positive: true }} bgClass="bg-kpi-blue-bg" />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Pending Apps */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 text-foreground">Pending Applications</h3>
            <StatusBadge status="warning" label={`${totals.pendingApplications} pending`} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-label text-muted-foreground font-medium">Hospital Name</th>
                  <th className="text-left py-2 text-label text-muted-foreground font-medium">City</th>
                  <th className="text-left py-2 text-label text-muted-foreground font-medium">Submitted</th>
                  <th className="text-right py-2 text-label text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.map((app) => (
                  <tr key={app.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="py-3 text-foreground font-medium">{app.hospitalName}</td>
                    <td className="py-3 text-muted-foreground">{app.city}</td>
                    <td className="py-3 text-muted-foreground">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Draft"}</td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/5" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => navigate("/admin/applications")} className="text-body text-primary hover:underline mt-3 block ml-auto">View All →</button>
        </div>

        {/* Recent Activity — from API (audit logs) */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="text-h3 text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 && (
              <p className="text-body text-muted-foreground">No recent activity yet.</p>
            )}
            {recentActivity.map((entry) => {
              const { action, detail } = formatAction(entry);
              return (
                <div key={entry.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-body text-foreground">{action}</p>
                    <p className="text-label text-muted-foreground">{detail}</p>
                  </div>
                  <span className="text-label text-muted-foreground whitespace-nowrap">{timeAgo(entry.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Review Applications", icon: FileText, path: "/admin/applications" },
          { label: "Manage Hospitals", icon: Building2, path: "/admin/hospitals" },
          { label: "Subscription Plans", icon: CreditCard, path: "/admin/subscriptions" },
          { label: "Platform Config", icon: Settings, path: "/admin/config" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-150 hover:scale-[1.01] active:scale-[0.98]"
          >
            <item.icon className="h-6 w-6" />
            <span className="text-btn">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
