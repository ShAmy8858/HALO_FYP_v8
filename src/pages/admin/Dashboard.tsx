import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Building2, Activity, Calendar, Users, FileText, CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const pendingApps = [
  { name: "City General Hospital", city: "Lahore", date: "Oct 12, 2024" },
  { name: "Al-Shifa Medical Center", city: "Islamabad", date: "Oct 11, 2024" },
  { name: "Karachi Spine Clinic", city: "Karachi", date: "Oct 10, 2024" },
];

const recentActivity = [
  { action: "Hospital approved", detail: "PIMS Hospital", time: "2 hours ago" },
  { action: "New application", detail: "Faisalabad Medical", time: "4 hours ago" },
  { action: "Plan assigned", detail: "CMH Rawalpindi", time: "5 hours ago" },
  { action: "Hospital suspended", detail: "Test Clinic", time: "1 day ago" },
  { action: "Config updated", detail: "Email templates", time: "1 day ago" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview and quick actions" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Hospitals" value={48} icon={Building2} trend={{ value: "+3 this month", positive: true }} bgClass="bg-kpi-teal-bg" />
        <KPICard title="Active Hospitals" value={42} icon={Activity} trend={{ value: "87.5% active", positive: true }} bgClass="bg-kpi-green-bg" />
        <KPICard title="Total Appointments" value="1,247" icon={Calendar} trend={{ value: "+12% vs yesterday", positive: true }} bgClass="bg-kpi-amber-bg" />
        <KPICard title="Platform Users" value={156} icon={Users} trend={{ value: "+8 this week", positive: true }} bgClass="bg-kpi-blue-bg" />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Pending Apps */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 text-foreground">Pending Applications</h3>
            <StatusBadge status="warning" label={`${pendingApps.length} pending`} />
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
                {pendingApps.map((app, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="py-3 text-foreground font-medium">{app.name}</td>
                    <td className="py-3 text-muted-foreground">{app.city}</td>
                    <td className="py-3 text-muted-foreground">{app.date}</td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/5" onClick={() => navigate("/admin/applications/1")}>
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

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="text-h3 text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-body text-foreground">{item.action}</p>
                  <p className="text-label text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-label text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
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
